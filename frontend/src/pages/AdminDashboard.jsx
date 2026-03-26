import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

/* ─── helper ─────────────────────────────────────────────────────────────── */
function StatusBadge({ value }) {
    const map = {
        Pending:  'status-pending',
        Approved: 'status-approved',
        Rejected: 'status-rejected',
        Verified: 'status-verified',
    };
    return <span className={`status-badge ${map[value] || 'status-neutral'}`}>{value}</span>;
}

// PayBadge removed as payment is manual now

/* ─── main component ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail' | 'priority'
    const [priorityList, setPriorityList] = useState([]);

    /* ── fetch ── */
    const fetchApplications = async () => {
        setLoading(true);
        try {
            let url = '/admin/applications';
            const params = [];
            if (statusFilter) params.push(`status=${statusFilter}`);
            if (categoryFilter) params.push(`category=${categoryFilter}`);
            if (params.length > 0) url += `?${params.join('&')}`;
            
            const res = await API.get(url);
            setApplications(res.data);
            setFiltered(res.data);
        } catch {
            logout();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, [statusFilter, categoryFilter]);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(applications.filter(a =>
            a.student_name?.toLowerCase().includes(lower) ||
            a.college_admn_no?.toLowerCase().includes(lower) ||
            a.hostel_admission_no?.toLowerCase().includes(lower) ||
            a.category?.toLowerCase().includes(lower)
        ));
    }, [search, applications]);

    /* ── helpers ── */
    const openWA = (url) => { 
        if (!url) return;
        const win = window.open(url, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
            alert("⚠️ WhatsApp link was blocked by your browser's popup blocker. Please allow popups for this site or click the student again to try opening the link.");
        }
    };
    const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 6000); };

    /* ── approve ── */
    /* ── approve ── */
    const handleApprove = async (id) => {
        if (!window.confirm('Approve this application? This will generate a WhatsApp notification for the student.')) return;
        
        // Strategy to bypass popup blockers: handle window before or during async
        setActionLoading(true);
        try {
            const res = await API.post(`/admin/applications/${id}/approve`);
            flash(`✅ Approved successfully.`);
            fetchApplications();
            setSelected(null); setViewMode('list');
            
            // Open WA link
            if (res.data.whatsapp_url) {
                setTimeout(() => openWA(res.data.whatsapp_url), 100);
            }
        } catch (err) {
            flash(`❌ ${err.response?.data?.message || 'Error approving.'}`);
        } finally { setActionLoading(false); }
    };
    
    /* ── verify payment ── */
    const handleVerifyPayment = async (id) => {
        if (!window.confirm('Verify payment for this student? This will generate their LOGIN CREDENTIALS and opening WhatsApp notify...')) return;
        setActionLoading(true);
        try {
            const res = await API.post(`/admin/applications/${id}/verify-payment`);
            flash(`✅ Payment verified.`);
            fetchApplications();
            setSelected(null); setViewMode('list');
            
            if (res.data.whatsapp_url) {
                setTimeout(() => openWA(res.data.whatsapp_url), 100);
            }
        } catch (err) {
            flash(`❌ ${err.response?.data?.message || 'Error verifying payment.'}`);
        } finally { setActionLoading(false); }
    };

    /* ── reject ── */
    const handleReject = async (id) => {
        const reason = window.prompt('Enter mandatory rejection reason:');
        if (!reason) {
            if (reason === '') flash('❌ Rejection reason is required.');
            return;
        }
        
        setActionLoading(true);
        try {
            const res = await API.post(`/admin/applications/${id}/reject`, { rejection_reason: reason });
            flash(`✅ Rejected successfully.`);
            fetchApplications();
            setSelected(null); setViewMode('list');
            
            if (res.data.whatsapp_url) {
                setTimeout(() => openWA(res.data.whatsapp_url), 100);
            }
        } catch (err) {
            flash(`❌ ${err.response?.data?.message || 'Error rejecting.'}`);
        } finally { setActionLoading(false); }
    };

    /* ── export ── */
    const handleExport = () => {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (categoryFilter) params.append('category', categoryFilter);
        
        const url = `/admin/export-excel?${params.toString()}`;
        console.log("Exporting to:", url);
        
        API.get(url, { responseType: 'blob' }).then(response => {
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            // Dynamic filename
            let filename = 'applications';
            if (statusFilter) filename += `_${statusFilter.toLowerCase()}`;
            if (categoryFilter) filename += `_${categoryFilter.toLowerCase()}`;
            filename += '.xlsx';
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            flash(`✅ Exported as ${filename}`);
        }).catch((err) => {
            console.error("Export Error:", err);
            flash('❌ Export failed (auth error or server error).');
        });
    };

    /* ── priority list ── */
    const handleGeneratePriority = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/priority-list');
            setPriorityList(res.data);
            setViewMode('priority');
        } catch {
            flash('❌ Failed to generate priority list.');
        } finally { setLoading(false); }
    };

    /* ── counts ── */
    const counts = {
        total:    applications.length,
        pending:  applications.filter(a => a.application_status === 'Pending').length,
        approved: applications.filter(a => a.application_status === 'Approved').length,
        sc:       applications.filter(a => a.category === 'SC').length,
        st:       applications.filter(a => a.category === 'ST').length,
    };

    /* ─────────────────────────────────────────────── render ─────────────── */
    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="container dash-head-inner">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>LBSITW Hostel Management</p>
                    </div>
                    <div className="dash-actions">
                        <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                    </div>
                </div>
            </div>

            <div className="container">
                {msg && (
                    <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
                        {msg}
                        <button className="close-alert" onClick={() => setMsg('')}>×</button>
                    </div>
                )}

                {/* Stats */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {[
                        { label: 'Total',    count: counts.total,    color: 'var(--primary)', icon: '📋' },
                        { label: 'Pending',  count: counts.pending,  color: '#f59e0b',        icon: '⏳' },
                        { label: 'Approved', count: counts.approved, color: '#10b981',        icon: '✅' },
                        { label: 'SC Count', count: counts.sc,       color: '#8b5cf6',        icon: '👤' },
                        { label: 'ST Count', count: counts.st,       color: '#ec4899',        icon: '👤' },
                    ].map((s, i) => (
                        <div className="stat-card" key={i} style={{ borderTop: `4px solid ${s.color}` }}>
                            <div className="stat-info">
                                <div className="stat-count" style={{ color: s.color }}>{s.count}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── LIST VIEW ── */}
                {viewMode === 'list' && (
                    <>
                        <div className="admin-toolbar">
                            <div className="filter-group">
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="filter-select">
                                    <option value="">All Categories</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="OEC">OEC</option>
                                    <option value="OBCH">OBCH</option>
                                    <option value="General">General</option>
                                </select>
                                <input type="text" placeholder="Search name, ID..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
                            </div>
                            <div className="tool-btns">
                                <button className="btn btn-outline" onClick={handleExport} title="Export current list to Excel">
                                    📥 Export Excel
                                </button>
                                <button className="btn btn-primary" onClick={handleGeneratePriority}>
                                    📊 Priority Sorting
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state">
                                <p>No applications found.</p>
                            </div>
                        ) : (
                            <div className="applications-table-wrapper">
                                <table className="applications-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student Name</th>
                                            <th>College ID</th>
                                            <th>Category</th>
                                            <th>Distance</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((app, i) => (
                                            <tr key={app.id}>
                                                <td>{i + 1}</td>
                                                <td><strong>{app.student_name}</strong></td>
                                                <td>{app.college_admn_no}</td>
                                                <td><span className={`cat-badge cat-${app.category?.toLowerCase()}`}>{app.category}</span></td>
                                                <td>{app.distance_km} km</td>
                                                <td><StatusBadge value={app.application_status} /></td>
                                                <td>
                                                    {app.payment_status === 'Verified' ? (
                                                        <span className="badge-paid">✅ Verified</span>
                                                    ) : app.payment_status === 'Paid' ? (
                                                        <span className="badge-pending" style={{ background: '#3b82f6', color: 'white' }}>💰 Paid</span>
                                                    ) : app.application_status === 'Approved' ? (
                                                        <span className="badge-pending">⏳ Pending</span>
                                                    ) : (
                                                        <span className="badge-neutral">—</span>
                                                    )}
                                                </td>
                                                <td className="action-cell">
                                                    <button className="btn-sm btn-view" onClick={() => { setSelected(app); setViewMode('detail'); }}>View</button>
                                                    {app.application_status === 'Pending' && (
                                                        <>
                                                            <button className="btn-sm btn-approve" onClick={() => handleApprove(app.id)} disabled={actionLoading}>Approve</button>
                                                            <button className="btn-sm btn-reject"  onClick={() => handleReject(app.id)}  disabled={actionLoading}>Reject</button>
                                                        </>
                                                    )}
                                                    {app.payment_status === 'Paid' && (
                                                        <button className="btn-sm btn-success" onClick={() => handleVerifyPayment(app.id)} disabled={actionLoading}>Verify Pmt</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ── DETAIL VIEW ── */}
                {viewMode === 'detail' && selected && (
                    <div className="detail-view">
                        <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => { setSelected(null); setViewMode('list'); }}>← Back</button>

                        <div className="detail-header">
                            <h2>{selected.student_name} ({selected.college_admn_no})</h2>
                            <StatusBadge value={selected.application_status} />
                        </div>

                        <div className="detail-grid">
                            <div className="detail-card">
                                <h3>Personal & Application</h3>
                                {[
                                    ['Semester / Branch', selected.semester_branch],
                                    ['Category', selected.category],
                                    ['Distance', `${selected.distance_km} km`],
                                    ['Contact', selected.student_contact],
                                    ['DOB', selected.dob],
                                    ['Caste', selected.caste],
                                    ['Religion', selected.religion],
                                    ['Rejection Reason', selected.rejection_reason],
                                ].map(([k, v]) => (
                                    <div className="info-row" key={k}><span>{k}</span><strong>{v || '—'}</strong></div>
                                ))}
                            </div>

                            <div className="detail-card">
                                <h3>Documents</h3>
                                <div className="doc-section">
                                    <div className="doc-item">
                                        <strong>Passport Photo:</strong><br />
                                        <img src={`http://localhost:5000/${selected.photo_path}`} alt="Student" className="student-photo" />
                                    </div>
                                    <div className="doc-links">
                                        <a href={`http://localhost:5000/api/admin/export-excel?dummy=1`} target="_blank" rel="noreferrer" className="doc-link" style={{display:'none'}}> {/* hidden dummy */} </a>
                                        <a href={`http://localhost:5000/${selected.caste_certificate_path}`} target="_blank" rel="noreferrer" className="doc-link">
                                            📄 View Caste Certificate
                                        </a>
                                        {selected.document_path && (
                                            <a href={`http://localhost:5000/${selected.document_path}`} target="_blank" rel="noreferrer" className="doc-link">
                                                📄 Other Document
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="detail-actions">
                            {selected.application_status === 'Pending' && (
                                <>
                                    <button className="btn btn-success" onClick={() => handleApprove(selected.id)} disabled={actionLoading}>Approve & Send WA Notify</button>
                                    <button className="btn btn-danger"  onClick={() => handleReject(selected.id)}  disabled={actionLoading}>Reject (Reason Required)</button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ── PRIORITY VIEW ── */}
                {viewMode === 'priority' && (
                    <div className="priority-view">
                        <div className="priority-header">
                            <h2>📊 Automated Priority Sorting (Pending)</h2>
                            <button className="btn btn-outline" onClick={() => setViewMode('list')}>← Back</button>
                        </div>
                        <p className="priority-desc">Rules: <strong>SC → ST → OEC → OBCH → Distance</strong></p>
                        {priorityList.length === 0 ? (
                            <p>No pending applications to sort.</p>
                        ) : (
                            <div className="applications-table-wrapper">
                                <table className="applications-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Distance</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {priorityList.map(app => (
                                            <tr key={app.id}>
                                                <td><span className="rank-badge">#{app.priority_rank}</span></td>
                                                <td><strong>{app.student_name}</strong></td>
                                                <td><span className={`cat-badge cat-${app.category?.toLowerCase()}`}>{app.category}</span></td>
                                                <td>{app.distance_km} km</td>
                                                <td><StatusBadge value={app.application_status} /></td>
                                                <td>
                                                    <button className="btn-sm btn-approve" onClick={() => handleApprove(app.id)} disabled={actionLoading}>Approve</button>
                                                    <button className="btn-sm btn-reject"  onClick={() => handleReject(app.id)}  disabled={actionLoading}>Reject</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
