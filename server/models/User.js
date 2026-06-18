import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Supabase user auth ID - maps to Supabase auth.users
  supabaseId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  college: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromName: String,
    fromUsername: String,
    fromAvatar: String,
    fromCollege: String,
    createdAt: { type: Date, default: Date.now },
  }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skills: [String],
  achievements: [String],
  isVerified: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  accessLevel: { type: String, enum: ['full', 'partial', 'read_only'], default: 'full' },
}, { timestamps: true });

// Text index for $text search: splits query into words, scores by frequency
userSchema.index({ username: 'text', name: 'text', college: 'text' });
// Compound index for regex search on username + name (for prefix / substring matching)
userSchema.index({ username: 1 });
userSchema.index({ name: 1 });
userSchema.index({ supabaseId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;