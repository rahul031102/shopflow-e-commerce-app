import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../../services/api';
import toast from 'react-hot-toast';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#EF4444' },
  },
};

const CheckoutForm = ({ order, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      // 1. Create payment intent on backend
      const { data } = await API.post(`/payments/create-intent/${order._id}`);
      const { clientSecret } = data;

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: order.user?.name,
            email: order.user?.email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-wrapper">
        <label className="form-label">Card Details</label>
        <div className="card-element-container">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="test-card-hint">
          Test card: <strong>4242 4242 4242 4242</strong> | Any future date | Any 3-digit CVC
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="pay-btn"
      >
        {processing ? 'Processing...' : `Pay $${order.totalPrice?.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutForm;
