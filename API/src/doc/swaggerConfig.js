const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Portfolio creation API",
      version: "0.1.0",
      description:
        "This is an API application made for a portfolio",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Océane",
        email: "o.glaneux@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  // Specify the correct path to your YAML file
  apis: ['./src/doc/doc.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
