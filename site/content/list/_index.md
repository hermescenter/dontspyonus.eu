---
title: "Explore data available and pictures uploaded!"
---

<br>
<br>

### 1. You can access data via API

`curl https://stopspy.eu/api/details/Malta`

returns the metadata from the Maltise Memember of the Paliament.

### 2. Explore, stats by select a Member State 

<div id="sorts" class="button-group">
  <button class="button is-checked" data-sort-by="name">Alphabetic order</button>
  <!-- <button class="button" data-sort-by="symbol">🗣 Number of Parliament representatives</button> -->
  <button class="button" data-sort-by="number">📷 Number of Pictures associated</button>
</div>

<div class="grid" id="state-list-container"></div>

### 3. Select a Member of the Parliament or filter by Political party

<div class="table" id="state-mep-container"></div>

<script src="/js/isotope.pkgd.min.js"></script>

<script>

window.addEventListener('load', loadIsotope);

const serverAPI = 
  window.location.hostname === 'localhost' ?
  'http://localhost:2023/api' :
  'https://stopspy.eu/api';

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

  const response = await fetch(`${serverAPI}/stats`);
  /* record the result in a global variable */
  faceStats = await response.json();

  // <p class="number">Representatives: 23</p>
  const htmlblob = _.map(EUMS, function(flag, members) {
    const amounts = _.find(faceStats, { _id : members });
    console.log(amounts);
    const rv = `<div onclick="expandNation(${members})"
      id="${members}" class="element-item" photos=${amounts.counter}>
      <p class="name">${members}</p>
      <p class="symbol">${flag}</p>
      <p class="number">🗣 ${amounts.counter}</p>
      <p class="weight">📷 ${amounts.counter}</p>
    </div>`;
    return rv;
  });
  $("#state-list-container").html(htmlblob.join('\n'));

  // init Isotope
  var $grid = $('.grid').isotope({
    itemSelector: '.element-item',
    layoutMode: 'fitRows',
    getSortData: {
      name: '.name',
      number: '[photos] parseInt',
    }
  });

  // filter functions
  var filterFns = {
    // show if number is greater than 50
    numberGreaterThan50: function() {
      var number = $(this).find('.number').text();
      return parseInt( number, 10 ) > 50;
    },
    // show if name ends with -ium
    ium: function() {
      var name = $(this).find('.name').text();
      return name.match( /ium$/ );
    }
  };

  // bind filter button click
  $('#filters').on( 'click', 'button', function() {
    var filterValue = $( this ).attr('data-filter');
    // use filterFn if matches value
    filterValue = filterFns[ filterValue ] || filterValue;
    console.log({filterValue});
    $grid.isotope({ filter: filterValue });
  });

  // bind sort button click
  $('#sorts').on( 'click', 'button', function() {
    var sortByValue = $(this).attr('data-sort-by');
    console.log({sortByValue});
    $grid.isotope({ sortBy: sortByValue });
  });

  // change is-checked class on buttons
  $('.button-group').each( function( i, buttonGroup ) {
    var $buttonGroup = $( buttonGroup );
    $buttonGroup.on( 'click', 'button', function() {
      $buttonGroup.find('.is-checked').removeClass('is-checked');
      $( this ).addClass('is-checked');
    });
  });
}

async function expandNation(e) {

  const memberState = e.id;
  const response = await fetch(`${serverAPI}/details/${memberState}`);
  const faceStats = await response.json();

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
        <div class="mepname">Biometry says:</div>
        <div class="label">Gender</div>
        <div class="meprbi">${Math.round(100 * mep.facerec.genderProbability)}% ${mep.facerec.gender}</div>

        <div class="label">Age</div>
        <div class="meprbi">${Math.round(mep.facerec.age)} years</div>

        <div class="label">Emotion</div>
        ${emotions}

        <br />
      </div>
    </div>`;
    return rv;
  });
  $("#state-mep-container").html(htmlblob.join('\n'));
}

</script>