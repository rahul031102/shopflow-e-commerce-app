import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!order) return <div className="error-container"><h2>Order not found</h2><Link to="/orders">Back to Orders</Link></div>;

  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <Link to="/orders" className="back-link">← Back to Orders</Link>
        <h1>Order #{order._id?.slice(-8).toUpperCase()}</h1>
        <p className="order-placed-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Order Progress Tracker */}
      {!['cancelled','refunded'].includes(order.orderStatus) && (
        <div className="order-tracker">
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <div className={`tracker-step ${i <= currentStep ? 'completed' : ''} ${i === currentStep ? 'current' : ''}`}>
                <div className="tracker-dot">{i <= currentStep ? '✓' : i + 1}</div>
                <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
              </div>
              {i < steps.length - 1 && <div className={`tracker-line ${i < currentStep ? 'completed' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="order-detail-grid">
        {/* Items */}
        <div className="order-detail-card">
          <h2>Items Ordered</h2>
          {order.orderItems?.map(item => (
            <div key={item._id} className="order-detail-item">
              <img src={item.image} alt={item.name} className="order-detail-img" />
              <div className="order-detail-item-info">
                <Link to={`/products/${item.product}`} className="order-item-name">{item.name}</Link>
                <p>Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
              </div>
              <strong>${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="order-detail-sidebar">
          {/* Shipping */}
          <div className="order-detail-card">
            <h2>Shipping Address</h2>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>

          {/* Payment */}
          <div className="order-detail-card">
            <h2>Payment Info</h2>
            <p>Method: <strong>{order.paymentMethod?.toUpperCase()}</strong></p>
            <p>Status: <span className={`payment-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>{order.isPaid ? '✓ Paid' : '⏳ Pending'}</span></p>
            {order.paidAt && <p>Paid: {new Date(order.paidAt).toLocaleDateString()}</p>}
            {order.couponCode && <p>Coupon: <strong>{order.couponCode}</strong></p>}
          </div>

          {/* Totals */}
          <div className="order-detail-card">
            <h2>Order Total</h2>
            <div className="order-totals">
              <div className="total-row"><span>Items</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
              {order.discount > 0 && <div className="total-row discount"><span>Discount</span><span>−${order.discount?.toFixed(2)}</span></div>}
              <div className="total-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
              <div className="total-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
              <div className="total-row grand-total"><strong>Total</strong><strong>${order.totalPrice?.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
