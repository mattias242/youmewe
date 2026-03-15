'use strict';

const { createDb } = require('./db');
const { createApp } = require('./app');
const { seed } = require('./seed');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './youmewe.db';

const db = createDb(DB_PATH);
seed(db);
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`YouMeWe API listening on port ${PORT}`);
});
