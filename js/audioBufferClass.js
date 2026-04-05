// Create the class to find/read/decode/load a file into buffer and play it

export class audioPlayer {
  constructor(myAudioContext, outputNode, filePath) {
    this.audioContext = myAudioContext; // Main Audio Context
    this.outputNode = outputNode; // Another way of saying destination
    this.filePath = filePath; // The audio file itself
    this.buffer = null;
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

    const source = new AudioBufferSourceNode(this.audioContext); // Play the chosen audio file
    source.buffer = this.buffer;

    source.connect(this.outputNode);
    source.start();
  }

  //   stop() {
  //     if (this.currentSource) {
  //       this.currentSource.stop();
  //     }
  //   }
}
