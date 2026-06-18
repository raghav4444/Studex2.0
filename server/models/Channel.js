import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minLength: 2,
    maxLength: 32,
    match: /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, // lowercase, hyphens, no start/end hyphen
  },
  description: {
    type: String,
    default: '',
    maxLength: 200,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdBy: { type: String, required: true }, // supabaseId
  members: [{ type: String }], // supabaseIds
  admins: [{ type: String }],   // supabaseIds
}, { timestamps: true });

channelSchema.index({ name: 'text', description: 'text' });

const Channel = mongoose.model('Channel', channelSchema);
export default Channel;