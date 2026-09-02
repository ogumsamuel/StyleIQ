import { useState } from 'react';
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResetMessage('');

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      onLoginSuccess();
    } catch (error: any) {
      console.error('Admin login error:', error);

      setError(
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(
        'Please enter your admin email address first.'
      );
      return;
    }

    try {
      setResetLoading(true);
      setError('');
      setResetMessage('');

      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      setResetMessage(
        'Password reset email sent. Please check your inbox and follow the instructions to create a new password.'
      );

    } catch (error: any) {
      console.error(
        'Password reset error:',
        error
      );

      if (
        error?.code ===
        'auth/user-not-found'
      ) {
        setError(
          'No StyleIQ account was found with this email address.'
        );
      } else if (
        error?.code ===
        'auth/invalid-email'
      ) {
        setError(
          'Please enter a valid email address.'
        );
      } else {
        setError(
          'Unable to send the password reset email. Please try again.'
        );
      }
    } finally {
      setResetLoading(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD SCREEN
  // ==========================================

  if (showForgotPassword) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <div style={styles.logo}>
            🔐
          </div>

          <h1 style={styles.title}>
            Reset Password
          </h1>

          <p style={styles.subtitle}>
            Enter your admin email address and we'll
            send you a link to create a new password.
          </p>

          <form onSubmit={handleForgotPassword}>

            <label style={styles.label}>
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              style={styles.input}
              autoComplete="email"
              disabled={resetLoading}
            />

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {resetMessage && (
              <div style={styles.success}>
                {resetMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              style={{
                ...styles.button,
                opacity: resetLoading
                  ? 0.6
                  : 1,
              }}
            >
              {resetLoading
                ? 'Sending...'
                : 'Send Reset Email'}
            </button>

          </form>

          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false);
              setError('');
              setResetMessage('');
            }}
            style={styles.backButton}
          >
            ← Back to Sign In
          </button>

          <p style={styles.footer}>
            StyleIQ Admin Dashboard
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // LOGIN SCREEN
  // ==========================================

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          ✨
        </div>

        <h1 style={styles.title}>
          StyleIQ Admin
        </h1>

        <p style={styles.subtitle}>
          Sign in to manage your StyleIQ platform
        </p>

        <form onSubmit={handleLogin}>

          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="admin@example.com"
            style={styles.input}
            autoComplete="email"
          />

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            style={styles.input}
            autoComplete="current-password"
          />

          <div style={styles.forgotContainer}>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setError('');
                setResetMessage('');
              }}
              style={styles.forgotButton}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading
                ? 0.6
                : 1,
            }}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

        <p style={styles.footer}>
          StyleIQ Admin Dashboard
        </p>

      </div>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F7F5FC',
    padding: '20px',
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    boxShadow:
      '0 15px 40px rgba(0, 0, 0, 0.08)',
  },

  logo: {
    width: '65px',
    height: '65px',
    borderRadius: '20px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 20px',
  },

  title: {
    textAlign: 'center',
    margin: '0',
    fontSize: '28px',
    fontWeight: 800,
    color: '#111111',
  },

  subtitle: {
    textAlign: 'center',
    color: '#777777',
    fontSize: '14px',
    lineHeight: 1.5,
    marginTop: '8px',
    marginBottom: '30px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#333333',
    marginBottom: '7px',
    marginTop: '18px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    height: '48px',
    borderRadius: '12px',
    border: '1px solid #E2E2E2',
    padding: '0 14px',
    fontSize: '14px',
    outline: 'none',
  },

  forgotContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },

  forgotButton: {
    border: 'none',
    background: 'transparent',
    color: '#6C3CF0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 0',
  },

  button: {
    width: '100%',
    height: '50px',
    border: 'none',
    borderRadius: '13px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '25px',
  },

  backButton: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: '#6C3CF0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '20px',
    padding: '8px',
  },

  error: {
    background: '#FFF1F1',
    color: '#D32F2F',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    marginTop: '15px',
    lineHeight: 1.5,
  },

  success: {
    background: '#EFFBF3',
    color: '#218838',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    marginTop: '15px',
    lineHeight: 1.5,
  },

  footer: {
    textAlign: 'center',
    color: '#999999',
    fontSize: '11px',
    marginTop: '25px',
  },
};

export default Login;