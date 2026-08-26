import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './db';
import { loginHandler, authMiddleware } from './auth/auth';
import { getLocusList } from './locus/locus';
import { openApiSpec } from './openapi';

const app = express();
app.use(express.json());

app.post('/auth/login', loginHandler);
app.get('/locus', authMiddleware, getLocusList);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

const port = Number(process.env.PORT) || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => console.log(`listening on ${port}`));
  })
  .catch((error) => {
    console.error('failed to connect to database', error);
    process.exit(1);
  });
