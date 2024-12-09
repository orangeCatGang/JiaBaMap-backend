const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'JiabaMap Backend API',
    description: 'This is the API document of JiabaMap API which conforms to OpenAPI and rendered by Swagger UI.'
  },

  // Dev
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

swaggerAutogen(outputFile, routes, doc);