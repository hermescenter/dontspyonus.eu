---
title: "Explore data available"
subtitle: "And pull via API the data for further exploration"
---

<br>
<br>

## You can access data via API

<pre>
curl https://dontspyonus.eu/api/details/Malta
</pre>

You can use any country name, it returns the metadata from the representatives:

<pre>
id:       "197403"
name:     "Alex AGIUS SALIBA"
urlimg:   "https://www.europarl.europa.eu/mepphoto/197403.jpg"
group:    "Group of the Progressive Alliance of Socialists and Democrats in the European Parliament"
nation:   "Malta"
TLC:      "MT"
party:    "Partit Laburista"
email:    "alex.agiussaliba@europarl.europa.eu"
facerec:
  gender              "male"
  genderProbability   0.9735493063926697
  age                 32.59959030151367
  expressions	
    emotion           "happy"
    value             100
</pre>

<br />

## Explore by Member State 

<div id="member-states"></div>

<script>

window.addEventListener('load', loadIsotope);

const serverAPI = 
  window.location.hostname === 'localhost' ?
  'http://localhost:2023/api' : '/api';

let faceStats = null;

async function loadIsotope() {

  const EUMS = {
    'Austria': "🇦🇹",
    'Belgium': "🇧🇪",
    'Bulgaria': "🇧🇬",
    'Croatia': "🇭🇷",
    'Cyprus': "🇨🇾",
    'Czechia': "🇨🇿",
    'Denmark': "🇩🇰",
    'Estonia': "🇪🇪",
    'Finland': "🇫🇮",
    'France': "🇫🇷",
    'Germany': "🇩🇪",
    'Greece': "🇬🇷",
    'Hungary': "🇭🇺",
    'Ireland': "🇮🇪",
    'Italy': "🇮🇹",
    'Latvia': "🇱🇻",
    'Lithuania': "🇱🇹",
    'Luxembourg': "🇱🇺",
    'Malta': "🇲🇹",
    'Netherlands': "🇳🇱",
    'Poland': "🇵🇱",
    'Portugal': "🇵🇹",
    'Romania': "🇷🇴",
    'Slovakia': "🇸🇰",
    'Slovenia': "🇸🇮",
    'Spain': "🇪🇸",
    'Sweden': "🇸🇪"
  };

  let inj = "";
  _.each(EUMS, (emoji, ms) => {
    inj += `<p class="state--name">
      <span id="${ms}" class="emoji">${emoji}</span>
      <a class="clickable-state" href="#${ms}" onclick="expandNation(${ms})">${ms}</a>
      <div class="list-of-meps" id="state-mep-container-${ms}"></div>
    </p>`;
  });
  $("#member-states").html(inj);
}

async function expandNation(e) {

  const memberState = e.id;
  const response = await fetch(`${serverAPI}/details/${memberState}`);
  const faceStats = await response.json();

  const targetId = `#state-mep-container-${memberState}`;

  const htmlblob = _.map(faceStats, function(mep, n) {
    /* TLC: "DE"
       group : "Identity and Democracy Group"
       id : "197475"
       name : "Christine ANDERSON"
       nation : "Germany"
       party : "Alternative für Deutschland"
       urlimg : "https://www.europarl.europa.eu/mepphoto/197475.jpg" */

    const emotions = _.map(mep.facerec.expressions, function(inf) {
      return `<div class="meprbi">${inf.emotion} ${inf.value}%</div>`;
    }).join('\n');

    const rv = `<div id="mep--${mep.id}" class="image-item">
      <img class="contained-image" src="${mep.urlimg}" />
      <div class="contained-info">
        <div class="mepname">${mep.name}</div>
        <div class="mepinfo">${mep.party}</div>

        <hr />
        <div class="biometry">Biometry says:</div>
        <div class="label">Gender:</div>
        <div class="mep-attributions">
          ${Math.round(100 * mep.facerec.genderProbability)}% ${mep.facerec.gender}
        </div>

        <div class="label">Age:</div>
        <div class="mep-attributions">${Math.round(mep.facerec.age)} years</div>

        <div class="label">Emotions:</div>
        ${emotions}

        <br />
      </div>
    </div>`;
    return rv;
  });
  $(targetId).html(htmlblob.join('\n'));
}

</script>
