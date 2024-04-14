require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000
// const port = process.env.PORT

const host ='0.0.0.0';
const cors = require('cors'); // Importez le module cors

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/doc/swaggerConfig.js');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const mongoose = require("mongoose");

mongoose.connect(process.env.connnexionMONGO);

app.use(cors()); // Utilisez le middleware cors
 
app.use(express.urlencoded());
app.use(express.json());



const path = require('path');
// Définir le chemin du répertoire d'uploads
const uploadsDirectory = path.join(__dirname, './src/uploads');
// Définir une route pour servir les fichiers statiques dans le répertoire d'uploads
app.use('/uploads', express.static(uploadsDirectory));



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
