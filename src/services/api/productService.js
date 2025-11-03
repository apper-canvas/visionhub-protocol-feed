import { getApperClient } from "@/services/apperClient";
class ProductService {
  constructor() {
    this.tableName = 'product_c';
    this.allProducts = []; // Cache for filter options
    this.cacheTimestamp = 0;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  transformProduct(rawProduct) {
    return {
Id: rawProduct.Id,
      brand: rawProduct.brand_c,
model: rawProduct.model_c,
      category: rawProduct.category_c,
      price: rawProduct.price_c,
      discountPrice: rawProduct.discountPrice_c,
      images: rawProduct.images_c ? JSON.parse(rawProduct.images_c) : [],
      frameShape: rawProduct.frameShape_c,
      frameMaterial: rawProduct.frameMaterial_c,
      frameColor: rawProduct.frameColor_c,
      gender: rawProduct.gender_c,
      size: rawProduct.size_c ? JSON.parse(rawProduct.size_c) : {},
      description: rawProduct.description_c,
      features: rawProduct.features_c ? JSON.parse(rawProduct.features_c) : [],
      inStock: rawProduct.inStock_c,
      rating: rawProduct.rating_c,
      reviewCount: rawProduct.reviewCount_c,
      // Keep database fields for reference
      brand_c: rawProduct.brand_c,
      model_c: rawProduct.model_c,
      category_c: rawProduct.category_c,
      price_c: rawProduct.price_c,
      discountPrice_c: rawProduct.discountPrice_c,
      frameShape_c: rawProduct.frameShape_c,
      frameMaterial_c: rawProduct.frameMaterial_c,
      frameColor_c: rawProduct.frameColor_c,
      gender_c: rawProduct.gender_c,
      inStock_c: rawProduct.inStock_c,
      rating_c: rawProduct.rating_c,
      reviewCount_c: rawProduct.reviewCount_c
    };
  }

  async getAllProducts() {
    const now = Date.now();
    if (this.allProducts.length > 0 && (now - this.cacheTimestamp) < this.cacheTimeout) {
      return this.allProducts;
    }

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        return [];
      }

      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "discountPrice_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "frameShape_c"}},
          {"field": {"Name": "frameMaterial_c"}},
          {"field": {"Name": "frameColor_c"}},
          {"field": {"Name": "gender_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "features_c"}},
          {"field": {"Name": "inStock_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviewCount_c"}}
        ]
      });

      if (!response.success) {
        console.error("Failed to fetch products:", response.message);
        return [];
      }

      this.allProducts = (response.data || []).map(product => this.transformProduct(product));
      this.cacheTimestamp = now;
      return this.allProducts;
    } catch (error) {
      console.error("Error fetching all products:", error);
      return [];
    }
  }

  async getAll(filters = {}) {
    try {
      let filteredProducts = await this.getAllProducts();

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
    } catch (error) {
      console.error("Error filtering products:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        throw new Error("Database service not available");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "discountPrice_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "frameShape_c"}},
          {"field": {"Name": "frameMaterial_c"}},
          {"field": {"Name": "frameColor_c"}},
          {"field": {"Name": "gender_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "features_c"}},
          {"field": {"Name": "inStock_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviewCount_c"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Product not found");
      }

      return this.transformProduct(response.data);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  async getRelated(productId, limit = 4) {
    try {
      const product = await this.getById(productId);
      if (!product) return [];

      const allProducts = await this.getAllProducts();
      const related = allProducts
        .filter(p => 
          p.Id !== parseInt(productId) && 
          (p.category === product.category || p.frameShape === product.frameShape)
        )
        .slice(0, limit);

      return related;
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }

  async search(query) {
    try {
      const allProducts = await this.getAllProducts();
      const searchLower = query.toLowerCase();
      return allProducts
        .filter(product =>
          product.brand.toLowerCase().includes(searchLower) ||
          product.model.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.frameShape.toLowerCase().includes(searchLower)
        )
        .slice(0, 8);
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  async getFilterOptions() {
    try {
      const products = await this.getAllProducts();
      
      const brands = [...new Set(products.map(p => p.brand))].sort();
      const frameShapes = [...new Set(products.map(p => p.frameShape))].sort();
      const frameColors = [...new Set(products.map(p => p.frameColor))].sort();
      const materials = [...new Set(products.map(p => p.frameMaterial))].sort();
      
      const prices = products.map(p => p.discountPrice || p.price);
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
    } catch (error) {
      console.error("Error getting filter options:", error);
      return {
        brands: [],
        frameShapes: [],
        frameColors: [],
        materials: [],
        priceRange: { min: 0, max: 1000 }
      };
    }
  }
}
export default new ProductService();