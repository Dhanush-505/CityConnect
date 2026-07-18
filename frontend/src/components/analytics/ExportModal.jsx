import { useState } from 'react';
import { MdClose, MdFileDownload, MdPictureAsPdf, MdTableChart, MdInsertDriveFile } from 'react-icons/md';
import axiosInstance from '../../api/axios';

function ExportModal({ isOpen, onClose, filters, reportTitle = 'CityConnect Complaints Analytics Report' }) {
  const [format, setFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setDownloading(true);
    try {
      const response = await axiosInstance.post('/reports/export', {
        format,
        reportTitle,
        filters
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'text/html' : format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'pdf' ? 'html' : format === 'excel' ? 'xls' : 'csv';
      link.setAttribute('download', `cityconnect_report_${Date.now()}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      alert(err.message || 'Export failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', maxWidth: '440px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdFileDownload size={22} color="#0f4c81" /> Export Report Data
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <MdClose size={22} />
          </button>
        </div>

        <p style={{ color: '#475569', fontSize: '0.85rem', margin: '1rem 0' }}>
          Select your preferred export format for the filtered municipal complaint report:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', background: format === 'pdf' ? '#eff6ff' : '#fff', borderColor: format === 'pdf' ? '#2563eb' : '#cbd5e1' }}>
            <input type="radio" name="exportFormat" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
            <MdPictureAsPdf size={24} color="#dc2626" />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>PDF Printable Web Document (.html / .pdf)</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Formatted document with headers and summary tables</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', background: format === 'excel' ? '#eff6ff' : '#fff', borderColor: format === 'excel' ? '#2563eb' : '#cbd5e1' }}>
            <input type="radio" name="exportFormat" value="excel" checked={format === 'excel'} onChange={() => setFormat('excel')} />
            <MdTableChart size={24} color="#16a34a" />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Excel Spreadsheet (.xls / .xlsx)</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Structured XML Spreadsheet with styled headers</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', background: format === 'csv' ? '#eff6ff' : '#fff', borderColor: format === 'csv' ? '#2563eb' : '#cbd5e1' }}>
            <input type="radio" name="exportFormat" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
            <MdInsertDriveFile size={24} color="#0284c7" />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>CSV Raw Data (.csv)</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Standard comma-separated values for data analysis</span>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={handleExport} disabled={downloading} style={{ background: '#0f4c81', color: '#fff', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
            {downloading ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
