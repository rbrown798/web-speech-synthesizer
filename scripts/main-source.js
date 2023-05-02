/*
*   main-source.js
*   Combined source that can switch between a noise source and an oscillator source 
*/

import { OscillatorSource } from "./oscillator-source.js";
import { NoiseSource } from "./noise-source.js";


export class MainSource extends AudioComponent {
  constructor(context) {
    super(context);
  
    this._useNoiseAlways = false; // True when 'Noise' is selected as the waveform. Calls to 'useOscillator()' and 'useNoise()' will be ignored with this flag.
  
    this._context = context; 
    this._oscillatorSource = new OscillatorSource(this.context);
    this._noiseSource = new NoiseSource(this.context);
  }
  
  setWaveform(type) {
    if (type === 'noise') {
      this._useNoiseAlways = true;
      this._noiseSource.soundOn(this._context.currentTime);
    } 
    else {
      this._oscillatorSource.setOscillatorType(type);
      this._useNoiseAlways = false;
    }
  }
  
  useOscillator(time) {
    if (!this._useNoiseAlways) {
      this._noiseSource.soundOff(time);
      this._oscillatorSource.soundOn(time);
    }
  }
  
  useNoise(time) {
    if (!this._useNoiseAlways) {
      this._oscillatorSource.soundOff(time);
      this._noiseSource.soundOn(time);
    }
  }
  
  setFrequency(freq) {
    this._oscillatorSource.setFrequency(freq);
    this._noiseSource.setFrequency(freq);
  }
}