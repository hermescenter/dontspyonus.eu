#!/usr/bin/env node
/* this is a minimalistic, all inclusive, backend that implements basic APIs */
const express = require('express');
const cors = require('cors');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

async function MongoRead(filter) {
  const client = new MongoClient(`mongodb://127.0.0.1:27017/faces`);
  await client.connect();
  const retv = await client.db()
    .collection('meps')
    .find(filter)
    .toArray();
  await client.close();
  return retv;
}

const app = express();
const PORT = 1099; // a random number to connect via 'http'
app.listen(PORT, () => {
  console.log(`Binded sucessfully port ${PORT}`);
});

app.use(express.static('recognizer'))

app.use('/dist', express.static(path.join(
'node_modules','@vladmandic','face-api', 'dist')))

app.use('/model', express.static(path.join(
'node_modules','@vladmandic','face-api', 'model')))
