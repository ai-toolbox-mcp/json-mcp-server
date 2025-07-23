#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import jq from 'node-jq';
import { createSchema } from 'genson-js';
import Ajv from 'ajv';
import { promises as fs } from 'fs';
import path from 'path';
import { program } from 'commander';
import which from 'which';

// Parse command line arguments
program
  .option('--verbose <value>', 'Enable verbose logging', 'false')
  .option('--file-path <path>', 'Default file path for JSON operations')
  .option('--jq-path <path>', 'Path to local jq binary (auto-detected if not provided)')
  .parse();

const options = program.opts();
const VERBOSE = options.verbose === 'true';
const DEFAULT_FILE_PATH = options.filePath;
const CUSTOM_JQ_PATH = options.jqPath;

// Global jq configuration
let JQ_CONFIG = {};

// Logging utility
function log(...args) {
  if (VERBOSE) {
    console.error('[JSON-MCP-SERVER]', ...args);
  }
}

// Initialize jq with local binary
async function initializeJq() {
  try {
    let jqPath;

    if (CUSTOM_JQ_PATH) {
      // Use custom path if provided
      jqPath = CUSTOM_JQ_PATH;
      log(`Using custom jq path: ${jqPath}`);
    } else {
      // Auto-detect local jq binary
      try {
        jqPath = await which('jq');
        log(`Auto-detected jq at: ${jqPath}`);
      } catch (whichError) {
        // On Windows, try jq.exe if jq fails
        if (process.platform === 'win32') {
          try {
            jqPath = await which('jq.exe');
            log(`Auto-detected jq.exe at: ${jqPath}`);
          } catch (exeError) {
            throw whichError; // Throw original error
          }
        } else {
          throw whichError;
        }
      }
    }

    // Verify the binary exists and is accessible
    try {
      await fs.access(jqPath);
      log(`✅ jq binary found and accessible: ${jqPath}`);
    } catch (accessError) {
      throw new Error(`jq binary not accessible: ${jqPath}`);
    }

    // Configure node-jq to use local binary
    JQ_CONFIG = {
      jqPath: jqPath,
      input: 'json'
    };

    log('✅ jq binary configured successfully');
    return true;

  } catch (error) {
    console.error('❌ Error: Local jq binary not found or not executable');
    console.error('');

    if (process.platform === 'win32') {
      console.error('Please install jq on Windows using:');
      console.error('  • Chocolatey: choco install jq');
      console.error('  • Scoop: scoop install jq');
      console.error('  • Manual: Download from https://stedolan.github.io/jq/download/');
      console.error('  • WSL: wsl -e sudo apt-get install jq');
    } else {
      console.error('Please install jq using:');
      console.error('  • macOS: brew install jq');
      console.error('  • Ubuntu/Debian: sudo apt-get install jq');
      console.error('  • CentOS/RHEL: sudo yum install jq');
    }

    console.error('');
    console.error('Or specify a custom path with --jq-path=/path/to/jq');
    if (process.platform === 'win32') {
      console.error('Example: --jq-path="C:\\Program Files\\jq\\jq.exe"');
    }
    console.error('');
    console.error(`Detection error: ${error.message}`);
    process.exit(1);
  }
}

// Load JSON file utility function
async function loadJsonFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file: ${filePath} - ${error.message}`);
    }
    throw error;
  }
}

// Validate file path and existence async
async function validateFilePath(filePath) {
  if (!filePath) {
    throw new Error('File path is required');
  }

  if (!path.isAbsolute(filePath)) {
    throw new Error('File path must be absolute');
  }

  try {
    await fs.access(filePath);
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error('Path must point to a file');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File does not exist: ${filePath}`);
    }
    throw error;
  }

  return filePath;
}

// Create the MCP server
const server = new Server(
  {
    name: 'json-tools-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('Listing available tools');

  return {
    tools: [
      {
        name: 'query_json',
        description: 'Query JSON data using jq notation from a specified file path',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to the JSON file to query'
            },
            query: {
              type: 'string',
              description: 'jq query string (e.g., ".key", ".[0].name", ".[] | select(.status == \\"active\\")")'
            }
          },
          required: ['query'],
          additionalProperties: false
        }
      },
      {
        name: 'generate_json_schema',
        description: 'Generate a JSON schema from a JSON file',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to the JSON file to analyze'
            }
          },
          required: [],
          additionalProperties: false
        }
      },
      {
        name: 'validate_json_schema',
        description: 'Validate that a JSON schema is properly formed and valid',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'object',
              description: 'The JSON schema object to validate'
            },
            schemaFilePath: {
              type: 'string',
              description: 'Path to a JSON file containing the schema to validate'
            }
          },
          additionalProperties: false
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  log(`Tool called: ${name}`, args);

  try {
    switch (name) {
      case 'query_json': {
        const filePath = await validateFilePath(args.filePath || DEFAULT_FILE_PATH);
        const { query } = args;

        if (!query) {
          throw new Error('Query parameter is required');
        }

        log(`Querying JSON file: ${filePath} with query: ${query}`);

        try {
          // Load JSON data
          const jsonData = await loadJsonFile(filePath);
          log('JSON file loaded successfully');

          // Execute jq query using local binary
          const result = await jq.run(query, jsonData, JQ_CONFIG);
          log('jq query executed successfully');

          return {
            content: [
              {
                type: 'text',
                text: `Query result:\n${JSON.stringify(result, null, 2)}`
              }
            ]
          };
        } catch (jqError) {
          log('jq query error:', jqError.message);
          throw new Error(`jq query failed: ${jqError.message}`);
        }
      }

      case 'generate_json_schema': {
        const filePath = await validateFilePath(args.filePath || DEFAULT_FILE_PATH);

        log(`Generating schema for: ${filePath}`);

        try {
          // Load JSON data
          const jsonData = await loadJsonFile(filePath);
          log('JSON file loaded for schema generation');

          // Generate schema using genson
          const schema = createSchema(jsonData);
          log('Schema generated successfully');

          return {
            content: [
              {
                type: 'text',
                text: `Generated JSON Schema:\n${JSON.stringify(schema, null, 2)}`
              }
            ]
          };
        } catch (error) {
          log('Schema generation error:', error.message);
          throw new Error(`Schema generation failed: ${error.message}`);
        }
      }

      case 'validate_json_schema': {
        let schema;

        if (args.schema) {
          schema = args.schema;
          log('Using provided schema object');
        } else if (args.schemaFilePath) {
          const schemaPath = await validateFilePath(args.schemaFilePath);
          log(`Loading schema from file: ${schemaPath}`);
          schema = await loadJsonFile(schemaPath);
        } else {
          throw new Error('Either "schema" object or "schemaFilePath" must be provided');
        }

        log('Validating JSON schema');

        try {
          // Create AJV instance for validation
          const ajv = new Ajv({ strict: false });

          // Try to compile the schema - this validates it
          const validate = ajv.compile(schema);
          log('Schema validation successful');

          return {
            content: [
              {
                type: 'text',
                text: `✅ JSON Schema is valid!\n\nSchema summary:\n- Type: ${schema.type || 'not specified'}\n- Properties: ${schema.properties ? Object.keys(schema.properties).length : 'none'}\n- Required fields: ${schema.required ? schema.required.length : 0}\n\nFull validated schema:\n${JSON.stringify(schema, null, 2)}`
              }
            ]
          };
        } catch (validationError) {
          log('Schema validation error:', validationError.message);

          return {
            content: [
              {
                type: 'text',
                text: `❌ JSON Schema is invalid!\n\nError: ${validationError.message}\n\nProvided schema:\n${JSON.stringify(schema, null, 2)}`
              }
            ]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    log('Tool execution error:', error.message);

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  log('Starting JSON MCP Server...');
  log('Verbose mode:', VERBOSE);
  log('Default file path:', DEFAULT_FILE_PATH || 'not set');

  // Initialize jq with local binary
  await initializeJq();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Server connected and ready');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
