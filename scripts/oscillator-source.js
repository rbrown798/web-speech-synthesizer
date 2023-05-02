/*
*   oscillator-source.js
*   Oscillator with a frequency modulator for vibrato
*/

import { AudioComponent } from "./audio-component.js";
import { NoiseGenerator } from "./noise-generator.js";


export class OscillatorSource extends AudioComponent {
  constructor(context) {
    super(context);
  
    this.context = context;
    this.oscillator = null;
    this.oscillatorType = 'sawtooth';

    this.noise = new NoiseGenerator(context);
    this.noiseGain = new GainNode(context);
    this.noise.connect(this.noiseGain);
    this.noiseGain.connect(this.output);

    // this.noiseGain.gain.value = 0.5;
    // this.breathiness = 0.5;
  
    this.modOscillator = null;
    this.modGain = new GainNode(context);
  
    this.modAmount = 0;
    this.modRate = 7;
  }
  
  createOscillator() {
    this.oscillator = new OscillatorNode(this.context);
    this.oscillator.type = this.oscillatorType;
    this.oscillator.connect(this.output);
  }
  
  createFrequencyMod() {
    this.modOscillator = new OscillatorNode(this.context);
    this.modOscillator.frequency.value = this.modRate;
    this.modOscillator.connect(this.modGain);
    this.modGain.connect(this.oscillator.frequency);
    this.modGain.gain.value = 0;
  }
  
  setFrequency(freq) {
    this.oscillator.frequency.setValueAtTime(freq, this.context.currentTime);
  }

  setBreathiness(value) {
    this.noiseGain.gain.setValueAtTime(value, this.context.currentTime);
  }
  
  setOscillatorType(type) {
    this.oscillatorType = type;
    if (this.oscillator) {
      this.oscillator.type = type;
    }
  }

  setWaveform(type) {
    this.oscillatorType = type;
    if (this.oscillator) {
      this.oscillator.type = type;
    }
  }
  
  setModAmount(value) {
    // Scale the value (initially between 0 and 1) by a max value of 10 
    this.modGain.gain.setValueAtTime(10*value, this.context.currentTime);
  }
  
  start(time) {
    this.createOscillator(); // Oscillator has to be recreated once its stopped 
    this.createFrequencyMod();
    this.oscillator.start(time);
    this.modOscillator.start(time);
    this.noise.start(time);
  }
  
  stop(time) {
    this.oscillator.stop(time);
    this.noise.stop(time);
  }

  cancel() {
    super.cancel();
    if (this.oscillator) {
      this.stop(this.context.currentTime);
    }
  }
}