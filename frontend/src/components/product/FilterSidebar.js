import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const CATEGORIES = ['Electronics','Clothing','Footwear','Accessories','Home & Kitchen','Books','Sports','Beauty','Toys','Other'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-averageRating', label: 'Top Rated' },
];

const FilterSidebar = ({ filters, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState({ min: filters.minPrice || '', max: filters.maxPrice || '' });

  const handlePriceApply = () => {
    onFilterChange({ ...filters, minPrice: priceRange.min, maxPrice: priceRange.max, page: 1 });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">Sort By</h3>
        <select
          className="filter-select"
          value={filters.sort || '-createdAt'}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value, page: 1 })}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Category</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.category}
              onChange={() => onFilterChange({ ...filters, category: '', page: 1 })}
            />
            All Categories
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="filter-option">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={filters.category === cat}
                onChange={() => onFilterChange({ ...filters, category: cat, page: 1 })}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Price Range</h3>
        <div className="price-inputs">
          <input
            type="number" placeholder="Min" min="0"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="price-input"
          />
          <span>—</span>
          <input
            type="number" placeholder="Max" min="0"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="price-input"
          />
        </div>
        <button onClick={handlePriceApply} className="apply-btn">Apply</button>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Minimum Rating</h3>
        {[4, 3, 2, 1].map((r) => (
          <label key={r} className="filter-option">
            <input
              type="radio"
              name="rating"
              value={r}
              checked={Number(filters.minRating) === r}
              onChange={() => onFilterChange({ ...filters, minRating: r, page: 1 })}
            />
            {'★'.repeat(r)} & up
          </label>
        ))}
        <label className="filter-option">
          <input type="radio" name="rating" value="" checked={!filters.minRating}
            onChange={() => onFilterChange({ ...filters, minRating: '', page: 1 })}
          />
          All Ratings
        </label>
      </div>

      <div className="filter-section">
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => onFilterChange({ ...filters, inStock: e.target.checked ? 'true' : '', page: 1 })}
          />
          In Stock Only
        </label>
      </div>

      <button
        className="clear-filters-btn"
        onClick={() => onFilterChange({ page: 1 })}
      >
        Clear All Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;
