import { dbtoa, atodb, mtof, ftom } from "./MusicTools.js";
import { audioPlayer } from "./audioBufferClass.js";

const myAudioContext = new AudioContext();

// Overall volume
const masterGain = myAudioContext.createGain();
masterGain.gain.value = 1.0;

// Connect Gainnode to audio output
masterGain.connect(myAudioContext.destination);

// Create workable effects! It's all Gain Nodes and Delay Effects. JUST LABEL!!!!!!

function createEcho(myAudioContext, inputNode, outputNode) {
  const delay = new DelayNode(myAudioContext);
  delay.delayTime.value = 0.25; //250 ms delay

  const feedback = new GainNode(myAudioContext);
  feedback.gain.value = 0.4;

  const wetGain = new GainNode(myAudioContext);
  wetGain.gain.value = 0.4;

  const dryGain = new GainNode(myAudioContext);
  dryGain.gain.value = 1.0;

  // Dry path
  inputNode.connect(dryGain);
  dryGain.connect(outputNode);

  // Wet path (echo)
  inputNode.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay); //feedback loop
  delay.connect(wetGain);
  wetGain.connect(outputNode);

  return {
    delay,
    feedback,
    wetGain,
    dryGain,
  };
}

// function createReverb(myAudioContext, inputNode, outputNode) {

//   const convolver = ConvolverNode(myAudioContext)
//   convolver.
// }

// The Main FX Bus
const fxInput = new GainNode(myAudioContext);
fxInput.gain.value = 1.0;

// Apply echo between fxInput and masterGain
const echo = createEcho(myAudioContext, fxInput, masterGain);

// Add controllable sliders for the effects

//Echo Delay sliders
const delaySlider = document.getElementById("delaySlider");

delaySlider.oninput = (e) => {
  echo.delay.delayTime.setValueAtTime(
    parseFloat(e.target.value) * 0.8, // 0 to 0.8 sec for mapping values
    myAudioContext.currentTime,
  );
};

const wetSlider1 = document.getElementById("wetSlider");

wetSlider1.oninput = (e) => {
  echo.wetGain.gain.setValueAtTime(
    parseFloat(e.target.value),
    myAudioContext.currentTime,
  );
};

//Reverb sliders

// Play audio files for the different fruits

const pineapple = new audioPlayer(
  myAudioContext,
  fxInput,
  "pineappleExcerpt.flac",
);
const banana = new audioPlayer(myAudioContext, fxInput, "bananaExcerpt.flac");
const fig = new audioPlayer(myAudioContext, fxInput, "figExcerpt.flac");
const pomegranate = new audioPlayer(
  myAudioContext,
  fxInput,
  "pomegranateExcerpt.flac",
);
const strawberry = new audioPlayer(
  myAudioContext,
  fxInput,
  "strawberryExcerpt.flac",
);
const guava = new audioPlayer(myAudioContext, fxInput, "guavaExcerpt.flac");
const watermelon = new audioPlayer(
  myAudioContext,
  fxInput,
  "watermelonExcerpt.flac",
);
const cantaloupe = new audioPlayer(
  myAudioContext,
  fxInput,
  "cantaloupeExcerpt.flac",
);

// Load audio files
await Promise.all([
  pineapple.load(),
  banana.load(),
  fig.load(),
  pomegranate.load(),
  strawberry.load(),
  guava.load(),
  watermelon.load(),
  cantaloupe.load(),
]);

// Buttons for audio files to play
document.getElementById("pineappleBtn").onclick = () => pineapple.play();
document.getElementById("bananaBtn").onclick = () => banana.play();
document.getElementById("figBtn").onclick = () => fig.play();
document.getElementById("pomegranateBtn").onclick = () => pomegranate.play();
document.getElementById("strawberryBtn").onclick = () => strawberry.play();
document.getElementById("guavaBtn").onclick = () => guava.play();
document.getElementById("watermelonBtn").onclick = () => watermelon.play();
document.getElementById("cantaloupeBtn").onclick = () => cantaloupe.play();
