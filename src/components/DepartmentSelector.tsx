import React from 'react';

interface DepartmentSelectorProps {
  departments: string[];
  selectedDepartment: string | null;
  onSelectDepartment: (department: string) => void;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
}) => {
  const getColorClass = (department: string) => {
    switch (department.toLowerCase()) {
      case 'accounting':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'engineering':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'technology':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'all':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {departments.map((department) => (
        <button
          key={department}
          onClick={() => onSelectDepartment(department)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getColorClass(department)} ${
            selectedDepartment === department || (department === 'all' && selectedDepartment === null)
              ? 'ring-2 ring-offset-1 ring-blue-500'
              : ''
          }`}
        >
          {department === 'all' ? 'All Departments' : department.charAt(0).toUpperCase() + department.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default DepartmentSelector;