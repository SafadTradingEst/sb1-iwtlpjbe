import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, name: string, department: string) => Promise<void>;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store users in localStorage
const USERS_STORAGE_KEY = 'app_users';

// Initialize with SAFAD admin account only
const initialUsers: User[] = [
  {
    id: '1',
    username: 'SAFAD',
    password: 'SAFAD',
    name: 'SAFAD',
    role: 'admin',
    avatarUrl: 'SAFAD',
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const register = async (username: string, password: string, name: string, department: string) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }

    const initials = name.split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      name,
      role: 'employee',
      department,
      avatarUrl: initials,
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    return;
  };

  const login = async (username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!foundUser) {
      throw new Error('Invalid username or password');
    }

    if (foundUser.password !== password) {
      throw new Error('Invalid username or password');
    }
    
    setUser(foundUser);
    localStorage.setItem('user', JSON.stringify(foundUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  const deleteUser = (userId: string) => {
    // Prevent deleting SAFAD account
    if (userId === '1') {
      throw new Error('Cannot delete admin account');
    }
    
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    
    // If deleted user is currently logged in, log them out
    if (user?.id === userId) {
      logout();
    }
  };

  const getAllUsers = () => {
    return users;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      updateUser,
      deleteUser,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};