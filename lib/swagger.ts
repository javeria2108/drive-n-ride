import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Drive-N-Ride API Docs',
    version: '1.0.0',
    description: 'API documentation for the Drive-N-Ride project',
  },
  servers: [
    {
      url: 'https://drive-n-ride-pk2b.vercel.app',
    },
    {
      url: 'http://localhost:3000',
    },
  ],
}

const options = {
  swaggerDefinition,
  apis: ['./app/api/**/*.ts'], // Adjust this path based on your file structure
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
