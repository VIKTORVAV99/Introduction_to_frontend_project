/**
 * Toggles the visibility of the hamburger menu panel and changes the background color of the toggle button.
 */
function hamburger_toggle() {
  // Gets the hamburger toggle button and the hamburger panel
  const toggle = document.getElementById("hamburger_toggle");
  const panel = document.getElementById("hamburger");
  // Toggles the visibility of the panel
  if (panel.style.display === "block") {
    panel.style.display = "none";
    toggle.style.backgroundColor = "transparent";
  } else {
    panel.style.display = "block";
    toggle.style.backgroundColor = "var(--color-primary)";
  }
}
