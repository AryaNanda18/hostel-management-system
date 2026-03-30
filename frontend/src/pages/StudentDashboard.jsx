import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API, { BASE_URL } from '../api/axios';
import { useNavigate } from 'react-router-dom';

/* ─── step tracker ──────────────────────────────────────────────────────── */
function WorkflowStep({ step, label, current, done }) {
    const cls = done ? 'wf-done' : current ? 'wf-active' : 'wf-future';
    return (
        <div className={`wf-step ${cls}`}>
            <div className="wf-circle">{done ? '✓' : step}</div>
            <div className="wf-label">{label}</div>
        </div>
    );
}

function WorkflowTracker({ status, payStatus, credsSent }) {
    const steps = [
        { label: 'Applied',           done: true },
        { label: 'Approved',          done: status === 'Approved' && true, current: status === 'Pending' },
        { label: 'Payment Pending',   done: payStatus === 'Paid', current: status === 'Approved' && payStatus === 'Pending' },
        { label: 'Paid',              done: payStatus === 'Paid' && credsSent !== false, current: payStatus === 'Paid' && !credsSent },
        { label: 'Credentials Sent',  done: credsSent, current: payStatus === 'Paid' && credsSent },
    ];

    return (
        <div className="workflow-tracker">
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <WorkflowStep step={i + 1} label={s.label} done={s.done} current={s.current && !s.done} />
                    {i < steps.length - 1 && <div className={`wf-line ${s.done ? 'wf-line-done' : ''}`} />}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ─── payment card ──────────────────────────────────────────────────────── */
/* ─── instructions card ─────────────────────────────────────────────────── */
function FeeInstructionsCard({ student }) {
    const total = (Number(student.admission_fee) || 0) + (Number(student.caution_deposit) || 0);

    return (
        <div className="dash-card payment-card">
            <h2>💰 Fee Payment Instructions</h2>
            <p className="payment-info">Your application has been approved! To confirm your seat, please pay the fees via <strong>NEFT/IMPS</strong> or at the <strong>College Office</strong>.</p>

            <div className="payment-breakdown">
                <div className="info-row"><span>Admission Fee</span><strong>₹ {Number(student.admission_fee).toLocaleString()}</strong></div>
                <div className="info-row"><span>Caution Deposit</span><strong>₹ {Number(student.caution_deposit).toLocaleString()}</strong></div>
                <div className="info-row total-row"><span>Total to be Paid</span><strong>₹ {total.toLocaleString()}</strong></div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Bank Details:</strong>
                <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: '#1e293b' }}>
                    <div className="info-row"><span>Account Name</span><strong>LBSITW HOSTEL FUND</strong></div>
                    <div className="info-row"><span>Account No</span><strong>123456789012</strong></div>
                    <div className="info-row"><span>IFSC Code</span><strong>SBIN0007028</strong></div>
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>* After payment, contact the hostel warden for manual verification.</p>
            </div>
        </div>
    );
}

/* ─── main component ────────────────────────────────────────────────────── */
export default function StudentDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [showPwForm, setShowPwForm] = useState(false);

    const fetchStudent = async () => {
        try {
            const res = await API.get('/student/dashboard');
            setStudent(res.data.student_info);
        } catch {
            logout();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudent(); }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/student/change-password', { new_password: newPassword });
            setPwMsg(res.data.message);
            setNewPassword('');
            setShowPwForm(false);
        } catch (err) {
            setPwMsg(err.response?.data?.message || 'Error updating password.');
        }
    };

    if (loading) return (
        <div className="loading-screen"><div className="spinner" /><p>Loading dashboard...</p></div>
    );
    if (!student) return null;

    const feesByCategory = ['SC', 'ST', 'OEC', 'OBCH'].includes(student.category)
        ? { admission: 1000, caution: 3000, total: 4000 }
        : { admission: 1000, caution: 12000, total: 13000 };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="container dash-head-inner">
                    <div>
                        <h1>Student Dashboard</h1>
                        <p>Welcome, <strong>{student.student_name}</strong></p>
                    </div>
                    <div className="dash-actions">
                        <span className={`status-badge status-${student.application_status?.toLowerCase()}`}>
                            {student.application_status}
                        </span>
                        <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Credentials sent banner */}
                {student.whatsapp_credentials_sent && (
                    <div className="alert alert-success" style={{ margin: '1.5rem 0' }}>
                        🔑 Your login credentials have been sent to your WhatsApp number.
                    </div>
                )}

                {/* Rejection notice */}
                {student.application_status === 'Rejected' && (
                    <div className="alert alert-error" style={{ margin: '1.5rem 0' }}>
                        ❌ Your application was rejected. Reason: <strong>{student.rejection_reason || 'N/A'}</strong>
                    </div>
                )}

                <div className="dashboard-grid">
                    {/* Admission Info */}
                    <div className="dash-card accent-card">
                        <h2>🎓 Hostel Status</h2>
                        <div className="info-row"><span>Hostel ID</span><strong className="highlight">{student.hostel_admission_no || 'Pending Approval'}</strong></div>
                        <div className="info-row"><span>Status</span><span className={`status-badge status-${student.application_status?.toLowerCase()}`}>{student.application_status}</span></div>
                        <div className="info-row"><span>Payment Status</span><strong style={{ color: student.payment_status === 'Paid' ? 'var(--success)' : '#f59e0b' }}>{student.payment_status}</strong></div>
                        <div className="info-row"><span>Applied On</span><strong>{student.created_at?.split(' ')[0]}</strong></div>
                    </div>

                    {/* Personal Details */}
                    <div className="dash-card">
                        <h2>👤 Personal Details</h2>
                        <div className="info-row"><span>Full Name</span><strong>{student.student_name}</strong></div>
                        <div className="info-row"><span>Semester / Branch</span><strong>{student.semester_branch}</strong></div>
                        <div className="info-row"><span>College ID</span><strong>{student.college_admn_no}</strong></div>
                        <div className="info-row"><span>Category</span><strong>{student.category}</strong></div>
                        <div className="info-row"><span>Distance</span><strong>{student.distance_km} km</strong></div>
                    </div>

                    {/* Instructions Card — shown only when Approved + Pending Payment */}
                    {student.application_status === 'Approved' && student.payment_status === 'Pending' && (
                        <FeeInstructionsCard student={student} />
                    )}

                    {/* Paid confirmation */}
                    {student.payment_status === 'Paid' && (
                        <div className="dash-card">
                            <h2>✅ Payment Verified</h2>
                            <div className="info-row"><span>Total Paid</span><strong>₹ {(Number(student.admission_fee) + Number(student.caution_deposit)).toLocaleString()}</strong></div>
                            <div className="info-row"><span>Verified On</span><strong>{student.payment_date || 'N/A'}</strong></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                Your payment has been manually verified by the admin.
                            </p>
                        </div>
                    )}

                    {/* Fee Summary */}
                    <div className="dash-card">
                        <h2>💰 Fee Structure</h2>
                        <div className="info-row"><span>Admission Fee</span><strong>₹ {feesByCategory.admission.toLocaleString()}</strong></div>
                        <div className="info-row"><span>Caution Deposit</span><strong>₹ {feesByCategory.caution.toLocaleString()}</strong></div>
                        <div className="info-row total-row"><span>Total (One-Time)</span><strong>₹ {feesByCategory.total.toLocaleString()}</strong></div>
                        <div className="info-row"><span>Monthly Rent</span><strong>₹ 1,260</strong></div>
                        <div className="info-row"><span>Mess & Utilities</span><strong>As per usage</strong></div>
                    </div>

                    {/* Documents */}
                    <div className="dash-card">
                        <h2>📄 Your Documents</h2>
                        <div className="info-row"><span>Photo</span><strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.open(`${BASE_URL}/${student.photo_path}`)}>View</strong></div>
                        <div className="info-row"><span>Caste Certificate</span><strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.open(`${BASE_URL}/${student.caste_certificate_path}`)}>View</strong></div>
                        {student.document_path && (
                            <div className="info-row"><span>Other Document</span><strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.open(`${BASE_URL}/${student.document_path}`)}>View</strong></div>
                        )}
                    </div>

                    {/* Account Settings */}
                    <div className="dash-card">
                        <h2>🔒 Change Password</h2>
                        {pwMsg && <div className={`alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{pwMsg}</div>}
                        {!showPwForm ? (
                            <button className="btn btn-outline" onClick={() => setShowPwForm(true)}>Change Password</button>
                        ) : (
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                                    <button type="submit" className="btn btn-primary">Update</button>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowPwForm(false)}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
