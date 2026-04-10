import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const savedUser = localStorage.getItem('campuslink_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      college: 'MIT',
      branch: 'Computer Science',
      year: 3,
      bio: 'Passionate about web development and AI',
      isVerified: true,
      isAnonymous: false,
      createdAt: new Date(),
    };
    
    setUser(mockUser);
    localStorage.setItem('campuslink_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      college: userData.college || '',
      branch: userData.branch || '',
      year: userData.year || 1,
      bio: userData.bio || '',
      isVerified: userData.email?.includes('.edu') || userData.email?.includes('.ac.in') || false,
      isAnonymous: false,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    localStorage.setItem('campuslink_user', JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campuslink_user');
  };

  return {
    user,
    login,
    signup,
    logout,
    loading,
  };
};