export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      let cell = row[header];
      if (cell === null || cell === undefined) {
        cell = '';
      } else if (typeof cell === 'string') {
        // Escape quotes
        cell = cell.replace(/"/g, '""');
        // Wrap in quotes if it contains comma, newline, or quote
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
      }
      return cell;
    }).join(',');
  });

  // Combine headers and rows
  const csvString = [headers.join(','), ...csvRows].join('\n');
  
  // Create Blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
