import { useState, useRef, useEffect } from 'react';
import { X, Lock, Hash } from 'lucide-react';

const CHANNEL_NAME_REGEX = /^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$|^[a-z0-9]$/;

interface CreateChannelModalProps {
  onCreate: (name: string, description: string, isPrivate: boolean) => Promise<void>;
  onClose: () => void;
  existingChannelNames: string[];
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ onCreate, onClose, existingChannelNames }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const isSubmitting = useRef(false); // guard against double submission

  useEffect(() => { nameRef.current?.focus(); }, []);

  // Safety net: if loading hangs for >5s, force-stop the spinner
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
  let validation = '';

  if (slug && !CHANNEL_NAME_REGEX.test(slug)) {
    validation = 'Use lowercase letters, numbers, hyphens. 2–32 chars.';
  } else if (['general'].includes(slug)) {
    validation = '"#general" already exists.';
  } else if (existingChannelNames.includes(slug)) {
    validation = 'Channel name already taken.';
  }

  const canSubmit = slug.length >= 2 && !validation && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting.current) return;
    isSubmitting.current = true;
    setError('');
    setLoading(true);
    try {
      await onCreate(slug, description.trim(), isPrivate);
      onClose(); // 1. immediate close on success
      setName('');  // 2. reset form
      setDescription('');
      setIsPrivate(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-[#13131a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {isPrivate ? <Lock className="w-4 h-4 text-white" /> : <Hash className="w-4 h-4 text-white" />}
            </div>
            <h3 className="text-white font-semibold text-base">Create Channel</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                {isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </span>
              <input
                ref={nameRef}
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="e.g. placements, campus-events"
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:outline-none text-sm transition"
              />
            </div>
            {slug && (
              <p className={`text-xs mt-1.5 ${validation ? 'text-red-400' : 'text-emerald-400'}`}>
                {validation || `Preview: #${slug}`}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Description <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:outline-none text-sm transition"
            />
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/6 rounded-xl cursor-pointer select-none" onClick={() => setIsPrivate(!isPrivate)}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${isPrivate ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Private Channel</p>
                <p className="text-gray-500 text-xs">Only invited members can view</p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition relative ${isPrivate ? 'bg-indigo-500' : 'bg-gray-700'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${isPrivate ? 'right-0.5' : 'right-5'}`} />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-gray-300 rounded-xl text-sm font-medium transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition shadow-lg"
            >
              {loading ? <span className="flex justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></span> : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};