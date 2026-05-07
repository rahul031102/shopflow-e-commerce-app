import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button onClick={() => navigate(-1)} className="btn-secondary">← Go Back</button>
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/products" className="btn-secondary">Browse Products</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
