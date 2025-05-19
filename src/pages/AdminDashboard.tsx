import React, { useState } from 'react';
import { useRecords } from '../contexts/RecordsContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Record } from '../types';
import { BarChart, PieChart, Calendar, Users, Filter, Trash2, Edit, Key } from 'lucide-react';
import RecordList from '../components/RecordList';
import DepartmentSelector from '../components/DepartmentSelector';
import StatisticCard from '../components/StatisticCard';
import Charts from '../components/Charts';
import { toast } from 'react-toastify';

const AdminDashboard: React.FC = () => {
  const { user, getAllUsers, deleteUser, updateUser } = useAuth();
  const { 
    records, 
    getUsersLoggedToday, 
    getUsersNotLoggedToday,
    getRecordsByDepartment,
  } = useRecords();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'logged' | 'notLogged' | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (!user || user.role !== 'admin') return null;

  const usersLoggedToday = getUsersLoggedToday();
  const usersNotLoggedToday = getUsersNotLoggedToday();
  const allUsers = getAllUsers();

  let filteredRecords = selectedDepartment 
    ? getRecordsByDepartment(selectedDepartment) 
    : records;

  if (dateFilter) {
    filteredRecords = filteredRecords.filter(record => 
      record.date.split('T')[0] === dateFilter
    );
  }

  const departments = Array.from(new Set(records.map(record => record.department)));
  
  const recordsPerDepartment = departments.map(dept => ({
    name: dept,
    count: records.filter(record => record.department === dept).length
  }));

  let filteredUsers: User[] = [];
  if (filterStatus === 'logged') {
    filteredUsers = usersLoggedToday;
  } else if (filterStatus === 'notLogged') {
    filteredUsers = usersNotLoggedToday;
  }

  const handleDeleteUser = (userId: string) => {
    try {
      deleteUser(userId);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Cannot delete admin account');
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    try {
      updateUser(updatedUser);
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Manage employee records and view department statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatisticCard 
          title="Total Records"
          value={records.length.toString()}
          icon={<BarChart className="h-6 w-6 text-blue-500" />}
          color="bg-blue-100"
        />
        
        <StatisticCard 
          title="Active Employees"
          value={usersLoggedToday.length.toString()}
          icon={<Users className="h-6 w-6 text-green-500" />}
          color="bg-green-100"
        />
        
        <StatisticCard 
          title="Departments"
          value={departments.length.toString()}
          icon={<PieChart className="h-6 w-6 text-purple-500" />}
          color="bg-purple-100"
        />
        
        <StatisticCard 
          title="Inactive Employees"
          value={usersNotLoggedToday.length.toString()}
          icon={<Calendar className="h-6 w-6 text-red-500" />}
          color="bg-red-100"
        />
      </div>

      <div className="mb-8">
        <Charts 
          recordsPerDepartment={recordsPerDepartment}
          departments={departments as string[]}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
          <Filter className="mr-2" size={20} />
          Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <DepartmentSelector 
              departments={['all', ...departments] as string[]}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={(dept) => {
                setSelectedDepartment(dept === 'all' ? null : dept);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value as any || null)}
            >
              <option value="">All Employees</option>
              <option value="logged">Logged Today</option>
              <option value="notLogged">Not Logged Today</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filterStatus && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {filterStatus === 'logged' ? 'Employees Logged Today' : 'Employees Not Logged Today'}
          </h3>
          
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user.username === 'SAFAD' ? 'SA' : getInitials(user.name)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        filterStatus === 'logged' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {filterStatus === 'logged' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.username !== 'SAFAD' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Records {selectedDepartment ? `(${selectedDepartment})` : ''}
          {dateFilter ? ` - ${new Date(dateFilter).toLocaleDateString()}` : ''}
        </h3>
        
        <RecordList records={filteredRecords} isAdmin />
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="accounting">Accounting</option>
                  <option value="engineering">Engineering</option>
                  <option value="technology">Technology</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(editingUser)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;