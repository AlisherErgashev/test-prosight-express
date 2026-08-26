export const openApiSpec = {
  openapi: '3.0.0',
  info: { title: 'RNAcentral Locus API (Express)', version: '1.0.0' },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Get a JWT for admin/normal/limited',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/locus': {
      get: {
        summary: 'List loci',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'query', schema: { type: 'string' } },
          { name: 'assemblyId', in: 'query', schema: { type: 'string' } },
          { name: 'regionId', in: 'query', schema: { type: 'string' } },
          { name: 'membershipStatus', in: 'query', schema: { type: 'string' } },
          { name: 'sideloading', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};
