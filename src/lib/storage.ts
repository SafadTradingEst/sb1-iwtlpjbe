import { User, Task } from '../types';

// Local Storage Keys
const USERS_KEY = 'task_system_users';
const TASKS_KEY = 'task_system_tasks';
const CURRENT_USER_KEY = 'task_system_current_user';

// Initial admin user
const initialAdmin: User = {
  id: '1',
  username: 'admin',
  password: 'admin',
  name: 'Administrator',
  role: 'admin',
  department: 'administration',
  avatarUrl: 'ADMIN'
};

// Storage Helper Functions
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [initialAdmin];
};

export const setUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getTasks = (): Task[] => {
  const tasks = localStorage.getItem(TASKS_KEY);
  return tasks ? JSON.parse(tasks) : [];
};

export const setTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Auth Functions
export const login = (username: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  setCurrentUser(user);
  return user;
};

export const logout = () => {
  setCurrentUser(null);
};

export const register = (newUser: Omit<User, 'id' | 'role'>): User => {
  const users = getUsers();
  if (users.some(u => u.username === newUser.username)) {
    throw new Error('Username already exists');
  }

  const user: User = {
    ...newUser,
    id: Date.now().toString(),
    role: 'employee'
  };

  setUsers([...users, user]);
  return user;
};

// Task Functions
export const createTask = (task: Omit<Task, 'id' | 'createdAt'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  setTasks([newTask, ...tasks]);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const updatedTask = { ...tasks[taskIndex], ...updates };
  tasks[taskIndex] = updatedTask;
  setTasks(tasks);
  
  return updatedTask;
};

export const deleteTask = (id: string) => {
  const tasks = getTasks();
  setTasks(tasks.filter(t => t.id !== id));
};

export const getUserTasks = (userId: string): Task[] => {
  const tasks = getTasks();
  return tasks.filter(t => t.userId === userId);
};

export const getDepartmentTasks = (department: string): Task[] => {
  const tasks = getTasks();
  return tasks.filter(t => t.department === department);
};