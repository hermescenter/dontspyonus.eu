---
title: 'Special page: pictures from ID'
type: "individual"
---

How does it works? by picking one of the ID from [this CSV](https://dontspyonus.eu/api/list), you can compose an URL like `https://dontspyonus.eu/individual#124973,124936` it would produce a picture composed by the two faces. [EXAMPLE](/individual#124973,124936,197820)


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
  }
</script>