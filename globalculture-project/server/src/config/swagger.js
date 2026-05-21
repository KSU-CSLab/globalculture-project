/**
 * config/swagger.js — Swagger / OpenAPI 3.0 설정
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '경성대학교 글로컬 컬쳐 허브 API',
      version: '1.0.0',
      description:
        '경성대학교와 글로컬 커뮤니티를 잇는 문화 교류 플랫폼의 REST API 문서입니다.',
      contact: {
        name: '팀원: 성현욱, 강동협, 김지우',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // JSDoc 주석으로부터 API 명세 자동 생성
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
