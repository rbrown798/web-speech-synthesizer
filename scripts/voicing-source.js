/*
*   voicing-source.js
*   Oscillator/Noise generator used for voicing in vowels/sonorants 
*/

import { AudioComponent } from "./audio-component.js";
import { Oscillator } from "./oscillator.js";
import { NoiseGenerator } from "./noise-generator.js";


export class VoicingSource extends AudioComponent {
  constructor(context) {
    super(context);
  
    this.context = context;

    this.oscillator = new Oscillator(context);
    this.oscillatorGain = new GainNode(context);
    this.oscillator.connect(this.oscillatorGain);
    this.oscillatorGain.connect(this.output);
    
    this.noise = new NoiseGenerator(context);
    this.noiseGain = new GainNode(context);
    this.noise.connect(this.noiseGain);
    this.noiseGain.connect(this.output);

    this.waveform = 'sawtooth';
    this.breathiness = 0;
  }
    
  setFrequency(freq) {
    this.oscillator.setFrequency(freq);
  }

  setBreathiness(value) {
    this.breathiness = value;
    if (this.waveform !== "noise") {
      this.noiseGain.gain.setValueAtTime(value, this.context.currentTime);
    }
  }
  
  setWaveform(type) {
    this.waveform = type;
    if (type === 'noise') { // Only use the noise generator
      this.oscillatorGain.gain.setValueAtTime(0.001, this.context.currentTime);
      this.noiseGain.gain.setValueAtTime(1, this.context.currentTime);
    }
    else if (this.oscillator) { // Use both
      this.oscillator.setWaveform(type);
      this.oscillatorGain.gain.setValueAtTime(1, this.context.currentTime);
      this.noiseGain.gain.setValueAtTime(this.breathiness, this.context.currentTime);
    }
  }
  
  setModAmount(value) {
    this.oscillator.setModAmount(value);
  }
  
  start(time) {
    this.oscillator.start(time);
    this.noise.start(time);
  }
  
  stop(time) {
    this.oscillator.stop(time);
    this.noise.stop(time);
  }

  cancel() {
    super.cancel();
    this.oscillator.cancel();
    this.noise.cancel();
  }
}