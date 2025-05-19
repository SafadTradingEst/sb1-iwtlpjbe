import React, { createContext, useContext, useState, useEffect } from 'react';
import { Record, User } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface RecordsContextType {
  records: Record[];
  loading: boolean;
  addRecord: (record: Omit<Record, 'id' | 'date' | 'startTime' | 'endTime'>) => void;
  updateRecord: (id: string, updates: Partial<Record>) => void;
  deleteRecord: (id: string) => void;
  getEmployeeRecords: (userId: string) => Record[];
  getUsersLoggedToday: () => User[];
  getUsersNotLoggedToday: () => User[];
  getRecordsByDepartment: (department: string) => Record[];
  getAllUsers: () => User[];
}

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

const RECORDS_STORAGE_KEY = 'app_records';

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<Record[]>(() => {
    const saved = localStorage.getItem(RECORDS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord = (newRecord: Omit<Record, 'id' | 'date' | 'startTime' | 'endTime'>) => {
    try {
      const now = new Date();
      const record: Record = {
        id: Date.now().toString(),
        date: now.toISOString(),
        startTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        endTime: '23:59',
        ...newRecord
      };
      
      setRecords(prev => [record, ...prev]);
      toast.success('Record added successfully');
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Failed to add record');
    }
  };

  const updateRecord = (id: string, updates: Partial<Record>) => {
    try {
      setRecords(prev => prev.map(record => 
        record.id === id ? { ...record, ...updates } : record
      ));
      toast.success('Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    }
  };

  const deleteRecord = (id: string) => {
    try {
      setRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const getEmployeeRecords = (userId: string) => {
    return records.filter(record => record.userId === userId);
  };

  const getUsersLoggedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const loggedUserIds = new Set(
      records
        .filter(record => record.date.startsWith(today))
        .map(record => record.userId)
    );
    
    return getAllUsers().filter(user => loggedUserIds.has(user.id));
  };

  const getUsersNotLoggedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const loggedUserIds = new Set(
      records
        .filter(record => record.date.startsWith(today))
        .map(record => record.userId)
    );
    
    return getAllUsers().filter(user => !loggedUserIds.has(user.id));
  };

  const getRecordsByDepartment = (department: string) => {
    return records.filter(record => record.department === department);
  };

  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('app_users') || '[]');
  };

  return (
    <RecordsContext.Provider value={{ 
      records, 
      loading, 
      addRecord,
      updateRecord,
      deleteRecord,
      getEmployeeRecords, 
      getUsersLoggedToday, 
      getUsersNotLoggedToday,
      getRecordsByDepartment,
      getAllUsers
    }}>
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};