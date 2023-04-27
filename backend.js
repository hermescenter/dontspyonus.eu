#!/usr/bin/env node
/* this is a minimalistic, all inclusive, backend that implements basic APIs */
const express = require('express');
const cors = require('cors');
const _ = require('lodash');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;

async function MongoRead(filter) {
  const client = new MongoClient(`mongodb://127.0.0.1:27017/faces`);
  await client.connect();
  const retv = await client
    .db()
    .collection('meps')
    .find(filter)
    .toArray();
  await client.close();
  return retv;
}

async function mepStats() {
  const client = new MongoClient(`mongodb://127.0.0.1:27017/faces`);
  await client.connect();
  const retv = await client
    .db()
    .collection('meps')
    .aggregate([{
      '$group': {
        '_id': '$nation',
        'counter': {
         '$sum': 1
        }
      }
    }])
    .toArray();

  await client.close();
  return retv;
}

async function queryMEPs(filter) {
  const client = new MongoClient(`mongodb://127.0.0.1:27017/faces`);
  await client.connect();
  const retv = await client
    .db()
    .collection('meps')
    .aggregate([
      { $match: filter },
      { $lookup: {
        from: 'analysis',
        localField: 'id',
        foreignField: 'id',
        as: 'facerec',
      }}
    ])
    .toArray();
  await client.close();
  return retv;
}


const app = express();
const PORT = 2023; // the year of AIAct
app.listen(PORT, () => {
  console.log(`Binded sucessfully port ${PORT}`);
});

app.get('/api/meps/:filter?', cors(), async function(req, res) {
  let filter = {};
  try {
    filter = JSON.parse(req.params.filter);
  } catch(error) {
    if(req.params?.filter && req.params.filter.length > 1) {
      console.log(`Unable to extract a valid filter: ${error.message}`);
    }
  }

  const data = await MongoRead(filter);
  console.log(`→ MEPs API fetched ${data.length} with filter ${JSON.stringify(filter)}, returns ${JSON.stringify(_.countBy(data, 'nation'))}`);
  res.json(data);
});

app.get('/api/stats', cors(), async function(req, res) {
  try {
    const rv = await mepStats();
    res.json(rv);
  } catch(error) {
    console.log(`Stats error: ${error.message}`);
    res.json({ error: true, message: error.message });
  }
});

app.get('/api/details/:memberState', cors(), async function(req, res) {
  try {
    const ms = req.params.memberState;
    const rv = await queryMEPs({ nation: ms });

    const fixed = _.map(rv, function(mep) {
      const o = _.omit(mep, ['_id' ]);
      o.facerec = _.omit(_.first(mep.facerec), ['_id', 'id']);
      o.facerec.expressions = _.reduce(o.facerec.expressions, function(memo, val, emo) {
        const effective = _.round(val * 100, 1);
        if(effective < 1)
          return memo;

        memo.push({
          emotion: emo,
          value: effective
        })
        return memo;
      }, []);
      return o;
    });

    res.json(fixed);
  } catch(error) {
    console.log(`Details for ${req.params.memberState} error: ${error.message}`);
    res.json({ error: true, message: error.message });
  }
});

app.get('/', cors(), function(req, res) {
  const implemented = [
    "/api/meps/:filter?", "/api/homepage", "/api/stats", "/api/details/:memberState" ];
  res.status(200);
  res.send(`
    <code>dontspy.eu</code><hr/>
    <h3>Implemented APIs</h3>
    <pre>
${implemented.join("\n\r")}
    </pre>`
  );
});

app.get('/api/homepage', cors(), async function(req, res) {
  /* at the moment homepage returns random */
  try {
    const amount = 40;
    const retv = await queryMEPs({});

    const random40 = _.times(amount, function(i) {
      const o = _.omit( _.sample(retv), ['_id', 'urlimg']);
      o.facerec = _.omit(_.first(o.facerec), ['_id', 'id']);
      return o;
    });

    console.log(`Homepage API returning a random sample of ${random40.length}`);
    res.json(_.chunk(random40, 4));
  } catch(error) {
    res.status(500);
    console.log(`Error: ${error.message}`);
    res.json({
      error: true,
      message: error.message
    })
  }
});
