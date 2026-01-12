import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const SerialHistoryPage = () => {
    const { monitoringData, loadMonitoringData } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadMonitoringData();
    }, []);

    // Filter Logic
    const filteredItems = monitoringData.filter(item => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const name = (item.client_name || item.client_first_name || '').toLowerCase();
            const serial = (item.serial_number || '').toLowerCase();
            return name.includes(term) || serial.includes(term);
        }
        return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Get status badge styling
    const getStatusBadge = (item) => {
        if (item.form_type) {
            return { text: 'Submitted', color: '#28a745', bg: '#d4edda' };
        }
        return { text: 'Pending Docs', color: '#856404', bg: '#fff3cd' };
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="history-header-controls">
                    <div>
                        <h2 style={{ margin: '0 0 5px 0' }}>Serial Request History</h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                            Track all serial number requests and their submission status
                        </p>
                    </div>
                    <div className="history-search-group">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="🔍 Search Serial or Name..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                onFocus={(e) => e.target.style.borderColor = '#0055b8'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                        </div>
                        <div className="total-badge">
                            Total: {filteredItems.length}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body">
                {currentItems.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                        <h3 style={{ color: '#495057', marginBottom: '8px' }}>No serial requests found</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            {searchTerm ? 'Try adjusting your search terms' : 'Serial requests will appear here once created'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="serial-table" style={{ minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>Serial Number</th>
                                        <th style={{ width: '25%' }}>Client Name</th>
                                        <th style={{ width: '25%' }}>Policy Type</th>
                                        <th style={{ width: '15%' }}>Date Generated</th>
                                        <th style={{ width: '20%', textAlign: 'center' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(item => {
                                        const status = getStatusBadge(item);
                                        return (
                                            <tr key={item.id} style={{ transition: 'all 0.2s' }}>
                                                <td>
                                                    <div className="table-serial-badge">
                                                        {item.serial_number}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '2px' }}>
                                                        {item.client_name || `${item.client_first_name} ${item.client_last_name}`}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ color: '#495057' }}>
                                                        {item.policy_type}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className="status-pill" style={{
                                                        color: status.color,
                                                        background: status.bg,
                                                        border: `1px solid ${status.color}30`,
                                                    }}>
                                                        {item.form_type ? '✓' : '⏱'} {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* --- ENHANCED PAGINATION CONTROLS --- */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} requests
                                </div>

                                <div className="pagination-controls">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ← Previous
                                    </button>

                                    <div className="page-info">
                                        Page {currentPage} of {totalPages}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SerialHistoryPage;