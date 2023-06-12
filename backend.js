#!/usr/bin/env node
/* this is a minimalistic, all inclusive, backend that implements basic APIs */
const express = require('express');
const cors = require('cors');
const _ = require('lodash');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;

const mongoServer = `mongodb://127.0.0.1:27017/faces`;

async function MongoRead(filter) {
  const client = new MongoClient(mongoServer);
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
  const client = new MongoClient(mongoServer);
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
  const client = new MongoClient(mongoServer);
  await client.connect();
  const retv = await client
    .db()
    .collection('meps')
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'analysis',
          localField: 'id',
          foreignField: 'id',
          as: 'facerec',
        }
      }
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

app.get('/api/meps/:filter?', cors(), async function (req, res) {
  let filter = {};
  try {
    filter = JSON.parse(req.params.filter);
  } catch (error) {
    if (req.params?.filter && req.params.filter.length > 1) {
      console.log(`Unable to extract a valid filter: ${error.message}`);
    }
  }

  const data = await MongoRead(filter);
  console.log(`→ MEPs API fetched ${data.length} with filter ${JSON.stringify(filter)}, returns ${JSON.stringify(_.countBy(data, 'nation'))}`);
  res.json(data);
});

app.get('/api/stats', cors(), async function (req, res) {
  try {
    const rv = await mepStats();
    res.json(rv);
  } catch (error) {
    console.log(`Stats error: ${error.message}`);
    res.json({ error: true, message: error.message });
  }
});

app.get('/api/details/:memberState', cors(), async function (req, res) {
  try {
    const ms = req.params.memberState;
    const rv = await queryMEPs({ nation: ms });

    const fixed = _.map(rv, function (mep) {
      const o = _.omit(mep, ['_id']);
      o.facerec = _.omit(_.first(mep.facerec), ['_id', 'id']);
      o.facerec.expressions = _.reduce(o.facerec.expressions, function (memo, val, emo) {
        const effective = _.round(val * 100, 1);
        if (effective < 1)
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
  } catch (error) {
    console.log(`Details for ${req.params.memberState} error: ${error.message}`);
    res.json({ error: true, message: error.message });
  }
});

app.get('/api', cors(), function (req, res) {
  const implemented = [
    "/api/meps/:filter?", "/api/homepage", "/api/squared",
    "/api/stats", "/api/details/:memberState", "/api/emotional",
    "/api/individual/:id", "/api/group/:name"];
  res.status(200);
  res.send(`
    <code>dontspyonus.eu</code><hr/>
    <h3>Implemented APIs</h3>
    <pre>
${implemented.join("\n\r")}
    </pre>`
  );
});

app.get('/api/group/:name', cors(), async (req, res) => {
  /* acquire from req.params.name the name which is URL encoded
   * and should be decoded in the variable 'name' */
  const name = decodeURIComponent(req.params.name);
  console.log(`Group API called with ${name}`);
  const data = await queryMEPs({ group: name });

  if(!data.length)
    throw new Error(`Unable to find group ${name}`);

  const ready = _.map(data, function (mep) {
    const o = _.omit(mep, ['_id']);
    o.facerec = _.omit(_.first(mep.facerec), ['_id', 'id']);
    o.facerec.expressions = _.reduce(o.facerec.expressions, function (memo, val, emo) {
      const effective = _.round(val * 100, 1);
      if (effective < 1)
        return memo;

      memo.push({
        emotion: emo,
        value: effective
      })
      return memo;
    }, []);
    return o;
  });

  const ordered = _.reverse(_.sortBy(ready, function (mep) {
    return mep.facerec.expressions.length
  }))

  console.log(`Group API returning ${ready.length}`);
  res.status(200);
  res.json(ordered);
})

app.get('/api/emotionals', cors(), async (req, res) => {
  try {
    const data = await queryMEPs({});
    /* neutral, happy, sad, angry,
       fearful, disgusted, surprised */

    const structure = {
      sad: [],
      angry: [],
      fearful: [],
      disgusted: [],
      surprised: []
    };
    /* in the retval we ignore the first two emotions */

    const emotionals = _.reduce(data, (memo, mep) => {
      if (!mep.facerec.length)
        return memo;

      const considered = _.keys(structure);
      _.each(considered, function (emotion) {
        const value = _.round(mep.facerec[0].expressions[emotion] * 100, 1);
        if (value > 10)
          memo[emotion].push({
            id: mep.id,
            name: mep.name,
            nation: mep.nation,
            value
          })
      })
      return memo;
    }, structure);

    console.log(`Returning the emotion list`);
    res.json(emotionals);

  } catch (error) {
    res.status(500);
    console.log(`Error: ${error.message}`);
    res.json({
      error: true,
      message: error.message
    })
  }
});

app.get('/api/list', cors(), async (req, res) => {
  /* pick all the MEPs and return them in a CSV format,
   * with the following fields:
   * id, name, nation, group, party, twitter */
  const flist = ['id', 'name', 'nation', 'group', 'party', 'twitter'];
  try {
    const data = await queryMEPs({});
    const selected = _.map(data, function (mep) {
      return _.pick(mep, flist);
    });
    const textual = _.reduce(selected, function (memo, mep) {
      memo.push(_.values(mep).join(","));
      return memo;
    }, [ flist.join(",") ] );

    console.log(`List API returning ${textual.length}`);
    res.status(200);
    /* set the header to make the CSV download with name 'list.csv' */
    res.header('Content-Disposition', 'attachment; filename="list.csv"');
    res.header('Content-Type', 'text/plain');
    res.send(textual.join("\n"));
  }
  catch (error) {
    res.status(500);
    console.log(`Error: ${error.message}`);
    res.json({
      error: true,
      message: error.message
    });
  }
});

app.get('/api/individual/:idList', cors(), async (req, res) => {
  /* pick up the MEP by id and transform the data in the same
   * format as we do for the group API */
  try {
    const ids = req.params.idList.split(',');
    const data = await queryMEPs({ id: { "$in": ids } });
    if (!data.length)
      throw new Error(`Unable to find MEP with id ${req.params.idList}`);

    const ready = _.map(data, function (mep) {
      const o = _.omit(mep, ['_id']);
      o.facerec = _.omit(_.first(mep.facerec), ['_id', 'id']);
      o.facerec.expressions = _.reduce(o.facerec.expressions, function (memo, val, emo) {
        const effective = _.round(val * 100, 1);
        if (effective < 1)
          return memo;

        memo.push({
          emotion: emo,
          value: effective
        })
        return memo;
      }, []);
      return o;
    });

    console.log(`Individual API returning ${ready.length} meps`);
    res.status(200);
    res.json(ready);
  } catch(error) {
    res.status(500);
    console.log(`Error: ${error.message}`);
    res.json({
      error: true,
      message: error.message
    });
  }
});

app.get('/api/squared', cors(), async function (req, res) {
  try {
    const data = await queryMEPs({});
    const ready = _.compact(_.map(data, function (mep) {

      // console.log(mep?.facerec[0]?.box);
      if (typeof mep?.facerec[0]?.box !== typeof [])
        return null;
      if (mep.facerec[0].box[0] > 30)
        return null;

      const o = _.omit(mep, ['_id', 'urlimg']);
      o.facerec = _.omit(_.first(o.facerec), ['_id', 'id']);
      return o;
    }));

    console.log(`Squared API returning ${ready.length}`);
    res.json(ready);

  } catch (error) {
    res.status(500);
    console.log(`Squared API error: ${error.message}`);
    res.json({
      error: true,
      message: error.message
    })
  }
});

app.get('/api/homepage', cors(), async function (req, res) {
  /* at the moment homepage returns random */
  try {
    const amount = 40;
    const retv = await queryMEPs({});

    const random40 = _.times(amount, function (i) {
      const o = _.omit(_.sample(retv), ['_id', 'urlimg']);
      o.facerec = _.omit(_.first(o.facerec), ['_id', 'id']);
      return o;
    });

    console.log(`Homepage API returning a random sample of ${random40.length}`);
    res.json(_.chunk(random40, 4));
  } catch (error) {
    res.status(500);
    console.log(`Homepage API error: ${error.message}`);
    res.json({
      error: true,
      message: error.message
    })
  }
});
