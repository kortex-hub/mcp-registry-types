/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';

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
