import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRecords } from '../contexts/RecordsContext';
import { X, FileUp, Check, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord?: Record | null;
}

const NewRecordModal: React.FC<NewRecordModalProps> = ({ isOpen, onClose, editingRecord }) => {
  const { user } = useAuth();
  const { addRecord, updateRecord } = useRecords();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  useEffect(() => {
    if (editingRecord) {
      setDescription(editingRecord.description);
      setProjectName(editingRecord.projectName);
      // Handle files if needed
    }
  }, [editingRecord]);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !projectName) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create URLs for files
      const fileUrls = files.map(file => {
        const url = URL.createObjectURL(file);
        return {
          name: file.name,
          url: url,
          type: file.type
        };
      });
      
      const recordData = {
        userId: user.id,
        userName: user.name,
        description,
        projectName,
        fileUrls: fileUrls.length > 0 ? fileUrls : [],
        department: user.department || 'general',
      };

      if (editingRecord) {
        await updateRecord(editingRecord.id, recordData);
        toast.success('Record updated successfully');
      } else {
        await addRecord(recordData);
        toast.success('Record created successfully');
      }

      setShowConfirmation(true);
      
      // Reset form
      setDescription('');
      setProjectName('');
      setFiles([]);
    } catch (error) {
      toast.error(editingRecord ? 'Failed to update record' : 'Failed to create record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
    onClose();
  };

  // Handle confirmation screen
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Record {editingRecord ? 'Updated' : 'Published'} Successfully
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Your daily task record has been {editingRecord ? 'updated' : 'published'} successfully and is now available in your records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleCloseModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {editingRecord ? 'Edit Record' : 'Add New Task Record'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the details about what you accomplished today.
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      id="projectName"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project or task name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      What did you accomplish today? *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what you accomplished"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Files
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileChange}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Any file type up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                      <ul className="space-y-1">
                        {files.map((file, index) => (
                          <li key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 truncate flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      <strong>Department:</strong> {user.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : 'General'}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Date:</strong> {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Time Range:</strong> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 23:59
                    </p>
                  </div>
                  
                  <div className="sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          
                          </svg>
                          {editingRecord ? 'Updating...' : 'Publishing...'}
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          {editingRecord ? 'Update Record' : 'Publish Record'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRecordModal;