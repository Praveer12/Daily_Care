import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal, Loader } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories, productTypes, fetchProducts } from '../data/products';
import './Products.css';

const Products = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const typeFromUrl = searchParams.get('type');
  
  const initialCategory = category || categoryFromUrl || 'all';
  const initialType = typeFromUrl || 'all';
  
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchProducts();
      setAllProducts(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Update filters when URL changes
  useEffect(() => {
    const newCategory = category || categoryFromUrl || 'all';
    setSelectedCategory(newCategory);
  }, [category, categoryFromUrl]);

  useEffect(() => {
    setSelectedType(typeFromUrl || 'all');
  }, [typeFromUrl]);

  // Filter and sort products
  useEffect(() => {
    let result = [...allProducts];

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      result = result.filter(p => p.type === selectedType);
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew));
        break;
      default:
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategory, selectedType, sortBy, priceRange]);

  const getCategoryName = () => {
    if (selectedCategory === 'all') return 'All Products';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : 'Products';
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setPriceRange([0, 5000]);
    setSortBy('featured');
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedType !== 'all' ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  return (
    <div className="products-page">
      <section className="page-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>{getCategoryName()}</h1>
            <p>Discover our curated collection of premium daily care products</p>
          </motion.div>
        </div>
      </section>

      <div className="container">
        <div className="products-layout">
          <aside className={`filters-sidebar ${isFilterOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3><Filter size={20} /> Filters</h3>
              <button className="close-filters" onClick={() => setIsFilterOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {activeFiltersCount > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear All Filters ({activeFiltersCount})
              </button>
            )}

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                <label className={`filter-option ${selectedCategory === 'all' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'all'}
                    onChange={() => setSelectedCategory('all')}
                  />
                  <span>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label
                    key={cat.id}
                    className={`filter-option ${selectedCategory === cat.id ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                    />
                    <span>{cat.icon} {cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Product Type</h4>
              <div className="filter-options">
                <label className={`filter-option ${selectedType === 'all' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    checked={selectedType === 'all'}
                    onChange={() => setSelectedType('all')}
                  />
                  <span>All Types</span>
                </label>
                {productTypes.map(type => (
                  <label
                    key={type.id}
                    className={`filter-option ${selectedType === type.id ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === type.id}
                      onChange={() => setSelectedType(type.id)}
                    />
                    <span>{type.icon} {type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <div className="price-input-wrapper">
                  <span>₹</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    placeholder="Min"
                  />
                </div>
                <span className="price-separator">to</span>
                <div className="price-input-wrapper">
                  <span>₹</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    placeholder="Max"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className="price-slider"
              />
              <div className="price-range-labels">
                <span>₹0</span>
                <span>₹5000</span>
              </div>
            </div>

            <button className="apply-filters" onClick={() => setIsFilterOpen(false)}>
              Show {filteredProducts.length} Products
            </button>
          </aside>

          <div className="products-content">
            <div className="products-toolbar">
              <button className="filter-toggle" onClick={() => setIsFilterOpen(true)}>
                <SlidersHorizontal size={20} />
                Filters
                {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
              </button>

              <p className="results-count">{filteredProducts.length} products</p>

              <div className="toolbar-right">
                <div className="sort-dropdown">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown size={16} />
                </div>

                <div className="view-toggle">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="active-filters">
                {selectedCategory !== 'all' && (
                  <span className="filter-tag">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('all')}><X size={14} /></button>
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="filter-tag">
                    {productTypes.find(t => t.id === selectedType)?.name}
                    <button onClick={() => setSelectedType('all')}><X size={14} /></button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <span className="filter-tag">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                    <button onClick={() => setPriceRange([0, 5000])}><X size={14} /></button>
                  </span>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="loading-state">
                  <Loader className="spinner" size={40} />
                  <p>Loading products...</p>
                </div>
              ) : (
                <motion.div
                  key={selectedCategory + selectedType + sortBy}
                  className={`products-grid ${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))
                  ) : (
                    <div className="no-products">
                      <p>No products found matching your criteria.</p>
                      <button onClick={clearFilters} className="btn-outline">
                        Clear Filters
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filter-overlay" onClick={() => setIsFilterOpen(false)} />
      )}
    </div>
  );
};

export default Products;
