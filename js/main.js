import { audioPlayer } from "./audioBufferClass.js";

const myAudioContext = new AudioContext();

// Overall volume
const masterGain = myAudioContext.createGain();
masterGain.gain.value = 0.4;

// Connect Gainnode to audio output
masterGain.connect(myAudioContext.destination);

//-------------------------------------------------------------------------------------

// Create workable effects! It's all Gain Nodes and Delay Effects. JUST LABEL!!!!!!

// Echo Delay effect

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

//-------------------------------------------------------------------------------------

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

//Reverb effect

function createReverb(myAudioContext, inputNode, outputNode, impulseURL) {
  const convolver = myAudioContext.createConvolver();

  const dryGain3 = myAudioContext.createGain();
  const wetGain3 = myAudioContext.createGain();

  dryGain3.gain.value = 0.7;
  wetGain3.gain.value = 0.3;

  //Dry Path
  inputNode.connect(dryGain3);
  dryGain3.connect(outputNode);

  //Wet Path
  inputNode.connect(convolver);
  convolver.connect(wetGain3);
  wetGain3.connect(outputNode);

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
    convolver,
    dryGain3,
    wetGain3,
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

// Apply reverb between fxInput and masterGain
const reverb = createReverb(
  myAudioContext,
  fxInput,
  masterGain,
  "audio/Casa Grande Domes Arizona.wav",
);

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

//-------------------------------------------------------------------------------------

//Flanger sliders
const delaySlider2 = document.getElementById("delaySlider2");

delaySlider2.oninput = (e) => {
  const now = myAudioContext.currentTime;

  flanger.delay2.delayTime.cancelScheduledValues(now);
  flanger.delay2.delayTime.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

const lfoSlider = document.getElementById("lfoSlider");
lfoSlider.oninput = (e) => {
  const now = myAudioContext.currentTime;

  flanger.lfo.frequency.cancelScheduledValues(now);
  flanger.lfo.frequency.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

const lfoGainSlider = document.getElementById("lfoGainSlider");
lfoGainSlider.oninput = (e) => {
  const now = myAudioContext.currentTime;

  flanger.lfoGain.gain.cancelScheduledValues(now);
  flanger.lfoGain.gain.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

const wetSlider2 = document.getElementById("wetSlider2");

wetSlider2.oninput = (e) => {
  const now = myAudioContext.currentTime;
  flanger.wetGain2.gain.cancelScheduledValues(now);
  flanger.wetGain2.gain.linearRampToValueAtTime(
    parseFloat(e.target.value),
    now + 0.02,
  );
};

//-------------------------------------------------------------------------------------

//Reverb sliders
const wetSlider3 = document.getElementById("wetSlider3");

wetSlider3.oninput = (e) => {
  reverb.wetGain3.gain.setValueAtTime(
    parseFloat(e.target.value),
    myAudioContext.currentTime,
  );
};

//-------------------------------------------------------------------------------------

// Play audio files for the different fruits

function createFruitPlayer(url) {
  const input = new GainNode(myAudioContext);

  const echo = createEcho(myAudioContext, input, masterGain);
  const flanger = createFlanger(myAudioContext, input, masterGain);
  const reverb = createReverb(
    myAudioContext,
    input,
    masterGain,
    "audio/Casa Grande Domes Arizona.wav",
  );

  const player = new audioPlayer(myAudioContext, input, url);

  return {
    player,
    echo,
    flanger,
    reverb,
    input,
  };
}

const pineapple = createFruitPlayer("audio/pineappleExcerpt.flac");
const banana = createFruitPlayer("audio/bananaExcerpt.flac");
const fig = createFruitPlayer("audio/figExcerpt.flac");
const pomegranate = createFruitPlayer("audio/pomegranateExcerpt.flac");
const strawberry = createFruitPlayer("audio/strawberryExcerpt.flac");
const guava = new createFruitPlayer("audio/guavaExcerpt.flac");
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

document.querySelectorAll(".fruit").forEach((fruit) => {
  fruit.draggable = false;
});

document.querySelectorAll(".fruit").forEach((fruit) => {
  enableFruitInteraction(fruit);
});

function enableFruitInteraction(fruit) {
  fruit.addEventListener("pointerdown", () => {
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

    players[fruit.id]?.player.play();
  });
}

// Adding the fruit "drag" event
const zone = document.getElementById("interaction-zone");
let activeFruit = null;

document.addEventListener("pointerdown", (e) => {
  if (e.target.classList.contains("fruit")) {
    activeFruit = e.target;

    const rect = zone.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const fruitRect = activeFruit.getBoundingClientRect();
    const offsetX = fruitRect.width / 2;
    const offsetY = fruitRect.height / 2;

    //make it draggable
    zone.appendChild(activeFruit);
    activeFruit.style.position = "absolute";

    //move it into the interaction zone by your cursor
    activeFruit.style.left = `${x - offsetX}px`;
    activeFruit.style.top = `${y - offsetY}px`;
  }
});

//Moving fruit in real time
zone.addEventListener("pointermove", (e) => {
  if (!activeFruit) return;

  const rect = zone.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const fruitRect = activeFruit.getBoundingClientRect();

  const offsetX = fruitRect.width / 2;
  const offsetY = fruitRect.height / 2;

  activeFruit.style.left = `${x - offsetX}px`;
  activeFruit.style.top = `${y - offsetY}px`;

  updateFruitAudio(activeFruit);
});

//Stop drag event
window.addEventListener("pointerup", () => {
  activeFruit = null;
});

// Old code that used "dragstart" and "drop" with uses of clone

// let draggedFruit = null;

// document.querySelectorAll(".fruit").forEach((fruit) => {
//   fruit.addEventListener("dragstart", (e) => {
//     draggedFruit = fruit;
//   });
// });

// //-------------------------------------------------------------------------------------

// // Allowing the drop in the interaction zone
// const zone = document.getElementById("interaction-zone");

// zone.addEventListener("dragover", (e) => {
//   e.preventDefault();
// });

// zone.addEventListener("drop", (e) => {
//   e.preventDefault();

//   const existing = zone.querySelector(`#${draggedFruit.id}`);
//   const rect = zone.getBoundingClientRect();
//   const size = 60; // half of fruit width

//   const x = e.clientX - rect.left;
//   const y = e.clientY - rect.top;

//   if (existing) {
//     existing.style.left = `${x - size}px`;
//     existing.style.top = `${y - size}px`;
//   } else {
//     const clone = draggedFruit.cloneNode(true);

//     clone.style.position = "absolute";
//     clone.style.left = `${x - size}px`;
//     clone.style.top = `${y - size}px`;

//     zone.appendChild(clone);

//     enableFruitInteraction(clone);

//     clone.draggable = true;
//     clone.addEventListener("dragstart", () => {
//       draggedFruit = clone;
//     });
//   }
// });

//-------------------------------------------------------------------------------------

// Fruit response to position

function updateFruitAudio(fruit) {
  const rect = zone.getBoundingClientRect();
  const fruitRect = fruit.getBoundingClientRect();

  const x = (fruitRect.left - rect.left) / rect.width;
  const y = (fruitRect.top - rect.top) / rect.height;

  // Distance from center (center is dry zone)
  const disFromCenter = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
  const isCenter = disFromCenter < 0.15; // subject to change

  const now = myAudioContext.currentTime;

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

  const fruitObj = players[fruit.id];

  if (!fruitObj) return;

  //effect mappings for each fruit

  //Gradual change control

  const top = Math.max(0, 1 - y);
  const bottom = Math.max(0, y);
  const left = Math.max(0, 1 - x);
  const right = Math.max(0, x);

  const echoAmount = Math.pow(top * left, 1.5);
  const flangerAmount = bottom * left;
  const reverbAmount = bottom * right;

  if (isCenter) {
    fruitObj.echo.wetGain.gain.value = 0;
    fruitObj.flanger.wetGain2.gain.value = 0;
    fruitObj.reverb.wetGain3.gain.value = 0;
  }

  // Echo delay
  fruitObj.echo.delay.delayTime.linearRampToValueAtTime(x * 0.8, now + 0.05);
  fruitObj.echo.wetGain.gain.value = echoAmount;

  // Flanger
  fruitObj.flanger.lfo.frequency.linearRampToValueAtTime(
    0.1 + x * 5,
    now + 0.05,
  );
  fruitObj.flanger.wetGain2.gain.value = flangerAmount;

  // Reverb

  fruitObj.reverb.wetGain3.gain.value = reverbAmount;

  // all wet gains are set to 0 so it should be dry

  //Volume (top = louder)
  fruit.style.opacity = 0.5 + (1 - y);
  //Visual glow
  fruit.style.transform = `scale(${1 + x * 0.3})`;
}

function animate() {
  document.querySelectorAll("#interaction-zone .fruit").forEach((fruit) => {
    updateFruitAudio(fruit);
  });

  requestAnimationFrame(animate);
}

animate();
