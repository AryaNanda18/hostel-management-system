import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const KERALA_DISTRICTS = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const initialState = {
    student_name: '', semester_branch: '', let_status: '',
    college_admn_no: '', parent_name: '', student_contact: '',
    permanent_address: '', official_address: '', dob: '',
    caste: '', religion: '', fee_concession: '', nationality: '',
    local_guardian_name: '', local_guardian_address: '',
    inside_outside_india: 'Inside India', state: '', district: '',
    category: '', distance_km: ''
};

/* ─── Field wrapper component defined OUTSIDE so React doesn't re-create it ─── */
function Field({ label, name, required = true, error, children }) {
    return (
        <div className="form-group">
            <label htmlFor={name}>
                {label}{required && <span className="req">*</span>}
            </label>
            {children}
            {error && <span className="error-msg">{error}</span>}
        </div>
    );
}

export default function AdmissionFormPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialState);
    const [photo, setPhoto] = useState(null);
    const [casteCert, setCasteCert] = useState(null);
    const [docFile, setDocFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitMsg, setSubmitMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleNameChange = (e) => {
        setForm(prev => ({ ...prev, student_name: e.target.value.toUpperCase() }));
        if (errors.student_name) setErrors(prev => ({ ...prev, student_name: '' }));
    };

    const validate = () => {
        const errs = {};
        const required = [
            'student_name', 'semester_branch', 'let_status', 'college_admn_no',
            'parent_name', 'student_contact', 'permanent_address', 'official_address',
            'dob', 'caste', 'religion', 'fee_concession', 'nationality',
            'local_guardian_name', 'local_guardian_address', 'inside_outside_india',
            'state', 'category', 'distance_km',
        ];
        required.forEach(field => {
            if (!form[field] || form[field].toString().trim() === '') {
                errs[field] = 'This field is required.';
            }
        });
        
        if (form.college_admn_no && !/^\d{4}B\d{3}$/.test(form.college_admn_no.trim())) {
            errs.college_admn_no = 'Format must be yyyyBxxx (e.g. 2025B001)';
        }
        
        if (form.state === 'Kerala' && !form.district) errs.district = 'District is required for Kerala.';
        if (form.student_contact && !/^\d{10}$/.test(form.student_contact.trim())) errs.student_contact = 'Enter a valid 10-digit phone number.';
        if (form.distance_km && isNaN(Number(form.distance_km))) errs.distance_km = 'Must be a number.';
        if (!photo) errs.photo = 'Passport size photo is required.';
        if (!casteCert) errs.caste_certificate = 'Caste certificate is required.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { 
            setErrors(errs); 
            // Better UX: go to first step with errors
            if (errs.student_name || errs.college_admn_no || errs.dob || errs.photo) setStep(1);
            else if (errs.permanent_address || errs.district) setStep(2);
            else setStep(3);
            return; 
        }
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => formData.append(key, val));
            formData.append('photo', photo);
            formData.append('caste_certificate', casteCert);
            if (docFile) formData.append('document', docFile);
            const res = await API.post('/application/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSubmitMsg(res.data.message);
            setForm(initialState);
            setPhoto(null);
            setCasteCert(null);
            setDocFile(null);
        } catch (err) {
            setSubmitMsg(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitMsg && submitMsg.includes('successfully')) {
        return (
            <div className="form-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">✅</div>
                        <h2>Application Submitted!</h2>
                        <p>{submitMsg}</p>
                        <p className="success-info">You will receive a WhatsApp message once your application is reviewed by the admin.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form-header">
                <div className="container">
                    <div className="form-header-inner">
                        <div>
                            <h1>LBSITW HOSTEL, POOJAPPURA, THIRUVANANTHAPURAM</h1>
                            <h2>Hostel Admission Form 2025-26</h2>
                        </div>
                        <div className="photo-placeholder">
                            <p>Attach a recent passport size photo</p>
                            {photo && <img src={URL.createObjectURL(photo)} alt="preview" className="photo-preview" />}
                            <label className="upload-label">
                                <input
                                    type="file" accept="image/*"
                                    onChange={e => { setPhoto(e.target.files[0]); if (errors.photo) setErrors(p => ({ ...p, photo: '' })); }}
                                    hidden
                                />
                                {photo ? 'Change Photo' : 'Choose Photo'}
                            </label>
                            {errors.photo && <span className="error-msg">{errors.photo}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Step tabs */}
                <div className="form-steps">
                    {['Personal Details', 'Address & Location', 'Priority & Documents'].map((s, i) => (
                        <button key={i} type="button" className={`step-tab ${step === i + 1 ? 'active' : ''}`} onClick={() => setStep(i + 1)}>
                            <span className="step-num">{i + 1}</span> {s}
                        </button>
                    ))}
                </div>

                {submitMsg && !submitMsg.includes('successfully') && (
                    <div className="alert alert-error">{submitMsg}</div>
                )}

                <form onSubmit={handleSubmit} className="admission-form">

                    {/* ── STEP 1: Personal Details ── */}
                    {step === 1 && (
                        <div className="form-section">
                            <h3>Personal Information</h3>
                            <div className="form-grid">

                                <Field label="Name of Student (Capital Letters)" name="student_name" error={errors.student_name}>
                                    <input
                                        id="student_name" name="student_name"
                                        value={form.student_name} onChange={handleNameChange}
                                        className={errors.student_name ? 'input-error' : ''}
                                    />
                                </Field>

                                <Field label="Semester with Branch" name="semester_branch" error={errors.semester_branch}>
                                    <input id="semester_branch" name="semester_branch" value={form.semester_branch} onChange={handleChange} className={errors.semester_branch ? 'input-error' : ''} />
                                </Field>

                                <Field label="Specify LET (Lateral Entry)" name="let_status" error={errors.let_status}>
                                    <select id="let_status" name="let_status" value={form.let_status} onChange={handleChange} className={errors.let_status ? 'input-error' : ''}>
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </Field>

                                <Field label="College Admission Number (yyyyBxxx)" name="college_admn_no" error={errors.college_admn_no}>
                                    <input 
                                        id="college_admn_no" name="college_admn_no" 
                                        value={form.college_admn_no} onChange={handleChange} 
                                        placeholder="e.g. 2025B001"
                                        className={errors.college_admn_no ? 'input-error' : ''} 
                                    />
                                </Field>

                                <Field label="Father's / Mother's Name" name="parent_name" error={errors.parent_name}>
                                    <input id="parent_name" name="parent_name" value={form.parent_name} onChange={handleChange} className={errors.parent_name ? 'input-error' : ''} />
                                </Field>

                                <Field label="Contact Number (Student)" name="student_contact" error={errors.student_contact}>
                                    <input id="student_contact" name="student_contact" type="tel" value={form.student_contact} onChange={handleChange} className={errors.student_contact ? 'input-error' : ''} maxLength={10} />
                                </Field>

                                <Field label="Date of Birth" name="dob" error={errors.dob}>
                                    <input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} className={errors.dob ? 'input-error' : ''} />
                                </Field>

                                <Field label="Caste" name="caste" error={errors.caste}>
                                    <input id="caste" name="caste" value={form.caste} onChange={handleChange} className={errors.caste ? 'input-error' : ''} />
                                </Field>

                                <Field label="Religion" name="religion" error={errors.religion}>
                                    <input id="religion" name="religion" value={form.religion} onChange={handleChange} className={errors.religion ? 'input-error' : ''} />
                                </Field>

                                <Field label="Eligible for Fee Concession (SC/OEC/OBCH)" name="fee_concession" error={errors.fee_concession}>
                                    <select id="fee_concession" name="fee_concession" value={form.fee_concession} onChange={handleChange} className={errors.fee_concession ? 'input-error' : ''}>
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </Field>

                                <Field label="Nationality" name="nationality" error={errors.nationality}>
                                    <input id="nationality" name="nationality" value={form.nationality} onChange={handleChange} className={errors.nationality ? 'input-error' : ''} />
                                </Field>

                                <Field label="Name of Local Guardian" name="local_guardian_name" error={errors.local_guardian_name}>
                                    <input id="local_guardian_name" name="local_guardian_name" value={form.local_guardian_name} onChange={handleChange} className={errors.local_guardian_name ? 'input-error' : ''} />
                                </Field>

                            </div>

                            <div className="form-grid-full">
                                <Field label="Address of Local Guardian with Contact Number" name="local_guardian_address" error={errors.local_guardian_address}>
                                    <textarea id="local_guardian_address" name="local_guardian_address" rows={3} value={form.local_guardian_address} onChange={handleChange} className={errors.local_guardian_address ? 'input-error' : ''} />
                                </Field>
                            </div>

                            <div className="form-nav-btns">
                                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next Step →</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Address & Location ── */}
                    {step === 2 && (
                        <div className="form-section">
                            <h3>Address & Location Details</h3>
                            <div className="form-grid-full">
                                <Field label="Permanent Address with Contact Number" name="permanent_address" error={errors.permanent_address}>
                                    <textarea id="permanent_address" name="permanent_address" rows={3} value={form.permanent_address} onChange={handleChange} className={errors.permanent_address ? 'input-error' : ''} />
                                </Field>
                                <Field label="Official Address with Contact Number" name="official_address" error={errors.official_address}>
                                    <textarea id="official_address" name="official_address" rows={3} value={form.official_address} onChange={handleChange} className={errors.official_address ? 'input-error' : ''} />
                                </Field>
                            </div>

                            <div className="form-grid">
                                <Field label="Inside / Outside India" name="inside_outside_india" error={errors.inside_outside_india}>
                                    <select id="inside_outside_india" name="inside_outside_india" value={form.inside_outside_india} onChange={handleChange}>
                                        <option value="Inside India">Inside India</option>
                                        <option value="Outside India">Outside India</option>
                                    </select>
                                </Field>

                                <Field label="State" name="state" error={errors.state}>
                                    <input
                                        id="state" name="state" value={form.state} onChange={handleChange}
                                        className={errors.state ? 'input-error' : ''} list="state-list" autoComplete="off"
                                    />
                                    <datalist id="state-list">
                                        {['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'West Bengal', 'Bihar', 'Other'].map(s => (
                                            <option key={s} value={s} />
                                        ))}
                                    </datalist>
                                </Field>

                                {form.state === 'Kerala' ? (
                                    <Field label="District" name="district" error={errors.district}>
                                        <select id="district" name="district" value={form.district} onChange={handleChange} className={errors.district ? 'input-error' : ''}>
                                            <option value="">Select District</option>
                                            {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                ) : (
                                    <Field label="District" name="district" required={false} error={errors.district}>
                                        <input id="district" name="district" value={form.district} onChange={handleChange} />
                                    </Field>
                                )}
                            </div>

                            <div className="form-nav-btns">
                                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Next Step →</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Priority & Documents ── */}
                    {step === 3 && (
                        <div className="form-section">
                            <h3>Priority & Documents</h3>
                            <div className="form-grid">

                                <Field label="Priority Category" name="category" error={errors.category}>
                                    <select id="category" name="category" value={form.category} onChange={handleChange} className={errors.category ? 'input-error' : ''}>
                                        <option value="">Select Category</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                        <option value="OEC">OEC</option>
                                        <option value="OBCH">OBCH</option>
                                        <option value="General">General (Distance Based)</option>
                                    </select>
                                </Field>

                                <Field label="Distance from College (in km)" name="distance_km" error={errors.distance_km}>
                                    <input id="distance_km" name="distance_km" type="number" min="0" step="0.1" value={form.distance_km} onChange={handleChange} className={errors.distance_km ? 'input-error' : ''} />
                                </Field>

                            </div>

                            <div className="form-grid">
                                <Field label="Caste Certificate (Required)" name="caste_certificate" error={errors.caste_certificate}>
                                    <div className="file-upload-area">
                                        <input
                                            type="file" id="caste_certificate" accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={e => { setCasteCert(e.target.files[0]); if (errors.caste_certificate) setErrors(p => ({ ...p, caste_certificate: '' })); }}
                                        />
                                        {casteCert && <span className="file-name">✅ Selected: {casteCert.name}</span>}
                                    </div>
                                </Field>

                                <Field label="Other Supporting Document (Optional)" name="document" required={false}>
                                    <div className="file-upload-area">
                                        <input
                                            type="file" id="document" accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={e => setDocFile(e.target.files[0])}
                                        />
                                        {docFile && <span className="file-name">✅ Selected: {docFile.name}</span>}
                                    </div>
                                </Field>
                            </div>

                            <div className="form-nav-btns">
                                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                                <button id="submit-btn" type="submit" className="btn btn-success btn-large" disabled={loading}>
                                    {loading ? '⏳ Submitting...' : '✅ Submit Application'}
                                </button>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}
