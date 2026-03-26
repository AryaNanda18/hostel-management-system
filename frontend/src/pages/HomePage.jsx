import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay" />
                <div className="hero-content">
                    <div className="college-badge">Est. 2004</div>
                    <h1 className="hero-title">LBSITW Hostel</h1>
                    <p className="hero-subtitle">Poojappura, Thiruvananthapuram</p>
                    <p className="hero-tagline">
                        Lal Bahadur Shastri Institute of Technology for Women
                    </p>
                    <p className="hero-description">
                        A safe, nurturing, and modern residential facility designed exclusively for women students.
                        Experience comfortable living with world-class amenities in the heart of Thiruvananthapuram.
                    </p>
                    <button
                        id="apply-btn"
                        className="btn btn-primary btn-large"
                        onClick={() => navigate('/fee-structure')}
                    >
                        Apply for Hostel Admission
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose Our Hostel?</h2>
                    <div className="features-grid">
                        {[
                            { icon: '🛡️', title: 'Safe & Secure', desc: '24/7 security and CCTV surveillance for your safety.' },
                            { icon: '🍽️', title: 'Nutritious Meals', desc: 'Hygienic and balanced meals served daily in our mess.' },
                            { icon: '📚', title: 'Study Rooms', desc: 'Dedicated quiet study rooms available round the clock.' },
                            { icon: '🌿', title: 'Peaceful Campus', desc: 'A serene green environment perfect for academic focus.' },
                            { icon: '💧', title: 'Clean Facilities', desc: 'Well-maintained bathrooms and common areas.' },
                            { icon: '🚌', title: 'Well Connected', desc: 'Conveniently located with easy transport access.' },
                        ].map((f, i) => (
                            <div className="feature-card" key={i}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Ready to Join Our Hostel?</h2>
                        <p>Admissions for 2025-26 are now open. Apply before seats fill up!</p>
                        <div className="cta-buttons">
                            <button className="btn btn-primary" onClick={() => navigate('/fee-structure')}>
                                View Fee Structure & Apply
                            </button>
                            <button className="btn btn-outline" onClick={() => navigate('/login')}>
                                Student / Admin Login
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="info-section">
                <div className="container">
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">📍</div>
                            <h3>Address</h3>
                            <p>LBSITW Hostel, Poojappura,<br />Thiruvananthapuram, Kerala</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">📞</div>
                            <h3>Contact</h3>
                            <p>+91 471 2345678<br />hostel@lbsitw.ac.in</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🕐</div>
                            <h3>Office Hours</h3>
                            <p>Monday – Friday<br />9:00 AM to 5:00 PM</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2026 LBSITW Hostel, Poojappura, Thiruvananthapuram. All rights reserved.</p>
            </footer>
        </div>
    );
}
