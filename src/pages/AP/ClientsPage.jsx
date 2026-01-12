import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const ClientsPage = () => {
    // Alias customers to clients for consistency
    const { customers: clients, loadCustomers: loadClients } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [groupedPolicies, setGroupedPolicies] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Toggle to see "Pending" items
    const [showAll, setShowAll] = useState(false);

    // --- NEW: State for Detailed View Modal ---
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [selectedYear, setSelectedYear] = useState('All');
    const [availableYears, setAvailableYears] = useState([]);

    // Track processing actions
    const [processingIds, setProcessingIds] = useState(new Set());

    useEffect(() => {
        handleRefresh();
    }, []);

    const handleRefresh = async () => {
        setIsLoading(true);
        await loadClients();
        setIsLoading(false);
    };

    // --- GROUPING LOGIC ---
    useEffect(() => {
        if (clients && clients.length > 0) {
            const policies = [];

            clients.forEach(c => {
                if (c.submissions && c.submissions.length > 0) {
                    c.submissions.forEach(s => {
                        const status = s.status ? s.status.toLowerCase() : '';

                        // Show if 'issued' OR if 'showAll' is checked
                        if (status === 'issued' || showAll) {
                            policies.push({
                                ...s,
                                id: s.id || s.sub_id,
                                clientName: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Unknown Client',
                                clientEmail: c.email || 'No Email',
                                client_id: c.id
                            });
                        }
                    });
                }
            });

            // Deduplicate policies based on ID
            const uniquePolicies = [];
            const seenIds = new Set();

            policies.forEach(p => {
                if (p.id && !seenIds.has(p.id)) {
                    seenIds.add(p.id);
                    uniquePolicies.push(p);
                } else if (!p.id) {
                    // unexpected, but keep it if no ID
                    uniquePolicies.push({ ...p, _tempId: Math.random() });
                }
            });

            const filtered = uniquePolicies.filter(p =>
                p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.clientEmail && p.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            // Sort Years Descending
            const years = [...new Set(filtered.map(p => {
                if (!p.next_payment_date) return 'Unscheduled';
                const d = new Date(p.next_payment_date);
                return isNaN(d.getTime()) ? 'Invalid' : d.getFullYear().toString();
            }))].sort().reverse();
            setAvailableYears(years);

            // Set default year to current year if available, unless "All" is selected
            if (years.length > 0 && selectedYear === 'All' && !years.includes('All')) {
                // Logic to default to current year could go here, but 'All' is fine
            }

            const groups = {};
            filtered.forEach(p => {
                // Determine Year for filtering
                let year = 'Unscheduled';
                if (p.next_payment_date) {
                    const d = new Date(p.next_payment_date);
                    if (!isNaN(d.getTime())) year = d.getFullYear().toString();
                }

                // Apply Year Filter
                if (selectedYear !== 'All' && year !== selectedYear) return;

                // Group missing dates under "Unscheduled / New"
                if (!p.next_payment_date) {
                    const key = 'Unscheduled / New';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(p);
                    return;
                }

                const d = new Date(p.next_payment_date);
                if (isNaN(d.getTime())) {
                    const key = 'Invalid Date Error';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(p);
                    return;
                }

                // Key format: "Year-MonthIdx|Month Name Year" for easy sorting
                // e.g., "2026-00|January 2026"
                const monthIdx = d.getMonth().toString().padStart(2, '0');
                const fullYear = d.getFullYear();
                const monthName = d.toLocaleString('default', { month: 'long' });

                // We use a comparable key for sorting, but we'll display just the readable part
                const key = `${fullYear}-${monthIdx}|${monthName} ${fullYear}`;

                if (!groups[key]) groups[key] = [];
                groups[key].push(p);
            });

            setGroupedPolicies(groups);
        } else {
            setGroupedPolicies({});
        }
    }, [clients, searchQuery, showAll, selectedYear]);

    const isDateOverdue = (dateString) => {
        if (!dateString) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateString);
        return checkDate < today;
    };

    const markPaid = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Confirm payment received?')) return;

        setProcessingIds(prev => new Set(prev).add(id));

        try {
            const res = await api.markPolicyPaid(id);
            if (res.success) {
                alert(`Payment Recorded! New Due Date: ${res.nextDate}`);
                await handleRefresh();
            }
        } catch (error) {
            console.error('Error marking policy as paid:', error);
            alert('Error recording payment: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // --- UPDATED: Open Modal with Full Policy Object ---
    const handleViewDetails = (policy, e) => {
        e.stopPropagation();
        setSelectedPolicy(policy);
        setShowDetailsModal(true);
    };

    return (
        <div className="card">
            <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Client Payment Board</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showAll}
                                onChange={(e) => setShowAll(e.target.checked)}
                            />
                            Show All (Inc. Pending)
                        </label>

                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading ? 'wait' : 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            {isLoading ? 'Refreshing...' : ' Refresh Data'}
                        </button>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ced4da',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#495057'
                            }}
                        >
                            <option value="All">All Years</option>
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search Client by Name or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-btn">Search</button>
                </div>

                {Object.keys(groupedPolicies).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        {isLoading ? 'Loading...' : 'No policies found.'}
                    </div>
                ) : (
                    Object.entries(groupedPolicies)
                        .sort((a, b) => a[0].localeCompare(b[0])) // Sort by the "Year-MonthIdx" key prefix
                        .map(([sortKey, items]) => {
                            // Extract readable title from key "2026-00|January 2026"
                            const monthStr = sortKey.includes('|') ? sortKey.split('|')[1] : sortKey;

                            const overdueCount = items.filter(i => isDateOverdue(i.next_payment_date)).length;
                            const pendingCount = items.length - overdueCount;

                            return (
                                <div key={monthStr} className="month-container">
                                    <div className="month-header">
                                        <div className="month-title">{monthStr}</div>
                                        <div className="month-stats">
                                            <span className="stat-badge">Total: {items.length}</span>
                                            <span className="stat-badge" style={{ color: '#ffc107' }}>Due: {pendingCount}</span>
                                            {overdueCount > 0 && (
                                                <span className="stat-badge" style={{ color: '#ff6b6b' }}>Overdue: {overdueCount}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="client-list">
                                        <table className="monthly-table">
                                            <thead>
                                                <tr>
                                                    <th>Client Name</th>
                                                    <th>Policy Type</th>
                                                    <th>Due Date</th>
                                                    <th>Premium</th>
                                                    <th>Status</th>
                                                    <th>View</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((p, idx) => {
                                                    const isOver = isDateOverdue(p.next_payment_date);
                                                    const isProcessing = processingIds.has(p.id);

                                                    const displayDate = p.next_payment_date
                                                        ? new Date(p.next_payment_date).toLocaleDateString()
                                                        : 'N/A';

                                                    return (
                                                        <tr key={p.id || p._tempId || idx}>
                                                            <td>
                                                                <strong>{p.clientName}</strong><br />
                                                                <span style={{ fontSize: '11px', color: '#777' }}>{p.clientEmail || ''}</span>
                                                            </td>
                                                            <td>{p.policy_type}</td>
                                                            <td>{displayDate}</td>
                                                            <td>PHP {parseFloat(p.premium_paid).toLocaleString()}</td>
                                                            <td>
                                                                {/* Display Paid Status if True */}
                                                                {p.is_paid ? (
                                                                    <span className="status-badge" style={{ backgroundColor: '#28a745', color: 'white' }}>✅ Paid</span>
                                                                ) : p.status !== 'Issued' ? (
                                                                    <span className="status-badge status-pending" style={{ fontSize: '10px' }}>{p.status}</span>
                                                                ) : isOver ? (
                                                                    <span className="status-overdue">⚠ OVERDUE</span>
                                                                ) : (
                                                                    <span className="status-due">Upcoming</span>
                                                                )}
                                                            </td>

                                                            {/* View Details Button */}
                                                            <td>
                                                                <button
                                                                    onClick={(e) => handleViewDetails(p, e)}
                                                                    style={{
                                                                        backgroundColor: '#007bff',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '13px'
                                                                    }}
                                                                >
                                                                    View
                                                                </button>
                                                            </td>

                                                            <td>
                                                                <button
                                                                    className="pay-btn"
                                                                    onClick={(e) => markPaid(p.id, e)}
                                                                    disabled={isProcessing}
                                                                    style={{
                                                                        opacity: isProcessing ? 0.6 : 1,
                                                                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                                                                    }}
                                                                >
                                                                    {isProcessing ? 'Saving...' : 'Mark Paid'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>

            {/* --- NEW: DETAILED VIEW MODAL --- */}
            {showDetailsModal && selectedPolicy && ReactDOM.createPortal(
                <div onClick={() => setShowDetailsModal(false)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 10000,
                    margin: 0,
                    padding: '20px'
                }}>
                    <div className="modal-content" style={{
                        maxWidth: '600px',
                        width: '100%',
                        margin: 'auto',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Policy Details</h2>
                            <span className="close-modal" onClick={() => setShowDetailsModal(false)}>&times;</span>
                        </div>
                        <div className="modal-body">

                            {/* 1. KEY INFO GRID */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px',
                                backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6'
                            }}>
                                {/* Client Name Field */}
                                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '5px' }}>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Client Name</small>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                                        {selectedPolicy.clientName}
                                    </div>
                                    <small style={{ color: '#888' }}>{selectedPolicy.clientEmail}</small>
                                </div>

                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Serial Number</small>
                                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#003781' }}>{selectedPolicy.serial_number || 'N/A'}</div>
                                </div>
                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Current Status</small>
                                    <div>
                                        <span className={`status-badge status-${selectedPolicy.status ? selectedPolicy.status.toLowerCase() : 'pending'}`}>
                                            {selectedPolicy.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* ADDED: Policy Proposal Date */}
                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Policy Proposal Date</small>
                                    <div style={{ fontWeight: 500 }}>
                                        {selectedPolicy.issued_at ? new Date(selectedPolicy.issued_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                {/* ADDED: Date Issued (Uses new column 'date_issued') */}
                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Date Issued</small>
                                    <div style={{ fontWeight: 500 }}>
                                        {selectedPolicy.status === 'Issued' && selectedPolicy.date_issued
                                            ? new Date(selectedPolicy.date_issued).toLocaleDateString()
                                            : '-'}
                                    </div>
                                </div>

                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Policy Type</small>
                                    <div style={{ fontWeight: 500 }}>{selectedPolicy.policy_type}</div>
                                </div>
                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Mode of Payment</small>
                                    <div>{selectedPolicy.mode_of_payment}</div>
                                </div>

                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Premium Paid</small>
                                    <div style={{ fontWeight: 500 }}>PHP {parseFloat(selectedPolicy.premium_paid || 0).toLocaleString()}</div>
                                </div>
                                <div>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Annualized Premium (ANP)</small>
                                    <div style={{ fontWeight: 500, color: '#28a745' }}>PHP {parseFloat(selectedPolicy.anp || 0).toLocaleString()}</div>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <small style={{ color: '#666', fontWeight: 600 }}>Agency</small>
                                    <div>{selectedPolicy.agency || '-'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                                <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '6px', textAlign: 'center' }}>
                                    <small style={{ color: '#856404', fontWeight: 700 }}>Next Due</small>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                        {selectedPolicy.next_payment_date ? new Date(selectedPolicy.next_payment_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div style={{ padding: '10px', background: '#d4edda', borderRadius: '6px', textAlign: 'center' }}>
                                    <small style={{ color: '#155724', fontWeight: 700 }}>Payment Status</small>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                        {selectedPolicy.is_paid ? 'Paid' : 'Unpaid'}
                                    </div>
                                </div>
                            </div>

                            {/* 3. PAYMENT HISTORY (NEW SECTION) */}
                            <h3 style={{ marginTop: '25px', marginBottom: '10px', fontSize: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                💳 Payment History
                            </h3>
                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {selectedPolicy.payment_history && selectedPolicy.payment_history.length > 0 ? (
                                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#666' }}>
                                                <th style={{ padding: '5px' }}>Date Paid</th>
                                                <th style={{ padding: '5px' }}>Period Covered</th>
                                                <th style={{ padding: '5px' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPolicy.payment_history.map(h => (
                                                <tr key={h.payment_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '5px' }}>{new Date(h.payment_date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '5px' }}>{h.period_covered ? new Date(h.period_covered).toLocaleDateString() : '-'}</td>
                                                    <td style={{ padding: '5px' }}>PHP {parseFloat(h.amount).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>No payment history recorded.</p>
                                )}
                            </div>

                            {/* 4. ATTACHMENTS LIST */}
                            <h3 style={{ marginTop: '25px', marginBottom: '10px', fontSize: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                📎 Attached Files
                            </h3>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {selectedPolicy.attachments && selectedPolicy.attachments.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {selectedPolicy.attachments.map((file, idx) => (
                                            <li key={idx} style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <a
                                                    href={file.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    📄 {file.fileName || 'Document'}
                                                </a>
                                                <span style={{ fontSize: '11px', color: '#999' }}>
                                                    {(file.fileSize / 1024).toFixed(0)} KB
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>No documents attached.</p>
                                )}
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    style={{
                                        padding: '8px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ClientsPage;