import productData from "@/services/mockData/products.json";

class ProductService {
  constructor() {
    this.products = [...productData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll(filters = {}) {
    await this.delay();
    let filteredProducts = [...this.products];

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply gender filter
    if (filters.gender && filters.gender !== "all") {
      filteredProducts = filteredProducts.filter(
        product => product.gender.toLowerCase() === filters.gender.toLowerCase() || 
                   product.gender.toLowerCase() === "unisex"
      );
    }

    // Apply frame shape filter
    if (filters.frameShape && filters.frameShape.length > 0) {
      filteredProducts = filteredProducts.filter(
        product => filters.frameShape.includes(product.frameShape)
      );
    }

    // Apply frame color filter
    if (filters.frameColor && filters.frameColor.length > 0) {
      filteredProducts = filteredProducts.filter(
        product => filters.frameColor.includes(product.frameColor)
      );
    }

    // Apply brand filter
    if (filters.brand && filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter(
        product => filters.brand.includes(product.brand)
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filteredProducts = filteredProducts.filter(
        product => {
          const price = product.discountPrice || product.price;
          return price >= min && price <= max;
        }
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product =>
          product.brand.toLowerCase().includes(searchLower) ||
          product.model.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          filteredProducts.sort((a, b) => {
            const priceA = a.discountPrice || a.price;
            const priceB = b.discountPrice || b.price;
            return priceA - priceB;
          });
          break;
        case "price-high":
          filteredProducts.sort((a, b) => {
            const priceA = a.discountPrice || a.price;
            const priceB = b.discountPrice || b.price;
            return priceB - priceA;
          });
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          filteredProducts.sort((a, b) => b.Id - a.Id);
          break;
        default:
          break;
      }
    }

    return filteredProducts;
  }

  async getById(id) {
    await this.delay();
    const product = this.products.find(p => p.Id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  }

  async getRelated(productId, limit = 4) {
    await this.delay();
    const product = this.products.find(p => p.Id === parseInt(productId));
    if (!product) return [];

    const related = this.products
      .filter(p => 
        p.Id !== parseInt(productId) && 
        (p.category === product.category || p.frameShape === product.frameShape)
      )
      .slice(0, limit);

    return related.map(p => ({ ...p }));
  }

  async search(query) {
    await this.delay();
    const searchLower = query.toLowerCase();
    return this.products
      .filter(product =>
        product.brand.toLowerCase().includes(searchLower) ||
        product.model.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.frameShape.toLowerCase().includes(searchLower)
      )
      .slice(0, 8)
      .map(p => ({ ...p }));
  }

  getFilterOptions() {
    const brands = [...new Set(this.products.map(p => p.brand))].sort();
    const frameShapes = [...new Set(this.products.map(p => p.frameShape))].sort();
    const frameColors = [...new Set(this.products.map(p => p.frameColor))].sort();
    const materials = [...new Set(this.products.map(p => p.frameMaterial))].sort();
    
    const prices = this.products.map(p => p.discountPrice || p.price);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };

    return {
      brands,
      frameShapes,
      frameColors,
      materials,
      priceRange
    };
  }
}

export default new ProductService();