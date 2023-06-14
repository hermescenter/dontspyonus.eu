---
title: 'Special page: pictures from ID'
type: "individual"
---

# Read [How does it works](/post/individual).

<script type="text/javascript" src="/js/group.js"></script>

<script>
  window.addEventListener('load', loadPhotos);

  const serverAPI = 
    window.location.hostname === 'localhost' ?
    'http://localhost:2023/api/individual' : '/api/individual';

  async function loadPhotos() {
    const ids = window.location.hash;
    const check = ids.split(',');
    if(check.length !== 3) {
        $("#target").html("<h3>Error, expected three IDs</h3>");
        return;
    }
    const resp = await fetch(`${serverAPI}/${ids.substr(1)}`);
    const mep = await resp.json()
    const htmli = produceHTML(mep);
    $("#target").html(htmli);

    await new Promise(resolve => setTimeout(resolve, 400));
    createCanvas(mep[0]);
    createCanvas(mep[1]);
    createCanvas(mep[2]);
  }
</script>
