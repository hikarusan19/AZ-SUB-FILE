import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const DocHistoryPage = () => {
    const { monitoringData, loadMonitoringData } = useApp();
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        loadMonitoringData();
    }, []);

    // Filter Logic
    const submissions = monitoringData.filter(item => {
        const hasDocuments = item.form_type;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const name = (item.client_name || item.client_first_name || '').toLowerCase();
            const serial = (item.serial_number || '').toLowerCase();
            const policy = (item.policy_type || '').toLowerCase();
            matchesSearch = name.includes(term) || serial.includes(term) || policy.includes(term);
        }

        return hasDocuments && matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // --- PAGINATION CALCULATIONS ---
    const totalPages = Math.ceil(submissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = submissions.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const updateStatus = async (id, newStatus) => {
        if (!confirm(`Mark this submission as ${newStatus}?`)) return;
        try {
            const res = await api.updateSubmissionStatus(id, newStatus);
            if (res.success) {
                alert('Status Updated Successfully! ✓');
                loadMonitoringData();
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    // Get status styling
    const getStatusStyle = (status) => {
        const styles = {
            'Pending': { color: '#856404', bg: '#fff3cd', border: '#ffc107', icon: '⏱' },
            'Issued': { color: '#155724', bg: '#d4edda', border: '#28a745', icon: '✓' },
            'Declined': { color: '#721c24', bg: '#f8d7da', border: '#dc3545', icon: '✕' }
        };
        return styles[status] || styles['Pending'];
    };

    // Count by status
    const statusCounts = {
        All: submissions.length,
        Pending: submissions.filter(s => s.status === 'Pending').length,
        Issued: submissions.filter(s => s.status === 'Issued').length,
        Declined: submissions.filter(s => s.status === 'Declined').length
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="history-header-controls">
                    <div>
                        <h2 style={{ margin: '0 0 8px 0' }}>Document Submission History</h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                            Review and manage all document submissions
                        </p>
                    </div>
                    <div className="history-search-group">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="🔍 Search client, serial, or policy..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                onFocus={(e) => e.target.style.borderColor = '#0055b8'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '2px solid #e9ecef',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#495057',
                                cursor: 'pointer',
                                background: 'white',
                                minWidth: '160px'
                            }}
                        >
                            <option value="All">All Statuses ({statusCounts.All})</option>
                            <option value="Pending">⏱ Pending ({statusCounts.Pending})</option>
                            <option value="Issued">✓ Issued ({statusCounts.Issued})</option>
                            <option value="Declined">✕ Declined ({statusCounts.Declined})</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="card-body">
                {currentItems.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
                        <h3 style={{ color: '#495057', marginBottom: '8px' }}>No submissions found</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            {searchTerm || statusFilter !== 'All'
                                ? 'Try adjusting your filters or search terms'
                                : 'Document submissions will appear here once created'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="doc-grid">
                            {currentItems.map(item => {
                                const statusStyle = getStatusStyle(item.status || 'Pending');

                                return (
                                    <div key={item.id} className="doc-card" style={{ borderLeft: `5px solid ${statusStyle.border}` }}>
                                        {/* Header: Name & Status */}
                                        <div className="doc-card-header">
                                            <div>
                                                <div style={{
                                                    fontSize: '20px',
                                                    fontWeight: '700',
                                                    color: '#2c3e50',
                                                    marginBottom: '6px'
                                                }}>
                                                    {item.client_name || `${item.client_first_name} ${item.client_last_name}`}
                                                </div>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    color: '#6c757d',
                                                    background: '#f8f9fa',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    fontWeight: '500'
                                                }}>
                                                    📄 Document Submission
                                                </div>
                                            </div>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 18px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: statusStyle.color,
                                                background: statusStyle.bg,
                                                border: `2px solid ${statusStyle.border}`,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {statusStyle.icon} {item.status || 'Pending'}
                                            </span>
                                        </div>

                                        {/* Body: Information Grid */}
                                        <div className="doc-info-grid" style={{ marginBottom: item.status === 'Pending' ? '20px' : '0' }}>
                                            <div>
                                                <div className="info-label">Serial Number</div>
                                                <div className="table-serial-badge">
                                                    {item.serial_number}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="info-label">Policy Type</div>
                                                <div className="info-value">{item.policy_type}</div>
                                            </div>
                                            <div>
                                                <div className="info-label">Submission Date</div>
                                                <div className="info-value">
                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="info-label">Agency</div>
                                                <div className="info-value" style={{ fontWeight: '500' }}>{item.agency || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="info-label">Form Type</div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#0055b8',
                                                    background: '#e3f2fd',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    display: 'inline-block'
                                                }}>{item.form_type}</div>
                                            </div>
                                            <div>
                                                <div className="info-label">Payment Mode</div>
                                                <div className="info-value">{item.mode_of_payment || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Only for Pending) */}
                                        {item.status === 'Pending' && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '12px',
                                                marginTop: '20px',
                                                paddingTop: '20px',
                                                borderTop: '2px solid #f8f9fa'
                                            }}>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Issued')}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px 24px',
                                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                                    }}
                                                >
                                                    <span style={{ fontSize: '18px' }}>✓</span> Issue Policy
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Declined')}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px 24px',
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                                    }}
                                                >
                                                    <span style={{ fontSize: '18px' }}>✕</span> Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- ENHANCED PAGINATION CONTROLS --- */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, submissions.length)} of {submissions.length} submissions
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

export default DocHistoryPage;