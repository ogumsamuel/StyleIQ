const express = require('express');

const {
  getFirestore,
} = require('firebase-admin/firestore');

const requireAdmin =
  require('../middleware/adminAuth');

const router = express.Router();


// ==================================================
// FIRESTORE
// ==================================================

const db = getFirestore();


// ==================================================
// GET TOTAL ORDERS
// ==================================================

router.get(
  '/orders/count',
  requireAdmin,
  async (req, res) => {

    try {

      const ordersQuery =
        db.collectionGroup('orders');

      const snapshot =
        await ordersQuery.count().get();

      const totalOrders =
        snapshot.data().count;

      return res.json({

        success: true,

        totalOrders,

      });

    } catch (error) {

      console.error(
        'Failed to count orders:',
        error
      );

      return res.status(500).json({

        success: false,

        error:
          'Unable to retrieve total orders.',

      });

    }

  }
);


// ==================================================
// GET AI ACTIVITY
// ==================================================

router.get(
  '/ai-activity',
  requireAdmin,
  async (req, res) => {

    try {

      console.log(
        '================================='
      );

      console.log(
        'GETTING AI ACTIVITY'
      );


      // ==========================================
      // GET AI ACTIVITY
      // ==========================================

      const snapshot =
        await db
          .collection('aiActivity')
          .orderBy(
            'createdAt',
            'desc'
          )
          .limit(50)
          .get();


      // ==========================================
      // CONVERT FIRESTORE DOCUMENTS
      // ==========================================

      const activities =
        snapshot.docs.map(
          (doc) => {

            const data =
              doc.data();


            return {

              id:
                doc.id,

              userId:
                data.userId || null,

              userEmail:
                data.userEmail || null,

              message:
                data.message || '',

              reply:
                data.reply || '',

              createdAt:
                data.createdAt
                  ? data.createdAt.toDate().toISOString()
                  : null,

            };

          }
        );


      // ==========================================
      // TOTAL REQUESTS
      // ==========================================

      const totalRequests =
        activities.length;


      // ==========================================
      // TODAY'S REQUESTS
      // ==========================================

      const now =
        new Date();

      const startOfToday =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );


      const todayRequests =
        activities.filter(
          (activity) => {

            if (
              !activity.createdAt
            ) {
              return false;
            }

            const activityDate =
              new Date(
                activity.createdAt
              );

            return (
              activityDate >=
              startOfToday
            );

          }
        ).length;


      // ==========================================
      // UNIQUE USERS
      // ==========================================

      const uniqueUserIds =
        new Set(
          activities
            .map(
              (activity) =>
                activity.userId
            )
            .filter(Boolean)
        );


      const uniqueUsers =
        uniqueUserIds.size;


      // ==========================================
      // RESPONSE
      // ==========================================

      console.log(
        'AI activity retrieved:',
        activities.length
      );

      console.log(
        'Total requests:',
        totalRequests
      );

      console.log(
        'Today requests:',
        todayRequests
      );

      console.log(
        'Unique users:',
        uniqueUsers
      );


      return res.json({

        success: true,

        statistics: {

          totalRequests,

          todayRequests,

          uniqueUsers,

        },

        activities,

      });

    } catch (error) {

      console.error(
        '================================='
      );

      console.error(
        'FAILED TO RETRIEVE AI ACTIVITY'
      );

      console.error(
        'Code:',
        error?.code
      );

      console.error(
        'Message:',
        error?.message
      );

      console.error(
        '================================='
      );


      return res.status(500).json({

        success: false,

        error:
          'Unable to retrieve AI activity.',

      });

    }

  }
);


module.exports = router;