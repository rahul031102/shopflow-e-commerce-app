import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, pagination, loading } = useSelector((s) => s.products);

  const getFilters = () => {
    const obj = {};
    for (const [key, value] of searchParams.entries()) obj[key] = value;
    return obj;
  };

  const [filters, setFilters] = useState(getFilters);

  useEffect(() => {
    const params = {};
    for (const [k, v] of searchParams.entries()) params[k] = v;
    setFilters(params);
    dispatch(fetchProducts(params));
  }, [searchParams, dispatch]);

  const handleFilterChange = (newFilters) => {
    const cleaned = Object.fromEntries(
      Object.entries(newFilters).filter(([, v]) => v !== '' && v !== undefined)
    );
    setSearchParams(cleaned);
  };

  const handlePageChange = (page) => {
    handleFilterChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <div className="products-page-layout">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />

        <div className="products-main">
          <div className="products-header">
            <h1 className="products-title">
              {filters.keyword ? `Results for "${filters.keyword}"` : filters.category || 'All Products'}
            </h1>
            {pagination && (
              <p className="products-count">{pagination.total} products found</p>
            )}
          </div>

          {loading ? (
            <div className="products-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="product-card-skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>😕</p>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query</p>
              <button onClick={() => handleFilterChange({ page: 1 })}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="page-btn"
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
