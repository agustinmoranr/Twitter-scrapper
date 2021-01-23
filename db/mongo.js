require('dotenv').config()

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

async function connection(URL) {
  await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log('[DB] Conectada con exito'))
    .catch((err) => console.error('[DB]:', err));
}

module.exports = connection;