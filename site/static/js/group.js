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

function loopOverFaces(faceStats, targetId) {
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

    const localimg = `/MEPs/pics/${mep.id}.jpg`;
    const rv = `<div id="mep--${mep.id}" class="image-item">
      <img class="contained-image" src="${localimg}" />
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