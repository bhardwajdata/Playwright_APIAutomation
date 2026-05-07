class apiclient {
    constructor(request) {
        this.request = request;
    }

    async get(url, headers = {}) {
        return this.request.get(url, { headers });
    }

    async post(url, payload = {}, headers = {}) {
        return await this.request.post(url, {
            data: payload,
            headers
        });
    }

    async fakerpost(url, payload = {}) {
        return await this.request.post(url, {
            data: payload
        });
    }

    async put(url, payload = {}, headers = {}) {
        return await this.request.put(url, {
            data: payload,
            headers
        });
    }

    async fakerput(url, payload = {}) {
        return await this.request.put(url, {
            data: payload
        });
    }

    async delete(url, headers = {}) {
        return await this.request.delete(url, { headers });
    }

    async fakerdelete(url) {
        return await this.request.delete(url);
    }
}

module.exports = apiclient;
