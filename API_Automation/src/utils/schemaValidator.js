import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export function validateSchema(schemaPath, data) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    throw new Error(
      'Schema validation failed:\n' +
      validate.errors.map(err => `- ${err.instancePath} ${err.message}`).join('\n')
    );
  }
}
