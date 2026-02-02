import {test , expect} from '@playwright/test';

test.describe.parallel('Get Request Test Suite', () => {

test('API test 1', async function({request}){
    const resp =  await request.get('https://dummyjson.com/products/1');
    expect(resp.status()).toBe(200);
    expect((await resp.json()).id).toBe(1);

    const respjson = await resp.json();
    expect(respjson).toHaveProperty('brand', 'Essence');
    expect(respjson).toHaveProperty('category', 'beauty');
    console.log("Brand and Category validated!");

    const reviewer = respjson.reviews.find(
        review => 
            review.reviewerName === 'Lucas Gordon' &&
            review.reviewerEmail === 'lucas.gordon@x.dummyjson.com' 
    );
    expect(reviewer).toBeDefined();

    respjson.reviews.forEach(review => {
        expect(review.reviewerName).toBeTruthy();
    });
    expect(respjson.meta.barcode).toBe('5784719087687');
    console.log("All reviewer names are valid and barcode is correct!");
} );

test('API test 2', async function({request}){
    const resp =  await request.get('https://dummyjson.com/products/120');
    expect(resp.status()).toBe(200);
    expect((await resp.json()).id).toBe(120);

    const respjson = await resp.json();
    expect(respjson).toHaveProperty('brand', 'Vaseline');
    expect(respjson).toHaveProperty('category', 'skin-care');
    console.log("Brand and Category validated for second test!");

    const reviewer = respjson.reviews.find(
        review =>
            review.reviewerName === 'Aria Ferguson' &&
            review.reviewerEmail === 'aria.ferguson@x.dummyjson.com'
   );
   expect(reviewer).toBeDefined();
    respjson.reviews.forEach(review => {
        expect(review.reviewerName).toBeTruthy();
    });
    expect(respjson.meta.barcode).toBe('8483207319090');
    console.log("All reviewer names are valid and barcode is correct!");
});


});    