class apiclient {
    constructor(request) {
        this.request = request;
    }

    async get(url) {
        return this.request.get(url);
    }

    async post(url, payload = {}, headers = {}) {
        return await this.request.post(url, {
            data: payload,
            headers
        });
    }

    async put(url, payload = {}, headers = {}) {
        return await this.request.put(url, {
            data: payload,
            headers
        });
    }

    async delete(url) {
        return await this.request.delete(url);
    }
}

module.exports = apiclient;
