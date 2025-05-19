import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { Printer, FileText, Calendar, FileSpreadsheet, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { toast } from 'react-toastify';

interface RecordListProps {
  records: Record[];
  isAdmin?: boolean;
  onEditRecord?: (record: Record) => void;
  onDeleteRecord?: (recordId: string) => void;
}

const RecordList: React.FC<RecordListProps> = ({ 
  records, 
  isAdmin = false,
  onEditRecord,
  onDeleteRecord 
}) => {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleExportExcel = (record) => {
    const ws = utils.json_to_sheet([{
      'Project Name': record.projectName,
      'Description': record.description,
      'Date': format(new Date(record.date), 'PPP'),
      'Time': `${format(new Date(`2000-01-01 ${record.startTime}`), 'hh:mm aa')} - ${format(new Date(`2000-01-01 ${record.endTime}`), 'hh:mm aa')}`,
      'Department': record.department,
      'Attachments': record.fileUrls.length
    }]);

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Record');
    writeFile(wb, `Record_${format(new Date(record.date), 'yyyy-MM-dd')}.xlsx`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDelete = (recordId: string) => {
    if (onDeleteRecord) {
      onDeleteRecord(recordId);
      setDeleteConfirmId(null);
      toast.success('Record deleted successfully');
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
          No records found
        </h3>
        <p className="text-gray-400 dark:text-gray-500 mt-1">
          {isAdmin ? "No records match your current filter criteria." : "You haven't added any records yet."}
        </p>
      </div>
    );
  }

  // Group records by date
  const groupedRecords = records.reduce((groups, record) => {
    const date = format(new Date(record.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div ref={printRef}>
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {groupedRecords[date].map(record => (
                <div key={record.id} className="p-4 md:p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Project Name:</h4>
                          <p className="text-gray-600 dark:text-gray-300">{record.projectName}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Description:</h4>
                          <p className="text-gray-600 dark:text-gray-300">{record.description}</p>
                        </div>
                        
                        {record.fileUrls && record.fileUrls.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Attachments:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {record.fileUrls.map((file, index) => (
                                <a
                                  key={index}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={file.name}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  <FileText size={12} className="mr-1" />
                                  {file.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Time:</h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {format(new Date(`2000-01-01 ${record.startTime}`), 'hh:mm aa')} - 
                            {format(new Date(`2000-01-01 ${record.endTime}`), 'hh:mm aa')}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {onEditRecord && (
                          <button
                            onClick={() => onEditRecord(record)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            title="Edit Record"
                          >
                            <Edit size={20} />
                          </button>
                        )}
                        {onDeleteRecord && (
                          <button
                            onClick={() => setDeleteConfirmId(record.id)}
                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                            title="Delete Record"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handleExportExcel(record)}
                          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Export to Excel"
                        >
                          <FileSpreadsheet size={20} />
                        </button>
                        <button
                          onClick={handlePrint}
                          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Print Record"
                        >
                          <Printer size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Record
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordList;