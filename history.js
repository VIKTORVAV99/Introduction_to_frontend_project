// Gets all the history items
const historyItems = document.querySelectorAll(".history_item");
// Gets the output box
const outputBox = document.getElementById("transcribed-output");

// Loops through all the history items
historyItems.forEach((button) => {
  // Adds an event listener to each history item
  button.addEventListener("click", () => {
    // Sets the output box to the text of the history item
    outputBox.innerText = Array.from(button.children).at(-1).innerText;
  });
});
