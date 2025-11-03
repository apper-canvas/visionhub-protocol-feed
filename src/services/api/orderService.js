import orderData from "@/services/mockData/orders.json";
import cartService from "@/services/api/cartService";

class OrderService {
  constructor() {
    this.orders = [...orderData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async create(orderDetails) {
    await this.delay();
    
    const cartItems = await cartService.getAll();
    const subtotal = await cartService.getTotal();
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const newOrder = {
      Id: this.getNextId(),
      items: cartItems.map(item => ({
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price,
        selectedLensType: item.selectedLensType
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      shippingAddress: orderDetails.shippingAddress,
      contactInfo: orderDetails.contactInfo,
      status: "Processing",
      createdAt: new Date().toISOString()
    };

    this.orders.push(newOrder);
    
    // Clear cart after successful order
    await cartService.clear();
    
    return { ...newOrder };
  }

  async getById(id) {
    await this.delay();
    const order = this.orders.find(o => o.Id === parseInt(id));
    if (!order) {
      throw new Error("Order not found");
    }
    return { ...order };
  }

  async getAll() {
    await this.delay();
    return this.orders.map(order => ({ ...order }));
  }

  getNextId() {
    const maxId = this.orders.length > 0 
      ? Math.max(...this.orders.map(order => order.Id)) 
      : 0;
    return maxId + 1;
  }
}

export default new OrderService();