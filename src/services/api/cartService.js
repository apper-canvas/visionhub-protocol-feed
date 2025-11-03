import cartData from "@/services/mockData/cart.json";
import productService from "@/services/api/productService";

class CartService {
  constructor() {
    this.cartItems = [...cartData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    // Enrich cart items with product data
    const enrichedItems = [];
    for (const item of this.cartItems) {
      try {
        const product = await productService.getById(item.productId);
        enrichedItems.push({
          ...item,
          product
        });
      } catch (error) {
        // Skip items with invalid product IDs
        console.warn(`Product not found for cart item: ${item.productId}`);
      }
    }
    return enrichedItems;
  }

  async addItem(productId, quantity = 1, selectedLensType = "standard") {
    await this.delay();
    
    const existingItemIndex = this.cartItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      this.cartItems[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        Id: this.getNextId(),
        productId,
        quantity,
        selectedLensType,
        prescription: null
      };
      this.cartItems.push(newItem);
    }

    return this.getAll();
  }

  async updateQuantity(productId, quantity) {
    await this.delay();
    
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const itemIndex = this.cartItems.findIndex(item => item.productId === productId);
    if (itemIndex >= 0) {
      this.cartItems[itemIndex].quantity = quantity;
    }

    return this.getAll();
  }

  async removeItem(productId) {
    await this.delay();
    
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    return this.getAll();
  }

  async clear() {
    await this.delay();
    this.cartItems = [];
    return [];
  }

  async getItemCount() {
    await this.delay();
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  async getTotal() {
    await this.delay();
    const items = await this.getAll();
    return items.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  getNextId() {
    const maxId = this.cartItems.length > 0 
      ? Math.max(...this.cartItems.map(item => item.Id)) 
      : 0;
    return maxId + 1;
  }
}

export default new CartService();