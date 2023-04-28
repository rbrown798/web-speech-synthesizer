/*
*   noise-source.js
*   White noise generator with an amplitude modulator (for voiced fricatives) and an envelope (for stop-consonants) 
*/

import { AudioComponent } from "./audio-component.js";


export class NoiseSource extends AudioComponent {
  constructor(context) {
    super(context);
  
    this.context = context;
    this.noiseBuffer = null;
    this.noise = null;
  
    this.noiseGain = new GainNode(context);     // 'noiseGain' will be used both as an envelope and an amplitude modulator 
    this.modGain = new GainNode(context);
    this.amplitudeMod = null;
  
    this.noiseGain.connect(this.output);
    this.modGain.connect(this.noiseGain.gain);
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
    this.noise.connect(this.noiseGain);
  }
  
  createAmplitudeMod() {
    this.amplitudeMod = new OscillatorNode(this.context, {type: 'square'});
    this.amplitudeMod.connect(this.modGain);
  }
  
  start(time) {
    this.createNoise();
    this.createAmplitudeMod();
    this.noise.start(time);
    this.amplitudeMod.start(time);
  }
  
  stop(time) {
    this.noise.stop(time);  // NOTE: 'AudioBufferSourceNode' doesn't have a stop method 
    this.amplitudeMod.stop(time);
  }
  
  setFrequency(freq) {
    this.amplitudeMod.frequency.setValueAtTime(freq, this.context.currentTime);
  }
 
  amplitudeModOn(time) {
    this.modGain.gain.setValueAtTime(1.0, time);
  }
  
  amplitudeModOff(time) {
    this.modGain.gain.setValueAtTime(0.001, time);
  }
  
  playEnvelope(time) {
    this.noiseGain.gain.setValueAtTime(1.0, time);
    this.noiseGain.gain.setTargetAtTime(0.0, time, 0.02);
    // Reset value 
    this.noiseGain.gain.setValueAtTime(1.0, time+0.02);
  }
}