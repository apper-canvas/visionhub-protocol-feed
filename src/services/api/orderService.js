import { getApperClient } from "@/services/apperClient";
import cartService from "@/services/api/cartService";
class OrderService {
  constructor() {
    this.tableName = 'order_c';
  }

  async create(orderDetails) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        throw new Error("Database service not available");
      }

      const cartItems = await cartService.getAll();
      if (cartItems.length === 0) {
        throw new Error("No items in cart");
      }

      const subtotal = await cartService.getTotal();
      const shipping = subtotal > 100 ? 0 : 9.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.product.discountPrice_c || item.product.price_c,
        selectedLensType: item.selectedLensType
      }));

      const params = {
        records: [{
          items_c: JSON.stringify(orderItems),
          subtotal_c: Math.round(subtotal * 100) / 100,
          shipping_c: Math.round(shipping * 100) / 100,
          tax_c: Math.round(tax * 100) / 100,
          total_c: Math.round(total * 100) / 100,
          shippingAddress_c: JSON.stringify(orderDetails.shippingAddress),
          contactInfo_c: JSON.stringify(orderDetails.contactInfo),
          status_c: "Processing"
        }]
      };

      const response = await apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create order:", response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const createdOrder = response.results[0];
        if (createdOrder.success) {
          // Clear cart after successful order
          await cartService.clear();
          
          return {
            Id: createdOrder.data.Id_c,
            items: orderItems,
            subtotal: Math.round(subtotal * 100) / 100,
            shipping: Math.round(shipping * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            total: Math.round(total * 100) / 100,
            shippingAddress: orderDetails.shippingAddress,
            contactInfo: orderDetails.contactInfo,
            status: "Processing",
            createdAt: new Date().toISOString()
          };
        } else {
          throw new Error(createdOrder.message || "Failed to create order");
        }
      }
      
      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
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
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "shipping_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "shippingAddress_c"}},
          {"field": {"Name": "contactInfo_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Order not found");
      }

      const order = response.data;
      return {
        Id: order.Id_c,
        items: order.items_c ? JSON.parse(order.items_c) : [],
        subtotal: order.subtotal_c,
        shipping: order.shipping_c,
        tax: order.tax_c,
        total: order.total_c,
        shippingAddress: order.shippingAddress_c ? JSON.parse(order.shippingAddress_c) : {},
        contactInfo: order.contactInfo_c ? JSON.parse(order.contactInfo_c) : {},
        status: order.status_c,
        createdAt: order.CreatedOn
      };
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        return [];
      }

      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "shipping_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "shippingAddress_c"}},
          {"field": {"Name": "contactInfo_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error("Failed to fetch orders:", response.message);
        return [];
      }

      return (response.data || []).map(order => ({
        Id: order.Id_c,
        items: order.items_c ? JSON.parse(order.items_c) : [],
        subtotal: order.subtotal_c,
        shipping: order.shipping_c,
        tax: order.tax_c,
        total: order.total_c,
        shippingAddress: order.shippingAddress_c ? JSON.parse(order.shippingAddress_c) : {},
        contactInfo: order.contactInfo_c ? JSON.parse(order.contactInfo_c) : {},
        status: order.status_c,
        createdAt: order.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }
}

export default new OrderService();