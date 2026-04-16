// Create the class to find/read/decode/load a file into buffer and play it

export class audioPlayer {
  constructor(myAudioContext, outputNode, filePath) {
    this.audioContext = myAudioContext; // Main Audio Context
    this.outputNode = outputNode; // Another way of saying destination
    this.filePath = filePath; // The audio file itself
    this.buffer = null;
    this.isPlaying = false;
  }

  async load() {
    const response = await fetch(this.filePath); // Finding the file
    const arrayBuffer = await response.arrayBuffer(); // Turn file to an Array Buffer
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer); // Decode Array buffer to Audio Buffer

    console.log(`${this.filePath} loaded`); // Console log to notify completion
  }

  play() {
    if (!this.buffer) {
      console.error("Audio not loaded yet!"); // Just in case error (! means opposite)
      return;
    }

    //Callback function and not continously generating new buffer nodes

    if (this.isPlaying) return;

    this.source = new AudioBufferSourceNode(this.audioContext); // Play the chosen audio file
    this.source.buffer = this.buffer;

    this.isPlaying = true;

    this.source.onended = () => {
      this.isPlaying = false;

      this.source.disconnect();
      this.source = null;
    };

    this.source.connect(this.outputNode);
    this.source.start();
  }

  stop() {
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
      this.isPlaying = false;
    }
  }
}
