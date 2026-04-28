
const { test, expect } = require('@playwright/test')
const platziproductapi = require('../pages/api/platziproductapi');
const product = require('../pages/payloads/platzi/product.json');
const updateproduct = require('../pages/payloads/platzi/updateproduct.json');
const { validateSchema } = require('../pages/utils/schemaValidator');

function clonePayload(payload) {
    return JSON.parse(JSON.stringify(payload));
}

function buildProductPayload() {
    const payload = clonePayload(product);
    payload.title = `${payload.title}-${Date.now()}`;
    return payload;
}

function buildUpdatedProductPayload() {
    const payload = clonePayload(updateproduct);
    payload.title = `${payload.title}-${Date.now()}`;
    return payload;
}

function assertCategoryShape(category) {
    expect(category).toEqual(
        expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            slug: expect.any(String),
            image: expect.any(String),
            creationAt: expect.any(String),
            updatedAt: expect.any(String),
        })
    );
}

function assertProductShape(responseBody) {
    expect(responseBody).toEqual(
        expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            price: expect.any(Number),
            description: expect.any(String),
            images: expect.any(Array),
            category: expect.any(Object),
        })
    );
    expect(responseBody.images.length).toBeGreaterThan(0);
    assertCategoryShape(responseBody.category);
}

test.describe('Api opertation check @api', () => {
    test('Normal flow check', async ({ request }) => {
        const api = new platziproductapi(request);
        const response = await api.getplatziproductid(85);

        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        expect(responseBody.id).toBe(85);
        assertProductShape(responseBody);
    })

    test('Create New Product', async ({ request }) => {
        const api = new platziproductapi(request);
        const createPayload = buildProductPayload();
        const updatePayload = buildUpdatedProductPayload();
        let createdProductId;

        validateSchema('pages/schema/platziproduct.schema.json', createPayload);

        try {
            await test.step('Create product', async () => {
                const response = await api.createproduct(createPayload);
                expect(response.status()).toBe(201);

                const responseBody = await response.json();
                createdProductId = responseBody.id;

                assertProductShape(responseBody);
                expect(responseBody.title).toBe(createPayload.title);
                expect(responseBody.price).toBe(createPayload.price);
                expect(responseBody.description).toBe(createPayload.description);
            });

            await test.step('Update product', async () => {
                const response = await api.updateproduct(createdProductId, updatePayload);
                expect(response.status()).toBe(200);

                const responseBody = await response.json();

                assertProductShape(responseBody);
                expect(responseBody.id).toBe(createdProductId);
                expect(responseBody.title).toBe(updatePayload.title);
                expect(responseBody.price).toBe(updatePayload.price);
                expect(responseBody.description).toBe(updatePayload.description);
            });
        } finally {
            if (createdProductId) {
                await test.step('Delete product', async () => {
                    const response = await api.deleteproduct(createdProductId);
                    expect(response.status()).toBe(200);
                });
            }
        }
    })
})
