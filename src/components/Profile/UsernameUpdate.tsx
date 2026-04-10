import React, { useState } from 'react';
import { Check, X, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface UsernameUpdateProps {
  currentUsername: string;
  onUpdate: (newUsername: string) => void;
  onCancel: () => void;
}

const UsernameUpdate: React.FC<UsernameUpdateProps> = ({
  currentUsername,
  onUpdate,
  onCancel,
}) => {
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }
    
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    
    if (username.startsWith('_') || username.endsWith('_')) {
      return 'Username cannot start or end with underscore';
    }
    
    if (username.includes('__')) {
      return 'Username cannot contain consecutive underscores';
    }
    
    return null;
  };

  const handleUpdate = async () => {
    if (!user) return;

    const validationError = validateUsername(newUsername);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newUsername === currentUsername) {
      onCancel();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newUsername)
        .neq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingUser) {
        setError('Username is already taken');
        setLoading(false);
        return;
      }

      // Update username
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      onUpdate(newUsername);
    } catch (err) {
      console.error('Error updating username:', err);
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
      <div className="flex items-center space-x-2 mb-3">
        <User className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Update Username</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              @
            </span>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter username"
              className="w-full pl-8 pr-4 py-2.5 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Username Guidelines:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• 3-20 characters long</li>
            <li>• Only letters, numbers, and underscores</li>
            <li>• Cannot start or end with underscore</li>
            <li>• No consecutive underscores</li>
            <li>• Must be unique across all users</li>
          </ul>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading || newUsername === currentUsername}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Update</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsernameUpdate;
