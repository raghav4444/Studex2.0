import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ChatSearchResult } from '../types';

export const useUserSearch = () => {
  const [searchResults, setSearchResults] = useState<ChatSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Searching for users with query:', query);
      
      // Search in profiles table using the actual field names from your database
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          name,
          email,
          college,
          branch,
          year,
          avatar_url
        `)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);

      if (searchError) {
        console.error('Search error:', searchError);
        throw searchError;
      }

      console.log('Search results:', data);

      const results: ChatSearchResult[] = (data || []).map(profile => ({
        id: profile.user_id,
        name: profile.name,
        username: profile.email?.split('@')[0] || profile.name.toLowerCase().replace(/\s+/g, ''),
        avatar: profile.avatar_url,
        college: profile.college,
        branch: profile.branch,
        year: profile.year,
        isOnline: false,
        lastSeen: undefined,
      }));

      console.log('Mapped results:', results);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchUsers,
    clearSearch,
  };
};
