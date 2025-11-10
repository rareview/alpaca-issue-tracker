/**
 * Board Helper Scripts
 *
 * Handles board-specific UI interactions.
 */

document.addEventListener('DOMContentLoaded', function () {
  const addIssueButton = document.getElementById('alpaca-add-issue');

  if (addIssueButton) {
    addIssueButton.addEventListener('click', function (e) {
      e.preventDefault();

      // Trigger modal open via WordPress hooks
      if (window.wp && window.wp.hooks) {
        wp.hooks.doAction('alpaca.openModal');
      }
    });
  }
});
