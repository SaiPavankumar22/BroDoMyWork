import React from 'react';
import { User, Hash } from 'lucide-react';

interface UserInfoFormProps {
  name: string;
  rollNumber: string;
  onNameChange: (name: string) => void;
  onRollNumberChange: (rollNumber: string) => void;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({
  name,
  rollNumber,
  onNameChange,
  onRollNumberChange
}) => {
  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        Student Information
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your full name"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Roll Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => onRollNumberChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your roll number"
            />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your name and roll number will appear on the top-right corner 
                of the first page in handwritten style.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};