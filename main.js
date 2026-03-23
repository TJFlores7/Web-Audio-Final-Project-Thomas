import { dbtoa, atodb, mtof, ftom } from "./MusicTools.js";
import { audioPlayer } from "./audioBufferClass.js";

const myAudioContext = new AudioContext();

// Overall volume
const masterGain = myAudioContext.createGain();
masterGain.gain.value = 1.0;

// Connect Gainnode to audio output
masterGain.connect(myAudioContext.destination);

// Play audio files for the different fruits

const pineapple = new audioPlayer(
  myAudioContext,
  masterGain,
  "pineappleExcerpt.flac",
);
const banana = new audioPlayer(
  myAudioContext,
  masterGain,
  "bananaExcerpt.flac",
);
const fig = new audioPlayer(myAudioContext, masterGain, "figExcerpt.flac");
const pomegranate = new audioPlayer(
  myAudioContext,
  masterGain,
  "pomegranateExcerpt.flac",
);
const strawberry = new audioPlayer(
  myAudioContext,
  masterGain,
  "strawberryExcerpt.flac",
);
const guava = new audioPlayer(myAudioContext, masterGain, "guavaExcerpt.flac");
const watermelon = new audioPlayer(
  myAudioContext,
  masterGain,
  "watermelonExcerpt.flac",
);
const cantaloupe = new audioPlayer(
  myAudioContext,
  masterGain,
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
