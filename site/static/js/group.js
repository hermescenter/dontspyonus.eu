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
  // this is the function used in the `individual` API
  console.log(mepdata);

  const rv = `
  <table class="main--table">
    <tr>
      <td class="table--data">
        <div class="mep--name">${mepdata[0].name}</div>
      </td>
      <td class="table--data">
        <div class="mep--name">${mepdata[1].name}</div>
      </td>
      <td class="table--data">
        <div class="mep--name">${mepdata[2].name}</div>
      </td> 
    </tr>
    
    <tr>
      <td class="table--data">
        <img class="contained-image" id="mep--${mepdata[0].id}" src="/MEPs/pics/${mepdata[0].id}.jpg">
      </td>
      <td class="table--data">
        <img class="contained-image" id="mep--${mepdata[1].id}" src="/MEPs/pics/${mepdata[1].id}.jpg">
      </td>
      <td class="table--data">
        <img class="contained-image" id="mep--${mepdata[2].id}" src="/MEPs/pics/${mepdata[2].id}.jpg">
      </td> 
    </tr>

    <tr>
      <td class="table--data">
        <br /> 
        <div class="party--name">${EUMS[mepdata[0].nation]} ${mepdata[0].party}</div>
        <small><br></small>
        <small class="group--name">${mepdata[0].group}</small>
      </td>
      <td class="table--data">
        <br /> 
        <div class="party--name">${EUMS[mepdata[1].nation]} ${mepdata[1].party}</div>
        <small><br></small>
        <small class="group--name">${mepdata[1].group}</small>
      </td>
      <td class="table--data">
        <br /> 
        <div class="party--name">${EUMS[mepdata[2].nation]} ${mepdata[2].party}</div>  
        <small><br></small>
        <small class="group--name">${mepdata[2].group}</small>
      </td>
    </tr>
  </table>
  <div>
    <div class="footer--container">
      <img class="smaller--image" src="/logo/4.png" />
    </div>
    <div class="mep--name footer--container">
      <span class="colorful">
        BAN THE FACE BIOMETRY IN THE AIAct 
      </span> 👁️ dontspyonus.eu
    </div>
  </div>
  `;

  return rv;
}

function createCanvas(o) {
  const canvas = document.createElement('canvas');
  const targetSpan = document.getElementById(`mep--${o.id}`);
  const rectang = targetSpan.getBoundingClientRect();

  canvas.width = targetSpan.width;
  canvas.height = targetSpan.height;

  /*align the canvas over the image*/
  canvas.style.position = 'absolute';

  canvas.style.top = (targetSpan.offsetTop + rectang.top) + 'px';
  canvas.style.left = (targetSpan.offsetLeft + rectang.x - 20) + 'px';

  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FF4747';
  ctx.fillStyle = '#FF4747';

  console.log(o.facerec);
  const text1 = `${Math.round(100 * o.facerec.genderProbability)}% ${o.facerec.gender}`;
  addText(text1, ctx, 0, 0);

  const text2 = `${Math.round(o.facerec.age)} years`;
  addText(text2, ctx, 0, 45);

  const text3 = `${o.facerec.expression[0]} ${Math.round(100 * o.facerec.expression[1])}%`;
  addText(text3, ctx, 0, 90);

  targetSpan.parentNode.appendChild(canvas);
}

function addText(textString, ctx, x, y) {
  // all hail to stackoverflow
  // https://stackoverflow.com/questions/18900117/write-text-on-canvas-with-background
  ctx.save();
  /// draw text from top - makes life easier at the moment
  ctx.textBaseline = 'top';
  ctx.font = '14px sans-serif';
  /// color for background
  ctx.fillStyle = '#ffffffaa';
  /// get width of text
  const width = ctx.measureText(textString).width;
  /// draw background rect assuming height of font
  ctx.fillRect(x + 1, y + 1 , width + 4, 14);
  /// text color
  ctx.fillStyle = '#000000';
  /// draw text on top, with a space in front
  ctx.fillText(` ${textString}`, x, y + 2);
  /// restore original state
  ctx.restore();
}
