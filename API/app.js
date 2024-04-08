require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000
const host ='0.0.0.0';

const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./src/doc/swaggerConfig.js');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

   
const mongoose = require("mongoose");
  
mongoose.connect(process.env.connnexionMONGO);

app.use(express.urlencoded());
app.use(express.json());

const certificationRoutes = require('./src/routes/certificationRoutes.js');
app.use('/', certificationRoutes);

const skillCategoryRoutes = require('./src/routes/skillCategoryRoutes.js');
app.use('/', skillCategoryRoutes);

const skillRoutes = require('./src/routes/skillRoutes.js');
app.use('/', skillRoutes);

const projectRoutes = require('./src/routes/projectRoutes.js');
app.use('/', projectRoutes);

const experienceRoutes = require('./src/routes/experienceRoutes.js');
app.use('/', experienceRoutes);

const educationRoutes = require('./src/routes/educationRoutes.js');
app.use('/', educationRoutes);
 

app.listen(port,host);