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

import { Ajv, type ValidateFunction } from 'ajv';
import openapiSchema from './openapi.json' with {type: 'json'};

const ajv = new Ajv({strict: false});

// Pre-register all OpenAPI schemas once for $ref resolution
for (const [schemaName, schema] of Object.entries(openapiSchema.components.schemas)) {
  ajv.addSchema(schema, `#/components/schemas/${schemaName}`);
}

/**
 * Creates a validator function for a specific schema component.
 * The validator automatically handles recursive validation of nested objects via $ref.
 * 
 * @param schemaName - Name of the schema in components.schemas (e.g., 'ServerList', 'Server', 'ServerResponse')
 * @returns AJV validator function that recursively validates the schema and all its nested references
 */
export function createValidator(schemaName: string): ValidateFunction {
  return ajv.compile({ $ref: `#/components/schemas/${schemaName}` });
}

