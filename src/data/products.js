// API URL - change this for production
export const API_URL = 'http://localhost:8000';

// Static products array - will be empty, data comes from API
export const products = [];

// Categories for filtering (can also be fetched from API)
export const categories = [
  {
    id: "skincare",
    name: "Skincare",
    description: "Nourish your skin with our premium skincare collection",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
    icon: "✨"
  },
  {
    id: "haircare",
    name: "Haircare",
    description: "Transform your hair with our luxurious treatments",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
    icon: "💇"
  },
  {
    id: "wellness",
    name: "Wellness",
    description: "Support your health with natural wellness products",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
    icon: "🌿"
  },
  {
    id: "bodycare",
    name: "Body Care",
    description: "Pamper your body with our indulgent body care range",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600",
    icon: "🛁"
  }
];

export const productTypes = [
  { id: "serum", name: "Serums", icon: "💧" },
  { id: "cream", name: "Creams & Lotions", icon: "🧴" },
  { id: "oil", name: "Oils", icon: "🫒" },
  { id: "tablet", name: "Tablets & Supplements", icon: "💊" },
  { id: "scrub", name: "Scrubs", icon: "✨" }
];

export const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Skincare Enthusiast",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    text: "The Vitamin C Serum transformed my skin! I've never felt more confident.",
    rating: 5
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Wellness Coach",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    text: "Finally found products that align with my values. Pure, effective, and sustainable.",
    rating: 5
  },
  {
    id: 3,
    name: "Ananya Gupta",
    role: "Beauty Blogger",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    text: "These products are a game-changer! My followers love my recommendations.",
    rating: 5
  }
];

// API helper functions
export const fetchProducts = async (category = null, type = null) => {
  try {
    let url = `${API_URL}/api/products`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      // Map backend fields to frontend expected format
      return data.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.slug || '',
        type: p.product_type,
        price: p.price,
        originalPrice: p.original_price,
        rating: p.rating,
        reviews: p.reviews_count,
        image: p.image,
        images: p.images || [],
        description: p.description,
        ingredients: p.ingredients || [],
        benefits: p.benefits || [],
        isNew: p.is_new,
        isBestseller: p.is_bestseller,
        stock: p.stock
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const fetchProductBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`);
    if (res.ok) {
      const p = await res.json();
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.slug || '',
        type: p.product_type,
        price: p.price,
        originalPrice: p.original_price,
        rating: p.rating,
        reviews: p.reviews_count,
        image: p.image,
        images: p.images || [],
        description: p.description,
        ingredients: p.ingredients || [],
        benefits: p.benefits || [],
        isNew: p.is_new,
        isBestseller: p.is_bestseller,
        stock: p.stock
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
};

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/api/categories`);
    if (res.ok) {
      return await res.json();
    }
    return categories; // fallback to static
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return categories;
  }
};
