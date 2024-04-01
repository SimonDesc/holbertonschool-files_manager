import bodyParser from 'body-parser';

const express = require('express');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Importation des routes depuis routes/index.js
const routes = require('./routes/index');

const PORT = process.env.PORT || 5000;

// Utilisation des routes
app.use('/', routes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('APP disponible sur le port localhost', PORT);
});
