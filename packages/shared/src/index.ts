import { z } from 'zod';

export const healthResponseSchema = z
  .object({
    status: z.literal('ok'),
    service: z.literal('api'),
  })
  .meta({ ref: 'HealthResponse' });

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const createExampleRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(80).meta({ example: 'My example' }),
  })
  .meta({ ref: 'CreateExampleRequest' });

export const exampleResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    createdAt: z.iso.datetime(),
  })
  .meta({ ref: 'ExampleResponse' });

export const exampleListResponseSchema = z
  .array(exampleResponseSchema)
  .meta({ ref: 'ExampleListResponse' });

export type CreateExampleRequest = z.infer<typeof createExampleRequestSchema>;
export type ExampleResponse = z.infer<typeof exampleResponseSchema>;
