import {readFileSync, writeFileSync} from 'fs';
import {parse} from 'yaml';

const yamlFilePath = 'openapi.yaml';
const jsonFilePath = 'src/openapi.json';

try {
  const yamlContent = readFileSync(yamlFilePath, 'utf8');
  const jsonData = parse(yamlContent);
  writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`Successfully converted ${yamlFilePath} to ${jsonFilePath}`);
} catch (error) {
  console.error(`Error converting YAML to JSON: ${error}`);
  process.exit(1);
}
