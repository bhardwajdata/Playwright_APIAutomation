const { test, expect } = require('@playwright/test');
const { ProductApi } = require('../src/api/productapi');
const { BookingApi } = require('../src/api/bookingapi');
const {bookingSchema} = require('../src/schemas/newBooking.schema.json');
const {validateSchema} = require('../src/utils/schemaValidator');

// import bookingSchema from '../srcnewBooking.schema.json';
//import { validateSchema } from '../src/utils/schemaValidator';

test.describe('API Checks Framework', () => {
test(' product API Get test', async ({ request }) => {
  const productApi = new ProductApi(request);
  const response = await productApi.getProduct(1);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty('id', 1);

  // Additonal one liner Schema validations 
  expect( typeof body.title ).toBe('string');
  expect( typeof body.brand ).toBe('string');
  expect( typeof body.category ).toBe('string');

  expect(body).toHaveProperty('brand', 'Essence');
  expect(body).toHaveProperty('category', 'beauty');
  console.log('Product details validated successfully!');
});

test('Booking API Create, update and delete test', async ({ request }) => {
  const auth = await request.post('https://restful-booker.herokuapp.com/auth', {
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      "username": "admin",
      "password": "password123"
    }},
  );

  expect(auth.status()).toBe(200);
  console.log('Authentication successful!');
  const authBody = await auth.json();
  const tokendata = authBody.token;
  console.log('Token received:', tokendata);

  // Get Booking details
  const bookingApi = new BookingApi(request);
  const response = await bookingApi.getBookingid(2);
  expect(response.status()).toBe(200);
  console.log('Booking details fetched successfully!');

  // Create a new booking
  const newBookingPayload = {
    firstname: 'Mr',
    lastname: 'Wick',
    totalprice: 102,
    depositpaid: true,
    bookingdates: {
      checkin: '2025-01-01',
      checkout: '2025-02-02'
    },
    additionalneeds: 'Breakfast'
  };

  // Validate payload 
  validateSchema('src/schemas/newBooking.schema.json', newBookingPayload);
  console.log('New booking payload validated against schema.');

  const createResponse = await bookingApi.createbooking(newBookingPayload);
  expect(createResponse.status()).toBe(200);
  const createBody = await createResponse.json();
  expect(createBody).toHaveProperty('bookingid');
  console.log('Booking created successfully with ID:', createBody.bookingid);
  console.log('Booking created successfully:', createBody);
  const BookingId = createBody.bookingid;

// Update the booking  
const updatebookingdata = {
      firstname: 'John',
      lastname: 'Wick',
      totalprice: 104,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-02-02'
      },
      additionalneeds: 'Lunch'
};
console.log('Updating booking with ID:', BookingId);
console.log('Token used for update:', tokendata);

const updateResponse = await bookingApi.updatebooking(
  BookingId,
  updatebookingdata
);
expect(updateResponse.status()).toBe(200);

const updatedBody = await updateResponse.json();
console.log('Updated booking:', updatedBody); 
expect(updatedBody).toHaveProperty('totalprice', 104);
expect(updatedBody).toHaveProperty('additionalneeds', 'Lunch');
expect(updatedBody).toHaveProperty('firstname', 'John');
console.log('Booking updated successfully!');

// delete the booking
const deleteResponse = await bookingApi.deletebooking(BookingId, tokendata);
expect(deleteResponse.status()).toBe(201);
console.log('Booking deleted successfully!');
});

});