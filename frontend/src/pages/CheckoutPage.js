import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { fetchCart } from '../store/slices/cartSlice';
import API from '../services/api';
import CheckoutForm from '../components/checkout/CheckoutForm';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const COUNTRIES = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IN'];

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [step, setStep] = useState(1); // 1=address, 2=payment
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: 'US',
  });

  useEffect(() => {
    dispatch(fetchCart());
    // Pre-fill from default address
    const def = user?.addresses?.find(a => a.isDefault);
    if (def) setAddress(def);
  }, [dispatch, user]);

  if (!cart || cart.items?.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const discount = cart.discount || 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const isEmpty = Object.values(address).some(v => !v.trim());
    if (isEmpty) { toast.error('Please fill all address fields'); return; }

    setLoading(true);
    try {
      const { data } = await API.post('/orders', {
        shippingAddress: address,
        paymentMethod: 'stripe',
      });
      setOrder(data.order);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate(`/order-success/${order._id}`);
  };

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      {/* Steps */}
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span>
          <span>Shipping Address</span>
        </div>
        <div className="step-divider" />
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <div className="checkout-card">
              <h2>Shipping Address</h2>

              {/* Saved addresses */}
              {user?.addresses?.length > 0 && (
                <div className="saved-addresses">
                  <p className="saved-label">Saved Addresses:</p>
                  {user.addresses.map((addr, i) => (
                    <button
                      key={i}
                      className="saved-address-btn"
                      onClick={() => setAddress(addr)}
                    >
                      {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                      {addr.isDefault && <span className="default-tag"> (Default)</span>}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddressSubmit} className="address-form">
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    placeholder="123 Main St, Apt 4B"
                    value={address.street}
                    onChange={e => setAddress({...address, street: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input type="text" value={address.state}
                      onChange={e => setAddress({...address, state: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ZIP Code *</label>
                    <input type="text" value={address.zipCode}
                      onChange={e => setAddress({...address, zipCode: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Country *</label>
                    <select value={address.country}
                      onChange={e => setAddress({...address, country: e.target.value})}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-continue" disabled={loading}>
                  {loading ? 'Creating Order...' : 'Continue to Payment →'}
                </button>
              </form>
            </div>
          )}

          {step === 2 && order && (
            <div className="checkout-card">
              <h2>Payment</h2>
              <Elements stripe={stripePromise}>
                <CheckoutForm order={order} onSuccess={handlePaymentSuccess} />
              </Elements>
              <button className="btn-back" onClick={() => setStep(1)}>← Back to Address</button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="checkout-items">
            {cart.items?.map(item => (
              <div key={item._id} className="checkout-item">
                <img src={item.product?.images?.[0]?.url} alt={item.product?.name} className="checkout-item-img" />
                <div>
                  <p className="checkout-item-name">{item.product?.name}</p>
                  <p className="checkout-item-qty">Qty: {item.quantity}</p>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <div className="total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="total-row discount"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
            <div className="total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="total-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="total-row grand-total"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
