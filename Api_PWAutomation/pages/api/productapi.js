const ApiClient = require("../core/apiclient");
const endpoints = require("../utils/endpoints");

class ProductApi {
    constructor(request) {
        this.apiClient = new ApiClient(request);
    }

    async getProductid(productId) {
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
}

module.exports = ProductApi;
