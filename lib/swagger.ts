import swaggerJSDoc from 'swagger-jsdoc'

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drive-N-Ride API',
      version: '1.0.0',
      description: 'API documentation for Drive-N-Ride app',
    },
    servers: [
      {
        url: 'https://drive-n-ride-pk2b.vercel.app/api',
      },
    ],
  },
  apis: ['./app/api/**/*.ts'], // path to your route files with JSDoc
})
