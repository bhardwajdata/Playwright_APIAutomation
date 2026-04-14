const ApiClient = require('../core/apiclient');
const endpoints = require('../utils/endpoints');

class platziproductapi {
    constructor(request) {
        this.apiClient = new ApiClient(request);
    }

    async getplatziproductid(productId) {
        return await this.apiClient.get(
            `${endpoints.platziproduct}/${productId}`
        );
    }

    async createproduct(payload) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        return await this.apiClient.post(
            endpoints.platziproduct,
            payload,
            headers
        );
    }

    async updateproduct(productId, payload) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        return await this.apiClient.put(
            `${endpoints.platziproduct}/${productId}`,
            payload,
            headers
        );
    }

    async deleteproduct(productId) {
        return await this.apiClient.delete(
            `${endpoints.platziproduct}/${productId}`
        );
    }

}

module.exports = platziproductapi;
