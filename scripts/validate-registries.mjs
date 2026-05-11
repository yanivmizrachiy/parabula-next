import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

const registries = [
  {
    id: 'app-surfaces',
    file: 'meta/app-surfaces.json',
    schema: 'schemas/app-surfaces.schema.json',
    arrayKey: 'surfaces',
    requiredItemFields: ['id', 'entry', 'status', 'role']
  },
  {
    id: 'validators',
    file: 'meta/validators.json',
    schema: 'schemas/validators.schema.json',
    arrayKey: 'validators',
    requiredItemFields: ['name', 'script', 'status', 'blocksMain']
  },
  {
    id: 'workflows',
    file: 'meta/workflows.json',
    schema: 'schemas/workflows.schema.json',
    arrayKey: 'workflows',
    requiredItemFields: ['file', 'status', 'risk', 'writeCapability']
  },
  {
    id: 'scripts',
    file: 'meta/scripts.json',
    schema: 'schemas/scripts.schema.json',
    arrayKey: 'scripts',
    requiredItemFields: ['file', 'status', 'risk']
  },
  {
    id: 'file-roles',
    file: 'meta/file-roles.json',
    schema: 'schemas/file-roles.schema.json',
    arrayKey: 'patterns',
    requiredItemFields: ['pattern', 'labels', 'risk', 'decision']
  }
];

const requiredTopLevelFields = ['schemaVersion', 'status', 'authority'];
const results = [];
let failures = 0;

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  const raw = fs.readFileSync(absolutePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function validateRequiredFields(object, fields, location) {
  const errors = [];
  for (const field of fields) {
    if (!hasOwn(object, field)) {
      errors.push(`${location} missing required field: ${field}`);
    }
  }
  return errors;
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];

  let data;
  try {
    data = readJson(registry.file);
  } catch (error) {
    return { id: registry.id, file: registry.file, status: 'fail', errors: [error.message], warnings };
  }

  try {
    readJson(registry.schema);
  } catch (error) {
    errors.push(error.message);
  }

  errors.push(...validateRequiredFields(data, requiredTopLevelFields, registry.file));

  if (typeof data.schemaVersion !== 'number') {
    errors.push(`${registry.file} schemaVersion must be a number`);
  }

  if (typeof data.status !== 'string' || data.status.length === 0) {
    errors.push(`${registry.file} status must be a non-empty string`);
  }

  if (typeof data.authority !== 'string' || data.authority.length === 0) {
    errors.push(`${registry.file} authority must be a non-empty string`);
  }

  if (!Array.isArray(data[registry.arrayKey])) {
    errors.push(`${registry.file} ${registry.arrayKey} must be an array`);
  } else if (data[registry.arrayKey].length === 0) {
    errors.push(`${registry.file} ${registry.arrayKey} must not be empty`);
  } else {
    data[registry.arrayKey].forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`${registry.file} ${registry.arrayKey}[${index}] must be an object`);
        return;
      }
      errors.push(...validateRequiredFields(item, registry.requiredItemFields, `${registry.file} ${registry.arrayKey}[${index}]`));
      if (hasOwn(item, 'labels') && !Array.isArray(item.labels)) {
        errors.push(`${registry.file} ${registry.arrayKey}[${index}].labels must be an array`);
      }
      if (hasOwn(item, 'blocksMain') && typeof item.blocksMain !== 'boolean') {
        errors.push(`${registry.file} ${registry.arrayKey}[${index}].blocksMain must be boolean`);
      }
    });
  }

  if (data.status === 'seed') {
    warnings.push(`${registry.file} is still marked as seed and is not final canonical metadata`);
  }

  return {
    id: registry.id,
    file: registry.file,
    schema: registry.schema,
    status: errors.length === 0 ? 'pass' : 'fail',
    count: Array.isArray(data?.[registry.arrayKey]) ? data[registry.arrayKey].length : 0,
    errors,
    warnings
  };
}

for (const registry of registries) {
  const result = validateRegistry(registry);
  results.push(result);
  if (result.status !== 'pass') failures += 1;
}

const summary = {
  generatedAt: new Date().toISOString(),
  checkedRegistries: results.length,
  passed: results.filter(result => result.status === 'pass').length,
  failed: failures,
  results
};

console.log(JSON.stringify(summary, null, 2));

if (failures > 0) {
  process.exitCode = 1;
}
