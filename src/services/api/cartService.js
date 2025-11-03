import { getApperClient } from "@/services/apperClient";
import productService from "@/services/api/productService";

class CartService {
  constructor() {
    this.tableName = 'cart_c';
    this.lookupFields = ['productId_c'];
  }

  prepareLookupFields(data) {
    const prepared = {...data};
    this.lookupFields.forEach(fieldName => {
      if (prepared[fieldName] !== undefined && prepared[fieldName] !== null) {
        // Handle both object and direct ID inputs
        prepared[fieldName] = prepared[fieldName]?.Id || prepared[fieldName];
      }
    });
    return prepared;
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
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "selectedLensType_c"}},
          {"field": {"Name": "prescription_c"}},
          {"field": {"Name": "productId_c"}}
        ]
      });

      if (!response.success) {
        console.error("Failed to fetch cart items:", response.message);
        return [];
      }

      // Enrich cart items with product data
      const enrichedItems = [];
      for (const item of response.data || []) {
        try {
          const product = await productService.getById(item.productId_c?.Id);
          enrichedItems.push({
            Id: item.Id_c,
            productId: item.productId_c?.Id,
            quantity: item.quantity_c,
            selectedLensType: item.selectedLensType_c,
            prescription: item.prescription_c,
            product
          });
        } catch (error) {
          console.warn(`Product not found for cart item: ${item.productId_c?.Id}`);
        }
      }
      return enrichedItems;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  }

  async addItem(productId, quantity = 1, selectedLensType = "standard") {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        return [];
      }

      // Check if item already exists
      const existingItems = await this.getAll();
      const existingItem = existingItems.find(item => item.productId === parseInt(productId));
      
      if (existingItem) {
        // Update existing item
        return await this.updateQuantity(productId, existingItem.quantity + quantity);
      } else {
        // Create new item
        const params = {
          records: [{
            quantity_c: quantity,
            selectedLensType_c: selectedLensType,
            productId_c: parseInt(productId),
            prescription_c: null
          }]
        };

        const response = await apperClient.createRecord(this.tableName, params);
        
        if (!response.success) {
          console.error("Failed to add cart item:", response.message);
          return [];
        }

        return this.getAll();
      }
    } catch (error) {
      console.error("Error adding cart item:", error);
      return [];
    }
  }

  async updateQuantity(productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        return [];
      }

      // Find the item to update
      const existingItems = await this.getAll();
      const itemToUpdate = existingItems.find(item => item.productId === parseInt(productId));
      
      if (!itemToUpdate) {
        console.error("Cart item not found");
        return this.getAll();
      }

      const params = {
        records: [{
          Id_c: itemToUpdate.Id,
          quantity_c: quantity
        }]
      };

      const response = await apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update cart item:", response.message);
        return [];
      }

      return this.getAll();
    } catch (error) {
      console.error("Error updating cart item:", error);
      return [];
    }
  }

  async removeItem(productId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        return [];
      }

      // Find the item to remove
      const existingItems = await this.getAll();
      const itemToRemove = existingItems.find(item => item.productId === parseInt(productId));
      
      if (!itemToRemove) {
        console.error("Cart item not found");
        return this.getAll();
      }

      const params = {
        RecordIds: [itemToRemove.Id]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to remove cart item:", response.message);
        return [];
      }

      return this.getAll();
    } catch (error) {
      console.error("Error removing cart item:", error);
      return [];
    }
  }

  async clear() {
    try {
      const items = await this.getAll();
      const recordIds = items.map(item => item.Id);
      
      if (recordIds.length === 0) {
        return [];
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not available");
        return [];
      }

      const params = {
        RecordIds: recordIds
      };

      const response = await apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to clear cart:", response.message);
        return [];
      }

      return [];
    } catch (error) {
      console.error("Error clearing cart:", error);
      return [];
    }
  }

  async getItemCount() {
    try {
      const items = await this.getAll();
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error("Error getting cart item count:", error);
      return 0;
    }
  }

  async getTotal() {
    try {
      const items = await this.getAll();
      return items.reduce((total, item) => {
        const price = item.product.discountPrice || item.product.price;
        return total + (price * item.quantity);
      }, 0);
    } catch (error) {
      console.error("Error calculating cart total:", error);
      return 0;
    }
  }
}

export default new CartService();

export default new CartService();