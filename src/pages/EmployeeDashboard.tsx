import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRecords } from '../contexts/RecordsContext';
import { toast } from 'react-toastify';
import { Calendar, FileUp, CheckCircle } from 'lucide-react';
import RecordList from '../components/RecordList';
import NewRecordModal from '../components/NewRecordModal';
import Clock from '../components/Clock';
import { format } from 'date-fns';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeRecords, deleteRecord, updateRecord } = useRecords();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  if (!user) return null;

  const employeeRecords = getEmployeeRecords(user.id);
  const todayRecords = employeeRecords.filter(record => {
    return new Date(record.date).toDateString() === new Date().toDateString();
  });
  
  const hasLoggedToday = todayRecords.length > 0;

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteRecord(recordId);
      toast.success('Record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="py-6 px-4 md:px-8" dir="ltr">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, <span className="text-blue-600">{user.name}</span>
            </h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Clock />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className={`p-3 rounded-full mr-4 ${hasLoggedToday ? 'bg-green-100 text-green-500' : 'bg-yellow-100 text-yellow-500'}`}>
            {hasLoggedToday ? <CheckCircle size={24} /> : <Calendar size={24} />}
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Today's Status</h3>
            <p className={`text-sm ${hasLoggedToday ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasLoggedToday 
                ? `You've logged ${todayRecords.length} record${todayRecords.length !== 1 ? 's' : ''} today` 
                : "You haven't logged any records today"}
            </p>
          </div>
        </div>
        
        {/* Department Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Department</h3>
            <p className="text-sm text-gray-600">
              {user.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : 'Not Assigned'}
            </p>
          </div>
        </div>
        
        {/* Total Records Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Total Records</h3>
            <p className="text-sm text-gray-600">
              {employeeRecords.length} record{employeeRecords.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Records</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200"
        >
          <FileUp className="mr-2" size={16} />
          Add New Record
        </button>
      </div>

      <RecordList 
        records={employeeRecords}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
      />

      <NewRecordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingRecord={editingRecord}
      />
    </div>
  );
};

export default EmployeeDashboard;