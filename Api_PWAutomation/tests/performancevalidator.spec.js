const { test, expect } = require('@playwright/test');
const BookingApi = require('../pages/api/bookingapi');
const { FakeApi } = require('../pages/api/fakerapi');
const PlatziProductApi = require('../pages/api/platziproductapi');
const ProductApi = require('../pages/api/productapi');
const newbooking = require('../pages/payloads/newbooking.json');
const updatebooking = require('../pages/payloads/updatebooking.json');
const user = require('../pages/payloads/fakeapi/user.json');
const userupdate = require('../pages/payloads/fakeapi/userupdate.json');
const product = require('../pages/payloads/platzi/product.json');
const updateproduct = require('../pages/payloads/platzi/updateproduct.json');
const {
    DEFAULT_SLA_MS,
    DEFAULT_VIRTUAL_USERS,
    assertWithinSla,
    clearPerformanceSummaries,
    exportPerformanceSummaries,
    logPerformanceSummary,
    measureRequest,
    runConcurrentUsers
} = require('../pages/utils/performancehelper');

const VIRTUAL_USERS = DEFAULT_VIRTUAL_USERS;
const SLA_MS = DEFAULT_SLA_MS;

function clonePayload(payload) {
    return JSON.parse(JSON.stringify(payload));
}

function uniqueSuffix(index) {
    return `${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
}

function buildBookingPayload(index, basePayload = newbooking) {
    const payload = clonePayload(basePayload);
    const suffix = uniqueSuffix(index);
    payload.firstname = `${payload.firstname}-${suffix}`;
    payload.lastname = `${payload.lastname}-${suffix}`;
    return payload;
}

function buildUserPayload(index) {
    const payload = clonePayload(user);
    const suffix = uniqueSuffix(index);
    payload.email = `perf-user-${suffix}@gmail.com`;
    payload.name = `${payload.name} ${suffix}`;
    payload.avatar = `https://picsum.photos/seed/${suffix}/200`;
    return payload;
}

function buildUpdatedUserPayload(index) {
    const payload = clonePayload(userupdate);
    payload.name = `${payload.name} ${uniqueSuffix(index)}`;
    return payload;
}

function buildPlatziProductPayload(index, basePayload = product) {
    const payload = clonePayload(basePayload);
    const suffix = uniqueSuffix(index);
    payload.title = `${payload.title}-${suffix}`;
    payload.slug = `running-shoes-${suffix}`;
    payload.images = payload.images.map((_, imageIndex) => `https://picsum.photos/seed/${suffix}-${imageIndex}/300`);
    return payload;
}

test.describe('API Performance Validation @api', () => {
    test.describe.configure({ mode: 'serial' });
    test.beforeAll(() => {
        clearPerformanceSummaries();
    });

    test.afterAll(() => {
        const { jsonPath, count } = exportPerformanceSummaries('test-results');
        console.log(`[PERF] Exported ${count} summaries to ${jsonPath}`);
    });

    test('DummyJSON product GET stays within SLA for 10 virtual users', async ({ request }) => {
        const productApi = new ProductApi(request);

        await runConcurrentUsers('DummyJSON GET /products/6', async (userIndex) => {
            const { response, duration } = await measureRequest(() => productApi.getProductid(6));
            return { userIndex, duration, status: response.status() };
        }, { virtualUsers: VIRTUAL_USERS, slaMs: SLA_MS });
    });

    test('Booking auth, create, get, update, and delete stay within SLA for 10 virtual users', async ({ request }) => {
        const bookingApi = new BookingApi(request);
        const authDurations = [];
        const createDurations = [];
        const getDurations = [];
        const updateDurations = [];
        const deleteDurations = [];

        await runConcurrentUsers('Booking full flow', async (userIndex) => {
            const createPayload = buildBookingPayload(userIndex, newbooking);
            const updatePayload = buildBookingPayload(userIndex, updatebooking);

            const authResult = await measureRequest(() => bookingApi.createToken());
            expect(authResult.response.status()).toBe(200);
            assertWithinSla(`Booking auth [user ${userIndex + 1}]`, authResult.duration, SLA_MS);
            authDurations.push(authResult.duration);

            const authBody = await authResult.response.json();
            const tokenHeaders = bookingApi.getTokenHeaders(authBody.token);

            const createResult = await measureRequest(() => bookingApi.createbooking(createPayload));
            expect(createResult.response.status()).toBe(200);
            assertWithinSla(`Booking create [user ${userIndex + 1}]`, createResult.duration, SLA_MS);
            createDurations.push(createResult.duration);

            const createBody = await createResult.response.json();
            const bookingId = createBody.bookingid;

            try {
                const getResult = await measureRequest(() => bookingApi.getBookingid(bookingId));
                expect(getResult.response.status()).toBe(200);
                assertWithinSla(`Booking get [user ${userIndex + 1}]`, getResult.duration, SLA_MS);
                getDurations.push(getResult.duration);

                const updateResult = await measureRequest(() => bookingApi.updatebooking(bookingId, updatePayload, tokenHeaders));
                expect(updateResult.response.status()).toBe(200);
                assertWithinSla(`Booking update [user ${userIndex + 1}]`, updateResult.duration, SLA_MS);
                updateDurations.push(updateResult.duration);

                const deleteResult = await measureRequest(() => bookingApi.deletebooking(bookingId, tokenHeaders));
                expect(deleteResult.response.status()).toBe(201);
                assertWithinSla(`Booking delete [user ${userIndex + 1}]`, deleteResult.duration, SLA_MS);
                deleteDurations.push(deleteResult.duration);

                return {
                    userIndex,
                    duration: Math.max(
                        authResult.duration,
                        createResult.duration,
                        getResult.duration,
                        updateResult.duration,
                        deleteResult.duration
                    ),
                    status: 200
                };
            } catch (error) {
                await bookingApi.deletebooking(bookingId, tokenHeaders).catch(() => {});
                throw error;
            }
        }, { virtualUsers: VIRTUAL_USERS, slaMs: SLA_MS });

        logPerformanceSummary('Booking auth', authDurations, SLA_MS);
        logPerformanceSummary('Booking create', createDurations, SLA_MS);
        logPerformanceSummary('Booking get', getDurations, SLA_MS);
        logPerformanceSummary('Booking update', updateDurations, SLA_MS);
        logPerformanceSummary('Booking delete', deleteDurations, SLA_MS);
    });

    test('Fake user GET, create, update, and delete stay within SLA for 10 virtual users', async ({ request }) => {
        const fakeApi = new FakeApi(request);
        const seededGetDurations = [];
        const createDurations = [];
        const createdGetDurations = [];
        const updateDurations = [];
        const deleteDurations = [];

        await runConcurrentUsers('Fake user full flow', async (userIndex) => {
            const createPayload = buildUserPayload(userIndex);
            const updatePayload = buildUpdatedUserPayload(userIndex);

            const seededGetResult = await measureRequest(() => fakeApi.getUserid(1));
            expect(seededGetResult.response.status()).toBe(200);
            assertWithinSla(`Fake user get existing [user ${userIndex + 1}]`, seededGetResult.duration, SLA_MS);
            seededGetDurations.push(seededGetResult.duration);

            const createResult = await measureRequest(() => fakeApi.createUser(createPayload));
            expect(createResult.response.status()).toBe(201);
            assertWithinSla(`Fake user create [user ${userIndex + 1}]`, createResult.duration, SLA_MS);
            createDurations.push(createResult.duration);

            const createBody = await createResult.response.json();
            const createdUserId = createBody.id;

            try {
                const getCreatedResult = await measureRequest(() => fakeApi.getUserid(createdUserId));
                expect(getCreatedResult.response.status()).toBe(200);
                assertWithinSla(`Fake user get created [user ${userIndex + 1}]`, getCreatedResult.duration, SLA_MS);
                createdGetDurations.push(getCreatedResult.duration);

                const updateResult = await measureRequest(() => fakeApi.updateUser(createdUserId, updatePayload));
                expect(updateResult.response.status()).toBe(200);
                assertWithinSla(`Fake user update [user ${userIndex + 1}]`, updateResult.duration, SLA_MS);
                updateDurations.push(updateResult.duration);

                const deleteResult = await measureRequest(() => fakeApi.deleteUser(createdUserId));
                expect(deleteResult.response.status()).toBe(200);
                assertWithinSla(`Fake user delete [user ${userIndex + 1}]`, deleteResult.duration, SLA_MS);
                deleteDurations.push(deleteResult.duration);

                return {
                    userIndex,
                    duration: Math.max(
                        seededGetResult.duration,
                        createResult.duration,
                        getCreatedResult.duration,
                        updateResult.duration,
                        deleteResult.duration
                    ),
                    status: 200
                };
            } catch (error) {
                await fakeApi.deleteUser(createdUserId).catch(() => {});
                throw error;
            }
        }, { virtualUsers: VIRTUAL_USERS, slaMs: SLA_MS });

        logPerformanceSummary('Fake user get existing', seededGetDurations, SLA_MS);
        logPerformanceSummary('Fake user create', createDurations, SLA_MS);
        logPerformanceSummary('Fake user get created', createdGetDurations, SLA_MS);
        logPerformanceSummary('Fake user update', updateDurations, SLA_MS);
        logPerformanceSummary('Fake user delete', deleteDurations, SLA_MS);
    });

    test('Platzi product GET, create, update, and delete stay within SLA for 10 virtual users', async ({ request }) => {
        const platziApi = new PlatziProductApi(request);
        const seededGetDurations = [];
        const createDurations = [];
        const updateDurations = [];
        const deleteDurations = [];

        await runConcurrentUsers('Platzi product full flow', async (userIndex) => {
            const createPayload = buildPlatziProductPayload(userIndex, product);
            const updatePayload = buildPlatziProductPayload(userIndex, updateproduct);

            const seededGetResult = await measureRequest(() => platziApi.getplatziproductid(35));
            expect(seededGetResult.response.status()).toBe(200);
            assertWithinSla(`Platzi product get existing [user ${userIndex + 1}]`, seededGetResult.duration, SLA_MS);
            seededGetDurations.push(seededGetResult.duration);

            const createResult = await measureRequest(() => platziApi.createproduct(createPayload));
            expect(createResult.response.status()).toBe(201);
            assertWithinSla(`Platzi product create [user ${userIndex + 1}]`, createResult.duration, SLA_MS);
            createDurations.push(createResult.duration);

            const createBody = await createResult.response.json();
            const createdProductId = createBody.id;

            try {
                const updateResult = await measureRequest(() => platziApi.updateproduct(createdProductId, updatePayload));
                expect(updateResult.response.status()).toBe(200);
                assertWithinSla(`Platzi product update [user ${userIndex + 1}]`, updateResult.duration, SLA_MS);
                updateDurations.push(updateResult.duration);

                const deleteResult = await measureRequest(() => platziApi.deleteproduct(createdProductId));
                expect(deleteResult.response.status()).toBe(200);
                assertWithinSla(`Platzi product delete [user ${userIndex + 1}]`, deleteResult.duration, SLA_MS);
                deleteDurations.push(deleteResult.duration);

                return {
                    userIndex,
                    duration: Math.max(
                        seededGetResult.duration,
                        createResult.duration,
                        updateResult.duration,
                        deleteResult.duration
                    ),
                    status: 200
                };
            } catch (error) {
                await platziApi.deleteproduct(createdProductId).catch(() => {});
                throw error;
            }
        }, { virtualUsers: VIRTUAL_USERS, slaMs: SLA_MS });

        logPerformanceSummary('Platzi product get existing', seededGetDurations, SLA_MS);
        logPerformanceSummary('Platzi product create', createDurations, SLA_MS);
        logPerformanceSummary('Platzi product update', updateDurations, SLA_MS);
        logPerformanceSummary('Platzi product delete', deleteDurations, SLA_MS);
    });
});

