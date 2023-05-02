import { AudioComponent } from "./audio-component.js";

export class NoiseGenerator extends AudioComponent {
  constructor(context) {
    super(context);
    
    this.context = context;
    this.noiseBuffer = null;
    this.noise = null;
  }
    
  createNoiseBuffer() {
    // Create an empty 1-second buffer
    const bufferSize = this.context.sampleRate;
    const noiseBuffer = new AudioBuffer({length: bufferSize, sampleRate: this.context.sampleRate});
    // Fill the buffer with noise 
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = noiseBuffer;
  }
    
  createNoise() {
    this.createNoiseBuffer();
    this.noise = new AudioBufferSourceNode(this.context);
    this.noise.buffer = this.noiseBuffer;
    this.noise.loop = true;
    this.noise.connect(this.output);
  }
    
  start(time) {
    this.createNoise();
    this.noise.start(time);
  }
    
  stop(time) {
    this.noise.stop(time);  // NOTE: 'AudioBufferSourceNode' doesn't have a stop method 
  }
}