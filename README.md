# MCP Registry Types

[![npm version](https://img.shields.io/npm/v/@kortex-hub/mcp-registry-types.svg)](https://www.npmjs.com/package/@kortex-hub/mcp-registry-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript type definitions for the [Model Context Protocol (MCP) Registry API](https://modelcontextprotocol.io/), providing complete type safety when interacting with MCP registry endpoints.

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that enables AI assistants to securely access and interact with external tools, data sources, and services. The MCP Registry is a centralized repository where developers can publish and discover MCP servers.

## What does this package do?

This package provides:

- 🎯 **Complete TypeScript types** for all MCP Registry API endpoints
- 🔒 **Type-safe API interactions** with full IntelliSense support
- 📋 **Auto-generated definitions** from the official OpenAPI specification
- 🔄 **Always up-to-date** types synced with the latest MCP Registry API

The types are automatically generated from the [official MCP Registry OpenAPI specification](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/openapi.yaml), ensuring they stay current with API changes.

## Installation

```bash
npm install @kortex-hub/mcp-registry-types
```

Or with your preferred package manager:

```bash
# pnpm
pnpm add @kortex-hub/mcp-registry-types

# yarn  
yarn add @kortex-hub/mcp-registry-types

# bun
bun add @kortex-hub/mcp-registry-types
```

## Usage

### Basic API Client Example

```typescript
import type { paths, components } from '@kortex-hub/mcp-registry-types';

// Type for server list response
type ServerListResponse = paths['/v0/servers']['get']['responses']['200']['content']['application/json'];

// Type for a single server
type Server = components['schemas']['Server'];

// Type for server details (used in publishing)
type ServerDetail = components['schemas']['ServerDetail'];

// Example API client usage
async function fetchServers(cursor?: string, limit?: number): Promise<ServerListResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (limit) params.set('limit', limit.toString());
  
  const response = await fetch(`https://registry.modelcontextprotocol.io/v0/servers?${params}`);
  return response.json();
}

async function publishServer(serverDetail: ServerDetail): Promise<ServerDetail> {
  const response = await fetch('https://registry.modelcontextprotocol.io/v0/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_REGISTRY_TOKEN}`,
    },
    body: JSON.stringify(serverDetail),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to publish server: ${response.statusText}`);
  }
  
  return response.json();
}
```

### With Popular HTTP Clients

#### Using with `fetch` (native)

```typescript
import type { paths } from '@kortex-hub/mcp-registry-types';

type ServerListParams = paths['/v0/servers']['get']['parameters']['query'];
type ServerListResponse = paths['/v0/servers']['get']['responses']['200']['content']['application/json'];

const servers: ServerListResponse = await fetch('/api/v0/servers').then(res => res.json());
```

#### Using with `axios`

```typescript
import axios from 'axios';
import type { paths, components } from '@kortex-hub/mcp-registry-types';

const api = axios.create({
  baseURL: 'https://registry.modelcontextprotocol.io',
});

// Get servers with full type safety
const response = await api.get<paths['/v0/servers']['get']['responses']['200']['content']['application/json']>('/v0/servers');
const servers = response.data.servers;
```

#### Using with `openapi-fetch`

```typescript
import createClient from 'openapi-fetch';
import type { paths } from '@kortex-hub/mcp-registry-types';

const client = createClient<paths>({ 
  baseUrl: 'https://registry.modelcontextprotocol.io' 
});

const { data, error } = await client.GET('/v0/servers', {
  params: {
    query: {
      limit: 10,
      cursor: 'abc123'
    }
  }
});

if (error) {
  console.error('API Error:', error);
} else {
  console.log('Servers:', data.servers);
}
```

### Working with Server Objects

```typescript
import type { components } from '@kortex-hub/mcp-registry-types';

type Server = components['schemas']['Server'];
type Package = components['schemas']['Package'];
type Remote = components['schemas']['Remote'];

function processServer(server: Server) {
  console.log(`Server: ${server.name} v${server.version}`);
  console.log(`Description: ${server.description}`);
  
  // Work with packages (different installation methods)
  server.packages?.forEach((pkg: Package) => {
    if (pkg.type === 'npm') {
      console.log(`NPM package: ${pkg.name}`);
    } else if (pkg.type === 'pip') {
      console.log(`Python package: ${pkg.name}`);
    }
  });
  
  // Work with remote configurations
  server.remotes?.forEach((remote: Remote) => {
    console.log(`Remote: ${remote.name} -> ${remote.url}`);
  });
}
```

## Available Types

The package exports the following main type categories:

### API Endpoints (`paths`)
- `/v0/servers` - List and retrieve MCP servers
- `/v0/servers/{id}` - Get specific server details  
- `/v0/publish` - Publish new servers (optional endpoint)

### Data Models (`components.schemas`)
- `Server` - Basic server information
- `ServerDetail` - Complete server specification for publishing
- `ServerList` - Paginated list of servers
- `Package` - Installation package information (npm, pip, etc.)
- `Remote` - Remote server configuration
- `Repository` - Source code repository details

### Request/Response Types
All API endpoints include complete request parameter and response body types with proper error handling.

## API Reference

For complete API documentation, see:

- **[MCP Registry API Reference](https://modelcontextprotocol.io/registry/api)** - Official API documentation
- **[OpenAPI Specification](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/openapi.yaml)** - Complete API schema
- **[MCP Specification](https://spec.modelcontextprotocol.io/)** - Core MCP protocol specification

## Related Resources

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Official MCP website
- **[MCP Registry](https://github.com/modelcontextprotocol/registry)** - Registry source code and documentation
- **[MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)** - TypeScript SDK for building MCP servers
- **[MCP Servers](https://github.com/modelcontextprotocol/servers)** - Collection of example MCP servers

## Development

This package uses automated type generation:

```bash
# Generate types from OpenAPI spec
pnpm generate

# This runs: npx openapi-typescript https://raw.githubusercontent.com/modelcontextprotocol/registry/refs/tags/v1.0.0/docs/reference/api/openapi.yaml -o src/schema.d.ts --export-type
```

The types are generated from the official MCP Registry OpenAPI specification and should not be manually edited.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [GitHub Releases](https://github.com/kortex-hub/mcp-registry-types/releases) for version history and changes.