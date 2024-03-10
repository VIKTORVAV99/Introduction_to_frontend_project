const OPENAI_WHISPER_ENDPOINT =
  "https://api.openai.com/v1/audio/transcriptions";
const OPENAI_GPT4_ENDPOINT = "https://api.openai.com/v1/assistants";

// This token will be revoked after the project has been graded or after the 3rd of April 2024.
const OPENAI_API_KEY = "";

const output_box = document.getElementById("transcribed-output");
const output_language = document.getElementById("language-selector-text").value;
const input_language = document.getElementById("language-selector-voice").value;

// The system prompt that will be used to post-process the transcription.
const SYSTEM_PROMPT = `You are a helpful assistant that translates the text to the language with the designation ${output_language} adds punctuation to text. Preserve the original words and only insert necessary punctuation such as periods, commas, capialization, symbols like dollar sings or percentage signs, and formatting. Use only the context provided. If there is no context provided say, 'No context provided'`;

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

    const response = await callWhisperAPI(audioBlob);
    const data = await response.json();

    // This code is commented out because the returned value from the Whisper API is crap and cant be translated in a good way.

    // For optimal results the API should be called with a longer audio clip
    // and post-processing should be done with GPT-4 to improve the transcription.
    //const postProcessedResponse = await postProcessTranscription(data?.text);
    //const data = await postProcessedResponse.json();

    outputBox.innerText = data?.text;
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
