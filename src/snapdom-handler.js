document
  .querySelector("#wp-admin-bar-alpaca-snapdom")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    // https://github.com/zumerlab/snapdom
    const canvas = await snapdom.toCanvas(document.body, {
      type: "jpg",
      // exclude: ["#wpadminbar"],
      embedFonts: true,
    });

    // Calculate the visible area based on scroll position and viewport size
    const x = window.scrollX;
    const y = window.scrollY;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create a new canvas to hold the cropped image
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const ctx = croppedCanvas.getContext("2d");

    // Draw the relevant portion of the original canvas onto the new canvas
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    // Get the Base64-encoded string from the canvas
    const base64String = croppedCanvas.toDataURL("image/webp", 0.5); // Set compression level
    console.log(base64String);

    // Open a new window and display the image using the Base64 string
    const newWindow = window.open("");
    newWindow.document.body.innerHTML = `<img src="${base64String}" />`;
  });
