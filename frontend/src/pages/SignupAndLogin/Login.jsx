import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../utils/axiosInstance';
const server = import.meta.env.VITE_API_URL;

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkExistingAuth = async () => {
            try {
                const res = await axiosInstance.get('/api/v1/users/check_auth');
                if (res.data.authenticated) {
                    navigate('/dashboard');
                }
            } catch (err) {
                // Not authenticated, stay on login
            }
        };
        checkExistingAuth();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const request = await axiosInstance.post('/api/v1/users/login', { username: email, password });

            if (request.status === 200) {
                // Token is now set in HttpOnly cookie by server
                // AND returned in JSON for explicit localStorage storage
                localStorage.setItem('token', request.data.token);
                localStorage.setItem('email', email);
                if (request.data.username) {
                    localStorage.setItem('username', request.data.username);
                }
                if (request.data.name) {
                    localStorage.setItem('name', request.data.name);
                }
                if (request.data.profile_picture) {
                    localStorage.setItem('profile_picture', request.data.profile_picture);
                } else {
                    localStorage.removeItem('profile_picture');
                }
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Invalid email or password. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const response = await axiosInstance.post(`/api/v1/users/google-login`, {
                    access_token: tokenResponse.access_token
                });

                if (response.status === 200) {
                    // Token is now set in HttpOnly cookie by server
                    // AND returned in JSON for explicit localStorage storage
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('email', response.data.email);
                    if (response.data.username) {
                        localStorage.setItem('username', response.data.username);
                    } else {
                        localStorage.setItem('username', response.data.name);
                    }
                    localStorage.setItem('name', response.data.name);
                    if (response.data.profile_picture) {
                        localStorage.setItem('profile_picture', response.data.profile_picture);
                    } else {
                        localStorage.removeItem('profile_picture');
                    }
                    navigate('/dashboard');
                }
            } catch (err) {
                setError('Google login failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google login failed.')
    });

    const handleGoogleLogin = () => {
        googleLogin();
    };

    return (
        <div style={styles.page}>
            {/* Ambient glow effects */}
            <div style={styles.glowTop} />
            <div style={styles.glowBottom} />

            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoWrapper}>
                    <div style={styles.logoIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                                stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span style={styles.brandName}>MeetNext</span>
                    <span style={styles.proBadge}>PRO SUITE</span>
                </div>

                <h1 style={styles.title}>Welcome back</h1>
                <p style={styles.subtitle}>Connect with your team instantly</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    {/* Email */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" />
                                    <polyline points="22,6 12,13 2,6" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                onFocus={(e) => e.target.parentElement.style.borderColor = 'rgba(99,102,241,0.6)'}
                                onBlur={(e) => e.target.parentElement.style.borderColor = 'var(--border-light)'}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={styles.fieldGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={styles.label}>Password</label>
                            <a href="#" style={styles.forgotLink}>Forgot Password?</a>
                        </div>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="var(--text-secondary)" strokeWidth="1.8" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ ...styles.input, paddingRight: '40px' }}
                                onFocus={(e) => e.target.parentElement.style.borderColor = 'rgba(99,102,241,0.6)'}
                                onBlur={(e) => e.target.parentElement.style.borderColor = 'var(--border-light)'}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" />
                                        <circle cx="12" cy="12" r="3" stroke="var(--text-secondary)" strokeWidth="1.8" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" />
                                        <circle cx="12" cy="12" r="3" stroke="var(--text-secondary)" strokeWidth="1.8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && <p style={styles.error}>{error}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }}
                        onMouseEnter={(e) => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(99,102,241,0.55)'; } }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'; }}
                    >
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>

                    {/* Divider */}
                    <div style={styles.divider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>OR CONTINUE WITH</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        style={styles.googleBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </form>

                <p style={styles.switchText}>
                    Don't have an account?{' '}
                    <Link to="/" style={styles.switchLink}>Join for free</Link>
                </p>

                {/* Footer Links */}
                <div style={styles.footer}>
                    <a href="#" style={styles.footerLink}>Privacy Policy</a>
                    <span style={styles.footerDot}>·</span>
                    <a href="#" style={styles.footerLink}>Terms of Service</a>
                    <span style={styles.footerDot}>·</span>
                    <a href="#" style={styles.footerLink}>Help Center</a>
                </div>
                <p style={styles.copyright}>© 2024 MeetNext Inc. All rights reserved.</p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        height: 'calc(100vh / var(--app-zoom, 1))',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-root)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxSizing: 'border-box',
        position: 'relative',
    },
    glowTop: {
        position: 'absolute',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    glowBottom: {
        position: 'absolute',
        bottom: '-100px',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-darker) 100%)',
        borderRadius: '16px',
        padding: '34px 32px 28px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 24px 60px var(--shadow-strong)',
        position: 'relative',
        zIndex: 1,
    },
    logoWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
    },
    logoIcon: {
        width: '34px',
        height: '34px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        flexShrink: 0,
    },
    brandName: {
        fontSize: '16px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px',
    },
    proBadge: {
        fontSize: '9px',
        fontWeight: '700',
        color: 'var(--primary-light)',
        letterSpacing: '1.5px',
        marginTop: '2px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        margin: '0 0 5px 0',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '13.5px',
        color: 'var(--text-secondary)',
        margin: '0 0 24px 0',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
    },
    forgotLink: {
        fontSize: '12px',
        color: 'var(--primary-light)',
        textDecoration: 'none',
        fontWeight: '500',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-light)',
        borderRadius: '10px',
        transition: 'border-color 0.2s',
        padding: '0 13px',
    },
    inputIcon: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '9px',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--text-primary)',
        fontSize: '14px',
        padding: '12px 0',
        fontFamily: 'inherit',
    },
    eyeBtn: {
        position: 'absolute',
        right: '11px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
    },
    error: {
        fontSize: '13px',
        color: '#F87171',
        margin: '0',
        padding: '10px 13px',
        backgroundColor: 'rgba(248,113,113,0.08)',
        borderRadius: '8px',
        border: '1px solid rgba(248,113,113,0.18)',
    },
    primaryBtn: {
        width: '100%',
        padding: '13px',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        border: 'none',
        borderRadius: '999px',
        color: 'var(--text-primary)',
        fontSize: '14.5px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
        fontFamily: 'inherit',
        letterSpacing: '0.2px',
        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    dividerText: {
        fontSize: '10.5px',
        color: 'var(--text-secondary)',
        letterSpacing: '0.8px',
        whiteSpace: 'nowrap',
    },
    googleBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-light)',
        borderRadius: '999px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'border-color 0.2s, background-color 0.2s',
        fontFamily: 'inherit',
    },
    switchText: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        marginTop: '18px',
    },
    switchLink: {
        color: 'var(--primary-light)',
        fontWeight: '600',
        textDecoration: 'none',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '24px',
    },
    footerLink: {
        fontSize: '11.5px',
        color: '#4B5563',
        textDecoration: 'none',
    },
    footerDot: {
        color: '#374151',
        fontSize: '12px',
    },
    copyright: {
        fontSize: '11px',
        color: '#374151',
        textAlign: 'center',
        margin: '6px 0 0 0',
    },
};
