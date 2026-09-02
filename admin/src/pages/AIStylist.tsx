import React, { useCallback, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { getIdToken } from 'firebase/auth';

interface AIStylistProps {
  onBack: () => void;
}

interface AIActivity {
  id: string;
  userId: string | null;
  userEmail: string | null;
  message: string;
  reply: string;
  createdAt: string | null;
}

interface AIStatistics {
  totalRequests: number;
  todayRequests: number;
  uniqueUsers: number;
}

interface AIActivityResponse {
  success: boolean;
  statistics: AIStatistics;
  activities: AIActivity[];
  error?: string;
}

export default function AIStylist({
  onBack,
}: AIStylistProps) {

  const [activities, setActivities] =
    useState<AIActivity[]>([]);

  const [statistics, setStatistics] =
    useState<AIStatistics>({
      totalRequests: 0,
      todayRequests: 0,
      uniqueUsers: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [refreshing, setRefreshing] =
    useState(false);


  // ==================================================
  // BACKEND URL
  // ==================================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000';


  // ==================================================
  // LOAD AI ACTIVITY
  // ==================================================

  const loadAIActivity =
    useCallback(async () => {

      try {

        setError('');
        const currentUser = auth.currentUser;

if (!currentUser) {
  throw new Error('You are not signed in.');
}

const idToken = await getIdToken(currentUser, true);

console.log('AI Admin request user:', {
  uid: currentUser.uid,
  email: currentUser.email,
});

console.log(
  'AI Admin token:',
  idToken.substring(0, 30) + '...'
);
        // ==========================================
        // CALL ADMIN BACKEND
        // ==========================================

        const response =
          await fetch(
            `${API_URL}/api/admin/ai-activity`,
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${idToken}`,

                'Content-Type':
                  'application/json',
              },
            }
          );


        const data:
          AIActivityResponse =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.error ||
            'Unable to retrieve AI activity.'
          );

        }


        // ==========================================
        // SAVE DATA
        // ==========================================

        setActivities(
          data.activities || []
        );

        setStatistics(
          data.statistics || {
            totalRequests: 0,
            todayRequests: 0,
            uniqueUsers: 0,
          }
        );

      } catch (err: any) {

        console.error(
          'AI activity error:',
          err
        );

        setError(
          err?.message ||
          'Unable to load AI activity.'
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    }, [API_URL]);


  // ==================================================
  // LOAD WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {

    loadAIActivity();

  }, [loadAIActivity]);


  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh = async () => {

    setRefreshing(true);

    await loadAIActivity();

  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (
    dateString: string | null
  ) => {

    if (!dateString) {
      return 'Unknown time';
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'Unknown time';
    }

    return date.toLocaleString();

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div style={styles.page}>

      {/* ============================================
          HEADER
      ============================================= */}

      <div style={styles.header}>

        <div>

          <button
            onClick={onBack}
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>

          <h1 style={styles.title}>
            AI Stylist
          </h1>

          <p style={styles.subtitle}>
            Monitor StyleIQ AI activity and usage.
          </p>

        </div>

        <button
          onClick={handleRefresh}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          {refreshing
            ? 'Refreshing...'
            : '↻ Refresh'}
        </button>

      </div>


      {/* ============================================
          ERROR
      ============================================= */}

      {error !== '' && (

        <div style={styles.errorCard}>

          <div style={styles.errorIcon}>
            ⚠️
          </div>

          <div>

            <strong>
              Unable to load AI activity
            </strong>

            <p style={styles.errorText}>
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ============================================
          STATISTICS
      ============================================= */}

      <div style={styles.statsGrid}>

        {/* AI STATUS */}

        <div style={styles.statCard}>

          <div style={styles.icon}>
            🤖
          </div>

          <div>

            <p style={styles.statLabel}>
              AI Status
            </p>

            <h2 style={styles.statValue}>
              Active
            </h2>

            <span style={styles.activeBadge}>
              ONLINE
            </span>

          </div>

        </div>


        {/* TOTAL CONVERSATIONS */}

        <div style={styles.statCard}>

          <div style={styles.icon}>
            💬
          </div>

          <div>

            <p style={styles.statLabel}>
              AI Conversations
            </p>

            <h2 style={styles.statValue}>

              {loading
                ? '...'
                : statistics.totalRequests}

            </h2>

            <p style={styles.statHint}>
              Total AI requests
            </p>

          </div>

        </div>


        {/* TODAY */}

        <div style={styles.statCard}>

          <div style={styles.icon}>
            📅
          </div>

          <div>

            <p style={styles.statLabel}>
              Today's Requests
            </p>

            <h2 style={styles.statValue}>

              {loading
                ? '...'
                : statistics.todayRequests}

            </h2>

            <p style={styles.statHint}>
              AI requests today
            </p>

          </div>

        </div>


        {/* UNIQUE USERS */}

        <div style={styles.statCard}>

          <div style={styles.icon}>
            👥
          </div>

          <div>

            <p style={styles.statLabel}>
              Users Using AI
            </p>

            <h2 style={styles.statValue}>

              {loading
                ? '...'
                : statistics.uniqueUsers}

            </h2>

            <p style={styles.statHint}>
              Users in recent activity
            </p>

          </div>

        </div>

      </div>


      {/* ============================================
          AI INFORMATION
      ============================================= */}

      <div style={styles.contentGrid}>

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.cardIcon}>
              🤖
            </div>

            <div>

              <h2 style={styles.cardTitle}>
                StyleIQ AI
              </h2>

              <p style={styles.cardSubtitle}>
                Personalized fashion assistant
              </p>

            </div>

          </div>

          <div style={styles.divider} />


          <div style={styles.infoRow}>

            <span style={styles.infoLabel}>
              Service
            </span>

            <span style={styles.infoValue}>
              StyleIQ AI
            </span>

          </div>


          <div style={styles.infoRow}>

            <span style={styles.infoLabel}>
              AI Provider
            </span>

            <span style={styles.infoValue}>
              Google Gemini
            </span>

          </div>


          <div style={styles.infoRow}>

            <span style={styles.infoLabel}>
              Backend
            </span>

            <span style={styles.infoValue}>
              StyleIQ API
            </span>

          </div>


          <div style={styles.infoRow}>

            <span style={styles.infoLabel}>
              Firestore Activity
            </span>

            <span style={styles.successText}>
              Connected
            </span>

          </div>


          <div style={styles.infoRow}>

            <span style={styles.infoLabel}>
              Personalization
            </span>

            <span style={styles.successText}>
              Enabled
            </span>

          </div>

        </div>


        {/* CAPABILITIES */}

        <div style={styles.card}>

          <h2 style={styles.cardTitle}>
            AI Capabilities
          </h2>

          <p style={styles.cardSubtitle}>
            Features currently available to StyleIQ
            users.
          </p>


          <div style={styles.capability}>
            <span>👔</span>
            <span>
              Outfit recommendations
            </span>
          </div>


          <div style={styles.capability}>
            <span>🎨</span>
            <span>
              Color matching
            </span>
          </div>


          <div style={styles.capability}>
            <span>💰</span>
            <span>
              Budget-aware styling
            </span>
          </div>


          <div style={styles.capability}>
            <span>👕</span>
            <span>
              Casual outfit creation
            </span>
          </div>


          <div style={styles.capability}>
            <span>✨</span>
            <span>
              Personalized recommendations
            </span>
          </div>

        </div>

      </div>


      {/* ============================================
          ACTIVITY
      ============================================= */}

      <div style={styles.activityCard}>

        <div style={styles.activityHeader}>

          <div>

            <h2 style={styles.cardTitle}>
              Recent AI Activity
            </h2>

            <p style={styles.cardSubtitle}>
              Real AI requests recorded by the
              StyleIQ backend.
            </p>

          </div>

          {!loading && (

            <span style={styles.activityCount}>
              {activities.length} recent
            </span>

          )}

        </div>


        {/* LOADING */}

        {loading && (

          <div style={styles.loadingState}>

            <div style={styles.loadingIcon}>
              🤖
            </div>

            <p style={styles.loadingText}>
              Loading AI activity...
            </p>

          </div>

        )}


        {/* NO ACTIVITY */}

        {!loading &&
          !error &&
          activities.length === 0 && (

            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                📊
              </div>

              <h3 style={styles.emptyTitle}>
                No AI activity yet
              </h3>

              <p style={styles.emptyText}>
                When StyleIQ users start using the
                AI Stylist, their requests will
                appear here.
              </p>

            </div>

          )}


        {/* ACTIVITY LIST */}

        {!loading &&
          activities.length > 0 && (

            <div style={styles.activityList}>

              {activities.map(
                (activity) => (

                  <div
                    key={activity.id}
                    style={styles.activityItem}
                  >

                    <div
                      style={
                        styles.activityIcon
                      }
                    >
                      ✨
                    </div>


                    <div
                      style={
                        styles.activityContent
                      }
                    >

                      <div
                        style={
                          styles.activityTop
                        }
                      >

                        <strong
                          style={
                            styles.activityUser
                          }
                        >
                          {activity.userEmail ||
                            'Unknown user'}
                        </strong>

                        <span
                          style={
                            styles.activityDate
                          }
                        >
                          {formatDate(
                            activity.createdAt
                          )}
                        </span>

                      </div>


                      <div
                        style={
                          styles.messageBox
                        }
                      >

                        <span
                          style={
                            styles.messageLabel
                          }
                        >
                          USER
                        </span>

                        <p
                          style={
                            styles.messageText
                          }
                        >
                          {activity.message}
                        </p>

                      </div>


                      <div
                        style={
                          styles.replyBox
                        }
                      >

                        <span
                          style={
                            styles.replyLabel
                          }
                        >
                          STYLEIQ AI
                        </span>

                        <p
                          style={
                            styles.replyText
                          }
                        >
                          {activity.reply}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </div>
  );
}


// ==================================================
// STYLES
// ==================================================

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
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '20px',
  },

  backButton: {
    border: 'none',
    background: 'transparent',
    color: '#6C3CF0',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '18px',
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: 800,
    color: '#111111',
  },

  subtitle: {
    marginTop: '7px',
    color: '#777777',
    fontSize: '14px',
  },

  refreshButton: {
    border: 'none',
    borderRadius: '10px',
    background: '#6C3CF0',
    color: '#FFFFFF',
    padding: '11px 18px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  errorCard: {
    background: '#FFF4F4',
    border: '1px solid #FFD5D5',
    borderRadius: '15px',
    padding: '15px 18px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
    color: '#A94442',
  },

  errorIcon: {
    fontSize: '20px',
  },

  errorText: {
    margin: '5px 0 0',
    fontSize: '13px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '25px',
  },

  statCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '23px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  icon: {
    width: '52px',
    height: '52px',
    borderRadius: '15px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
    flexShrink: 0,
  },

  statLabel: {
    margin: 0,
    color: '#777777',
    fontSize: '12px',
  },

  statValue: {
    margin: '4px 0',
    color: '#111111',
    fontSize: '21px',
    fontWeight: 800,
  },

  statHint: {
    margin: 0,
    color: '#999999',
    fontSize: '11px',
  },

  activeBadge: {
    display: 'inline-block',
    background: '#E8F8EE',
    color: '#198754',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '9px',
    fontWeight: 800,
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '25px',
  },

  card: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '25px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '23px',
  },

  cardTitle: {
    margin: 0,
    color: '#111111',
    fontSize: '18px',
    fontWeight: 800,
  },

  cardSubtitle: {
    margin: '6px 0 0',
    color: '#888888',
    fontSize: '12px',
  },

  divider: {
    height: '1px',
    background: '#EEEEEE',
    margin: '20px 0',
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #F2F2F2',
    gap: '15px',
  },

  infoLabel: {
    color: '#777777',
    fontSize: '13px',
  },

  infoValue: {
    color: '#222222',
    fontSize: '13px',
    fontWeight: 700,
  },

  successText: {
    color: '#198754',
    fontSize: '13px',
    fontWeight: 700,
  },

  capability: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 0',
    borderBottom: '1px solid #F2F2F2',
    color: '#444444',
    fontSize: '13px',
  },

  activityCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '25px',
    boxShadow:
      '0 8px 25px rgba(0, 0, 0, 0.05)',
  },

  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '20px',
  },

  activityCount: {
    background: '#F0EBFF',
    color: '#6C3CF0',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 700,
  },

  loadingState: {
    padding: '45px',
    textAlign: 'center',
    background: '#FAFAFA',
    borderRadius: '15px',
  },

  loadingIcon: {
    fontSize: '35px',
  },

  loadingText: {
    color: '#777777',
    fontSize: '13px',
    marginTop: '10px',
  },

  emptyState: {
    marginTop: '20px',
    padding: '35px',
    borderRadius: '15px',
    background: '#FAFAFA',
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: '35px',
  },

  emptyTitle: {
    margin: '10px 0 5px',
    color: '#222222',
    fontSize: '16px',
  },

  emptyText: {
    maxWidth: '500px',
    margin: '0 auto',
    color: '#888888',
    fontSize: '12px',
    lineHeight: 1.6,
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  activityItem: {
    display: 'flex',
    gap: '14px',
    padding: '18px',
    border: '1px solid #EEEEEE',
    borderRadius: '15px',
    background: '#FFFFFF',
  },

  activityIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  activityContent: {
    flex: 1,
    minWidth: 0,
  },

  activityTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '12px',
  },

  activityUser: {
    color: '#222222',
    fontSize: '13px',
  },

  activityDate: {
    color: '#999999',
    fontSize: '11px',
  },

  messageBox: {
    background: '#F8F7FC',
    borderRadius: '10px',
    padding: '11px 13px',
    marginBottom: '8px',
  },

  replyBox: {
    background: '#F0EBFF',
    borderRadius: '10px',
    padding: '11px 13px',
  },

  messageLabel: {
    color: '#777777',
    fontSize: '9px',
    fontWeight: 800,
  },

  replyLabel: {
    color: '#6C3CF0',
    fontSize: '9px',
    fontWeight: 800,
  },

  messageText: {
    margin: '5px 0 0',
    color: '#444444',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  replyText: {
    margin: '5px 0 0',
    color: '#333333',
    fontSize: '13px',
    lineHeight: 1.5,
  },
};