import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const PerformanceDashboardPage = () => {
    const { userRole, currentUser, performanceData, loadPerformanceData } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'totalANP', direction: 'desc' });

    useEffect(() => {
        // Redirect non-AL users to main dashboard
        if (userRole !== 'AL') {
            navigate('/');
            return;
        }

        // Load performance data for this AL's team
        if (currentUser && currentUser.id) {
            loadPerformanceData(currentUser.id);
        }
    }, [userRole, currentUser, navigate, loadPerformanceData]);

    if (userRole !== 'AL') {
        return null;
    }

    if (!performanceData) {
        return (
            <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                    <h3>Loading Performance Data...</h3>
                </div>
            </div>
        );
    }

    const { performanceByAP, teamStats } = performanceData;

    // Sorting logic
    const sortedData = [...performanceByAP].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Search filter
    const filteredData = sortedData.filter(ap =>
        ap.apName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle sort
    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
        });
    };

    // Top performers (top 3 by total ANP)
    const topPerformers = [...performanceByAP]
        .sort((a, b) => b.totalANP - a.totalANP)
        .slice(0, 3);

    // Chart data - ANP by AP
    const anpChartData = {
        labels: performanceByAP.map(ap => ap.apName),
        datasets: [{
            label: 'Total ANP',
            data: performanceByAP.map(ap => ap.totalANP),
            backgroundColor: '#0055b8',
            borderRadius: 6
        }]
    };

    // Chart data - Team Status Distribution
    const statusChartData = {
        labels: ['Issued', 'Pending', 'Declined'],
        datasets: [{
            data: [teamStats.totalIssued, teamStats.totalPending, teamStats.totalDeclined],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
        }]
    };

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h2>Your Team Performance Overview</h2>
                </div>
                <div className="card-body">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '20px'
                    }}>
                        <div className="stat-card" style={{ borderLeft: '4px solid #f39c12' }}>
                            <div className="stat-header"><div className="stat-label">Total Team ANP</div></div>
                            <div className="stat-value">PHP {teamStats.totalTeamANP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className="stat-subtext">All-time team production</div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #28a745' }}>
                            <div className="stat-header"><div className="stat-label">Monthly Team ANP</div></div>
                            <div className="stat-value">PHP {teamStats.totalMonthlyANP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className="stat-subtext">Current month</div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #0055b8' }}>
                            <div className="stat-header"><div className="stat-label">Total Submissions</div></div>
                            <div className="stat-value">{teamStats.totalSubmissions}</div>
                            <div className="stat-subtext">All team applications</div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #9b59b6' }}>
                            <div className="stat-header"><div className="stat-label">Avg Conversion Rate</div></div>
                            <div className="stat-value">{teamStats.averageConversionRate}%</div>
                            <div className="stat-subtext">Team average</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            <div className="card">
                <div className="card-header">
                    <h2>🏆 Top Performers</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {topPerformers.map((ap, index) => (
                            <div
                                key={ap.apName}
                                style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: index === 0
                                        ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                                        : index === 1
                                            ? 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
                                            : 'linear-gradient(135deg, #cd7f32 0%, #b8860b 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                                    {ap.apName}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                                    PHP {ap.totalANP.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                                    {ap.issued} Issued • {ap.conversionRate}% Rate
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h2>ANP by Agency Partner</h2>
                    </div>
                    <div className="card-body">
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={anpChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Team Status Distribution</h2>
                    </div>
                    <div className="card-body">
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Doughnut
                                data={statusChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* AP Performance Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Agency Partner Performance</h2>
                    <input
                        type="text"
                        placeholder="Search by AP name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            width: '250px'
                        }}
                    />
                </div>
                <div className="card-body">
                    <table className="serial-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('apName')} style={{ cursor: 'pointer' }}>
                                    AP Name {sortConfig.key === 'apName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('totalANP')} style={{ cursor: 'pointer' }}>
                                    Total ANP {sortConfig.key === 'totalANP' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('monthlyANP')} style={{ cursor: 'pointer' }}>
                                    Monthly ANP {sortConfig.key === 'monthlyANP' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('totalSubmissions')} style={{ cursor: 'pointer' }}>
                                    Submissions {sortConfig.key === 'totalSubmissions' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('issued')} style={{ cursor: 'pointer' }}>
                                    Issued {sortConfig.key === 'issued' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('pending')} style={{ cursor: 'pointer' }}>
                                    Pending {sortConfig.key === 'pending' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('declined')} style={{ cursor: 'pointer' }}>
                                    Declined {sortConfig.key === 'declined' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('conversionRate')} style={{ cursor: 'pointer' }}>
                                    Conv. Rate {sortConfig.key === 'conversionRate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map(ap => (
                                    <tr key={ap.apName}>
                                        <td style={{ fontWeight: '600' }}>{ap.apName}</td>
                                        <td>PHP {ap.totalANP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>PHP {ap.monthlyANP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{ap.totalSubmissions}</td>
                                        <td><span className="status-badge status-issued">{ap.issued}</span></td>
                                        <td><span className="status-badge status-pending">{ap.pending}</span></td>
                                        <td><span className="status-badge status-declined">{ap.declined}</span></td>
                                        <td style={{ fontWeight: '600', color: parseFloat(ap.conversionRate) >= 50 ? '#28a745' : '#e67e22' }}>
                                            {ap.conversionRate}%
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        {searchTerm ? 'No matching agency partners found.' : 'No performance data available.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default PerformanceDashboardPage;
