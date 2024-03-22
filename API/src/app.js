const express = require('express')
const app = express()
const port = 3000
const host ='0.0.0.0';

const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('../src/doc/swaggerConfig.js');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/portfolio');

app.use(express.urlencoded());
app.use(express.json());

const certificationRoutes = require('./routes/certificationRoutes');
app.use('/', certificationRoutes);

const skillCategoryRoutes = require('./routes/skillCategoryRoutes');
app.use('/', skillCategoryRoutes);

const skillRoutes = require('./routes/skillRoutes');
app.use('/', skillRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use('/', projectRoutes);

const experienceRoutes = require('./routes/experienceRoutes');
app.use('/', experienceRoutes);

const educationRoutes = require('./routes/educationRoutes');
app.use('/', educationRoutes);

app.listen(port,host);