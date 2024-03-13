const express = require('express')
const app = express()
const port = 3000
const host ='0.0.0.0';

const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swaggerConfig.js');
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

app.listen(port,host);