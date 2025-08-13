import "./alpaca.scss";

import "./apitest.js";

import AlpacaModal from "./modal.jsx";
import AlpacaSettings from "./settings.jsx";
import AlpacaBoard from "./board.jsx";

const { render } = wp.element;
if (document.querySelector("#wp-admin-bar-alpaca-menu")) {
  render(
    <AlpacaModal />,
    document.querySelector("#wp-admin-bar-alpaca-report")
  );
}

if (document.querySelector("#alpaca-settings")) {
  render(<AlpacaSettings />, document.querySelector("#alpaca-settings"));
}

if (document.querySelector("#alpaca-board")) {
  render(<AlpacaBoard />, document.querySelector("#alpaca-board"));
}
