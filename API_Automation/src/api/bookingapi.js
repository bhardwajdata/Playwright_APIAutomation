const {ApiClient} = require('../core/apiClient');
const {endpoints} = require('../config/endpoint');

class BookingApi {
  constructor(request) {
    this.apiClient = new ApiClient(request);
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

  async updatebooking(bookingId, payload) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization':
      'Basic ' + Buffer.from('admin:password123').toString('base64')
  };
  return await this.apiClient.put(
    `${endpoints.bookings}/${bookingId}`,
    payload,
    headers
  );
}

  async deletebooking(bookingId, token) {
  return await this.apiClient.delete(
    `${endpoints.bookings}/${bookingId}`,
    {
      Cookie: `token=${token}`,
    }
  );
}

}

module.exports = { BookingApi };