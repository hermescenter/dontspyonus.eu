---
title: "Squared faces"
date: "2023-06-03"
description: "This small experimental visualization is meant to display all the faces with a graphic that can be easily used when campaigning about RBI"
---


# This is just a disorganized list of faces, at the moment, if some change is necessary, let's talk via mail.

<div id="only--you" class="container img__limit"> </div>

# That's all! Because the page is particularly heavy, and paiting over pictures is not a very stable activity, this table might not turn out **as perfect as you can hope**. Just refresh.

<br />
<br />

<!--
<div id="facelist-1" class="container img__limit"></div>
-->

<script type="text/javascript">

  function createImageElement(o) {

    const imgname = o?.facerec?.fname;
    return `
    <div class="float--left">
      <div class="mep--party">
        ${o.nation}
      </div>
      <span id="mep--${o.id}">
        <img class="mep--img" src="/MEPs/pics/${imgname}">
      </span>
      <div class="mep--name">${o.name}</div>
    </div>
  `;
  }

  function createCanvas(o, imageNumber) {
    const canvas = document.createElement('canvas');
    const targetSpan = document.getElementById(`mep--${o.id}`);

    const spanRect = targetSpan.getBoundingClientRect();
    // console.log(coord);

    /*align the canvas over the image*/
    canvas.style.position = 'absolute';
    canvas.style.left = `${spanRect.x}px`;

    const ctx = canvas.getContext('2d');

    const text1 = `${Math.round(100 * o.facerec.genderProbability)}% ${o.facerec.gender}`;
    addText(text1, ctx, 0, 5);

    const text2 = `${Math.round(o.facerec.age)} years`;
    addText(text2, ctx, 0, 20);

    const text3 = `${o.facerec.expression[0]} ${Math.round(100 * o.facerec.expression[1])}%`;
    addText(text3, ctx, 0, 35);

    ctx.beginPath()
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF4747';

    ctx.beginPath()
    console.log(imageNumber, o.facerec.box);
    const box = o.facerec.box;
    /* x, y, width, height */

    const endRightX = (box[2] - box[0]);
    const ourMargin = 8;

    ctx.moveTo(box[0] + ourMargin, box[1]);
    ctx.lineTo(endRightX, box[1]);
    ctx.stroke(); // Draw it

    ctx.moveTo(box[0], box[1] + ourMargin);
    ctx.lineTo(box[0], box[3]);
    ctx.stroke(); // Draw it

    /* ok and these are the first |- */

    ctx.beginPath()
    ctx.moveTo(endRightX, box[1]);
    ctx.lineTo(endRightX, box[3] - ourMargin);
    ctx.stroke(); // Draw it

    ctx.moveTo(endRightX - ourMargin, box[3]);
    ctx.lineTo(box[0], box[3]);
    ctx.stroke(); // Draw it

    targetSpan.appendChild(canvas);
  }

  function addText(textString, ctx, x, y) {
    // all hail to stackoverflow
    // https://stackoverflow.com/questions/18900117/write-text-on-canvas-with-background
    ctx.save();
    /// draw text from top - makes life easier at the moment
    ctx.textBaseline = 'top';
    /// color for background
    ctx.fillStyle = '#f5f2cc'; // highlight color, Lemon chiffon
    /// get width of text
    const width = ctx.measureText(textString).width;
    /// draw background rect assuming height of font
    ctx.fillRect(x, y, width + 4, 12);
    /// text color
    ctx.fillStyle = '#ff4747'; // imperial red
    /// draw text on top, with a space in front
    ctx.fillText(` ${textString}`, x, y + 2);
    /// restore original state
    ctx.restore();
  }

  /* this function calls the `squared` api that ensure pictures of the same 
   * shape, wheres is easier to depict squares over them */
  async function squarify() {
    const server =
      window.location.hostname === 'localhost' ?
        'http://localhost:2023/api/squared' : '/api/squared';

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

    await htmlAppend(mepdata);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await canvasPaint(mepdata);
  }

  async function htmlAppend(mepdata) {
    _.each(mepdata, function (mep) {
      const element = createImageElement(mep);
      $("#only--you").append(element);
    });
  }

  async function canvasPaint(mepdata) {
    _.each(mepdata, createCanvas);
  }

  try {
    squarify();
  } catch (error) {
    console.log(`Error: ${error.message}`);
    $("#only--you").text(`Error: ${error.message}`);
  }

</script>