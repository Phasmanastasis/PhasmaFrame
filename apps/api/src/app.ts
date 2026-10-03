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
import type { PrismaClient } from '@prisma/client';

export interface CreateAppOptions {
  /** Prisma client to use for this app instance (Node singleton or per-request D1 client). */
  prisma: PrismaClient;
  /** CORS allow-origin for /api/*. Defaults to the local web dev origin. */
  webOrigin?: string;
  /** When true, expose /openapi.json and /docs. Off in production. */
  exposeDocs?: boolean;
}

/**
 * Build the API as a Hono app. Shared by the Node server (src/index.ts) and the
 * Cloudflare Worker (src/worker.ts) so the routes stay identical across both targets.
 */
export function createApp({ prisma, webOrigin, exposeDocs = false }: CreateAppOptions): Hono {
  const app = new Hono();

  app.use('/api/*', cors({ origin: webOrigin ?? 'http://localhost:4321' }));

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
  if (exposeDocs) {
    app.get(
      '/openapi.json',
      openAPIRouteHandler(app, {
        documentation: {
          info: {
            title: 'App API',
            version: '1.0.0',
            description: 'OpenAPI documentation for the app API.',
          },
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

  return app;
}
