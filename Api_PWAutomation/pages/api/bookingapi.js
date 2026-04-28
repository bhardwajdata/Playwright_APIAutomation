const ApiClient = require("../core/apiclient");
const endpoints = require("../utils/endpoints");

class BookingApi {
    constructor(request) {
        this.apiClient = new ApiClient(request);
    }

    getBasicAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + Buffer.from('admin:password123').toString('base64')
        };
    }

    getTokenHeaders(token) {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': `token=${token}`
        };
    }

    async createToken() {
        const response = await this.apiClient.post(endpoints.auth, {
            username: 'admin',
            password: 'password123'
        }, {
            'Content-Type': 'application/json'
        });

        return response;
    }

    async getBookingid(bookingId) {
        return await this.apiClient.get(
            `${endpoints.bookings}/${bookingId}`
        );
    }

    async createbooking(payload) {
        return await this.apiClient.post(
            endpoints.bookings,
            payload
        );
    }

    async updatebooking(bookingId, payload, headers = this.getBasicAuthHeaders()) {
        return await this.apiClient.put(
            `${endpoints.bookings}/${bookingId}`,
            payload,
            headers
        );
    }

    async deletebooking(bookingId, tokenOrHeaders) {
        const headers = typeof tokenOrHeaders === 'string'
            ? this.getTokenHeaders(tokenOrHeaders)
            : tokenOrHeaders;
        return await this.apiClient.delete(
            `${endpoints.bookings}/${bookingId}`,
            headers
        );
    }

}

module.exports = BookingApi;
