const { ApiClient } = require('../core/apiClient');
const { endpoints } = require('../config/endpoint');

class ProductApi {
  constructor(request) {
    this.apiClient = new ApiClient(request);
  }

  async getProduct(productId) {
    return await this.apiClient.get(
      `${endpoints.products}/${productId}`
    );
  }

  async createProduct(payload) {
    return await this.apiClient.post(
      endpoints.products,
      payload
    );
  }

  async updateProduct(productId, payload) {
    return await this.apiClient.put(
      `${endpoints.products}/${productId}`,
      payload
    );
  }

  async deleteProduct(productId) {
    return await this.apiClient.delete(
      `${endpoints.products}/${productId}`
    );
  }
}

module.exports = { ProductApi };
