import { audioPlayer } from "./audioBufferClass.js";

const myAudioContext = new AudioContext();

// Overall volume
const masterGain = myAudioContext.createGain();
masterGain.gain.value = 0.4;

// Connect Gainnode to audio output
masterGain.connect(myAudioContext.destination);

const fx_Config = {
  echo: {
    feedback: 0.2,
  },

  flanger: {
    maxDelay: 0.8,
    lfodepth: 0.002,
    feedback: 0.5,
  },
};

//-------------------------------------------------------------------------------------

// Create workable effects! It's all Gain Nodes and Delay Effects. JUST LABEL!!!!!!

// Echo Delay effect

function createEcho(myAudioContext) {
  const input = myAudioContext.createGain();
  const output = myAudioContext.createGain();

  const delay = new DelayNode(myAudioContext);
  delay.delayTime.value = 0.25; //250 ms delay

  const feedback = new GainNode(myAudioContext);
  feedback.gain.value = fx_Config.echo.feedback;

  const wetGain = new GainNode(myAudioContext);
  wetGain.gain.value = 0.4;

  const dryGain = new GainNode(myAudioContext);
  dryGain.gain.value = 1.0;

  // Dry path
  input.connect(dryGain).connect(output);

  // Wet path (echo)
  input.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay); //feedback loop
  delay.connect(wetGain).connect(output);

  return {
    input,
    output,
    delay,
    feedback,
    wetGain,
    dryGain,
  };
}

//-------------------------------------------------------------------------------------

// Flanger effect

function createFlanger(myAudioContext) {
  const input = myAudioContext.createGain();
  const output = myAudioContext.createGain();

  const delay2 = new DelayNode(myAudioContext);
  delay2.delayTime.value = 0.003; //3 ms delay

  const lfo = new OscillatorNode(myAudioContext);
  lfo.frequency.value = 0.02; //This will modulate the delay2

  const lfoGain = new GainNode(myAudioContext);
  lfoGain.gain.value = fx_Config.flanger.lfodepth; //enough to have a presence

  const feedback2 = new GainNode(myAudioContext);
  feedback2.gain.value = fx_Config.flanger.feedback; //strength control

  const wetGain2 = new GainNode(myAudioContext);
  wetGain2.gain.value = 0.4;

  const dryGain2 = new GainNode(myAudioContext);
  dryGain2.gain.value = 1.0;

  //Dry Path
  input.connect(dryGain2).connect(output);

  //Wet Path
  input.connect(delay2);
  delay2.connect(feedback2);
  feedback2.connect(delay2);
  lfo.connect(lfoGain);
  lfoGain.connect(delay2.delayTime);
  delay2.connect(wetGain2).connect(output);

  lfo.start();

  return {
    input,
    output,
    delay2,
    lfo,
    lfoGain,
    feedback2,
    wetGain2,
    dryGain2,
  };
}

//-------------------------------------------------------------------------------------

//Reverb effect

function createReverb(myAudioContext, impulseURL) {
  const input = myAudioContext.createGain();
  const output = myAudioContext.createGain();

  const convolver = myAudioContext.createConvolver();

  const dryGain3 = myAudioContext.createGain();
  const wetGain3 = myAudioContext.createGain();

  dryGain3.gain.value = 0.7;
  wetGain3.gain.value = 0.3;

  //Dry Path
  input.connect(dryGain3).connect(output);

  //Wet Path
  input.connect(convolver);
  convolver.connect(wetGain3).connect(output);

  //Load impulse response

  async function loadImpulse() {
    try {
      const response = await fetch(impulseURL);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await myAudioContext.decodeAudioData(arrayBuffer);
      convolver.buffer = audioBuffer;

      console.log("Impulse loaded successfully");
    } catch (err) {
      console.error("Impulse failed to load:", err);
    }
  }

  loadImpulse();

  return {
    input,
    output,
    convolver,
    dryGain3,
    wetGain3,
  };
}

//-------------------------------------------------------------------------------------

// Create the fruit player for the fruits to play!

function createFruitPlayer(url) {
  const input = new GainNode(myAudioContext);

  // Volume control for the fruits
  const fruitGain = new GainNode(myAudioContext);
  fruitGain.gain.value = 1.0;

  const dryGain = new GainNode(myAudioContext);
  dryGain.gain.value = 1.0;

  dryGain.connect(masterGain);
  input.connect(fruitGain);

  // Add filter effect
  const filter = new BiquadFilterNode(myAudioContext);
  filter.type = "lowpass";
  filter.frequency.value = 20000;

  // Add panning
  const panner = new StereoPannerNode(myAudioContext);
  panner.pan.value = 0;

  // Add effects
  const echo = createEcho(myAudioContext);
  const flanger = createFlanger(myAudioContext);
  const reverb = createReverb(
    myAudioContext,
    "audio/Casa Grande Domes Arizona.wav",
  );
  // Chain them properly to avoid explosion

  filter.connect(dryGain);
  fruitGain.connect(panner);
  panner.connect(filter);

  filter.connect(echo.input);
  echo.output.connect(masterGain);

  filter.connect(flanger.input);
  flanger.output.connect(masterGain);

  filter.connect(reverb.input);
  reverb.output.connect(masterGain);

  const player = new audioPlayer(myAudioContext, input, url);

  return {
    player,
    echo,
    flanger,
    reverb,
    input,
    fruitGain,
    filter,
    panner,
    dryGain,
    rotation: 0,
  };
}

//-------------------------------------------------------------------------------------

// Activate fruit players

const pineapple = createFruitPlayer("audio/pineappleExcerpt.flac");
const banana = createFruitPlayer("audio/bananaExcerpt.flac");
const fig = createFruitPlayer("audio/figExcerpt.flac");
const pomegranate = createFruitPlayer("audio/pomegranateExcerpt.flac");
const strawberry = createFruitPlayer("audio/strawberryExcerpt.flac");
const guava = createFruitPlayer("audio/guavaExcerpt.flac");
const watermelon = createFruitPlayer("audio/watermelonExcerpt.flac");
const cantaloupe = createFruitPlayer("audio/cantaloupeExcerpt.flac");

// Load audio files
await Promise.all([
  pineapple.player.load(),
  banana.player.load(),
  fig.player.load(),
  pomegranate.player.load(),
  strawberry.player.load(),
  guava.player.load(),
  watermelon.player.load(),
  cantaloupe.player.load(),
]);

// Buttons for audio files to play
document.getElementById("pineapple").onclick = () => pineapple.player.play();
document.getElementById("banana").onclick = () => banana.player.play();
document.getElementById("fig").onclick = () => fig.player.play();
document.getElementById("pomegranate").onclick = () =>
  pomegranate.player.play();
document.getElementById("strawberry").onclick = () => strawberry.player.play();
document.getElementById("guava").onclick = () => guava.player.play();
document.getElementById("watermelon").onclick = () => watermelon.player.play();
document.getElementById("cantaloupe").onclick = () => cantaloupe.player.play();

//-------------------------------------------------------------------------------------

// Create Fruit Interactions

const players = {
  pineapple,
  banana,
  fig,
  pomegranate,
  strawberry,
  guava,
  watermelon,
  cantaloupe,
};

Object.entries(players).forEach(([id, fruitObj]) => {
  const element = document.getElementById(id);

  if (!element) return; // safety

  element.addEventListener("contextmenu", (e) => {
    const isInZone = isInsideZone(element);

    if (isInZone) {
      e.preventDefault(); // stops the browser menu
    }

    if (fruitObj.player.isPlaying) {
      fruitObj.player.stop();
    } else {
      fruitObj.player.play();
    }
  });
});

document.querySelectorAll(".fruit").forEach((fruit) => {
  fruit.draggable = false;
});

let isDragging = false; //tracks whether user is currently dragging mouse - thanks Nush
let activeFruit = null;

//Function that forces no audio in the fruit deck until the fruit is in interaction-zone
function isInsideZone(fruit) {
  return fruit.parentElement === zone;
}

//-------------------------------------------------------------------------------------

// Create controllable zone
const zone = document.getElementById("interaction-zone");

// Adding the fruit "drag" event
document.addEventListener("pointerdown", (e) => {
  if (!e.target.classList.contains("fruit")) return;

  activeFruit = e.target;
  isDragging = true;

  const fruitObj = players[activeFruit.id];

  if (fruitObj && isInsideZone(activeFruit) && !fruitObj.player.isPlaying) {
    // fruitObj.player.play();
  }

  const rect = zone.getBoundingClientRect();
  const fruitRect = activeFruit.getBoundingClientRect();

  const offsetX = fruitRect.width / 2;
  const offsetY = fruitRect.height / 2;

  //make it draggable
  zone.appendChild(activeFruit);
  activeFruit.style.position = "absolute";

  //move it into the interaction zone by your cursor
  activeFruit.style.left = `${e.clientX - rect.left - offsetX}px`;
  activeFruit.style.top = `${e.clientY - rect.top - offsetY}px`;

  activeFruit.classList.add("dragging");
});

//-------------------------------------------------------------------------------------

//Moving fruit in real time
zone.addEventListener("pointermove", (e) => {
  if (!isDragging || !activeFruit) return;

  const rect = zone.getBoundingClientRect();
  const fruitRect = activeFruit.getBoundingClientRect();

  const offsetX = fruitRect.width / 2;
  const offsetY = fruitRect.height / 2;

  activeFruit.style.left = `${e.clientX - rect.left - offsetX}px`;
  activeFruit.style.top = `${e.clientY - rect.top - offsetY}px`;

  let newX = e.clientX - rect.left - offsetX;
  let newY = e.clientY - rect.top - offsetY;

  // Clamp inside zone
  newX = Math.max(0, Math.min(newX, rect.width - fruitRect.width));
  newY = Math.max(0, Math.min(newY, rect.height - fruitRect.height));

  activeFruit.style.left = `${newX}px`;
  activeFruit.style.top = `${newY}px`;

  const fruitObj = players[activeFruit.id];

  // ONLY update audio if it's playing
  if (fruitObj?.player.isPlaying) {
    updateFruitAudio(activeFruit);
  }
});

//-------------------------------------------------------------------------------------

//Stop drag event
window.addEventListener("pointerup", () => {
  if (activeFruit && isInsideZone(activeFruit)) {
    const fruitObj = players[activeFruit.id];
    if (fruitObj && !fruitObj.player.isPlaying) {
      fruitObj.player.play();
    }
  }

  if (activeFruit) {
    activeFruit.classList.remove("dragging");
  }

  isDragging = false;
  activeFruit = null;
});

//-------------------------------------------------------------------------------------

// Fruit responses to position change

function updateFruitAudio(fruit) {
  const rect = zone.getBoundingClientRect();
  const fruitRect = fruit.getBoundingClientRect();

  const x = (fruitRect.left - rect.left) / rect.width;
  const y = (fruitRect.top - rect.top) / rect.height;

  // Distance from center (center is dry zone)
  const disFromCenter = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
  const isCenter = disFromCenter < 0.15; // subject to change

  const now = myAudioContext.currentTime;

  const fruitObj = players[fruit.id];

  //If there is no fruit object, return with these functions

  if (!fruitObj) return;

  //effect mappings for each fruit
  const top = Math.max(0, 1 - y);
  const bottom = Math.max(0, y);
  const left = Math.max(0, 1 - x);
  const right = Math.max(0, x);

  let echoAmount = Math.pow(top * left, 1.5);
  let flangerAmount = bottom * left;
  let reverbAmount = bottom * right;

  const maxWet = Math.max(echoAmount, flangerAmount, reverbAmount);
  const dryLevel = 1 - maxWet;

  const total = echoAmount + flangerAmount + reverbAmount;

  if (total > 1) {
    echoAmount /= total;
    flangerAmount /= total;
    reverbAmount /= total;
  }

  fruitObj.dryGain.gain.linearRampToValueAtTime(dryLevel, now + 0.05);

  //---------------------------------------------------------------------------

  // Effect regions for gradual change in the fruit's audio

  // Dry audio

  if (isCenter) {
    echoAmount = 0;
    flangerAmount = 0;
    reverbAmount = 0;
  }

  //---------------------------------------------------------------------------

  // Echo delay

  fruitObj.echo.delay.delayTime.linearRampToValueAtTime(x * 0.8, now + 0.05);
  fruitObj.echo.wetGain.gain.value = echoAmount;
  const echoWet = echoAmount;
  const echoDry = 1 - echoWet;

  fruitObj.echo.wetGain.gain.value = echoWet;

  if (echoAmount < 0.05) {
    fruitObj.echo.feedback.gain.value = 0;
  }

  //---------------------------------------------------------------------------

  // Flanger

  fruitObj.flanger.lfo.frequency.linearRampToValueAtTime(
    0.1 + x * 5,
    now + 0.05,
  );
  fruitObj.flanger.wetGain2.gain.value = flangerAmount;

  //---------------------------------------------------------------------------

  // Reverb
  const reverbScaled = Math.pow(reverbAmount, 2.5);
  fruitObj.reverb.wetGain3.gain.value = reverbScaled;

  const reverbWet = reverbAmount;
  const reverbDry = 1 - reverbWet;

  fruitObj.reverb.wetGain3.gain.value = reverbWet;

  //---------------------------------------------------------------------------

  // Filter (lowpass)

  const inTopRight = x > 0.5 && y < 0.5;

  let filterAmount = 0;

  if (inTopRight) {
    const localX = (x - 0.5) * 2; // maps 0.5→1 → 0→1
    const localY = (0.5 - y) * 2; // maps 0→0.5 → 1→0

    filterAmount = Math.pow(localX * localY, 1.5);
  }

  // Map to frequency range
  const minFreq = 200;
  const maxFreq = 20000;

  const freq = maxFreq * Math.pow(minFreq / maxFreq, filterAmount);
  fruitObj.filter.frequency.linearRampToValueAtTime(freq, now + 0.05);

  //---------------------------------------------------------------------------

  // Pan control using X-axis
  const pan = (x - 0.5) * 2; // maps 0→1 → -1→1
  fruitObj.panner.pan.linearRampToValueAtTime(pan, now + 0.05);

  //---------------------------------------------------------------------------

  // Visual fruit changes
  fruit.style.opacity = 1 - y * 0.4;

  const rotation = fruitObj?.rotation || 0;

  fruit.style.transform = `rotate(${rotation}deg) scale(${1 + x * 0.3})`;
}

//-------------------------------------------------------------------------------------

// a small animation for each fruit

function animate() {
  document.querySelectorAll("#interaction-zone .fruit").forEach((fruit) => {
    const fruitObj = players[fruit.id];

    if (!fruitObj) return;

    updateFruitAudio(fruit);
    updateRotationAudio(fruitObj, fruit);
  });

  requestAnimationFrame(animate);
}

animate();

//-------------------------------------------------------------------------------------

// Mouse wheel volume control for each fruit

document.querySelectorAll(".fruit").forEach((fruit) => {
  fruit.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault(); // prevent page scrolling

      const fruitObj = players[fruit.id];
      if (!fruitObj) return;

      const now = myAudioContext.currentTime;

      // Scroll direction
      const delta = e.deltaY;
      //scale sensitivity
      const change = delta * -0.001;

      // Adjust volume
      let currentVol = fruitObj.fruitGain.gain.value;
      let newVol = currentVol + change;

      newVol = Math.max(0, Math.min(1, newVol));

      // Apply volume
      fruitObj.fruitGain.gain.cancelScheduledValues(now);
      fruitObj.fruitGain.gain.linearRampToValueAtTime(newVol, now + 0.05);

      // Visual feedback
      const container = fruit.parentElement;
      const bar = container.querySelector(".volume-bar");

      if (bar) {
        bar.style.setProperty("--vol", `${newVol * 100}%`);
      }

      fruit.style.filter = `brightness(${0.5 + newVol})`;
    },
    { passive: false },
  );
});

//-------------------------------------------------------------------------------------

// Function to change and update the audio by rotating

function updateRotationAudio(fruitObj, fruitElement) {
  const now = myAudioContext.currentTime;

  // Normalize the main rotation (0 -> 360) (0 -> 1)
  const norm = (((fruitObj.rotation % 360) + 360) % 360) / 360;

  // Controlled feedback unless you want a spiraling feedback that blows up :)
  const echoFeedback = Math.min(0.9, Math.pow(norm, 2) * 0.75);
  const flangerFeedback = Math.min(0.9, Math.pow(norm, 2) * 0.8);

  let echoAmount = fruitObj.echoAmount;
  const targetFeedback = echoAmount < 0.05 ? 0 : echoFeedback;

  // Apply to echo
  fruitObj.echo.feedback.gain.cancelScheduledValues(now);
  fruitObj.echo.feedback.gain.linearRampToValueAtTime(
    targetFeedback,
    now + 0.1,
  );

  // Apply to flanger
  fruitObj.flanger.feedback2.gain.cancelScheduledValues(now);
  fruitObj.flanger.feedback2.gain.linearRampToValueAtTime(
    flangerFeedback,
    now + 0.05,
  );
}

//-------------------------------------------------------------------------------------

// event listener for certain keys to control rotation (feedback)

document.addEventListener("keydown", (e) => {
  if (!activeFruit) return;

  const fruitObj = players[activeFruit.id];
  if (!fruitObj) return;

  const step = 5; // degrees per press

  if (e.key === "ArrowLeft" || e.key === "a") {
    fruitObj.rotation -= step;
  }

  if (e.key === "ArrowRight" || e.key === "d") {
    fruitObj.rotation += step;
  }

  // keep rotation within 360 range
  fruitObj.rotation = fruitObj.rotation % 360;

  // FORCE VISUAL UPDATE
  updateFruitAudio(activeFruit);
  // Update sound
  updateRotationAudio(fruitObj, activeFruit);
});

//-------------------------------------------------------------------------------------

// Create a separate Start Screen!

const startScreen = document.getElementById("start-screen");

startScreen.addEventListener("click", async () => {
  await myAudioContext.resume();

  startScreen.classList.add("exit");

  setTimeout(() => {
    startScreen.remove();
  }, 1000); // match animation duration
});

// Create controllable App for animation purposes

const app = document.getElementById("app");

startScreen.addEventListener("click", async () => {
  await myAudioContext.resume();

  startScreen.classList.add("exit");
  app.classList.add("active");

  setTimeout(() => {
    startScreen.remove();
  }, 1000);
});
