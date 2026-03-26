import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState('admin');
    const [adminForm, setAdminForm] = useState({ username: '', password: '' });
    const [studentForm, setStudentForm] = useState({ admission_no: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/admin/login', adminForm);
            login(res.data.token, 'admin');
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/student/login', studentForm);
            login(res.data.token, 'student');
            navigate('/student-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">🏫</div>
                    <h1>LBSITW Hostel</h1>
                    <p>Poojappura, Thiruvananthapuram</p>
                </div>

                <div className="login-tabs">
                    <button
                        id="admin-tab"
                        className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('admin'); setError(''); }}
                    >
                        🔐 Admin Login
                    </button>
                    <button
                        id="student-tab"
                        className={`login-tab ${activeTab === 'student' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('student'); setError(''); }}
                    >
                        🎓 Student Login
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {activeTab === 'admin' && (
                    <form className="login-form" onSubmit={handleAdminLogin}>
                        <div className="form-group">
                            <label htmlFor="admin-username">Username</label>
                            <input
                                id="admin-username"
                                type="text"
                                value={adminForm.username}
                                onChange={e => setAdminForm(p => ({ ...p, username: e.target.value }))}
                                placeholder="Enter admin username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="admin-password">Password</label>
                            <input
                                id="admin-password"
                                type="password"
                                value={adminForm.password}
                                onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        <button id="admin-login-btn" type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login as Admin'}
                        </button>
                        <p className="login-hint">Default: username <strong>admin</strong> / password <strong>password123</strong></p>
                    </form>
                )}

                {activeTab === 'student' && (
                    <form className="login-form" onSubmit={handleStudentLogin}>
                        <div className="form-group">
                            <label htmlFor="student-admn-no">Hostel Admission Number</label>
                            <input
                                id="student-admn-no"
                                type="text"
                                value={studentForm.admission_no}
                                onChange={e => setStudentForm(p => ({ ...p, admission_no: e.target.value }))}
                                placeholder="e.g. LBSH/2026/001"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="student-password">Password</label>
                            <input
                                id="student-password"
                                type="password"
                                value={studentForm.password}
                                onChange={e => setStudentForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button id="student-login-btn" type="submit" className="btn btn-success btn-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login as Student'}
                        </button>
                        <p className="login-hint">Only approved students can log in. Credentials are sent via WhatsApp.</p>
                    </form>
                )}
            </div>
        </div>
    );
}
