import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function PublicHeader() {
    const navigate = useNavigate();

    return (
        <header className="public-header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="brand">
                        <TrendingUp size={28} className="brand-icon" />
                        <span className="brand-text">Hz Tracker</span>
                    </Link>

                    <nav className="auth-nav">
                        <button
                            className="btn-text"
                            onClick={() => navigate('/login', { state: { isSignUp: false } })}
                        >
                            Log In
                        </button>
                        <button
                            className="btn-primary-sm"
                            onClick={() => navigate('/login', { state: { isSignUp: true } })}
                        >
                            Sign Up
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
