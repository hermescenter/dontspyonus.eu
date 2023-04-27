#!node_modules/.bin/zx
import { fs, path } from 'zx';
import _ from 'lodash';
import { MongoClient } from 'mongodb';
import { parseHTML } from 'linkedom';

const jsource = path.join('addresses', 'IdList.json');
const ids = await fs.readJSON(jsource);


for (const id of ids) {

  const url = `https://www.europarl.europa.eu/meps/en/${id}`;
  const tmpo = path.join('addresses', 'outputs', `${id}.html`);

  if(fs.existsSync(tmpo)) {
    console.log(`File ${tmpo} exists, skipping`);
    continue;
  }

  await $`curl -o ${tmpo} -L ${url}`.quiet();
  console.log(`curl completed, output produced`);
  await $`ls -l ${tmpo}`;

  await $`sleep 1`.quiet();
}

const client = new MongoClient('mongodb://127.0.0.1:27017/faces');
await client.connect();

function antiSpam(stripz) {
  const replaced = stripz.replace(/\[at\]/, '@').replace(/\[dot\]/, '.');
  const straight = (_.reverse(_.split(replaced, ''))).join('');
  return straight;
}

for (const id of ids) {

  const sourcepage = path.join('addresses', 'outputs', `${id}.html`);
  const htmlpage = await fs.readFile(sourcepage, 'utf-8');

  const {
    window, document, customElements,
    HTMLElement,
    Event, CustomEvent
  } = parseHTML(htmlpage);

  const twitt = document.querySelector('a.link_twitt');
  const email = document.querySelector('a.link_email');

  const mep = await client.db()
    .collection('meps').findOne({ id });

  if(twitt)
    mep.twitter = twitt.getAttribute('href');

  if(email)
    mep.email = antiSpam(email.getAttribute('href'));

  await client.db()
    .collection('meps').deleteOne({id: mep.id});

  _.unset(mep, '_id');

  await client.db()
    .collection('meps').insertOne(mep);
}

await client.close();

console.log("Aquisition done!");
