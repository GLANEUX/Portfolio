require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000
const host ='0.0.0.0';

const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./doc/swaggerConfig.js');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

   
const mongoose = require("mongoose");
  
console.log(process.env.connnexionMONGO)
mongoose.connect(process.env.connnexionMONGO);

app.use(express.urlencoded());
app.use(express.json());

const certificationRoutes = require('./routes/certificationRoutes.js');
app.use('/', certificationRoutes);

const skillCategoryRoutes = require('./routes/skillCategoryRoutes.js');
app.use('/', skillCategoryRoutes);

const skillRoutes = require('./routes/skillRoutes.js');
app.use('/', skillRoutes);

const projectRoutes = require('./routes/projectRoutes.js');
app.use('/', projectRoutes);

const experienceRoutes = require('./routes/experienceRoutes.js');
app.use('/', experienceRoutes);

const educationRoutes = require('./routes/educationRoutes.js');
app.use('/', educationRoutes);

app.listen(port,host);