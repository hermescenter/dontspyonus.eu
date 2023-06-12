/* this library is used to display the MEPs of a specific 
 * political group, at the moment there is hardcoded the 
 * group name, but it can become flexible. the entry 
 * point is the function `rendermeps` 
 * 
 * It is a repurposing of the open data face JS*/

const routeWithString = `api/group/Group of the European People\'s Party (Christian Democrats)`;

/* this function calls the `squared` api that ensure pictures of the same 
 * shape, wheres is easier to depict squares over them */
async function rendermeps() {
  const server =
    window.location.hostname === 'localhost' ?
      `http://localhost:2023/${routeWithString}` : `/${routeWithString}`;
  let mepdata = null;
  try {
    const response = await fetch(server);
    mepdata = await response.json();

    if (!mepdata)
      throw new Error("Not received expected data");

    if (mepdata.error)
      throw new Error(mepdata.message);

  } catch (error) {
    console.log(`Error with server ${server}`);
    const m = `Unable to retrieve faces: ${error.message}`;
    $("#only--you").text(`Error: ${m}`);
    return;
  }

  loopOverFaces(mepdata, '#only--you');

}

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

function loopOverFaces(faceStats, targetId) {
  const htmlblob = _.map(faceStats, function (mep, n) {
    /* 
    TLC: "BG"
    email: "andrey.kovatchev@europarl.europa.eu"
    facerec: Object { fname: "97968.jpg", gender: "male", genderProbability: 0.9898331165313721, … }
    group: "Group of the European People's Party (Christian Democrats)"
    id: "97968"
    name: "Andrey KOVATCHEV"
    nation: "Bulgaria"
    party: "Citizens for European Development of Bulgaria"
    twitter: "http://twitter.com/andreykovatchev"
    urlimg: "https://www.europarl.europa.eu/mepphoto/97968.jpg" */

    const emotions = _.map(mep.facerec.expressions, function (inf) {
      return `<div class="meprbi">${inf.emotion} ${inf.value}%</div>`;
    }).join('\n');

    const twitterSlot = mep.twitter ? `
      <div class="label">Twitter:</div>
      <div class="twitter-handle">
        <a href="${mep.twitter}" target="_blank">${mep.twitter.replace(/http.*twitter.com./, '@')}</a>
      </div>
    ` : '';

    const localimg = `/MEPs/pics/${mep.id}.jpg`;
    const rv = `<div id="mep--${mep.id}" class="image-item">
      <img class="contained-image" src="${localimg}" />
      <div class="contained-info">
        <div class="mepname">${EUMS[mep.nation]} ${mep.name}</div>
        <div class="mepinfo">${mep.party}</div>

        <hr />
        <div class="biometry">Biometry says:</div>
        <div class="label">Gender:</div>
        <div class="mep-attributions">
          ${Math.round(100 * mep.facerec.genderProbability)}% ${mep.facerec.gender}
        </div>

        <div class="label">Age:</div>
        <div class="mep-attributions">${Math.round(mep.facerec.age)} years</div>

        ${twitterSlot}

        <div class="label">Emotions:</div>
        ${emotions}

        <br />
      </div>
    </div>`;
    return rv;
  });
  $(targetId).html(htmlblob.join('\n'));
}

function produceHTML(mepdata) {
  console.log(mepdata);

  const rv = `<div class="picture-block">
  <table class="main--table">
  <tr>

  <td class="table--data">
        <div class="mep--name">${EUMS[mepdata[0].nation]}<br> ${mepdata[0].name}</div>
  </td>
  <td class="table--data">
        <div class="mep--name">${EUMS[mepdata[1].nation]}<br> ${mepdata[1].name}</div>
  </td>
  <td class="table--data">
        <div class="mep--name">${EUMS[mepdata[2].nation]}<br> ${mepdata[2].name}</div>
  </td> 
  </tr>

  <tr>
  <td class="table--data">
      <img class="contained-image" src="/MEPs/pics/${mepdata[0].id}.jpg">
  </td>
  <td class="table--data">
      <img class="contained-image" src="/MEPs/pics/${mepdata[1].id}.jpg">
  </td>
  <td class="table--data">
      <img class="contained-image" src="/MEPs/pics/${mepdata[2].id}.jpg">
  </td> 
  </tr>

  <tr>
  <td class="table--data">


        <div class="party--name">${mepdata[0].party}</div>
        <small class="group--name">${mepdata[0].group}</small>
        </td>
  <td class="table--data">
        <div class="party--name">${mepdata[1].party}</div>
        <small class="group--name">${mepdata[1].group}</small>
        </td>
  <td class="table--data">
        <div class="party--name">${mepdata[2].party}</div>  
        <small class="group--name">${mepdata[2].group}</small>
        </td>
  </tr>

 </table> 
      </div>`
  return rv;
}