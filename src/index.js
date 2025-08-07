import "./alpaca.scss";

document
  .querySelector("#wp-admin-bar-alpaca-snapdom")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    // https://github.com/zumerlab/snapdom
    const canvas = await snapdom.toCanvas(document.body, {
      type: "jpg",
      exclude: ["#wpadminbar"],
      embedFonts: true,
    });

    // Get the Base64-encoded string from the canvas
    const base64String = canvas.toDataURL("image/jpeg");
    console.log(base64String);

    // Open a new window and display the image using the Base64 string
    const newWindow = window.open("");
    newWindow.document.body.innerHTML = `<img src="${base64String}" />`;
  });
