import { useState, useMemo } from 'react';

export const useTableData = (data, searchKeys = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let processData = [...data];

    // Search
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      processData = processData.filter((item) => {
        return searchKeys.some((key) => {
          const val = item[key];
          if (val == null) return false;
          return String(val).toLowerCase().includes(lowerQuery);
        });
      });
    }

    // Sort
    if (sortConfig.key !== null) {
      processData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal == null && bVal != null) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bVal == null && aVal != null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal == null && bVal == null) return 0;

        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processData;
  }, [data, searchQuery, sortConfig, searchKeys]);

  return {
    filteredAndSortedData,
    searchQuery,
    setSearchQuery,
    requestSort,
    sortConfig,
  };
};
