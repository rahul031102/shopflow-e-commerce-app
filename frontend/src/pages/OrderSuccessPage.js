// OrderSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    API.get(`/orders/${id}`).then(res => setOrder(res.data.order)).catch(() => {});
  }, [id]);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase. Your order is being processed.</p>
        {order && (
          <div className="success-details">
            <p><strong>Order ID:</strong> #{order._id?.slice(-8).toUpperCase()}</p>
            <p><strong>Total:</strong> ${order.totalPrice?.toFixed(2)}</p>
            <p><strong>Status:</strong> <span className={`status-tag ${order.orderStatus}`}>{order.orderStatus}</span></p>
          </div>
        )}
        <div className="success-actions">
          <Link to={`/orders/${id}`} className="btn-primary">View Order Details</Link>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
