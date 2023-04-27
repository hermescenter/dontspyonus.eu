#!node_modules/.bin/zx
import { fs, path } from 'zx';
import _ from 'lodash';
import { MongoClient } from 'mongodb';


const listwlcc = [
  "BE", "BG", "CZ", "DK", "DE", "EE", "IE",
  "GR", "ES", "FR", "HR", "IT", "CY", "LV",
  "LT", "LU", "HU", "MT", "NL", "AT", "PL",
  "PT", "RO", "SI", "SK", "FI", "SE"
];

const root = path.join("site", "static", "MEPs");

const client = new MongoClient('mongodb://127.0.0.1:27017/faces');
await client.connect();

for (const TLC of listwlcc) {

  const srcjson = path.join(root, `ppls-${TLC}.json`);
  const ppls = await fs.readJSON(srcjson);
  console.log(`Adding ${ppls.length}, for country ${TLC}`);
  const mepobjs = _.map(ppls, function(mep) {
    let chunks = mep.urlimg.split('/');
    let id = chunks.pop();
    id = id.replace(/\.jpg/, '');
    return {
      id,
      ...mep
    };
  });

  await client.db()
    .collection('meps').insertMany(mepobjs);

}

await client.close();

console.log("Aquisition done!");
