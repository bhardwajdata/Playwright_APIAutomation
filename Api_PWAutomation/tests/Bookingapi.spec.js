const { test, expect } = require('@playwright/test')
const BookingApi = require('../pages/api/bookingapi')
const newbooking = require('../pages/payloads/newbooking.json')
const updatebooking = require('../pages/payloads/updatebooking.json')
const { validateSchema } = require('../pages/utils/schemaValidator');

test.describe('Booking Api CRUD Operations @api', () => {
    test('Get Booking by ID', async ({ request }) => {
        const bookingApi = new BookingApi(request);
        const response = await bookingApi.getBookingid(10);
        expect(response.status()).toBe(200);
        console.log('Status Code: ' + response.status());

        const responseBody = await response.json();
        expect(typeof responseBody.firstname).toBe('string');
        expect(typeof responseBody.lastname).toBe('string');
        expect(typeof responseBody.totalprice).toBe('number');
        expect(typeof responseBody.depositpaid).toBe('boolean');
        expect(typeof responseBody.bookingdates).toBe('object');
        expect(typeof responseBody.bookingdates.checkin).toBe('string');
        expect(typeof responseBody.bookingdates.checkout).toBe('string');
        console.log('Body type validation check Passed!');
    })

    test('Auth Generation,Booking creation and update with Auth', async ({ request }) => {
        const auth = await request.post('https://restful-booker.herokuapp.com/auth', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "username": "admin",
                "password": "password123"
            }
        });
        expect(auth.status()).toBe(200);
        console.log('Status Code: ' + auth.status());
        const responseBody = await auth.json();
        const authdata = responseBody.token;

        const bookingApi = new BookingApi(request);
        const response = await bookingApi.getBookingid(10);
        expect(response.status()).toBe(200);
        console.log('Booking details fetched successfully!');
        validateSchema('pages/schema/newBooking.schema.json', newbooking);
        console.log('New booking payload validated against schema.');

        const createResponse = await bookingApi.createbooking(newbooking);
        expect(createResponse.status()).toBe(200);
        const createBody = await createResponse.json();
        expect(createBody).toHaveProperty('bookingid');
        const BookingId = createBody.bookingid;
        console.log('Booking created successfully with ID:', BookingId);
        console.log('Updating booking with ID:', BookingId);
        const updateResponse = await bookingApi.updatebooking(
            BookingId,
            updatebooking
        );
        expect(updateResponse.status()).toBe(200);
        const updatedBody = await updateResponse.json();
        console.log(updatedBody);
        console.log('Booking updated successfully with ID:', BookingId);

    })

})