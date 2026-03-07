import React from 'react';
import { FileX, Search, Bookmark, Inbox } from 'lucide-react';

const icons = {
  file: FileX,
  search: Search,
  bookmark: Bookmark,
  inbox: Inbox
};

const EmptyState = ({ 
  title = 'No items found', 
  description = 'There are no items to display at the moment.',
  icon = 'file',
  action = null
}) => {
  const IconComponent = icons[icon] || FileX;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
