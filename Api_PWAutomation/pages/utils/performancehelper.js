const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const DEFAULT_VIRTUAL_USERS = 10;
const DEFAULT_SLA_MS = 2000;
const performanceSummaries = [];

async function measureRequest(action) {
    const startedAt = Date.now();
    const response = await action();
    const duration = Date.now() - startedAt;
    return { response, duration };
}

function assertWithinSla(label, duration, slaMs = DEFAULT_SLA_MS) {
    expect(duration, `${label} exceeded ${slaMs} ms SLA with ${duration} ms`).toBeLessThanOrEqual(slaMs);
}

function summarizeDurations(durations) {
    const sorted = [...durations].sort((left, right) => left - right);
    const total = sorted.reduce((sum, value) => sum + value, 0);
    const average = Math.round(total / sorted.length);

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: average,
        count: sorted.length
    };
}

function storePerformanceSummary(label, durations, slaMs = DEFAULT_SLA_MS) {
    const summary = summarizeDurations(durations);
    const entry = {
        label,
        users: summary.count,
        slaMs,
        minMs: summary.min,
        avgMs: summary.avg,
        maxMs: summary.max,
        recordedAt: new Date().toISOString()
    };

    performanceSummaries.push(entry);
    return entry;
}

function logPerformanceSummary(label, durations, slaMs = DEFAULT_SLA_MS) {
    const summary = storePerformanceSummary(label, durations, slaMs);
    console.log(
        `[PERF] ${summary.label} | users=${summary.users} | sla=${summary.slaMs}ms | min=${summary.minMs}ms | avg=${summary.avgMs}ms | max=${summary.maxMs}ms`
    );
    return summary;
}

function clearPerformanceSummaries() {
    performanceSummaries.length = 0;
}

function exportPerformanceSummaries(outputDirectory = 'test-results') {
    const resolvedOutputDirectory = path.resolve(outputDirectory);
    fs.mkdirSync(resolvedOutputDirectory, { recursive: true });

    const jsonPath = path.join(resolvedOutputDirectory, 'performance-summary.json');
    fs.writeFileSync(jsonPath, JSON.stringify(performanceSummaries, null, 2));

    return { jsonPath, count: performanceSummaries.length };
}

async function runConcurrentUsers(label, scenario, options = {}) {
    const virtualUsers = options.virtualUsers ?? DEFAULT_VIRTUAL_USERS;
    const slaMs = options.slaMs ?? DEFAULT_SLA_MS;
    const results = await Promise.all(
        Array.from({ length: virtualUsers }, (_, index) => scenario(index))
    );

    const durations = results.map(result => result.duration);
    logPerformanceSummary(label, durations, slaMs);

    for (const result of results) {
        assertWithinSla(`${label} [user ${result.userIndex + 1}]`, result.duration, slaMs);
        expect(result.status, `${label} returned unexpected status`).toBeGreaterThanOrEqual(200);
        expect(result.status, `${label} returned unexpected status`).toBeLessThan(400);
    }

    return results;
}

module.exports = {
    DEFAULT_SLA_MS,
    DEFAULT_VIRTUAL_USERS,
    assertWithinSla,
    clearPerformanceSummaries,
    exportPerformanceSummaries,
    logPerformanceSummary,
    measureRequest,
    runConcurrentUsers
};
