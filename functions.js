function hamburger_toggle() {
  const toggle = document.getElementById("hamburger_toggle");
  const panel = document.getElementById("hamburger");
  if (panel.style.display === "block") {
    panel.style.display = "none";
    toggle.style.backgroundColor = "inherit";
  } else {
    panel.style.display = "block";
    toggle.style.backgroundColor = "var(--color-primary)";
  }
}
