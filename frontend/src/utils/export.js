import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const exportToPDF = (data, filename, title) => {
  if (!data || !data.length) return;

  const doc = new jsPDF();
  
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => {
    let cell = row[header];
    return cell !== null && cell !== undefined ? String(cell) : '';
  }));

  autoTable(doc, {
    head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
    body: rows,
    startY: title ? 20 : 10,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235] } // blue-600
  });

  doc.save(filename);
};
