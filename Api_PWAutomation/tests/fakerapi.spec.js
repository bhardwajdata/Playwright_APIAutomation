const { FakeApi } = require("../pages/api/fakerapi");
const { test, expect } = require("@playwright/test");
const user = require("../pages/payloads/fakeapi/user.json");
const userupdate = require("../pages/payloads/fakeapi/userupdate.json");
const { validateSchema } = require("../pages/utils/schemavalidator.js");

test.describe("Api Automation Test suite @fakerapi", () => {
    let fakeapi;
    let userId;
    const schemapath = "pages/schema/fakeuser.schema.json";

    test.beforeEach(async ({ request }) => {
        fakeapi = new FakeApi(request);
    });

    test("Get User By ID", async () => {
        const response = await fakeapi.getUserid(1);
        expect(response.status()).toBe(200);
        const responsebody = await response.json();
        validateSchema(schemapath, responsebody);
        console.log('GET API Response Schema is Validated')
        expect(responsebody.id).toBe(1);
    });

    test("Create User", async () => {
        const response = await fakeapi.createUser(user);
        expect(response.status()).toBe(201);
        const responsebody = await response.json();
        validateSchema(schemapath, responsebody);
        console.log('Create API Response Schema is Validated')
        expect(responsebody.name).toBe(user.name);
        userId = responsebody.id;
        console.log("User Created with ID: " + userId);
        await test.step("Update User By Id", async () => {
            const response = await fakeapi.updateUser(userId, userupdate);
            console.log("Update Response: " + response.status());
            expect(response.status()).toBe(200);
            const responsebody = await response.json();
            validateSchema(schemapath, responsebody);
            console.log('Update API Response Schema is Validated')
            expect(responsebody.role).toBe(userupdate.role);
        })
        await test.step("Delete User By Id", async () => {
            const response = await fakeapi.deleteUser(userId);
            expect(response.status()).toBe(200);
            console.log('User deleted with id : ' + userId);
        })
    });
});
