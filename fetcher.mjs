#!node_modules/.bin/zx
import { argv, fs, path, sleep } from 'zx';
import _ from 'lodash';
import { spawn } from 'child_process';
import { parseHTML } from 'linkedom';


const listwlcc = [
  "BE", "BG", "CZ", "DK", "DE", "EE", "IE",
  "GR", "ES", "FR", "HR", "IT", "CY", "LV",
  "LT", "LU", "HU", "MT", "NL", "AT", "PL",
  "PT", "RO", "SI", "SK", "FI", "SE"
];

for (const TLC of listwlcc) {

  const url = `https://www.europarl.europa.eu/meps/en/search/advanced?name=&euPoliticalGroupBodyRefNum=&countryCode=${TLC}&bodyType=ALL`;
  console.log(url);

  const destpath = path.join('MEPs', `${TLC}.html`);
  if(fs.existsSync(destpath)) {
    console.log(`File ${destpath} exists, skipping`);
    continue;
  }

  console.log(`Fetching via CURL ${url}`);
  await spawn("curl", [
    "-o",
    destpath,
    url
  ]);
}

for (const TLC of listwlcc) {

  const sourcepage = path.join('MEPs', `${TLC}.html`);
  const pplsdir = path.join('MEPs', `ppls-${TLC}`);
  const pplsdirjson = path.join('MEPs', `ppls-${TLC}.json`);
  fs.ensureDir(pplsdir);

  const htmlpage = await fs.readFile(sourcepage, 'utf-8');

  const {
    window, document, customElements,
    HTMLElement,
    Event, CustomEvent
  } = parseHTML(htmlpage);

  const y = document.querySelectorAll('.erpl_member-list-item');

  const mepdets = _.map(y, function(a) {

    const name = a.querySelector(".erpl_title-h4").textContent;
    const urlimg = a.querySelector('img[loading="lazy"]').getAttribute('src');
    const infos = a.querySelectorAll(".sln-additional-info");

    if(infos.length !== 3) {
      console.log(`Odd: ${infos.length} size`);
      process.exit(1);
    }

    const mep = {
      name,
      urlimg,
      group: infos[0].textContent,
      nation: infos[1].textContent,
      TLC,
      party: infos[2].textContent
    }
    return mep;
  });

  fs.writeFileSync(pplsdirjson, JSON.stringify(mepdets, null, 2), 'utf-8');
  console.log(`Saved ${mepdets.length} MEPs info in ${pplsdirjson}`);
}
