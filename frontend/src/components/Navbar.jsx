import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, LogOut, Layout } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">
                    <span className="brand-icon">🏫</span>
                    <span className="brand-text">LBSITW Hostel</span>
                </Link>
            </div>

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <li><Link to="/" onClick={() => setMenuOpen(false)}><Home size={16} /> Home</Link></li>
                <li><Link to="/fee-structure" onClick={() => setMenuOpen(false)}>Fee Structure</Link></li>
                {!isAuthenticated && (
                    <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
                )}
                {isAuthenticated && role === 'admin' && (
                    <li><Link to="/admin" onClick={() => setMenuOpen(false)}><Layout size={16} /> Admin Portal</Link></li>
                )}
                {isAuthenticated && role === 'student' && (
                    <li><Link to="/student-dashboard" onClick={() => setMenuOpen(false)}><Layout size={16} /> My Portal</Link></li>
                )}
                {isAuthenticated && (
                    <li>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
}
