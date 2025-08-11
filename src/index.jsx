import "./alpaca.scss";

import AlpacaModal from "./modal.jsx";

const { render } = wp.element;
if (document.querySelector("#wp-admin-bar-alpaca-menu")) {
  render(
    <AlpacaModal />,
    document.querySelector("#wp-admin-bar-alpaca-report")
  );
}
