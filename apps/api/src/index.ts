import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';
import {
  describeRoute,
  openAPIRouteHandler,
  resolver,
  validator,
} from 'hono-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import {
  createExampleRequestSchema,
  exampleListResponseSchema,
  exampleResponseSchema,
  healthResponseSchema,
  type HealthResponse,
  type ExampleResponse,
} from '@app/shared';
import { prisma } from './db.js';

const app = new Hono();
const port = Number(process.env.PORT ?? 3000);
const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';

app.use('/api/*', cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:4321' }));

app.get(
  '/api/health',
  describeRoute({
    tags: ['System'],
    summary: 'Health check',
    description: 'Returns the current status of the API service.',
    responses: {
      200: {
        description: 'Service is healthy',
        content: {
          'application/json': { schema: resolver(healthResponseSchema) },
        },
      },
    },
  }),
  (c) => {
    const response: HealthResponse = { status: 'ok', service: 'api' };
    return c.json(healthResponseSchema.parse(response));
  },
);

app.get(
  '/api/examples',
  describeRoute({
    tags: ['Examples'],
    summary: 'List examples',
    description: 'Returns all examples ordered by newest first.',
    responses: {
      200: {
        description: 'A list of examples',
        content: {
          'application/json': { schema: resolver(exampleListResponseSchema) },
        },
      },
    },
  }),
  async (c) => {
    const rows = await prisma.example.findMany({ orderBy: { createdAt: 'desc' } });
    const examples: ExampleResponse[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
    }));
    return c.json(examples);
  },
);

app.post(
  '/api/examples',
  describeRoute({
    tags: ['Examples'],
    summary: 'Create an example',
    description: 'Creates a new example record.',
    responses: {
      201: {
        description: 'The created example',
        content: {
          'application/json': { schema: resolver(exampleResponseSchema) },
        },
      },
    },
  }),
  validator('json', createExampleRequestSchema),
  async (c) => {
    const input = c.req.valid('json');
    const row = await prisma.example.create({ data: input });
    const example: ExampleResponse = {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
    };
    return c.json(example, 201);
  },
);

// API documentation — only exposed outside production.
if (isDev) {
  app.get(
    '/openapi.json',
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: 'App API',
          version: '1.0.0',
          description: 'OpenAPI documentation for the app API.',
        },
        servers: [{ url: `http://localhost:${port}`, description: 'Local development' }],
      },
    }),
  );

  app.get(
    '/docs',
    Scalar({
      theme: 'saturn',
      url: '/openapi.json',
      pageTitle: 'App API Reference',
    }),
  );
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
  if (isDev) {
    console.log(`API docs available on http://localhost:${info.port}/docs`);
  }
});
