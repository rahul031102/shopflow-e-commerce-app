import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart, applyCoupon } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [couponInput, setCouponInput] = useState('');

  useEffect(() => { if (user) dispatch(fetchCart()); }, [dispatch, user]);

  const handleQtyChange = async (productId, quantity) => {
    if (quantity < 1) return;
    const result = await dispatch(updateCartItem({ productId, quantity }));
    if (!updateCartItem.fulfilled.match(result)) toast.error(result.payload || 'Update failed');
  };

  const handleRemove = async (productId) => {
    const result = await dispatch(removeFromCart(productId));
    if (removeFromCart.fulfilled.match(result)) toast.success('Item removed');
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    await dispatch(clearCart());
    toast.success('Cart cleared');
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const result = await dispatch(applyCoupon(couponInput.trim()));
    if (applyCoupon.fulfilled.match(result)) toast.success('Coupon applied!');
    else toast.error(result.payload || 'Invalid coupon');
  };

  if (!user) return (
    <div className="empty-cart-page">
      <div className="empty-state">
        <span>🛒</span>
        <h2>Your cart is waiting</h2>
        <p>Sign in to view your cart</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    </div>
  );

  if (loading && !cart) return <div className="loading-container"><div className="spinner" /></div>;

  if (!cart || cart.items?.length === 0) return (
    <div className="empty-cart-page">
      <div className="empty-state">
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    </div>
  );

  const subtotal = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const discount = cart.discount || 0;
  const taxable = subtotal - discount;
  const tax = taxable * 0.08;
  const total = taxable + shipping + tax;

  return (
    <div className="cart-page">
      <h1 className="page-title">Shopping Cart</h1>
      <div className="cart-layout">
        {/* Cart items */}
        <div className="cart-items">
          <div className="cart-header">
            <span>{cart.items?.length} item{cart.items?.length !== 1 ? 's' : ''}</span>
            <button onClick={handleClearCart} className="clear-cart-btn">Clear Cart</button>
          </div>

          {cart.items?.map(item => (
            <div key={item._id} className="cart-item">
              <img
                src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                alt={item.product?.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <Link to={`/products/${item.product?._id}`} className="cart-item-name">
                  {item.product?.name}
                </Link>
                <p className="cart-item-price">${item.price?.toFixed(2)} each</p>
                {item.product?.stock === 0 && (
                  <p className="out-of-stock-warn">⚠️ Out of stock</p>
                )}
              </div>
              <div className="cart-item-qty">
                <button onClick={() => handleQtyChange(item.product?._id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQtyChange(item.product?._id, item.quantity + 1)} disabled={item.quantity >= item.product?.stock}>+</button>
              </div>
              <div className="cart-item-total">
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </div>
              <button className="remove-item-btn" onClick={() => handleRemove(item.product?._id)}>✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          {/* Coupon */}
          <div className="coupon-section">
            <label>Promo Code</label>
            <div className="coupon-input-row">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                className="coupon-input"
              />
              <button onClick={handleApplyCoupon} className="apply-coupon-btn">Apply</button>
            </div>
            {cart.couponCode && (
              <p className="coupon-applied">✓ Coupon "{cart.couponCode}" applied</p>
            )}
          </div>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          {subtotal < 100 && (
            <p className="free-shipping-hint">
              Add ${(100 - subtotal).toFixed(2)} more for free shipping!
            </p>
          )}

          <button
            className="checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
