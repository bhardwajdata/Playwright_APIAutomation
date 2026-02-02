import { test, expect } from '@playwright/test';
let suiteStart;

test.describe.parallel('API Health & Performance Monitoring', () => {
  
  const MAX_RESPONSE_TIME = 2000;
  const RUNS = 100;
  test.setTimeout(0);

   test.beforeAll(() => {
    suiteStart = Date.now();
  });

  test.afterAll(() => {
    const suiteTotal = Date.now() - suiteStart;
    console.log(
      `TOTAL SUITE EXECUTION TIME: ${suiteTotal}ms`
    );
  });

  const APIs = [
    { name: 'Product 1', url: 'https://dummyjson.com/products/1', sla: 2000 },
    { name: 'Product 2', url: 'https://dummyjson.com/products/2', sla: 2000 },
    { name: 'Categories', url: 'https://dummyjson.com/products/categories', sla: 1500 }
  ];

  for (const api of APIs) {
    test(`${api.name} SLA check`, async ({ request }) => {
      const times = [];

      // warm-up
      await request.get(api.url);

      for (let i = 1; i <= RUNS; i++) {
        const start = Date.now();
        const response = await request.get(api.url);
        const duration = Date.now() - start;

        console.log(`[${api.name}] Run ${i}: ${duration}ms`);

        expect(response.ok()).toBeTruthy();
        times.push(duration);
      }

      const avg =
        times.reduce((a, b) => a + b, 0) / times.length;

      expect(avg).toBeLessThanOrEqual(api.sla);
    });
  }
});
