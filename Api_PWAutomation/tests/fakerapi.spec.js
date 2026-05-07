const path = require("path");
const { FakeApi } = require("../pages/api/fakerapi");
const { test, expect } = require("@playwright/test");
const user = require("../pages/payloads/fakeapi/user.json");
const userupdate = require("../pages/payloads/fakeapi/userupdate.json");
const { validateSchema } = require("../pages/utils/schemavalidat.js");

const schemapath = path.resolve(__dirname, "../pages/schema/fakeuser.schema.json");

function clonePayload(payload) {
    return JSON.parse(JSON.stringify(payload));
}

function buildUserPayload() {
    const payload = clonePayload(user);
    const uniqueValue = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    payload.email = `fakeapi-${uniqueValue}@gmail.com`;
    payload.name = `${payload.name} ${uniqueValue}`;
    return payload;
}

function buildUpdatedUserPayload() {
    const payload = clonePayload(userupdate);
    payload.name = `${payload.name} ${Date.now()}`;
    return payload;
}

test.describe("Api Automation Test suite @api", () => {
    test.describe.configure({ mode: "serial" });

    let fakeapi;
    let cleanupUserIds = [];
    let createdUser;

    test.beforeEach(async ({ request }) => {
        fakeapi = new FakeApi(request);
    });

    test.afterAll(async () => {
        for (const userId of cleanupUserIds) {
            const response = await fakeapi.deleteUser(userId);

            if (response.ok()) {
                expect(response.status()).toBe(200);
            }
        }
    });

    async function createUserForTest(payload = buildUserPayload()) {
        const response = await fakeapi.createUser(payload);
        expect(response.status()).toBe(201);

        const responseBody = await response.json();
        validateSchema(schemapath, responseBody);
        expect(responseBody.email).toBe(payload.email);
        expect(responseBody.name).toBe(payload.name);
        expect(responseBody.role).toBe(payload.role);
        expect(responseBody.avatar).toBe(payload.avatar);

        cleanupUserIds.push(responseBody.id);
        return responseBody;
    }

    test("Get User By ID", async () => {
        const response = await fakeapi.getUserid(1);
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        validateSchema(schemapath, responseBody);
        expect(responseBody.id).toBe(1);
    });

    test("Create User And Fetch By Returned ID", async () => {
        await test.step("Create a user", async () => {
            createdUser = await createUserForTest();
        });

        await test.step("Fetch the created user and validate persisted values", async () => {
            const response = await fakeapi.getUserid(createdUser.id);
            expect(response.status()).toBe(200);

            const responseBody = await response.json();
            validateSchema(schemapath, responseBody);
            expect(responseBody.id).toBe(createdUser.id);
            expect(responseBody.email).toBe(createdUser.email);
            expect(responseBody.name).toBe(createdUser.name);
            expect(responseBody.role).toBe(createdUser.role);
            expect(responseBody.avatar).toBe(createdUser.avatar);
        });
    });

    test("Update Previously Created User By ID", async () => {
        const updatePayload = buildUpdatedUserPayload();
        expect(createdUser?.id).toBeTruthy();

        await test.step("Update the created user", async () => {
            const response = await fakeapi.updateUser(createdUser.id, updatePayload);
            expect(response.status()).toBe(200);

            const responseBody = await response.json();
            validateSchema(schemapath, responseBody);
            expect(responseBody.id).toBe(createdUser.id);
            expect(responseBody.name).toBe(updatePayload.name);
            expect(responseBody.role).toBe(updatePayload.role);
            expect(responseBody.email).toBe(createdUser.email);

            createdUser = responseBody;
        });
    });

    test("Delete Previously Created User By ID", async () => {
        expect(createdUser?.id).toBeTruthy();

        await test.step("Delete the created user", async () => {
            const response = await fakeapi.deleteUser(createdUser.id);
            expect(response.status()).toBe(200);
        });

        cleanupUserIds = cleanupUserIds.filter((userId) => userId !== createdUser.id);
        createdUser = undefined;
    });

    test("Get User With Non Existing ID", async () => {
        const response = await fakeapi.getUserid(999999999);
        expect([400, 404]).toContain(response.status());
    });

    test("Get User With Invalid ID", async () => {
        const response = await fakeapi.getUserid("abc");
        expect([400, 404]).toContain(response.status());
    });

});