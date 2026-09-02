import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../firebase';

type AdminUser = {
  id: string;
  uid: string;
  name: string;
  email: string;
  createdAt?: any;
};

interface UsersProps {
  onBack: () => void;
}

function Users({ onBack }: UsersProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const usersRef = collection(db, 'users');

      const snapshot = await getDocs(usersRef);

      const loadedUsers: AdminUser[] =
        snapshot.docs.map((userDoc) => {
          const data = userDoc.data();

          return {
            id: userDoc.id,
            uid: data.uid || userDoc.id,
            name: data.name || 'Unknown User',
            email: data.email || 'No email',
            createdAt: data.createdAt,
          };
        });

      loadedUsers.sort((a, b) => {
        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      });

      setUsers(loadedUsers);

    } catch (error) {
      console.error(
        'Failed to load users:',
        error
      );

      setError(
        'Unable to load users. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) {
      return 'Date unavailable';
    }

    return timestamp.toDate().toLocaleString();
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <button
            onClick={onBack}
            style={styles.backButton}
          >
            ← Dashboard
          </button>

          <h1 style={styles.title}>
            Users
          </h1>

          <p style={styles.subtitle}>
            Manage StyleIQ users and accounts
          </p>
        </div>

        <button
          onClick={loadUsers}
          style={styles.refreshButton}
        >
          Refresh
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div style={styles.messageCard}>

          <div style={styles.messageIcon}>
            👥
          </div>

          <h2 style={styles.messageTitle}>
            Loading users...
          </h2>

          <p style={styles.messageText}>
            Getting the latest StyleIQ users.
          </p>

        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div style={styles.errorCard}>

          <h2 style={styles.errorTitle}>
            Unable to load users
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            onClick={loadUsers}
            style={styles.retryButton}
          >
            Try Again
          </button>

        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        users.length === 0 && (
          <div style={styles.messageCard}>

            <div style={styles.messageIcon}>
              👤
            </div>

            <h2 style={styles.messageTitle}>
              No users yet
            </h2>

            <p style={styles.messageText}>
              Registered StyleIQ users will
              appear here.
            </p>

          </div>
        )}

      {/* USERS */}

      {!loading &&
        !error &&
        users.length > 0 && (

          <div>

            {/* SUMMARY */}

            <div style={styles.summaryCard}>

              <div>
                <p style={styles.summaryLabel}>
                  Total Users
                </p>

                <h2 style={styles.summaryValue}>
                  {users.length}
                </h2>
              </div>

            </div>

            {/* USER LIST */}

            <div style={styles.usersList}>

              {users.map((user) => (

                <div
                  key={user.id}
                  style={styles.userCard}
                >

                  <div style={styles.userAvatar}>
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={styles.userInfo}>

                    <h2 style={styles.userName}>
                      {user.name}
                    </h2>

                    <p style={styles.userEmail}>
                      {user.email}
                    </p>

                    <p style={styles.userDate}>
                      Joined:{' '}
                      {formatDate(
                        user.createdAt
                      )}
                    </p>

                  </div>

                  <div style={styles.userIdBox}>

                    <p style={styles.userIdLabel}>
                      User ID
                    </p>

                    <p style={styles.userId}>
                      {user.uid}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {

  page: {
    minHeight: '100vh',
    background: '#F7F5FC',
    padding: '30px 40px',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '30px',
  },

  backButton: {
    border: 'none',
    background: 'transparent',
    color: '#6C3CF0',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    marginBottom: '12px',
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: 800,
    color: '#111111',
  },

  subtitle: {
    marginTop: '6px',
    color: '#777777',
    fontSize: '14px',
  },

  refreshButton: {
    padding: '11px 20px',
    border: 'none',
    borderRadius: '10px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    fontWeight: 700,
    cursor: 'pointer',
  },

  summaryCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '22px 25px',
    marginBottom: '22px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  summaryLabel: {
    margin: 0,
    color: '#777777',
    fontSize: '12px',
  },

  summaryValue: {
    margin: '5px 0 0',
    color: '#111111',
    fontSize: '24px',
  },

  usersList: {
    display: 'grid',
    gap: '15px',
  },

  userCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  userAvatar: {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    background: '#F0EBFF',
    color: '#6C3CF0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 800,
    flexShrink: 0,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    margin: 0,
    color: '#111111',
    fontSize: '16px',
  },

  userEmail: {
    margin: '5px 0',
    color: '#666666',
    fontSize: '13px',
  },

  userDate: {
    margin: 0,
    color: '#999999',
    fontSize: '11px',
  },

  userIdBox: {
    maxWidth: '260px',
  },

  userIdLabel: {
    margin: 0,
    color: '#999999',
    fontSize: '10px',
    textTransform: 'uppercase',
    fontWeight: 700,
  },

  userId: {
    margin: '5px 0 0',
    color: '#777777',
    fontSize: '10px',
    wordBreak: 'break-all',
  },

  messageCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '50px 30px',
    textAlign: 'center',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  messageIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },

  messageTitle: {
    margin: 0,
    color: '#111111',
  },

  messageText: {
    color: '#777777',
    fontSize: '14px',
  },

  errorCard: {
    background: '#FFF1F1',
    borderRadius: '18px',
    padding: '30px',
    textAlign: 'center',
  },

  errorTitle: {
    color: '#D32F2F',
    margin: 0,
  },

  errorText: {
    color: '#777777',
    fontSize: '13px',
  },

  retryButton: {
    marginTop: '10px',
    padding: '10px 18px',
    border: 'none',
    borderRadius: '9px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default Users;