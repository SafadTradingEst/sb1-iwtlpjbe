import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';

interface RecordCardProps {
  record: {
    projectName: string;
    description: string;
    fileUrls: string[];
    date: string;
    startTime: string;
    endTime: string;
  };
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleExportExcel = () => {
    const ws = utils.json_to_sheet([{
      'Project Name': record.projectName,
      'Description': record.description,
      'Date': format(new Date(record.date), 'PPP'),
      'Time': `${record.startTime} - ${record.endTime}`,
      'Attachments': record.fileUrls.length
    }]);

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Record');
    writeFile(wb, `Record_${format(new Date(record.date), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div ref={printRef}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Project Name</h3>
          <p className="text-gray-700 dark:text-gray-300">{record.projectName}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Description</h3>
          <p className="text-gray-700 dark:text-gray-300">{record.description}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Attachments</h3>
          <div className="flex flex-wrap gap-2">
            {record.fileUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                <FileText size={12} className="mr-1" />
                Attachment {index + 1}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">Time</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {format(new Date(`2000-01-01 ${record.startTime}`), 'hh:mm a')} - 
            {format(new Date(`2000-01-01 ${record.endTime}`), 'hh:mm a')}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <FileSpreadsheet size={16} className="mr-2" />
          Export Excel
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <Printer size={16} className="mr-2" />
          Print
        </button>
      </div>
    </div>
  );
};

export default RecordCard;