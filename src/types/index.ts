export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'admin' | 'employee';
  department?: string;
  avatarUrl: string;
}

export interface Record {
  id: string;
  userId: string;
  userName: string;
  description: string;
  projectName: string;
  fileUrls: string[];
  department: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Department {
  id: string;
  name: string;
}