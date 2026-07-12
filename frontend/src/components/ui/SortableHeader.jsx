import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export const SortableHeader = ({ label, sortKey, requestSort, sortConfig, className = '' }) => {
  const isSorted = sortConfig.key === sortKey;
  
  return (
    <th 
      className={`p-4 font-semibold cursor-pointer select-none hover:text-slate-900 dark:hover:text-neutral-100 transition-colors ${className}`}
      onClick={() => requestSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        {isSorted ? (
          sortConfig.direction === 'ascending' ? (
            <ArrowUp className="w-4 h-4 text-blue-600" />
          ) : (
            <ArrowDown className="w-4 h-4 text-blue-600" />
          )
        ) : (
          <ArrowUpDown className="w-4 h-4 text-slate-300" />
        )}
      </div>
    </th>
  );
};
