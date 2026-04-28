const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const schemaCache = new Map();

function getSchemaValidator(schemaPath) {
    const resolvedSchemaPath = path.resolve(schemaPath);

    if (!schemaCache.has(resolvedSchemaPath)) {
        const schema = JSON.parse(fs.readFileSync(resolvedSchemaPath, 'utf-8'));
        schemaCache.set(resolvedSchemaPath, ajv.compile(schema));
    }

    return schemaCache.get(resolvedSchemaPath);
}

function validateSchema(schemaPath, data) {
    const validate = getSchemaValidator(schemaPath);

    if (!validate(data)) {
        throw new Error(
            'Schema validation failed:\n' +
            validate.errors.map(err => `- ${err.instancePath} ${err.message}`).join('\n')
        );
    }
}

module.exports = { validateSchema };
