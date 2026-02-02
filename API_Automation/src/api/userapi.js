const { ApiClient } = require('../core/apiClient');
const { endpoints } = require('../config/endpoint');

class UserApi {
  constructor(request) {
    this.apiClient = new ApiClient(request);
  }

  async getUser(userId) {
    return await this.apiClient.get(
      `${endpoints.users}/${userId}`
    );
  }

  async createUser(payload) {
    return await this.apiClient.post(
      endpoints.users,
      payload
    );
  }

  async updateUser(userId, payload) {
    return await this.apiClient.put(
      `${endpoints.users}/${userId}`,
      payload
    );
  }

  async deleteUser(userId) {
    return await this.apiClient.delete(
      `${endpoints.users}/${userId}`
    );
  }
}

module.exports = { UserApi };
