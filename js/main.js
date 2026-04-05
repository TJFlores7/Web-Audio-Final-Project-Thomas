import { dbtoa, atodb, mtof, ftom } from "./MusicTools.js";
import { audioPlayer } from "./audioBufferClass.js";

const myAudioContext = new AudioContext();

// Overall volume
const masterGain = myAudioContext.createGain();
masterGain.gain.value = 1.0;

// Connect Gainnode to audio output
masterGain.connect(myAudioContext.destination);

// for Smoothing purposes for the sliders in real time
const now = myAudioContext.currentTime;

//-------------------------------------------------------------------------------------

// Create workable effects! It's all Gain Nodes and Delay Effects. JUST LABEL!!!!!!

function createEcho(myAudioContext, inputNode, outputNode) {
  const delay = new DelayNode(myAudioContext);
  delay.delayTime.value = 0.25; //250 ms delay

  const feedback = new GainNode(myAudioContext);
  feedback.gain.value = 0.2;

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

// Reverb effect

// function createReverb(myAudioContext, inputNode, outputNode) {

//   const convolver = ConvolverNode(myAudioContext)
//   convolver.
// }

// Flanger effect

function createFlanger(myAudioContext, inputNode, outputNode) {
  const delay2 = new DelayNode(myAudioContext);
  delay2.delayTime.value = 0.003; //3 ms delay

  const lfo = new OscillatorNode(myAudioContext);
  lfo.frequency.value = 0.02; //This will modulate the delay2

  const lfoGain = new GainNode(myAudioContext);
  lfoGain.gain.value = 0.002; //enough to have a presence

  const feedback2 = new GainNode(myAudioContext);
  feedback2.gain.value = 0.5; //strength control

  const wetGain2 = new GainNode(myAudioContext);
  wetGain2.gain.value = 0.4;

  const dryGain2 = new GainNode(myAudioContext);
  dryGain2.gain.value = 1.0;

  //Dry Path
  inputNode.connect(dryGain2);
  dryGain2.connect(outputNode);

  //Wet Path
  inputNode.connect(delay2);
  delay2.connect(feedback2);
  feedback2.connect(delay2);
  lfo.connect(lfoGain);
  lfoGain.connect(delay2.delayTime);
  delay2.connect(wetGain2);
  wetGain2.connect(outputNode);

  lfo.start();

  return {
    delay2,
    lfo,
    lfoGain,
    feedback2,
    wetGain2,
    dryGain2,
  };
}

//-------------------------------------------------------------------------------------

// The Main FX Bus
const fxInput = new GainNode(myAudioContext);
fxInput.gain.value = 1.0;

// Apply echo between fxInput and masterGain
const echo = createEcho(myAudioContext, fxInput, masterGain);

// Apply flanger between fxInput and masterGain
const flanger = createFlanger(myAudioContext, fxInput, masterGain);

//-------------------------------------------------------------------------------------

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

//Flanger sliders
const delaySlider2 = document.getElementById("delaySlider2");

delaySlider2.oninput = (e) => {
  flanger.delay2.delayTime.cancelScheduledValues(now);
  flanger.delay2.delayTime.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

const lfoSlider = document.getElementById("lfoSlider");
lfoSlider.oninput = (e) => {
  flanger.lfo.frequency.cancelScheduledValues(now);
  flanger.lfo.frequency.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

const lfoGainSlider = document.getElementById("lfoGainSlider");
lfoGainSlider.oninput = (e) => {
  flanger.lfoGain.gain.cancelScheduledValues(now);
  flanger.lfoGain.gain.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

const wetSlider2 = document.getElementById("wetSlider2");

wetSlider2.oninput = (e) => {
  flanger.wetGain2.gain.cancelScheduledValues(now);
  flanger.wetGain2.gain.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

//-------------------------------------------------------------------------------------

// Play audio files for the different fruits

const pineapple = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/pineappleExcerpt.flac",
);
const banana = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/bananaExcerpt.flac",
);
const fig = new audioPlayer(myAudioContext, fxInput, "audio/figExcerpt.flac");
const pomegranate = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/pomegranateExcerpt.flac",
);
const strawberry = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/strawberryExcerpt.flac",
);
const guava = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/guavaExcerpt.flac",
);
const watermelon = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/watermelonExcerpt.flac",
);
const cantaloupe = new audioPlayer(
  myAudioContext,
  fxInput,
  "audio/cantaloupeExcerpt.flac",
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
