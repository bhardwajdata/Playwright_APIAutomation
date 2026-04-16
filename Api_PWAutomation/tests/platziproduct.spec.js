// @ts-check
const { test, expect } = require('@playwright/test')
const platziproductapi = require('../pages/api/platziproductapi');
const product = require('../pages/payloads/platzi/product.json');
const updateproduct = require('../pages/payloads/platzi/updateproduct.json');
const { validateSchema } = require('../pages/utils/schemaValidator');

test.describe('Api opertation check @api', () => {
    test('Normal flow check', async ({ request }) => {
        const getproduct = new platziproductapi(request);
        const response = await getproduct.getplatziproductid(95);
        expect(response.status()).toBe(200);
        console.log('Status is ' + response.status());
        const responseBody = await response.json();
        expect(responseBody.id).toBe(95);
        expect(typeof responseBody.title).toBe('string');
        expect(typeof responseBody.price).toBe('number');
        expect(typeof responseBody.description).toBe('string');
        expect(responseBody.images).toBeInstanceOf(Array);
        expect(responseBody.images.length).toBeGreaterThan(0);
        expect(responseBody.category).toBeInstanceOf(Object);

        expect(typeof responseBody.category.id).toBe('number');
        expect(typeof responseBody.category.name).toBe('string');
        expect(typeof responseBody.category.slug).toBe('string');
        expect(typeof responseBody.category.image).toBe('string');
        expect(typeof responseBody.category.creationAt).toBe('string');
        expect(typeof responseBody.category.updatedAt).toBe('string');
        console.log('Get product flow passed!')
    })

    test('Create New Product', async ({ request }) => {
        const createproduct = new platziproductapi(request);
        console.log('Validating product schema...');
        validateSchema('pages/schema/platziproduct.schema.json', product);
        console.log('Product schema validated successfully.');

        console.log('Product creation flow started');
        const response = await createproduct.createproduct(product);
        expect(response.status()).toBe(201);
        console.log('Status is ' + response.status());
        const responseBody = await response.json();
        console.log(responseBody);
        const CreateProductId = responseBody.id;
        console.log('Product created successfully with ID:', CreateProductId);
        expect(typeof responseBody.title).toBe('string');
        expect(typeof responseBody.price).toBe('number');
        expect(typeof responseBody.description).toBe('string');
        expect(responseBody.images).toBeInstanceOf(Array);
        expect(responseBody.images.length).toBeGreaterThan(0);
        expect(responseBody.category).toBeInstanceOf(Object);

        console.log('Product update with ID', CreateProductId);
        const newresponse = await createproduct.updateproduct(
            CreateProductId,
            updateproduct
        );
        expect(newresponse.status()).toBe(200);
        console.log('Status is ' + newresponse.status());
        const newresponseBody = await newresponse.json();
        console.log(newresponseBody);
        const UpdatedProductId = newresponseBody.id;
        console.log('Product updated successfully with ID:', UpdatedProductId);
        expect(typeof newresponseBody.title).toBe('string');
        expect(newresponseBody.title).toBe('Running Shoes 9');
        expect(typeof newresponseBody.price).toBe('number');
        expect(newresponseBody.price).toBe(2500);
        expect(typeof newresponseBody.description).toBe('string');
        expect(newresponseBody.description).toBe('Lightweight and comfortable running shoes designed for daily training.');
        expect(newresponseBody.images).toBeInstanceOf(Array);
        expect(newresponseBody.images.length).toBeGreaterThan(0);
        expect(newresponseBody.category).toBeInstanceOf(Object);

        console.log('Deleting product with ID:', UpdatedProductId);
        const deleteresponse = await createproduct.deleteproduct(UpdatedProductId);
        expect(deleteresponse.status()).toBe(200);
        console.log('Status is ' + deleteresponse.status());
        const deleteresponseBody = await deleteresponse.json();
        console.log(deleteresponseBody);
        console.log('Product deleted successfully with ID:', UpdatedProductId);

    })
})