const { useEffect } = wp.element;
const { doAction } = wp.hooks;
import Board from './BoardMain';

export function AlpacaBoard() {
  useEffect(() => {
    // Fire an action to allow other components to render into the controls area.
    doAction('alpaca_board_controls', '#alpaca-board-controls-mount');
  }, []);

  return (
    <>
      <div id="alpaca-board-controls-mount"></div>
      <Board />
    </>
  );
}
