/*
*   breath-source.js
*   White noise generator with an amplitude modulator (for voiced fricatives) and an envelope (for stop-consonants) 
*   Also used for aspirate phoneme 
*/

import { AudioComponent } from "./audio-component.js";
import { NoiseGenerator } from "./noise-generator.js";


export class BreathSource extends AudioComponent {
  constructor(context) {
    super(context);
  
    this.context = context;
    this.noise = new NoiseGenerator(context);
  
    this.noiseGain = new GainNode(context);     // 'noiseGain' will be used both as an envelope and an amplitude modulator 
    this.modGain = new GainNode(context);
    this.amplitudeMod = null;
  
    this.noise.connect(this.noiseGain);
    this.noiseGain.connect(this.output);
    this.modGain.connect(this.noiseGain.gain);
  }
  
  createAmplitudeMod() {
    this.amplitudeMod = new OscillatorNode(this.context, {type: 'square'});
    this.amplitudeMod.connect(this.modGain);
  }
  
  start(time) {
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

  cancel() {
    super.cancel();
    this.modGain.gain.cancelScheduledValues(this.context.currentTime);
    this.noiseGain.gain.cancelScheduledValues(this.context.currentTime);
    this.noise.cancel();
  }
}