import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text:    { type: String, default: '' },
  senderId: { type: String, required: true, index: true }, // supabaseId

  // ── Channel messages ──────────────────────────────────
  channelId: { type: String, index: true }, // MongoDB Channel _id

  // ── Direct messages ────────────────────────────────────
  // dmRoomId = sorted [userId1, userId2].join('-') for consistent pairing
  dmRoomId:     { type: String, index: true },
  recipientId:  { type: String, index: true }, // supabaseId (for 1-on-1 lookup)

  // ── Message content ────────────────────────────────────
  type:     { type: String, enum: ['text', 'system', 'image', 'file', 'gif'], default: 'text' },
  imageUrl: { type: String, default: '' },

  // ── Read tracking ──────────────────────────────────────
  // For channels: which users have read this message
  readBy: [{ type: String }], // supabaseIds

  // ── Reactions ─────────────────────────────────────────
  reactions: {
    type: Map,
    of: [{
      userId:    String,
      username:  String,
      emoji:     String,
      createdAt: { type: Date, default: Date.now },
    }],
    default: {},
  },

  // ── Reply / quote ─────────────────────────────────────
  replyTo: {
    messageId: String,
    text:      String,
    senderName: String,
  },

  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Channel message queries
messageSchema.index({ channelId: 1, createdAt: -1 });
// DM queries
messageSchema.index({ dmRoomId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;