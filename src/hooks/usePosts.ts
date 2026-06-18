import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { useCommunityAccess } from './useCommunityAccess';
import { Post, User } from '../types';

export const usePosts = (scope: 'college' | 'global' = 'college') => {
  const { user } = useAuth();
  const { canCreate, canLike } = useCommunityAccess();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, scope]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('posts')
        .select(`*, post_likes (count)`)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedPosts: Post[] = [];
      
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        
        const profilesResponse = await supabase
          .from('profiles')
          .select('id, user_id, name, email, college, branch, year, is_verified, avatar_url')
          .in('user_id', userIds);
        
        const profileMap = new Map(
          (profilesResponse.data || []).map((p: any) => [p.user_id, p])
        );

        for (const post of data) {
          if (scope === 'college' && profileMap.get(post.user_id)?.college !== user.college) {
            continue;
          }
          
          const profile = profileMap.get(post.user_id);
          
          formattedPosts.push({
            id: post.id,
            userId: post.user_id,
            author: {
              id: profile?.id || post.user_id,
              name: post.is_anonymous ? 'Anonymous' : (profile?.name || 'Unknown'),
              email: profile?.email || '',
              college: profile?.college || '',
              branch: profile?.branch || '',
              year: profile?.year || 1,
              isVerified: profile?.is_verified || false,
              isAnonymous: post.is_anonymous,
              avatar: profile?.avatar_url || null,
              joinedAt: new Date(),
              lastActive: new Date(),
            },
            content: post.content,
            fileUrl: post.file_url,
            fileName: post.file_name,
            fileType: post.file_type,
            isAnonymous: post.is_anonymous,
            scope: post.scope,
            likes: post.post_likes?.[0]?.count || 0,
            comments: [],
            createdAt: new Date(post.created_at),
            updatedAt: new Date(post.updated_at),
          });
        }
      }

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, file?: File, isAnonymous = false, tags?: string[]) => {
    if (!user) return;
    if (!canCreate) {
      throw new Error('You do not have permission to create posts. Verify your account for full or partial access.');
    }

    try {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `posts/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          is_anonymous: isAnonymous,
          scope,
          tags: tags || [],
        });

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    if (!canLike) return;

    try {
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) throw error;
      await fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const unlikePost = async (postId: string) => {
    if (!user) return;
    if (!canLike) return;

    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchPosts();
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  return {
    posts,
    loading,
    createPost,
    likePost,
    unlikePost,
    refetch: fetchPosts,
  };
};