const path = require('path');
const { test, expect } = require('@playwright/test');
const BookingApi = require('../pages/api/bookingapi');
const newbooking = require('../pages/payloads/newbooking.json');
const updatebooking = require('../pages/payloads/updatebooking.json');
const { validateSchema } = require('../pages/utils/schemaValidator');

const bookingSchemaPath = path.resolve(__dirname, '../pages/schema/newBooking.schema.json');

test.describe('Booking Api CRUD Operations @api', () => {
    test.describe.configure({ mode: 'serial' });

    let bookingApi;
    let authToken;
    let cleanupBookingIds;

    test.beforeEach(async ({ request }) => {
        bookingApi = new BookingApi(request);
        cleanupBookingIds = [];

        await test.step('Generate auth token for secured booking operations', async () => {
            const authResponse = await bookingApi.createToken();
            expect(authResponse.status()).toBe(200);

            const authBody = await authResponse.json();
            expect(authBody.token).toBeTruthy();
            authToken = authBody.token;
        });
    });

    test.afterEach(async () => {
        for (const bookingId of cleanupBookingIds) {
            const deleteResponse = await bookingApi.deletebooking(
                bookingId,
                bookingApi.getTokenHeaders(authToken)
            );

            expect(deleteResponse.ok()).toBeTruthy();
        }
    });

    function buildBookingPayload(basePayload) {
        return {
            ...JSON.parse(JSON.stringify(basePayload)),
            firstname: `${basePayload.firstname}-${Date.now()}`,
            lastname: `${basePayload.lastname}-${Math.floor(Math.random() * 1000)}`
        };
    }

    async function createBooking(payload) {
        const createResponse = await bookingApi.createbooking(payload);
        expect(createResponse.status()).toBe(200);

        const createBody = await createResponse.json();
        expect(createBody.bookingid).toBeTruthy();
        expect(createBody.booking).toMatchObject(payload);
        validateSchema(bookingSchemaPath, createBody.booking);

        cleanupBookingIds.push(createBody.bookingid);
        return createBody;
    }

    test('Get Booking by ID', async () => {
        const payload = buildBookingPayload(newbooking);
        let bookingId;

        await test.step('Create a booking to fetch by id', async () => {
            const createdBooking = await createBooking(payload);
            bookingId = createdBooking.bookingid;
        });

        await test.step('Fetch the created booking and validate its structure', async () => {
            const response = await bookingApi.getBookingid(bookingId);
            expect(response.status()).toBe(200);

            const responseBody = await response.json();
            validateSchema(bookingSchemaPath, responseBody);
            expect(responseBody).toMatchObject(payload);
        });
    });

    test('Create Booking', async () => {
        const payload = buildBookingPayload(newbooking);

        await test.step('Create a new booking and validate the returned payload', async () => {
            await createBooking(payload);
        });
    });

    test('Update Booking with Auth', async () => {
        const createPayload = buildBookingPayload(newbooking);
        const updatePayload = buildBookingPayload(updatebooking);
        let bookingId;

        await test.step('Create a booking to update', async () => {
            const createdBooking = await createBooking(createPayload);
            bookingId = createdBooking.bookingid;
        });

        await test.step('Update the booking using authenticated request headers', async () => {
            const updateResponse = await bookingApi.updatebooking(
                bookingId,
                updatePayload,
                bookingApi.getTokenHeaders(authToken)
            );
            expect(updateResponse.status()).toBe(200);

            const updatedBody = await updateResponse.json();
            validateSchema(bookingSchemaPath, updatedBody);
            expect(updatedBody).toMatchObject(updatePayload);
        });
    });
});
