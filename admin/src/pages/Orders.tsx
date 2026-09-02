import { useEffect, useState } from 'react';

import {
  collectionGroup,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase';


// ==================================================
// TYPES
// ==================================================

interface OrderItem {
  id: string;
  name: string;
  price: string;
  category?: string;
  color?: string;
  image?: string;
  quantity: number;
}

interface AdminOrder {
  id: string;
  userId: string;

  orderNumber: string;

  items: OrderItem[];

  total: number;

  totalQuantity: number;

  customerName: string;

  phone: string;

  address: string;

  paymentMethod: string;

  paymentStatus: string;

  orderStatus: string;

  deliveryStatus: string;

  paystackReference?: string | null;

  deliveredAt?: any;

  createdAt?: any;

  updatedAt?: any;
}


interface OrdersProps {
  onBack: () => void;
}


// ==================================================
// OPTIONS
// ==================================================

const PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Failed',
  'Refunded',
];

const DELIVERY_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ORDER_STATUSES = [
  'Processing',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];


// ==================================================
// ADMIN ORDERS
// ==================================================

function Orders({
  onBack,
}: OrdersProps) {

  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [selectedOrderId, setSelectedOrderId] =
    useState<string | null>(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);


  // ==================================================
  // LOAD ORDERS
  // ==================================================

  useEffect(() => {

    loadOrders();

  }, []);


  const loadOrders = async () => {

    try {

      setLoading(true);

      setError('');


      // ==================================================
      // FIND ALL CUSTOMER ORDERS
      //
      // users/{userId}/orders/{orderId}
      //
      // collectionGroup allows the admin dashboard
      // to find orders belonging to every customer.
      // ==================================================

      const ordersQuery =
        collectionGroup(
          db,
          'orders'
        );


      const snapshot =
        await getDocs(
          ordersQuery
        );


      // ==================================================
      // CONVERT FIRESTORE DOCUMENTS
      // ==================================================

      const loadedOrders =
        snapshot.docs.map((orderDoc) => {

          const data =
            orderDoc.data();


          // ==================================================
          // GET USER ID
          //
          // orderDoc:
          // users/{uid}/orders/{orderId}
          //
          // orderDoc.ref.parent = orders collection
          // orderDoc.ref.parent.parent = user document
          // ==================================================

          const userId =
            orderDoc.ref.parent.parent?.id || '';


          return {

            id:
              orderDoc.id,

            userId,

            orderNumber:
              data.orderNumber ||
              `ORDER-${orderDoc.id}`,

            items:
              Array.isArray(data.items)
                ? data.items
                : [],

            total:
              typeof data.total === 'number'
                ? data.total
                : Number(data.total || 0),

            totalQuantity:
              typeof data.totalQuantity === 'number'
                ? data.totalQuantity
                : 0,

            customerName:
              data.customerName ||
              'Unknown Customer',

            phone:
              data.phone ||
              '',

            address:
              data.address ||
              '',

            paymentMethod:
              data.paymentMethod ||
              'Unknown',

            paymentStatus:
              data.paymentStatus ||
              'Pending',

            orderStatus:
              data.orderStatus ||
              'Processing',

            deliveryStatus:
              data.deliveryStatus ||
              'Pending',

            paystackReference:
              data.paystackReference ||
              null,

            deliveredAt:
              data.deliveredAt ||
              null,

            createdAt:
              data.createdAt,

            updatedAt:
              data.updatedAt,

          };

        }) as AdminOrder[];


      // ==================================================
      // NEWEST FIRST
      // ==================================================

      loadedOrders.sort((a, b) => {

        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;

      });


      setOrders(
        loadedOrders
      );


    } catch (error) {

      console.error(
        'Failed to load orders:',
        error
      );

      setError(
        'Unable to load orders. Please check your connection and permissions.'
      );


    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // UPDATE ORDER
  // ==================================================

  const updateOrderField = async (
    order: AdminOrder,
    field:
      | 'paymentStatus'
      | 'deliveryStatus'
      | 'orderStatus',
    value: string
  ) => {

    try {

      setUpdatingOrderId(
        order.id
      );

      setError('');


      // ==================================================
      // UPDATE THE EXISTING CUSTOMER ORDER
      //
      // users/{userId}/orders/{orderId}
      // ==================================================

      const orderRef =
        doc(
          db,
          'users',
          order.userId,
          'orders',
          order.id
        );


      const updateData: any = {

        [field]:
          value,

        updatedAt:
          serverTimestamp(),

      };


      // ==================================================
      // DELIVERY COMPLETED
      // ==================================================

      if (
        field === 'deliveryStatus' &&
        value === 'Delivered'
      ) {

        updateData.deliveredAt =
          serverTimestamp();

      }


      // ==================================================
      // DELIVERY NOT DELIVERED
      //
      // Clear deliveredAt if status is changed away
      // from Delivered.
      // ==================================================

      if (
        field === 'deliveryStatus' &&
        value !== 'Delivered'
      ) {

        updateData.deliveredAt =
          null;

      }


      await updateDoc(
        orderRef,
        updateData
      );


      // ==================================================
      // UPDATE LOCAL UI IMMEDIATELY
      // ==================================================

      setOrders((currentOrders) =>

        currentOrders.map(
          (currentOrder) => {

            if (
              currentOrder.id !==
              order.id
            ) {

              return currentOrder;

            }


            return {

              ...currentOrder,

              [field]:
                value,

              ...(field === 'deliveryStatus' && {
                deliveredAt:
                  value === 'Delivered'
                    ? new Date()
                    : null,
              }),

            };

          }
        )

      );


    } catch (error) {

      console.error(
        `Failed to update ${field}:`,
        error
      );


      setError(
        'The order could not be updated. Please try again.'
      );


    } finally {

      setUpdatingOrderId(
        null
      );

    }

  };


  // ==================================================
  // DATE
  // ==================================================

  const formatDate = (
    timestamp: any
  ) => {

    if (!timestamp) {

      return 'Date unavailable';

    }


    try {

      const date =
        timestamp?.toDate
          ? timestamp.toDate()
          : timestamp instanceof Date
            ? timestamp
            : null;


      if (!date) {

        return 'Date unavailable';

      }


      return date.toLocaleString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }
      );

    } catch {

      return 'Date unavailable';

    }

  };


  // ==================================================
  // PAYMENT BADGE
  // ==================================================

  const getPaymentBadgeStyle = (
    status: string
  ): React.CSSProperties => {

    switch (
      status.toLowerCase()
    ) {

      case 'paid':

        return {
          background: '#E8F7EE',
          color: '#18864B',
        };

      case 'failed':

        return {
          background: '#FDECEC',
          color: '#D32F2F',
        };

      case 'refunded':

        return {
          background: '#FFF4E5',
          color: '#B86B00',
        };

      default:

        return {
          background: '#F1F1F1',
          color: '#666666',
        };

    }

  };


  // ==================================================
  // DELIVERY BADGE
  // ==================================================

  const getDeliveryBadgeStyle = (
    status: string
  ): React.CSSProperties => {

    switch (
      status.toLowerCase()
    ) {

      case 'delivered':

        return {
          background: '#E8F7EE',
          color: '#18864B',
        };

      case 'out for delivery':

        return {
          background: '#EDE8FF',
          color: '#6C3CF0',
        };

      case 'shipped':

        return {
          background: '#EAF3FF',
          color: '#2673C9',
        };

      case 'cancelled':

        return {
          background: '#FDECEC',
          color: '#D32F2F',
        };

      default:

        return {
          background: '#F1F1F1',
          color: '#666666',
        };

    }

  };


  // ==================================================
  // ORDER BADGE
  // ==================================================

  const getOrderBadgeStyle = (
    status: string
  ): React.CSSProperties => {

    switch (
      status.toLowerCase()
    ) {

      case 'delivered':

        return {
          background: '#E8F7EE',
          color: '#18864B',
        };

      case 'cancelled':

        return {
          background: '#FDECEC',
          color: '#D32F2F',
        };

      case 'shipped':

        return {
          background: '#EAF3FF',
          color: '#2673C9',
        };

      case 'confirmed':

        return {
          background: '#EDE8FF',
          color: '#6C3CF0',
        };

      default:

        return {
          background: '#FFF4E5',
          color: '#B86B00',
        };

    }

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div
        style={styles.page}
      >

        <div
          style={styles.loadingContainer}
        >

          <div
            style={styles.loadingSpinner}
          >
            ⟳
          </div>

          <p
            style={styles.loadingText}
          >
            Loading orders...
          </p>

        </div>

      </div>

    );

  }


  // ==================================================
  // SCREEN
  // ==================================================

  return (

    <div
      style={styles.page}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={styles.header}
      >

        <div>

          <button
            onClick={onBack}
            style={styles.backButton}
          >
            ← Dashboard
          </button>


          <h1
            style={styles.title}
          >
            Orders
          </h1>


          <p
            style={styles.subtitle}
          >
            Manage StyleIQ customer orders
          </p>

        </div>


        <button
          onClick={loadOrders}
          style={styles.refreshButton}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div
          style={styles.errorBanner}
        >
          {error}
        </div>

      )}


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div
        style={styles.summaryGrid}
      >

        <div
          style={styles.summaryCard}
        >

          <div
            style={styles.summaryIcon}
          >
            📦
          </div>

          <div>

            <p
              style={styles.summaryLabel}
            >
              Total Orders
            </p>

            <h2
              style={styles.summaryValue}
            >
              {orders.length}
            </h2>

          </div>

        </div>


        <div
          style={styles.summaryCard}
        >

          <div
            style={styles.summaryIcon}
          >
            💳
          </div>

          <div>

            <p
              style={styles.summaryLabel}
            >
              Paid Orders
            </p>

            <h2
              style={styles.summaryValue}
            >
              {
                orders.filter(
                  (order) =>
                    order.paymentStatus
                      .toLowerCase() ===
                    'paid'
                ).length
              }
            </h2>

          </div>

        </div>


        <div
          style={styles.summaryCard}
        >

          <div
            style={styles.summaryIcon}
          >
            🚚
          </div>

          <div>

            <p
              style={styles.summaryLabel}
            >
              Delivered
            </p>

            <h2
              style={styles.summaryValue}
            >
              {
                orders.filter(
                  (order) =>
                    order.deliveryStatus
                      .toLowerCase() ===
                    'delivered'
                ).length
              }
            </h2>

          </div>

        </div>

      </div>


      {/* ==================================================
          EMPTY
      ================================================== */}

      {orders.length === 0 ? (

        <div
          style={styles.emptyCard}
        >

          <div
            style={styles.emptyIcon}
          >
            📦
          </div>

          <h2
            style={styles.emptyTitle}
          >
            No orders yet
          </h2>

          <p
            style={styles.emptyText}
          >
            Customer orders will appear here when they place an order.
          </p>

        </div>

      ) : (

        <div
          style={styles.ordersContainer}
        >

          {/* ==================================================
              ORDER LIST
          ================================================== */}

          {orders.map((order) => {

            const isOpen =
              selectedOrderId ===
              order.id;

            const isUpdating =
              updatingOrderId ===
              order.id;


            return (

              <div
                key={`${order.userId}-${order.id}`}
                style={styles.orderCard}
              >

                {/* ==================================================
                    ORDER SUMMARY
                ================================================== */}

                <button
                  style={styles.orderHeaderButton}
                  onClick={() =>
                    setSelectedOrderId(
                      isOpen
                        ? null
                        : order.id
                    )
                  }
                >

                  <div
                    style={styles.orderHeaderLeft}
                  >

                    <div
                      style={styles.orderIcon}
                    >
                      📦
                    </div>


                    <div>

                      <h3
                        style={styles.orderNumber}
                      >
                        {order.orderNumber}
                      </h3>


                      <p
                        style={styles.orderDate}
                      >
                        {formatDate(
                          order.createdAt
                        )}
                      </p>

                    </div>

                  </div>


                  <div
                    style={styles.orderHeaderRight}
                  >

                    <span
                      style={{
                        ...styles.badge,
                        ...getPaymentBadgeStyle(
                          order.paymentStatus
                        ),
                      }}
                    >
                      Payment: {order.paymentStatus}
                    </span>


                    <span
                      style={{
                        ...styles.badge,
                        ...getDeliveryBadgeStyle(
                          order.deliveryStatus
                        ),
                      }}
                    >
                      Delivery: {order.deliveryStatus}
                    </span>


                    <span
                      style={{
                        ...styles.badge,
                        ...getOrderBadgeStyle(
                          order.orderStatus
                        ),
                      }}
                    >
                      {order.orderStatus}
                    </span>


                    <span
                      style={styles.expandArrow}
                    >
                      {isOpen
                        ? '⌃'
                        : '⌄'}
                    </span>

                  </div>

                </button>


                {/* ==================================================
                    ORDER DETAILS
                ================================================== */}

                {isOpen && (

                  <div
                    style={styles.details}
                  >

                    {/* ==================================================
                        CUSTOMER
                    ================================================== */}

                    <div
                      style={styles.detailSection}
                    >

                      <h4
                        style={styles.detailTitle}
                      >
                        Customer Information
                      </h4>


                      <div
                        style={styles.customerGrid}
                      >

                        <div>

                          <span
                            style={styles.fieldLabel}
                          >
                            Name
                          </span>

                          <p
                            style={styles.fieldValue}
                          >
                            {order.customerName}
                          </p>

                        </div>


                        <div>

                          <span
                            style={styles.fieldLabel}
                          >
                            Phone
                          </span>

                          <p
                            style={styles.fieldValue}
                          >
                            {order.phone || 'Not provided'}
                          </p>

                        </div>


                        <div
                          style={styles.addressField}
                        >

                          <span
                            style={styles.fieldLabel}
                          >
                            Delivery Address
                          </span>

                          <p
                            style={styles.fieldValue}
                          >
                            {order.address || 'Not provided'}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* ==================================================
                        ITEMS
                    ================================================== */}

                    <div
                      style={styles.detailSection}
                    >

                      <h4
                        style={styles.detailTitle}
                      >
                        Order Items
                      </h4>


                      <div
                        style={styles.itemsList}
                      >

                        {order.items.map(
                          (item, index) => (

                            <div
                              key={`${item.id}-${index}`}
                              style={styles.itemRow}
                            >

                              {item.image ? (

                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={styles.itemImage}
                                />

                              ) : (

                                <div
                                  style={styles.itemImagePlaceholder}
                                >
                                  📷
                                </div>

                              )}


                              <div
                                style={styles.itemInfo}
                              >

                                <p
                                  style={styles.itemName}
                                >
                                  {item.name}
                                </p>


                                <p
                                  style={styles.itemMeta}
                                >
                                  {item.color || 'No color'} • Qty: {item.quantity || 1}
                                </p>

                              </div>


                              <p
                                style={styles.itemPrice}
                              >
                                $
                                {(
                                  Number(
                                    String(
                                      item.price || 0
                                    )
                                      .replace('$', '')
                                      .replace(',', '')
                                  ) *
                                  (item.quantity || 1)
                                ).toFixed(2)}
                              </p>

                            </div>

                          )
                        )}

                      </div>


                      <div
                        style={styles.totalRow}
                      >

                        <span
                          style={styles.totalLabel}
                        >
                          Total
                        </span>

                        <strong
                          style={styles.totalAmount}
                        >
                          $
                          {Number(
                            order.total || 0
                          ).toFixed(2)}
                        </strong>

                      </div>

                    </div>


                    {/* ==================================================
                        PAYMENT
                    ================================================== */}

                    <div
                      style={styles.detailSection}
                    >

                      <h4
                        style={styles.detailTitle}
                      >
                        Payment
                      </h4>


                      <div
                        style={styles.infoGrid}
                      >

                        <div>

                          <span
                            style={styles.fieldLabel}
                          >
                            Payment Method
                          </span>

                          <p
                            style={styles.fieldValue}
                          >
                            {order.paymentMethod}
                          </p>

                        </div>


                        <div>

                          <span
                            style={styles.fieldLabel}
                          >
                            Paystack Reference
                          </span>

                          <p
                            style={styles.fieldValue}
                          >
                            {order.paystackReference ||
                              'Not applicable'}
                          </p>

                        </div>

                      </div>


                      <div
                        style={styles.statusControl}
                      >

                        <label
                          style={styles.controlLabel}
                        >
                          Payment Status
                        </label>


                        <select
                          value={
                            order.paymentStatus
                          }
                          disabled={isUpdating}
                          onChange={(event) =>
                            updateOrderField(
                              order,
                              'paymentStatus',
                              event.target.value
                            )
                          }
                          style={styles.select}
                        >

                          {PAYMENT_STATUSES.map(
                            (status) => (

                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>

                            )
                          )}

                        </select>

                      </div>

                    </div>


                    {/* ==================================================
                        DELIVERY
                    ================================================== */}

                    <div
                      style={styles.detailSection}
                    >

                      <h4
                        style={styles.detailTitle}
                      >
                        Delivery & Order Status
                      </h4>


                      <div
                        style={styles.controlsGrid}
                      >

                        <div
                          style={styles.statusControl}
                        >

                          <label
                            style={styles.controlLabel}
                          >
                            Delivery Status
                          </label>


                          <select
                            value={
                              order.deliveryStatus
                            }
                            disabled={isUpdating}
                            onChange={(event) =>
                              updateOrderField(
                                order,
                                'deliveryStatus',
                                event.target.value
                              )
                            }
                            style={styles.select}
                          >

                            {DELIVERY_STATUSES.map(
                              (status) => (

                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>

                              )
                            )}

                          </select>

                        </div>


                        <div
                          style={styles.statusControl}
                        >

                          <label
                            style={styles.controlLabel}
                          >
                            Order Status
                          </label>


                          <select
                            value={
                              order.orderStatus
                            }
                            disabled={isUpdating}
                            onChange={(event) =>
                              updateOrderField(
                                order,
                                'orderStatus',
                                event.target.value
                              )
                            }
                            style={styles.select}
                          >

                            {ORDER_STATUSES.map(
                              (status) => (

                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                      </div>


                      {isUpdating && (

                        <p
                          style={styles.updatingText}
                        >
                          Updating order...
                        </p>

                      )}

                    </div>


                    {/* ==================================================
                        ORDER INFORMATION
                    ================================================== */}

                    <div
                      style={styles.orderFooter}
                    >

                      <div>

                        <span
                          style={styles.fieldLabel}
                        >
                          Customer ID
                        </span>

                        <p
                          style={styles.smallValue}
                        >
                          {order.userId}
                        </p>

                      </div>


                      <div>

                        <span
                          style={styles.fieldLabel}
                        >
                          Order ID
                        </span>

                        <p
                          style={styles.smallValue}
                        >
                          {order.id}
                        </p>

                      </div>


                      <div>

                        <span
                          style={styles.fieldLabel}
                        >
                          Created
                        </span>

                        <p
                          style={styles.smallValue}
                        >
                          {formatDate(
                            order.createdAt
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

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
    boxSizing: 'border-box',
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

  errorBanner: {
    background: '#FFF1F1',
    color: '#D32F2F',
    borderRadius: '10px',
    padding: '13px 16px',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: 600,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '25px',
  },

  summaryCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow:
      '0 6px 20px rgba(0, 0, 0, 0.04)',
  },

  summaryIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '23px',
  },

  summaryLabel: {
    margin: 0,
    color: '#777777',
    fontSize: '12px',
    fontWeight: 600,
  },

  summaryValue: {
    margin: '3px 0 0',
    color: '#111111',
    fontSize: '27px',
    fontWeight: 800,
  },

  ordersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  orderCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow:
      '0 6px 20px rgba(0, 0, 0, 0.04)',
  },

  orderHeaderButton: {
    width: '100%',
    border: 'none',
    background: '#FFFFFF',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    textAlign: 'left',
  },

  orderHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
  },

  orderIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '13px',
    background: '#F0EBFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '21px',
    flexShrink: 0,
  },

  orderNumber: {
    margin: 0,
    color: '#111111',
    fontSize: '15px',
    fontWeight: 800,
  },

  orderDate: {
    margin: '4px 0 0',
    color: '#888888',
    fontSize: '11px',
  },

  orderHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 9px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  expandArrow: {
    marginLeft: '5px',
    color: '#6C3CF0',
    fontSize: '20px',
    fontWeight: 800,
  },

  details: {
    borderTop: '1px solid #EEEEEE',
    padding: '25px',
  },

  detailSection: {
    marginBottom: '25px',
  },

  detailTitle: {
    margin: '0 0 15px',
    color: '#111111',
    fontSize: '15px',
    fontWeight: 800,
  },

  customerGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '18px',
  },

  addressField: {
    gridColumn: '1 / -1',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    marginBottom: '18px',
  },

  fieldLabel: {
    display: 'block',
    color: '#999999',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '5px',
  },

  fieldValue: {
    margin: 0,
    color: '#222222',
    fontSize: '13px',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },

  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    background: '#FAFAFA',
    borderRadius: '12px',
  },

  itemImage: {
    width: '55px',
    height: '62px',
    borderRadius: '9px',
    objectFit: 'cover',
    background: '#EEEEEE',
    flexShrink: 0,
  },

  itemImagePlaceholder: {
    width: '55px',
    height: '62px',
    borderRadius: '9px',
    background: '#EEEEEE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
    padding: '0 13px',
  },

  itemName: {
    margin: 0,
    color: '#222222',
    fontSize: '13px',
    fontWeight: 700,
  },

  itemMeta: {
    margin: '4px 0 0',
    color: '#888888',
    fontSize: '11px',
  },

  itemPrice: {
    margin: 0,
    color: '#111111',
    fontSize: '13px',
    fontWeight: 800,
  },

  totalRow: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid #EEEEEE',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    color: '#555555',
    fontSize: '14px',
    fontWeight: 700,
  },

  totalAmount: {
    color: '#6C3CF0',
    fontSize: '19px',
  },

  statusControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  controlsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '16px',
  },

  controlLabel: {
    color: '#555555',
    fontSize: '11px',
    fontWeight: 700,
  },

  select: {
    width: '100%',
    height: '44px',
    padding: '0 12px',
    border: '1px solid #DDDDDD',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#222222',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },

  updatingText: {
    margin: '10px 0 0',
    color: '#6C3CF0',
    fontSize: '11px',
    fontWeight: 700,
  },

  orderFooter: {
    borderTop: '1px solid #EEEEEE',
    paddingTop: '18px',
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
    gap: '15px',
  },

  smallValue: {
    margin: 0,
    color: '#777777',
    fontSize: '10px',
    wordBreak: 'break-all',
  },

  loadingContainer: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingSpinner: {
    fontSize: '35px',
    color: '#6C3CF0',
  },

  loadingText: {
    color: '#777777',
    fontSize: '14px',
  },

  emptyCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '70px 30px',
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: '50px',
    marginBottom: '15px',
  },

  emptyTitle: {
    margin: 0,
    color: '#111111',
    fontSize: '21px',
    fontWeight: 800,
  },

  emptyText: {
    margin: '8px auto 0',
    maxWidth: '400px',
    color: '#888888',
    fontSize: '13px',
    lineHeight: 1.5,
  },

};


export default Orders;