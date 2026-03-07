import React from 'react';
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileType,
  File
} from 'lucide-react';

const fileTypeConfig = {
  pdf: { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/20' },
  doc: { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
  docx: { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
  ppt: { icon: FileType, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  pptx: { icon: FileType, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  jpg: { icon: FileImage, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  jpeg: { icon: FileImage, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  png: { icon: FileImage, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  gif: { icon: FileImage, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  txt: { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  xls: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' }
};

const FileIcon = ({ fileType, size = 'md', className = '' }) => {
  const config = fileTypeConfig[fileType?.toLowerCase()] || { 
    icon: File, 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-100 dark:bg-gray-800' 
  };
  
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} ${config.bgColor} rounded-lg flex items-center justify-center ${className}`}>
      <IconComponent className={`${iconSizes[size]} ${config.color}`} />
    </div>
  );
};

export default FileIcon;
