const ApiClient = require("../core/apiclient");
const endpoints = require("../utils/endpoints");

class FakeApi {
    constructor(request) {
        this.apiClient = new ApiClient(request);
    }

    async getUserid(userId) {
        return await this.apiClient.get(
            `${endpoints.fakeapi}/${userId}`
        );
    }

    async createUser(payload) {
        return await this.apiClient.fakerpost(
            endpoints.fakeapi,
            payload
        );
    }

    async updateUser(userId, payload) {
        return await this.apiClient.fakerput(
            `${endpoints.fakeapi}/${userId}`,
            payload
        );
    }

    async deleteUser(userId) {
        return await this.apiClient.fakerdelete(
            `${endpoints.fakeapi}/${userId}`
        );
    }
}

module.exports = { FakeApi };