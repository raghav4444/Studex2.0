import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import User from './models/User.js';
import Message from './models/Message.js';
import Channel from './models/Channel.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── App Setup ──────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Middleware ─────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── Multer (file + image uploads) ──────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
    if (allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Only image and document files are allowed'));
    }
  },
});

// ─── In-Memory Device → Socket Mapping ───────────────────
const deviceToSocket = new Map(); // deviceId → socketId
const socketToDevice = new Map(); // socketId → deviceId
const socketToUserId = new Map(); // socketId → supabaseId
const userIdToSockets = new Map(); // supabaseId → Set<socketId>
const typingUsers = new Map(); // `${recipientId}:${senderId}` → setTimeout

// ─── DB Connection ──────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studex-chat');
    console.log('✅ MongoDB connected:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// ─── Helpers ────────────────────────────────────────────
const emitOnlineUsers = async () => {
  const onlineUsers = await User.find({ isOnline: true }).select('_id name username avatar college isOnline lastSeen friendRequests');
  io.emit('users:online', onlineUsers);
};

const getUser = async (supabaseId) => {
  if (!supabaseId) return null;
  return User.findOne({ supabaseId }).select('-friendRequests.createdAt');
};

const getUserFriends = async (supabaseId) => {
  const user = await User.findOne({ supabaseId }).populate('friends', '_id name username avatar college branch year isOnline lastSeen isVerified');
  return user?.friends || [];
};

const getUserConversations = async (supabaseId) => {
  // Direct messages: find all messages involving this user as sender or recipient
  const sentMessages = await Message.find({ senderId: supabaseId }).select('recipientId createdAt');
  const receivedMessages = await Message.find({ recipientId: supabaseId }).select('senderId createdAt');

  const partnerIds = new Set();
  sentMessages.forEach(m => { if (m.recipientId) partnerIds.add(m.recipientId); });
  receivedMessages.forEach(m => { if (m.senderId !== supabaseId) partnerIds.add(m.senderId); });

  const conversations = [];
  for (const partnerId of partnerIds) {
    const partner = await User.findOne({ supabaseId: partnerId }).select('_id supabaseId name username avatar college branch year isOnline lastSeen isVerified');
    if (!partner) continue;

    const lastMessage = await Message.findOne({
      $or: [
        { senderId: supabaseId, recipientId: partnerId },
        { senderId: partnerId, recipientId: supabaseId },
      ],
      isDeleted: false,
      type: { $ne: 'system' },
    }).sort({ createdAt: -1 });

    const unreadCount = await Message.countDocuments({
      senderId: partnerId,
      recipientId: supabaseId,
      isDeleted: false,
      seenBy: { $not: { $elemMatch: { userId: supabaseId } } },
    });

    conversations.push({
      _id: partner.supabaseId,
      partner: {
        _id: partner._id,
        supabaseId: partner.supabaseId,
        name: partner.name,
        username: partner.username,
        avatar: partner.avatar,
        college: partner.college,
        branch: partner.branch,
        year: partner.year,
        isOnline: partner.isOnline,
        lastSeen: partner.lastSeen,
        isVerified: partner.isVerified,
        isFriend: true,
      },
      lastMessage: lastMessage ? {
        _id: lastMessage._id,
        text: lastMessage.text,
        senderId: lastMessage.senderId,
        type: lastMessage.type,
        imageUrl: lastMessage.imageUrl,
        createdAt: lastMessage.createdAt,
        reactions: Object.fromEntries(lastMessage.reactions || new Map()),
      } : null,
      unreadCount,
    });
  }

  return conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt?.getTime() || 0;
    const bTime = b.lastMessage?.createdAt?.getTime() || 0;
    return bTime - aTime;
  });
};

const getDMHistory = async (user1, user2, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const dmRoom = getDMRoomId(user1, user2);
  const messages = await Message.find({ dmRoomId: dmRoom, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return messages.reverse();
};

// ─── Channel Helpers ───────────────────────────────────
const getDMRoomId = (user1, user2) => [user1, user2].sort().join('::');

const getUserChannels = async (supabaseId) => {
  // Return ALL public channels + private ones the user belongs to
  const channels = await Channel.find({
    $or: [
      { isPrivate: false },        // all public channels (visible to everyone)
      { members: supabaseId },    // private channels user is a member of
    ],
  })
    .select('_id name description isPrivate createdBy createdAt members admins')
    .lean();

  return channels.map(c => {
    const lastMsg = Message.findOne(
      { channelId: String(c._id), type: { $ne: 'system' }, isDeleted: false },
      { text: 1, type: 1, createdAt: 1, senderId: 1 }
    ).sort({ createdAt: -1 }).lean();

    return { ...c, lastMessage: lastMsg };
  });
};

const getChannelHistory = async (channelId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const msgs = await Message.find({ channelId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return msgs.reverse();
};

// ─── Online/Offline ─────────────────────────────────────
const setUserOnline = async (supabaseId, isOnline) => {
  await User.updateOne({ supabaseId }, { isOnline, lastSeen: new Date() });
};

// ─── REST API Routes ────────────────────────────────────
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Get or create user by supabase ID
app.post('/api/users/upsert', async (req, res) => {
  try {
    const { supabaseId, name, username, email, college, branch, year, bio, avatar, isVerified, accessLevel } = req.body;
    if (!supabaseId || !email) return res.status(400).json({ error: 'supabaseId and email required' });

    let user = await User.findOne({ supabaseId });
    if (user) {
      // Update fields if provided
      Object.assign(user, {
        ...(name && { name }),
        ...(username && { username }),
        ...(college && { college }),
        ...(branch && { branch }),
        ...(year && { year }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(isVerified !== undefined && { isVerified }),
        ...(accessLevel && { accessLevel }),
      });
      await user.save();
    } else {
      user = await User.create({
        supabaseId, name, username, email, college, branch, year,
        bio: bio || '', avatar: avatar || '', isVerified: isVerified || false,
        accessLevel: accessLevel || 'full',
      });
    }
    res.json({ user });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate username - append a number
      const rawUsername = req.body.username || 'user';
      const rand = Math.floor(Math.random() * 9000) + 1000;
      req.body.username = `${rawUsername}${rand}`;
      // Retry
      const user = await User.create(req.body);
      return res.json({ user });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
app.get('/api/users/:supabaseId', async (req, res) => {
  try {
    const user = await getUser(req.params.supabaseId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isFriend = false; // TODO: check if mutual friend
    res.json({
      _id: user._id,
      supabaseId: user.supabaseId,
      name: user.name,
      username: user.username,
      email: user.email,
      college: user.college,
      branch: user.branch,
      year: user.year,
      bio: user.bio,
      avatar: user.avatar,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isVerified: user.isVerified,
      isFriend: false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search users
app.get('/api/users', async (req, res) => {
  try {
    const { q, supabaseId } = req.query;
    let query = {};
    if (q) {
      query = { $text: { $search: q } };
    }
    const users = await User.find(query)
      .select('_id supabaseId name username avatar college branch year isOnline lastSeen isVerified friends sentRequests')
      .limit(50)
      .lean();

    const currentUser = supabaseId ? await User.findOne({ supabaseId }).select('friends sentRequests friendRequests._id').lean() : null;
    const currentFriends = new Set((currentUser?.friends || []).map(f => String(f)));
    const sentSet = new Set((currentUser?.sentRequests || []).map(s => String(s)));

    const result = users.map(u => ({
      _id: u._id,
      supabaseId: u.supabaseId,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      college: u.college,
      branch: u.branch,
      year: u.year,
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
      isVerified: u.isVerified,
      isFriend: currentFriends.has(String(u._id)),
      hasSentRequest: sentSet.has(String(u._id)),
      isSentByOther: currentUser?.friendRequests?.some(r => String(r.from?._id || r.from) === String(u._id)) || false,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.originalname, size: req.file.size });
});

// Search GIFs via Tenor
app.get('/api/gifs', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ results: [] });
  const tenorKey = process.env.TENOR_KEY;
  try {
    const params = new URLSearchParams({
      key: tenorKey || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURd5Query',
      q,
      limit: '20',
      media_filter: 'gif,static',
      contentfilter: 'medium',
    });
    const response = await fetch(`https://tenor.googleapis.com/v2/search?${params}`);
    const data = await response.json();
    const results = (data.results || []).map(g => ({
      id: g.id,
      title: g.title,
      preview: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url,
      url: g.media_formats?.gif?.url,
      width: g.media_formats?.gif?.dims?.[0] || 200,
      height: g.media_formats?.gif?.dims?.[1] || 200,
    }));
    res.json({ results });
  } catch (err) {
    res.json({ results: [] });
  }
});

// ─── Channel REST API ───────────────────────────────────

// List channels (public ones + ones user is a member of, but NOT private ones they don't belong to)
app.get('/api/channels', async (req, res) => {
  try {
    const { supabaseId } = req.query;
    const publicChannels = await Channel.find({ isPrivate: false }).lean();
    const privateChannels = supabaseId
      ? await Channel.find({ isPrivate: true, members: String(supabaseId) }).lean()
      : [];
    const all = [...publicChannels, ...privateChannels];
    res.json(all.map(c => ({
      _id: c._id,
      name: c.name,
      description: c.description,
      isPrivate: c.isPrivate,
      createdBy: c.createdBy,
      memberCount: c.members?.length || 0,
      isMember: supabaseId ? c.members?.includes(String(supabaseId)) : false,
      createdAt: c.createdAt,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create channel
app.post('/api/channels', async (req, res) => {
  try {
    const { name, description = '', isPrivate = false, createdBy } = req.body;
    if (!name || !createdBy) return res.status(400).json({ error: 'name and createdBy required' });

    // Validate name
    const slugName = name.toLowerCase().trim().replace(/\s+/g, '-');
    if (!/^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$|^[a-z0-9]$/.test(slugName)) {
      return res.status(400).json({ error: 'Invalid channel name. Use lowercase, hyphens only, 2-32 chars.' });
    }
    if (['general'].includes(slugName)) {
      return res.status(400).json({ error: 'Channel "#general" already exists.' });
    }

    const existing = await Channel.findOne({ name: slugName });
    if (existing) return res.status(409).json({ error: 'Channel name already taken' });

    const channel = await Channel.create({
      name: slugName,
      description,
      isPrivate,
      createdBy,
      members: [createdBy],
      admins: [createdBy],
    });

    // Broadcast new public channel to all connected users
    if (!isPrivate) {
      io.emit('channel:created', {
        _id: channel._id,
        name: channel.name,
        description: channel.description,
        isPrivate: channel.isPrivate,
        createdBy: channel.createdBy,
        memberCount: 1,
        isMember: false,
        createdAt: channel.createdAt,
      });
    } else {
      // Notify the creator
      io.to(`user:${createdBy}`).emit('channel:created', {
        _id: channel._id,
        name: channel.name,
        description: channel.description,
        isPrivate: channel.isPrivate,
        createdBy: channel.createdBy,
        memberCount: 1,
        isMember: true,
        createdAt: channel.createdAt,
      });
    }

    res.json({ status: 'ok', channel: { ...channel.toObject(), memberCount: 1, isMember: true } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Join channel
app.post('/api/channels/:id/join', async (req, res) => {
  try {
    const { supabaseId } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    if (channel.isPrivate) return res.status(403).json({ error: 'Private channels must use invite' });
    if (channel.members.includes(supabaseId)) return res.json({ status: 'ok', channel });

    channel.members.push(supabaseId);
    await channel.save();

    // Notify channel room
    io.to(`channel:${channel._id}`).emit('channel:joined', { channelId: channel._id, memberCount: channel.members.length });

    res.json({ status: 'ok', channel: { ...channel.toObject(), memberCount: channel.members.length } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete channel (admin only)
app.delete('/api/channels/:id', async (req, res) => {
  try {
    const { supabaseId } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    if (channel.name === 'general') return res.status(403).json({ error: 'Cannot delete #general' });
    if (!channel.admins.includes(supabaseId)) return res.status(403).json({ error: 'Admin only' });

    // Delete all messages in channel
    await Message.deleteMany({ channelId: String(channel._id) });
    await Channel.deleteOne({ _id: req.params.id });

    io.emit('channel:deleted', { channelId: req.params.id });
    res.json({ status: 'ok' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Socket.IO Events ────────────────────────────────────
io.on('connection', async (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── user:join ── Authenticate and register user
  socket.on('user:join', async ({ supabaseId, deviceId }, callback) => {
    try {
      if (!supabaseId) {
        if (callback) callback({ status: 'error', message: 'supabaseId required' });
        return;
      }

      // Map device/socket
      if (deviceId) {
        deviceToSocket.set(deviceId, socket.id);
        socketToDevice.set(socket.id, deviceId);
      }
      socketToUserId.set(socket.id, supabaseId);

      // Track multi-device connections
      if (!userIdToSockets.has(supabaseId)) userIdToSockets.set(supabaseId, new Set());
      userIdToSockets.get(supabaseId).add(socket.id);

      // Set online
      await setUserOnline(supabaseId, true);

      // Get or create user
      let user = await getUser(supabaseId);
      if (!user) {
        user = await User.create({ supabaseId, name: 'User', username: `user_${supabaseId.slice(0, 8)}`, email: `${supabaseId}@placeholder.com`, college: 'Unknown', branch: 'Unknown', year: 1 });
      }

      // Join a private room for this user
      socket.join(`user:${supabaseId}`);

      // Get friends and conversations
      const [friends, conversations, friendRequests, channels] = await Promise.all([
        getUserFriends(supabaseId),
        getUserConversations(supabaseId),
        User.findOne({ supabaseId }).select('friendRequests').lean(),
        getUserChannels(supabaseId),
      ]);

      // Emit online users to all
      await emitOnlineUsers();

      if (callback) callback({
        status: 'ok',
        user: {
          _id: user._id,
          supabaseId: user.supabaseId,
          name: user.name,
          username: user.username,
          email: user.email,
          college: user.college,
          branch: user.branch,
          year: user.year,
          avatar: user.avatar,
          bio: user.bio,
          isOnline: true,
          isVerified: user.isVerified,
          friends: friends.map(f => f.supabaseId || String(f._id)),
          accessLevel: user.accessLevel,
        },
        friends,
        conversations,
        channels,
        friendRequests: (friendRequests?.friendRequests || []).map(r => ({
          _id: r.from?._id || r.from,
          fromName: r.fromName,
          fromUsername: r.fromUsername,
          fromAvatar: r.fromAvatar,
          fromCollege: r.fromCollege,
          createdAt: r.createdAt,
        })),
      });
    } catch (err) {
      console.error('user:join error:', err);
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── user:list ── Get all users with online status
  socket.on('user:list', async ({ supabaseId }, callback) => {
    try {
      const [users, friends, onlineUsers] = await Promise.all([
        User.find().select('_id supabaseId name username avatar college branch year isOnline lastSeen').limit(100).lean(),
        getUserFriends(supabaseId),
        User.find({ isOnline: true }).select('_id supabaseId').lean(),
      ]);

      const onlineSet = new Set(onlineUsers.map(u => String(u._id)));
      const friendIds = new Set(friends.map(f => String(f._id)));

      const result = users.map(u => ({
        _id: u._id,
        supabaseId: u.supabaseId,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        college: u.college,
        branch: u.branch,
        year: u.year,
        isOnline: onlineSet.has(String(u._id)),
        lastSeen: u.lastSeen,
        isFriend: friendIds.has(String(u._id)),
      }));

      if (callback) callback({ users: result });
    } catch (err) {
      if (callback) callback({ error: err.message });
    }
  });

  // ── message:send ── Group message (broadcasts to all)
  socket.on('message:send', async ({ supabaseId, text, type, imageUrl, replyTo }, callback) => {
    try {
      const msg = await Message.create({
        text,
        senderId: supabaseId,
        type: type || 'text',
        imageUrl: imageUrl || '',
        replyTo,
      });

      const sender = await getUser(supabaseId);

      io.emit('message:new', { ...msg.toObject(), sender });

      if (callback) callback({ status: 'ok', message: msg });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── dm:send ── Direct message
  socket.on('dm:send', async ({ supabaseId, recipientId, text, type = 'text', imageUrl, fileName, replyTo }, callback) => {
    try {
      const dmRoom = getDMRoomId(supabaseId, recipientId);
      const msg = await Message.create({
        text: text || '',
        senderId: supabaseId,
        recipientId,
        dmRoomId: dmRoom,
        type,
        imageUrl: imageUrl || '',
        replyTo,
      });

      const sender = await getUser(supabaseId);

      // Send to recipient via their user room
      io.to(`user:${recipientId}`).emit('dm:new', { ...msg.toObject(), sender });
      // Confirm back to sender
      io.to(`user:${supabaseId}`).emit('dm:confirm', { ...msg.toObject(), sender });

      if (callback) callback({ status: 'ok', message: { ...msg.toObject(), sender } });
    } catch (err) {
      console.error('dm:send error:', err);
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── dm:load ── Load direct message history between two users
  socket.on('dm:load', async ({ supabaseId, partnerId, page }, callback) => {
    try {
      const messages = await getDMHistory(supabaseId, partnerId, page || 1);

      // Fetch sender info for each message
      const senderIds = [...new Set(messages.map(m => m.senderId))];
      const senders = await User.find({ supabaseId: { $in: senderIds } })
        .select('_id supabaseId name username avatar college').lean();
      const senderMap = new Map(senders.map(s => [s.supabaseId, s]));

      const enriched = messages.map(m => ({ ...m, sender: senderMap.get(m.senderId) }));

      if (callback) callback({ messages: enriched, hasMore: messages.length === 50 });
    } catch (err) {
      console.error('dm:load error:', err);
      if (callback) callback({ error: err.message });
    }
  });

  // ── typing ── Typing indicator
  socket.on('typing', ({ supabaseId, recipientId, username }) => {
    io.to(`user:${recipientId}`).emit('typing', { supabaseId, username });
  });

  socket.on('typing:stop', ({ supabaseId, recipientId }) => {
    io.to(`user:${recipientId}`).emit('typing:stop', { supabaseId });
  });

  // ── message:seen ── Mark messages as read + broadcast seen receipt
  socket.on('message:seen', async ({ supabaseId, partnerId, messageIds }) => {
    try {
      // If specific message IDs provided, mark those
      if (messageIds?.length) {
        await Message.updateMany(
          { _id: { $in: messageIds }, recipientId: supabaseId },
          { $addToSet: { seenBy: { userId: supabaseId, seenAt: new Date() } } }
        );
        io.to(`user:${partnerId}`).emit('message:seen', { messages: messageIds, seenBy: supabaseId });
        return;
      }

      // Otherwise, mark all unread messages from partner
      const result = await Message.updateMany(
        {
          senderId: partnerId,
          recipientId: supabaseId,
          isDeleted: false,
          'seenBy.userId': { $ne: supabaseId },
        },
        { $addToSet: { seenBy: { userId: supabaseId, seenAt: new Date() } } }
      );

      const updatedMessages = await Message.find({
        senderId: partnerId,
        recipientId: supabaseId,
        'seenBy.userId': supabaseId,
      }).select('_id').lean();

      if (updatedMessages.length > 0) {
        io.to(`user:${partnerId}`).emit('message:seen', {
          messages: updatedMessages.map(m => m._id.toString()),
          seenBy: supabaseId,
        });
      }
    } catch (err) {
      console.error('message:seen error:', err);
    }
  });

  // ── message:react ── Add/remove reaction
  socket.on('message:react', async ({ supabaseId, messageId, emoji, action }, callback) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        if (callback) callback({ status: 'error', message: 'Message not found' });
        return;
      }

      const sender = await getUser(supabaseId);
      const reactions = message.reactions || new Map();

      if (action === 'remove') {
        // Remove all reactions by this user
        for (const [key, reactionList] of reactions) {
          const filtered = reactionList.filter(r => r.userId !== supabaseId);
          if (filtered.length === 0) reactions.delete(key);
          else reactions.set(key, filtered);
        }
      } else {
        // Add reaction
        const existing = reactions.get(emoji) || [];
        const existingIdx = existing.findIndex(r => r.userId === supabaseId);
        if (existingIdx >= 0) {
          existing[existingIdx] = { userId: supabaseId, username: sender?.username, emoji, createdAt: new Date() };
        } else {
          existing.push({ userId: supabaseId, username: sender?.username, emoji, createdAt: new Date() });
        }
        reactions.set(emoji, existing);
      }

      await message.updateOne({ reactions });

      // Broadcast to both participants
      io.to(`user:${message.senderId}`).emit('message:react', { messageId, reactions: Object.fromEntries(reactions), emoji });
      if (message.recipientId) {
        io.to(`user:${message.recipientId}`).emit('message:react', { messageId, reactions: Object.fromEntries(reactions), emoji });
      }

      if (callback) callback({ status: 'ok', reactions: Object.fromEntries(reactions) });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── message:delete ── Delete message
  socket.on('message:delete', async ({ supabaseId, messageId }, callback) => {
    try {
      const message = await Message.findByIdAndUpdate(messageId, { isDeleted: true }, { new: true });
      if (!message) {
        if (callback) callback({ status: 'error', message: 'Message not found' });
        return;
      }
      io.to(`user:${message.senderId}`).emit('message:delete', { messageId });
      if (message.recipientId) io.to(`user:${message.recipientId}`).emit('message:delete', { messageId });
      if (callback) callback({ status: 'ok' });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── dm:start ── Start new DM conversation (ensure user exists in DB)
  socket.on('dm:start', async ({ supabaseId, partnerId }, callback) => {
    try {
      const [sender, partner] = await Promise.all([
        getUser(supabaseId),
        getUser(partnerId),
      ]);
      if (!sender || !partner) {
        if (callback) callback({ status: 'error', message: 'User not found' });
        return;
      }
      // Return conversation data
      if (callback) callback({
        status: 'ok',
        conversation: {
          _id: partnerId,
          partner: {
            _id: partner._id,
            supabaseId: partner.supabaseId,
            name: partner.name,
            username: partner.username,
            avatar: partner.avatar,
            college: partner.college,
            branch: partner.branch,
            year: partner.year,
            isOnline: partner.isOnline,
            lastSeen: partner.lastSeen,
            isVerified: partner.isVerified,
            isFriend: true,
          },
        },
      });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── friend:request ── Send friend request
  socket.on('friend:request', async ({ supabaseId, recipientId, username: senderName, avatar: senderAvatar }, callback) => {
    try {
      const sender = await getUser(supabaseId);
      if (!sender) {
        if (callback) callback({ status: 'error', message: 'Sender not found' });
        return;
      }

      const recipient = await User.findOne({ supabaseId: recipientId });
      if (!recipient) {
        if (callback) callback({ status: 'error', message: 'Recipient not found' });
        return;
      }

      // Check if already sent
      if (recipient.sentRequests.some(s => String(s) === String(sender._id))) {
        if (callback) callback({ status: 'error', message: 'Request already sent' });
        return;
      }
      if (sender.friendRequests.some(r => String(r.from) === String(sender._id))) {
        if (callback) callback({ status: 'error', message: 'Already friends or request pending' });
        return;
      }

      // Add to recipient's incoming requests
      recipient.friendRequests.push({ from: sender._id, fromName: sender.name, fromUsername: sender.username, fromAvatar: sender.avatar, fromCollege: sender.college });
      await recipient.save();

      // Add to sender's sent requests
      await User.updateOne({ supabaseId }, { $addToSet: { sentRequests: recipient._id } });

      // Notify recipient
      io.to(`user:${recipientId}`).emit('friend:request', {
        _id: sender._id,
        fromName: sender.name,
        fromUsername: sender.username,
        fromAvatar: sender.avatar,
        fromCollege: sender.college,
      });

      if (callback) callback({ status: 'ok', message: 'Friend request sent' });
    } catch (err) {
      console.error('friend:request error:', err);
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── friend:accept ── Accept friend request → mutual friendship
  socket.on('friend:accept', async ({ supabaseId, requesterId, requesterObj }, callback) => {
    try {
      const [acceptor, requester] = await Promise.all([
        User.findOne({ supabaseId }),
        requesterObj?._id ? User.findById(requesterObj._id) : User.findOne({ supabaseId: requesterId }),
      ]);
      if (!acceptor || !requester) {
        if (callback) callback({ status: 'error', message: 'Users not found' });
        return;
      }

      // Add mutual friendship
      if (!acceptor.friends.some(f => String(f) === String(requester._id))) {
        acceptor.friends.push(requester._id);
        await acceptor.save();
      }
      if (!requester.friends.some(f => String(f) === String(acceptor._id))) {
        requester.friends.push(acceptor._id);
        await requester.save();
      }

      // Remove from friendRequests and sentRequests
      acceptor.friendRequests = acceptor.friendRequests.filter(r => String(r.from) !== String(requester._id));
      await acceptor.save();

      await User.updateOne({ supabaseId: requester.supabaseId }, { $pull: { sentRequests: acceptor._id } });

      // Notify both users
      const acceptorPublic = { _id: acceptor._id, name: acceptor.name, username: acceptor.username, avatar: acceptor.avatar, college: acceptor.college, isOnline: acceptor.isOnline };
      const requesterPublic = { _id: requester._id, name: requester.name, username: requester.username, avatar: requester.avatar, college: requester.college, isOnline: requester.isOnline };

      io.to(`user:${supabaseId}`).emit('friend:accepted', { friend: requesterPublic, status: 'accepted' });
      io.to(`user:${requester.supabaseId}`).emit('friend:accepted', { friend: acceptorPublic, status: 'accepted' });

      if (callback) callback({ status: 'ok', friend: requesterPublic });
    } catch (err) {
      console.error('friend:accept error:', err);
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── friend:reject ── Reject/friend request
  socket.on('friend:reject', async ({ supabaseId, requesterId }, callback) => {
    try {
      const acceptor = await User.findOne({ supabaseId });
      if (!acceptor) {
        if (callback) callback({ status: 'error', message: 'User not found' });
        return;
      }
      acceptor.friendRequests = acceptor.friendRequests.filter(r => String(r.from) !== String(requesterId));
      await acceptor.save();

      io.to(`user:${supabaseId}`).emit('friend:rejected', { requesterId });

      if (callback) callback({ status: 'ok' });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── friend:unfriend ── Remove friend + clear DM history
  socket.on('friend:unfriend', async ({ supabaseId, friendId }, callback) => {
    try {
      await Promise.all([
        User.updateOne({ supabaseId }, { $pull: { friends: friendId } }),
        User.updateOne({ supabaseId: friendId }, { $pull: { friends: { $in: [supabaseId] } } }),
      ]);

      // Delete all DM history between the two users
      await Message.deleteMany({
        $or: [
          { senderId: supabaseId, recipientId: friendId },
          { senderId: friendId, recipientId: supabaseId },
        ],
      });

      // Remove from sent requests if any
      await User.updateOne({ supabaseId }, { $pull: { sentRequests: friendId } });

      const user = await getUser(supabaseId);
      io.to(`user:${friendId}`).emit('friend:unfriended', { friendId: user?._id?.toString?.() || user?.supabaseId });

      if (callback) callback({ status: 'ok' });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── friend:list ── Get current user's friends
  socket.on('friend:list', async ({ supabaseId }, callback) => {
    try {
      const friends = await getUserFriends(supabaseId);
      if (callback) callback({ status: 'ok', friends });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ── conversations:refresh ── Refresh conversation list
  socket.on('conversations:refresh', async ({ supabaseId }, callback) => {
    try {
      const conversations = await getUserConversations(supabaseId);
      io.to(`user:${supabaseId}`).emit('conversations:update', conversations);
      if (callback) callback({ status: 'ok', conversations });
    } catch (err) {
      if (callback) callback({ status: 'error', message: err.message });
    }
  });

  // ═══════════════════════════════════════════════════════
  // ── CHANNEL SOCKET EVENTS ─────────────────────────────
  // ═══════════════════════════════════════════════════════

  // ── channel:join ── Join a channel room + load history
  socket.on('channel:join', async ({ supabaseId, channelId }, callback) => {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) { if (callback) callback({ status: 'error', message: 'Channel not found' }); return; }
      if (channel.isPrivate && !channel.members.includes(supabaseId)) {
        if (callback) callback({ status: 'error', message: 'Not a member of this private channel' }); return;
      }

      socket.join(`channel:${channelId}`);

      // Load last 50 messages
      const msgs = await getChannelHistory(channelId);
      const senderIds = [...new Set(msgs.map(m => m.senderId))];
      const senders = await User.find({ supabaseId: { $in: senderIds } }).select('_id supabaseId name username avatar').lean();
      const senderMap = new Map(senders.map(s => [s.supabaseId, s]));
      const enriched = msgs.map(m => ({ ...m, sender: senderMap.get(m.senderId) }));

      if (callback) callback({
        status: 'ok',
        channel: { _id: channel._id, name: channel.name, description: channel.description, isPrivate: channel.isPrivate, createdBy: channel.createdBy, members: channel.members, admins: channel.admins },
        messages: enriched,
      });
    } catch (err) { if (callback) callback({ status: 'error', message: err.message }); }
  });

  // ── channel:leave ── Leave a channel room
  socket.on('channel:leave', ({ supabaseId, channelId }) => {
    socket.leave(`channel:${channelId}`);
  });

  // ── channel:send ── Send a message to a channel
  socket.on('channel:send', async ({ supabaseId, channelId, text, type = 'text', imageUrl, replyTo }, callback) => {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) { if (callback) callback({ status: 'error', message: 'Channel not found' }); return; }
      if (!channel.members.includes(supabaseId)) { if (callback) callback({ status: 'error', message: 'Not a member' }); return; }

      const msg = await Message.create({ text, senderId: supabaseId, channelId: String(channelId), type, imageUrl: imageUrl || '', replyTo });
      const sender = await getUser(supabaseId);

      // Broadcast to everyone in the channel room
      io.to(`channel:${channelId}`).emit('channel:message', { ...msg.toObject(), sender });

      if (callback) callback({ status: 'ok', message: { ...msg.toObject(), sender } });
    } catch (err) { if (callback) callback({ status: 'error', message: err.message }); }
  });

  // ── channel:load ── Load more channel history
  socket.on('channel:load', async ({ channelId, page }, callback) => {
    try {
      const msgs = await getChannelHistory(channelId, page || 1);
      const senderIds = [...new Set(msgs.map(m => m.senderId))];
      const senders = await User.find({ supabaseId: { $in: senderIds } }).select('_id supabaseId name username avatar').lean();
      const senderMap = new Map(senders.map(s => [s.supabaseId, s]));
      if (callback) callback({ messages: msgs.map(m => ({ ...m, sender: senderMap.get(m.senderId) })), hasMore: msgs.length === 50 });
    } catch (err) { if (callback) callback({ error: err.message }); }
  });

  // ── channel:typing ── Typing in channel
  socket.on('channel:typing', ({ supabaseId, username, channelId }) => {
    socket.to(`channel:${channelId}`).emit('channel:typing', { supabaseId, username, channelId });
  });
  socket.on('channel:typing:stop', ({ supabaseId, channelId }) => {
    socket.to(`channel:${channelId}`).emit('channel:typing:stop', { supabaseId, channelId });
  });

  // ── channel:react ── React to channel message
  socket.on('channel:react', async ({ supabaseId, messageId, emoji, action }, callback) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) { if (callback) callback({ status: 'error' }); return; }
      const reactions = msg.reactions || new Map();
      if (action === 'remove') {
        for (const [key, list] of reactions) {
          const filtered = list.filter(r => r.userId !== supabaseId);
          if (filtered.length === 0) reactions.delete(key);
          else reactions.set(key, filtered);
        }
      } else {
        const sender = await getUser(supabaseId);
        const existing = reactions.get(emoji) || [];
        const idx = existing.findIndex(r => r.userId === supabaseId);
        const entry = { userId: supabaseId, username: sender?.username, emoji, createdAt: new Date() };
        if (idx >= 0) existing[idx] = entry; else existing.push(entry);
        reactions.set(emoji, existing);
      }
      await msg.updateOne({ reactions });
      io.to(`channel:${msg.channelId}`).emit('channel:react', { messageId, reactions: Object.fromEntries(reactions), emoji });
      if (callback) callback({ status: 'ok', reactions: Object.fromEntries(reactions) });
    } catch (err) { if (callback) callback({ status: 'error', message: err.message }); }
  });

  // ── channel:seen ── Mark all channel messages as read
  socket.on('channel:seen', async ({ supabaseId, channelId }) => {
    try {
      await Message.updateMany(
        { channelId, readBy: { $ne: supabaseId } },
        { $addToSet: { readBy: supabaseId } }
      );
    } catch (err) { console.error('channel:seen error:', err); }
  });

  // ── disconnect ──
  socket.on('disconnect', async () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    const supabaseId = socketToUserId.get(socket.id);
    const deviceId = socketToDevice.get(socket.id);

    deviceToSocket.delete(deviceId);
    socketToDevice.delete(socket.id);
    socketToUserId.delete(socket.id);

    if (supabaseId && userIdToSockets.has(supabaseId)) {
      userIdToSockets.get(supabaseId).delete(socket.id);
      if (userIdToSockets.get(supabaseId).size === 0) {
        userIdToSockets.delete(supabaseId);
        await setUserOnline(supabaseId, false);
        await emitOnlineUsers();
      }
    }
  });
});

// ─── Seed channels ──────────────────────────────────────
const seedChannels = async () => {
  const existing = await Channel.findOne({ name: 'general' });
  if (!existing) {
    await Channel.create({
      name: 'general',
      description: 'The default channel for everyone. Say hi!',
      isPrivate: false,
      createdBy: 'system',
      members: [],
      admins: ['system'],
    });
    console.log('  ✅ Seeded #general channel');
  }
};

// ─── Start ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  await connectDB();
  await seedChannels();
  console.log(`🚀 Studex Chat Server running on port ${PORT}`);
});