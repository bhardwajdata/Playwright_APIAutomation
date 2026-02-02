class ApiHealthMonitor {
  constructor(request) {
    this.request = request;
  }

  async makeRequest(url, method, payload) {
    switch (method) {
      case 'POST':
        return this.request.post(url, { data: payload });
      case 'PUT':
        return this.request.put(url, { data: payload });
      case 'DELETE':
        return this.request.delete(url);
      default:
        return this.request.get(url);
    }
  }

  calculatePercentile(times, percentile) {
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  async checkHealth(url, method = 'GET', payload = null, runs = 10) {
    const responseTimes = [];
    let lastStatus;

    for (let i = 0; i < runs; i++) {
      const startTime = Date.now();
      const response = await this.makeRequest(url, method, payload);
      const endTime = Date.now();

      responseTimes.push(endTime - startTime);
      lastStatus = response.status();
    }

    const total = responseTimes.reduce((a, b) => a + b, 0);
    const avg = total / runs;

    return {
      url,
      method,
      runs,
      status: lastStatus,
      responseTimes,
      averageResponseTime: avg,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p95ResponseTime: this.calculatePercentile(responseTimes, 95)
    };
  }
}

module.exports = { ApiHealthMonitor };
