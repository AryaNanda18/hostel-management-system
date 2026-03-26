import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function PublicPaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [admissionNo, setAdmissionNo] = useState(searchParams.get('admn') || '');
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [payLoading, setPayLoading] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    /* auto-fetch when admn param present in URL */
    useEffect(() => {
        if (admissionNo) fetchInfo(admissionNo);
    }, []);

    const fetchInfo = async (no = admissionNo) => {
        if (!no.trim()) return;
        setLoading(true); setFetchError(''); setInfo(null);
        try {
            const res = await API.get(`/public/fee-info/${no.trim()}`);
            setInfo(res.data);
        } catch (e) {
            setFetchError(e.response?.data?.message || 'Admission number not found or application not approved.');
        } finally { setLoading(false); }
    };

    const total = info ? (Number(info.admission_fee) + Number(info.caution_deposit)) : 0;

    const handleMarkPaid = async () => {
        if (!info) return;
        setPayLoading(true);
        try {
            await API.post(`/public/mark-paid/${info.hostel_admission_no}`);
            setPaySuccess(true);
        } catch (e) {
            alert(e.response?.data?.message || 'Error marking payment as paid.');
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="pay-page">
            <div className="pay-card">
                <div className="pay-logo">🏫</div>
                <h1 className="pay-title">Hostel Fee Information</h1>
                <p className="pay-subtitle">LBSITW Hostel Admission Procedure</p>

                {/* Lookup */}
                {!info && (
                    <div className="pay-lookup">
                        <p className="pay-info-text">Enter your <strong>Hostel Admission ID</strong> (provided in your approval notification) to view fee details and offline payment instructions.</p>
                        <div className="form-group">
                            <label htmlFor="admn-input">Hostel Admission ID</label>
                            <input
                                id="admn-input"
                                type="text"
                                placeholder="e.g. LBSH/2026/001"
                                value={admissionNo}
                                onChange={e => setAdmissionNo(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && fetchInfo()}
                            />
                        </div>
                        {fetchError && <div className="alert alert-error" style={{ margin: '0.75rem 0' }}>{fetchError}</div>}
                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => fetchInfo()}
                            disabled={loading || !admissionNo.trim()}
                        >
                            {loading ? '⏳ Searching...' : 'View Fee Details →'}
                        </button>
                    </div>
                )}

                {/* Fee details */}
                {info && (
                    <>
                        <div className="pay-student-info">
                            <div className="info-row"><span>Student Name</span><strong>{info.student_name}</strong></div>
                            <div className="info-row"><span>Hostel ID</span><strong className="highlight">{info.hostel_admission_no}</strong></div>
                            <div className="info-row"><span>Category</span><strong>{info.category}</strong></div>
                        </div>

                        <div className="pay-breakdown">
                            <h3>Admission Fees to be Paid</h3>
                            <div className="info-row"><span>Admission Fee</span><strong>₹ {Number(info.admission_fee).toLocaleString()}</strong></div>
                            <div className="info-row"><span>Caution Deposit</span><strong>₹ {Number(info.caution_deposit).toLocaleString()}</strong></div>
                            <div className="info-row total-row" style={{ borderTop: '2px solid var(--border)' }}>
                                <span>Total Payable</span>
                                <strong>₹ {total.toLocaleString()}</strong>
                            </div>
                        </div>

                        <div className="pay-instructions" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Instructions:</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                1. Fees must be paid via <strong>NEFT/IMPS Transfer</strong> or <strong>Physical Counter</strong> at the college.<br/>
                                2. Transaction successful receipt must be submitted to the warden office.<br/>
                                3. Your room will be allotted only after manual verification of payment.
                            </p>
                            
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Official Bank Account:</strong>
                                <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: '#1e293b' }}>
                                    <div className="info-row"><span>Account Name</span><strong>LBSITW HOSTEL FUND</strong></div>
                                    <div className="info-row"><span>Account No</span><strong>123456789012</strong></div>
                                    <div className="info-row"><span>IFSC Code</span><strong>SBIN0007028</strong></div>
                                    <div className="info-row"><span>Bank</span><strong>SBI, Poojappura</strong></div>
                                </div>
                            </div>
                        </div>

                        {paySuccess ? (
                            <div className="alert alert-success" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>✅ Payment Notified!</h4>
                                <p style={{ fontSize: '0.85rem' }}>We have received your payment notification. Please wait for the warden to verify your transaction. Credentials will be sent via WhatsApp once verified.</p>
                            </div>
                        ) : (
                            <button 
                                className="btn btn-primary btn-full" 
                                style={{ marginTop: '1.5rem' }} 
                                onClick={handleMarkPaid}
                                disabled={payLoading}
                            >
                                {payLoading ? '⏳ Processing...' : 'I have completed the Payment →'}
                            </button>
                        )}

                        <button className="btn btn-outline btn-full" style={{ marginTop: '1rem' }} onClick={() => { setInfo(null); setAdmissionNo(''); setPaySuccess(false); }}>
                            ← Back to Lookup
                        </button>
                    </>
                )}
            </div>
            <p style={{ position: 'fixed', bottom: '1rem', color: '#6b6375', fontSize: '0.8rem' }}>
                Note: This portal is for information only. No online payments are accepted.
            </p>
        </div>
    );
}
