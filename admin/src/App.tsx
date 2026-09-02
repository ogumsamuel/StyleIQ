import { useEffect, useState } from 'react';
import { supabase } from './supabase';

import {
  onAuthStateChanged,
  signOut,
  getIdTokenResult,
} from 'firebase/auth';

import type { User } from 'firebase/auth';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Products from './pages/products';
import AIStylist from './pages/AIStylist';

import { auth } from './firebase';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState<User | null>(
    auth.currentUser
  );

  const [isAdmin, setIsAdmin] = useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);
const [activePage, setActivePage] =
  useState<
    'dashboard' | 'orders' | 'users' | 'products' | 'ai'
  >('dashboard');
  useEffect(() => {
  const testSupabase = async () => {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list();

    if (error) {
      console.error('Supabase Storage error:', error);
      return;
    }

    console.log('Supabase Storage connected:', data);
  };

  testSupabase();
}, []);
  // ==========================================
  // CHECK AUTHENTICATION + ADMIN AUTHORIZATION
  // ==========================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setCheckingAuth(true);

        // User is not signed in
        if (!currentUser) {
          setUser(null);
          setIsAdmin(false);
          setCheckingAuth(false);
          return;
        }

        try {
          // Force Firebase to refresh the ID token
          // so we receive the latest custom claims.
          const tokenResult =
            await getIdTokenResult(
              currentUser,
              true
            );

          const adminClaim =
            tokenResult.claims.admin === true;

          console.log(
            'Admin authorization:',
            adminClaim
          );

          setUser(currentUser);
          setIsAdmin(adminClaim);

        } catch (error) {
          console.error(
            'Authorization check failed:',
            error
          );

          setUser(currentUser);
          setIsAdmin(false);

        } finally {
          setCheckingAuth(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (checkingAuth) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>

          <div style={styles.loadingIcon}>
            ✨
          </div>

          <h2 style={styles.loadingTitle}>
            StyleIQ Admin
          </h2>

          <p style={styles.loadingText}>
            Verifying administrator access...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return (
      <Login
        onLoginSuccess={() => {
          // onAuthStateChanged will automatically
          // detect the successful login.
        }}
      />
    );
  }

  // ==========================================
  // LOGGED IN BUT NOT ADMIN
  // ==========================================

  if (!isAdmin) {
    return (
      <div style={styles.deniedPage}>

        <div style={styles.deniedCard}>

          <div style={styles.deniedIcon}>
            🔒
          </div>

          <h1 style={styles.deniedTitle}>
            Access Denied
          </h1>

          <p style={styles.deniedText}>
            Your account is authenticated, but you
            are not authorized to access the
            StyleIQ Admin Dashboard.
          </p>

          <p style={styles.accountText}>
            Signed in as:
            <br />
            <strong>
              {user.email}
            </strong>
          </p>

          <button
            onClick={() => signOut(auth)}
            style={styles.signOutButton}
          >
            Sign Out
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // AUTHORIZED ADMIN DASHBOARD
  // ==========================================
if (activePage === 'orders') {
  return (
    <Orders
      onBack={() =>
        setActivePage('dashboard')
      }
    />
  );
}
if (activePage === 'users') {
  return (
    <Users
      onBack={() =>
        setActivePage('dashboard')
      }
    />
  );
}
if (activePage === 'products') {
  return (
    <Products
      onBack={() =>
        setActivePage('dashboard')
      }
    />
  );
}
if (activePage === 'ai') {
  return (
    <AIStylist
      onBack={() =>
        setActivePage('dashboard')
      }
    />
  );
}

return (
    <div style={styles.dashboard}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.dashboardTitle}>
            StyleIQ Admin Dashboard
          </h1>

          <p style={styles.dashboardSubtitle}>
            Platform administration
          </p>
        </div>

        <button
          onClick={() => signOut(auth)}
          style={styles.headerSignOut}
        >
          Sign Out
        </button>

      </div>

      {/* ADMIN WELCOME */}

      <div style={styles.welcomeCard}>

        <div style={styles.adminIcon}>
          ✨
        </div>

        <div>

          <h2 style={styles.welcomeTitle}>
            Welcome, Admin
          </h2>

          <p style={styles.welcomeText}>
            {user.email}
          </p>

          <span style={styles.adminBadge}>
            ADMINISTRATOR
          </span>

        </div>

      </div>

      {/* DASHBOARD CARDS */}
<div
  style={{
    ...styles.dashboardCard,
    cursor: 'pointer',
  }}
  onClick={() =>
    setActivePage('users')
  }
>

  <div style={styles.cardIcon}>
    👥
  </div>

  <h3 style={styles.cardTitle}>
    Users
  </h3>

  <p style={styles.cardText}>
    Manage StyleIQ users and accounts.
  </p>

</div>
<div
  style={{
    ...styles.dashboardCard,
    cursor: 'pointer',
  }}
  onClick={() =>
    setActivePage('products')
  }
>

  <div style={styles.cardIcon}>
    🛍️
  </div>

  <h3 style={styles.cardTitle}>
    Products
  </h3>

  <p style={styles.cardText}>
    Manage products and inventory.
  </p>

</div>
<div
  style={{
    ...styles.dashboardCard,
    cursor: 'pointer',
  }}
  onClick={() =>
    setActivePage('orders')
  }
>

  <div style={styles.cardIcon}>
    📦
  </div>

  <h3 style={styles.cardTitle}>
    Orders
  </h3>

  <p style={styles.cardText}>
    View and manage customer orders.
  </p>

</div>

<div
  style={{
    ...styles.dashboardCard,
    cursor: 'pointer',
  }}
  onClick={() =>
    setActivePage('ai')
  }
>
  <div style={styles.cardIcon}>
    🤖
  </div>

  <h3 style={styles.cardTitle}>
    AI Stylist
  </h3>

  <p style={styles.cardText}>
    Monitor StyleIQ AI activity.
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

  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F7F5FC',
    padding: '20px',
  },

  loadingCard: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    boxShadow:
      '0 15px 40px rgba(0, 0, 0, 0.08)',
  },

  loadingIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },

  loadingTitle: {
    margin: 0,
    color: '#111111',
  },

  loadingText: {
    color: '#777777',
    marginTop: '8px',
  },

  deniedPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F7F5FC',
    padding: '20px',
  },

  deniedCard: {
    width: '100%',
    maxWidth: '450px',
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    boxShadow:
      '0 15px 40px rgba(0, 0, 0, 0.08)',
  },

  deniedIcon: {
    fontSize: '45px',
    marginBottom: '15px',
  },

  deniedTitle: {
    margin: 0,
    color: '#111111',
    fontSize: '26px',
  },

  deniedText: {
    color: '#666666',
    lineHeight: 1.6,
    fontSize: '14px',
  },

  accountText: {
    color: '#777777',
    fontSize: '13px',
    marginTop: '20px',
    lineHeight: 1.6,
  },

  signOutButton: {
    marginTop: '20px',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '10px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    fontWeight: 700,
    cursor: 'pointer',
  },

  dashboard: {
    minHeight: '100vh',
    background: '#F7F5FC',
    padding: '30px 40px',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
  },

  dashboardTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 800,
    color: '#111111',
  },

  dashboardSubtitle: {
    marginTop: '5px',
    color: '#777777',
    fontSize: '14px',
  },

  headerSignOut: {
    padding: '11px 20px',
    border: 'none',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#6C3CF0',
    fontWeight: 700,
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E5DFFF',
  },

  welcomeCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  adminIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '18px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
  },

  welcomeTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#111111',
  },

  welcomeText: {
    margin: '5px 0 10px',
    color: '#777777',
    fontSize: '13px',
  },

  adminBadge: {
    display: 'inline-block',
    background: '#F0EBFF',
    color: '#6C3CF0',
    padding: '5px 9px',
    borderRadius: '7px',
    fontSize: '10px',
    fontWeight: 800,
  },

  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginTop: '25px',
  },

  dashboardCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '25px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  cardIcon: {
    fontSize: '30px',
    marginBottom: '12px',
  },

  cardTitle: {
    margin: 0,
    fontSize: '17px',
    color: '#111111',
  },

  cardText: {
    color: '#777777',
    fontSize: '13px',
    lineHeight: 1.5,
  },
};

export default App;