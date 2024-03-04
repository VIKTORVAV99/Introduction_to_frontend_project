const OPENAI_WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

const OPENAI_API_KEY = "";

const output_box = document.getElementById("transcribed-output");

// Call the OpenAI API to get a whisper response
/**
 * Calls the API with the provided audio blob.
 * @param {Blob} audioBlob - The audio blob to be sent to the API.
 * @returns {Promise<Response>} - A promise that resolves to the API response.
 */
async function callAPI(audioBlob) {
  const formData = new FormData();
  formData.append("file", new File([audioBlob], "audio.wav"));
  formData.append("model", "whisper-1");
  formData.append("language", "en"); // Should read from the user's settings in the future
  formData.append("response_format", "json");

  return fetch(OPENAI_WHISPER_ENDPOINT, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });
}

/**
 * Records audio using the user's microphone and returns a MediaRecorder object.
 * @returns {MediaRecorder} The MediaRecorder object used for recording audio.
 */
async function recordAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
    console.log(audioChunks);
  });

  mediaRecorder.addEventListener("stop", async () => {
    console.debug("Recording stopped");
    const audioBlob = new Blob(audioChunks);

    const response = await callAPI(audioBlob);
    const data = await response.json();

    // For optimal results the API should be called with a longer audio clip
    // and post-processing should be done with GPT-4 to improve the transcription.

    output_box.innerText = data?.text;

  });

  const button = document.getElementById("record");

  button.addEventListener("click", () => {
    if (mediaRecorder.state === "inactive") {
      mediaRecorder.start();
      button.innerText = "Stop";
    } else {
      mediaRecorder.stop();
      button.innerText = "Record";
    }
  });

  mediaRecorder.addEventListener("start", () => {
    console.debug("Recording started");
  });

  mediaRecorder.addEventListener("resume", () => {
    console.debug("Recording resumed");
  });

  mediaRecorder.addEventListener("pause", () => {
    console.debug("Recording paused");
  });

  mediaRecorder.addEventListener("error", (event) => {
    console.error("Error while recording: ", event.error);
  });

  return mediaRecorder;
}

recordAudio();
