import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserTasks, createTask, updateTask, deleteTask } from '../lib/storage';
import { Task } from '../types';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const user = getCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user) {
      const userTasks = getUserTasks(user.id);
      setTasks(userTasks);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const fileData = await Promise.all(
        files.map(async (file) => {
          return new Promise<{ name: string; url: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                name: file.name,
                url: reader.result as string
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const taskData = {
        userId: user!.id,
        userName: user!.name,
        title,
        description,
        department: user!.department,
        files: fileData
      };

      if (editingTask) {
        const updated = updateTask(editingTask.id, taskData);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success('Task updated successfully');
      } else {
        const newTask = createTask(taskData);
        setTasks(prev => [newTask, ...prev]);
        toast.success('Task created successfully');
      }

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFiles([]);
      setEditingTask(null);
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleDelete = (taskId: string) => {
    try {
      deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Department: {user?.department}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
          >
            <Plus className="mr-2" size={20} />
            New Task
          </button>
        </div>

        <div className="grid gap-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                  {task.files && task.files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">Attachments:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.files.map((file, index) => (
                          <a
                            key={index}
                            href={file.url}
                            download={file.name}
                            className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                          >
                            <FileText size={14} className="mr-1" />
                            {file.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    Created: {format(new Date(task.createdAt), 'PPp')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTask(null);
                      setTitle('');
                      setDescription('');
                      setFiles([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingTask ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;