import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const LoginPage = () => {
    const { login } = useApp();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        login(role);
        if (role === 'AL') {
            navigate('/performance');
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                padding: '40px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: '800',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                    textShadow: '0 0 20px rgba(255,255,255,0.3)'
                }}>
                    CAELUM
                </div>
                <div style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '40px',
                    letterSpacing: '0.5px'
                }}>
                    AGENCY MANAGEMENT SYSTEM
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                        onClick={() => handleLogin('AL')}
                        style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f39c12 0%, #d35400 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'transfrom 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <span>👑</span> Login as Agency Leader
                    </button>

                    <button
                        onClick={() => handleLogin('AP')}
                        style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #0055b8 0%, #003380 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'transfrom 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <span>👤</span> Login as Agency Partner
                    </button>
                </div>

                <div style={{
                    marginTop: '40px',
                    color: '#64748b',
                    fontSize: '12px'
                }}>
                    Protected System • Authorized Access Only
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
