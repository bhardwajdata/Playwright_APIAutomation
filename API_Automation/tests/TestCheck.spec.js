const { test, expect } = require('@playwright/test');
const { ApiHealthMonitor } = require('../src/core/apihealthmonitor');
const apiConfig = require('../src/config/apiconfig');

test('API Performance Health Checks (soft assertions)', async ({ request }) => {
  const monitor = new ApiHealthMonitor(request);
  const failures = [];

  // Run all APIs and collect violations
  for (const api of apiConfig) {
    console.log(`▶ Running API: ${api.name}`);
    const result = await monitor.checkHealth(
      api.url,
      api.method,
      api.payload ?? null,
      api.runs
    );

    console.log(`✔ Finished API: ${api.name}`);
    const violations = [];

    if (result.averageResponseTime >= api.thresholds.avg) {
      violations.push(`AVG ${result.averageResponseTime}ms > ${api.thresholds.avg}ms`);
    }

    if (result.p95ResponseTime >= api.thresholds.p95) {
      violations.push(`P95 ${result.p95ResponseTime}ms > ${api.thresholds.p95}ms`);
    }

    if (result.maxResponseTime >= api.thresholds.max) {
      violations.push(`MAX ${result.maxResponseTime}ms > ${api.thresholds.max}ms`);
    }

    if (violations.length > 0) {
      failures.push({
        api: api.name,
        method: api.method,
        url: api.url,
        violations,
        metrics: {
          avg: result.averageResponseTime,
          p95: result.p95ResponseTime,
          max: result.maxResponseTime,
        },
      });
    }
  }

  if (failures.length > 0) {
  const summary = failures
    .map(
      f => `🔴 ${f.api}
${f.method} ${f.url}
Violations: ${f.violations.join(', ')}
Metrics: AVG=${f.metrics.avg}ms, P95=${f.metrics.p95}ms, MAX=${f.metrics.max}ms`
    )
    .join('\n\n');

  // Print full summary cleanly
  console.error('\n' + summary + '\n');

  // Throw minimal error for test failure
  throw new Error(`API performance failures (${failures.length} endpoint(s))`);
}

});