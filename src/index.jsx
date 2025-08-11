import "./alpaca.scss";

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
