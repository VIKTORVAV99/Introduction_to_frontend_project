const OPENAI_WHISPER_ENDPOINT =
  "https://api.openai.com/v1/audio/transcriptions";
const OPENAI_GPT4_ENDPOINT = "https://api.openai.com/v1/chat/completions";

// This token will be revoked after the project has been graded or after the 3rd of April 2024.
const OPENAI_API_KEY = "";

const output_box = document.getElementById("transcribed-output");
const output_language = document.getElementById("language-selector-text").value;
const input_language = document.getElementById("language-selector-voice").value;

// The system prompt that will be used to post-process the transcription.
const SYSTEM_PROMPT = `You are a helpful assistant that translates the text to the language with the designation ${output_language} adds punctuation to text.`;

// Call the OpenAI API to get a whisper response
/**
 * Calls the API with the provided audio blob.
 * @param {Blob} audioBlob - The audio blob to be sent to the API.
 * @returns {Promise<Response>} - A promise that resolves to the API response.
 */
async function callWhisperAPI(audioBlob) {
  const formData = new FormData();
  formData.append("file", new File([audioBlob], "audio.wav"));
  formData.append("model", "whisper-1");
  formData.append("language", input_language);
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

// Using GPT4 we can post-process the transcription to improve the results.
/**
 * Processes the transcription by sending it to the OpenAI GPT-4 Turbo API for further processing.
 * @param {string} transcription - The transcription to be processed.
 * @returns {Promise<Response>} - A promise that resolves to the response from the API.
 */
async function postProcessTranscription(transcription) {
  return fetch(OPENAI_GPT4_ENDPOINT, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ContentType: "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: transcription,
        },
      ],
    }),
  });
}

/**
 * Records audio using the user's microphone and returns a MediaRecorder object.
 * @returns {MediaRecorder} The MediaRecorder object used for recording audio.
 */
async function recordAudio() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    alert(
      "Could not access the device microphone. Please allow access to the microphone and refresh the page.",
    );
    console.error("Could not access the device microphone: ", error);
  }
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
    console.log(audioChunks);
  });

  mediaRecorder.addEventListener("stop", async () => {
    console.debug("Recording stopped");
    const audioBlob = new Blob(audioChunks);
    output_box.innerText = "Transcribing...";
    try {
      const response = await callWhisperAPI(audioBlob);
      const data = await response.json();

      // This code is commented out because the returned value from the Whisper API is crap and cant be translated in a good way.

      // For optimal results the API should be called with a longer audio clip
      // and post-processing should be done with GPT-4 to improve the transcription.
      //const postProcessedResponse = await postProcessTranscription(data?.text);
      //const processedData = await postProcessedResponse.json()?.choices[0]?.message?.content;

      output_box.innerText = data?.text;
    } catch (error) {
      console.error("Error while calling the API: ", error);
      output_box.innerText = "An error occurred while transcribing the audio.";
    }
  });

  const button = document.getElementById("record");

  button.addEventListener("click", () => {
    if (mediaRecorder.state === "inactive") {
      mediaRecorder.start();
      button.children[0].src = "../assets/stop.svg";
    } else {
      mediaRecorder.stop();
      button.children[0].src = "../assets/mic.svg";
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
