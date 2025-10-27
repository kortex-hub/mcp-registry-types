import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type Server = {
  name: string;
  description: string;
  repository?: Repository | undefined;
  version: string;
  websiteUrl?: string | undefined;
};
type Repository = {
  url: string;
  source: string;
  id: string;
  subfolder?: string | undefined;
};
type ServerList = {
  servers: Array<ServerResponse>;
  metadata?:
    | Partial<{
        nextCursor: string;
        count: number;
      }>
    | undefined;
};
type ServerResponse = {
  server: ServerDetail;
  _meta: Partial<
    {
      "io.modelcontextprotocol.registry/official": Partial<{
        status: "active" | "deprecated" | "deleted";
        publishedAt: string;
        updatedAt: string;
        isLatest: boolean;
      }>;
    } & {
      [key: string]: any;
    }
  >;
};
type ServerDetail = Server &
  Partial<{
    $schema: string;
    packages: Array<Package>;
    remotes: Array<Remote>;
    _meta: Partial<{
      "io.modelcontextprotocol.registry/publisher-provided": {};
    }>;
  }>;
type Package = {
  registryType: string;
  registryBaseUrl?: string | undefined;
  identifier: string;
  version: string;
  fileSha256?: string | undefined;
  runtimeHint?: string | undefined;
  runtimeArguments?: Array<Argument> | undefined;
  packageArguments?: Array<Argument> | undefined;
  environmentVariables?: Array<KeyValueInput> | undefined;
};
type Argument =
  | (PositionalArgument | NamedArgument)
  | Array<PositionalArgument | NamedArgument>;
type PositionalArgument = InputWithVariables &
  ((unknown | unknown) | Array<unknown | unknown>);
type InputWithVariables = Input &
  Partial<{
    variables: {};
  }>;
type Input = Partial<{
  description: string;
  isRequired: boolean;
  format: "string" | "number" | "boolean" | "filepath";
  value: string;
  isSecret: boolean;
  default: string;
  choices: Array<string>;
}>;
type NamedArgument = InputWithVariables & {
  type: "named";
  name: string;
  isRepeated?: boolean | undefined;
};
type KeyValueInput = InputWithVariables & {
  name: string;
};
type Remote = {
  type: "streamable-http" | "sse";
  url: string;
  headers?: Array<KeyValueInput> | undefined;
};

const Repository: z.ZodType<Repository> = z
  .object({
    url: z.string().url(),
    source: z.string(),
    id: z.string(),
    subfolder: z.string().optional(),
  })
  .passthrough();
const Server: z.ZodType<Server> = z
  .object({
    name: z.string(),
    description: z.string(),
    repository: Repository.optional(),
    version: z.string(),
    websiteUrl: z.string().url().optional(),
  })
  .passthrough();
const Input: z.ZodType<Input> = z
  .object({
    description: z.string(),
    isRequired: z.boolean().default(false),
    format: z
      .enum(["string", "number", "boolean", "filepath"])
      .default("string"),
    value: z.string(),
    isSecret: z.boolean().default(false),
    default: z.string(),
    choices: z.array(z.string()),
  })
  .partial()
  .passthrough();
const InputWithVariables = Input.and(
  z
    .object({ variables: z.record(Input) })
    .partial()
    .passthrough()
);
const PositionalArgument = InputWithVariables.and(
  z.union([z.unknown(), z.unknown()])
);
const NamedArgument = InputWithVariables.and(
  z
    .object({
      type: z.literal("named"),
      name: z.string(),
      isRepeated: z.boolean().optional().default(false),
    })
    .passthrough()
);
const Argument = z.union([PositionalArgument, NamedArgument]);
const KeyValueInput = InputWithVariables.and(
  z.object({ name: z.string() }).passthrough()
);
const Package: z.ZodType<Package> = z
  .object({
    registryType: z.string(),
    registryBaseUrl: z.string().url().optional(),
    identifier: z.string(),
    version: z.string(),
    fileSha256: z.string().optional(),
    runtimeHint: z.string().optional(),
    runtimeArguments: z.array(Argument).optional(),
    packageArguments: z.array(Argument).optional(),
    environmentVariables: z.array(KeyValueInput).optional(),
  })
  .passthrough();
const Remote: z.ZodType<Remote> = z
  .object({
    type: z.enum(["streamable-http", "sse"]),
    url: z.string().url(),
    headers: z.array(KeyValueInput).optional(),
  })
  .passthrough();
const ServerDetail = Server.and(
  z
    .object({
      $schema: z.string().url(),
      packages: z.array(Package),
      remotes: z.array(Remote),
      _meta: z
        .object({
          "io.modelcontextprotocol.registry/publisher-provided": z
            .object({})
            .partial()
            .passthrough(),
        })
        .partial()
        .passthrough(),
    })
    .partial()
    .passthrough()
);
const ServerResponse: z.ZodType<ServerResponse> = z
  .object({
    server: ServerDetail,
    _meta: z
      .object({
        "io.modelcontextprotocol.registry/official": z
          .object({
            status: z.enum(["active", "deprecated", "deleted"]),
            publishedAt: z.string().datetime({ offset: true }),
            updatedAt: z.string().datetime({ offset: true }),
            isLatest: z.boolean(),
          })
          .partial(),
      })
      .partial()
      .passthrough(),
  })
  .passthrough();
const ServerList: z.ZodType<ServerList> = z
  .object({
    servers: z.array(ServerResponse),
    metadata: z
      .object({ nextCursor: z.string(), count: z.number().int() })
      .partial()
      .passthrough()
      .optional(),
  })
  .passthrough();

export const schemas = {
  Repository,
  Server,
  Input,
  InputWithVariables,
  PositionalArgument,
  NamedArgument,
  Argument,
  KeyValueInput,
  Package,
  Remote,
  ServerDetail,
  ServerResponse,
  ServerList,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/v0/publish",
    alias: "postV0publish",
    description: `Publish a new MCP server to the registry or update an existing one.

**Note**: This endpoint is optional for registry implementations. Read-only registries may not provide this functionality.

Authentication mechanism is registry-specific and may vary between implementations.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ServerDetail,
      },
    ],
    response: ServerResponse,
    errors: [
      {
        status: 401,
        description: `Unauthorized - Invalid or missing authentication token`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 403,
        description: `Forbidden - Insufficient permissions`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/v0/servers",
    alias: "getV0servers",
    description: `Returns a list of all registered MCP servers`,
    requestFormat: "json",
    parameters: [
      {
        name: "cursor",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
    ],
    response: ServerList,
  },
  {
    method: "get",
    path: "/v0/servers/:serverName",
    alias: "getV0serversServerName",
    description: `Returns detailed information about the latest version of a specific MCP server.`,
    requestFormat: "json",
    parameters: [
      {
        name: "serverName",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ServerResponse,
    errors: [
      {
        status: 404,
        description: `Server not found`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/v0/servers/:serverName/versions",
    alias: "getV0serversServerNameversions",
    description: `Returns all available versions for a specific MCP server, ordered by publication date (newest first)`,
    requestFormat: "json",
    parameters: [
      {
        name: "serverName",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ServerList,
    errors: [
      {
        status: 404,
        description: `Server not found`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/v0/servers/:serverName/versions/:version",
    alias: "getV0serversServerNameversionsVersion",
    description: `Returns detailed information about a specific version of an MCP server.`,
    requestFormat: "json",
    parameters: [
      {
        name: "serverName",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "version",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ServerResponse,
    errors: [
      {
        status: 404,
        description: `Server or version not found`,
        schema: z.object({ error: z.string() }).partial().passthrough(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
