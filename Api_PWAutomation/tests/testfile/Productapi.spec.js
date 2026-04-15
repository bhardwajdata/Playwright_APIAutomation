import { test, expect } from '@playwright/test'
import ProductApi from '../../pages/api/productapi'

test.describe('Api CRUD Operations', () => {
    test('Get Product by ID', async ({ request }) => {
        const productApi = new ProductApi(request);
        const response = await productApi.getProductid(6);
        expect(response.status()).toBe(200);
        console.log('Status Code: ' + response.status());

        const responseBody = await response.json();
        expect(typeof responseBody.id).toBe('number');
        expect(typeof responseBody.title).toBe('string');
        expect(typeof responseBody.price).toBe('number');
        expect(typeof responseBody.category).toBe('string');
        expect(typeof responseBody.tags).toBe('object');
        expect(typeof responseBody.dimensions).toBe('object');
        expect(responseBody.rating).toBeGreaterThanOrEqual(2);
        console.log('Body type validation check passed!');

        const review = responseBody.reviews.find(review =>
            review.rating > 2
        );
        expect(review).toBeDefined();
        expect(typeof review.date).toBe('string');
        expect(typeof review.reviewerName).toBe('string');
        expect(typeof review.reviewerEmail).toBe('string');
        expect(typeof review.comment).toBe('string');
        console.log('Review type validation check passed!');
    })

})