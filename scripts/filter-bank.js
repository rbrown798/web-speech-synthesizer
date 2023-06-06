/* 
 *  filter-bank.js
 *  Formant filter bank with methods for setting filter frequencies, gains, and formant scale
*/ 

import { AudioComponent } from "./audio-component.js";
import { FormantFilter } from "./formant-filter.js";


export class FilterBank extends AudioComponent {
  constructor(context) {
    super(context);
  
    this.filters = null;
    this.createFilters();
  }
  
  createFilters() {
    // Create a bank of 3 resonant bandpass filters 
    const filters = [];
    for (let i = 0; i < 4; i++) {
      filters[i] = new FormantFilter(this.context);
      filters[i].connect(this.output);
    }
    this.filters = filters;
  }
  
  setFreqs(freqs, time, duration=0.5) {    
    for (let i = 0; i < freqs.length; i++) {
      this.filters[i].setBaseFreq(freqs[i], time, duration);
    }  
  }
  
  setGains(gains, time, duration=0.5) {
    for (let [index, filt] of this.filters.entries()) {
      filt.setGain(gains[index], time, duration);
    }
  }
  
  setFormantScale(value) {
    for (let filt of this.filters) {
      filt.setFormantScale(value);
    }
  }
  
  addInput(input) {
    for (let filt of this.filters) {
      filt.addInput(input);
    }
  }

  cancel() {
    super.cancel();
    if (this.filters) {
      for (let filt of this.filters) {
        filt.cancel();
      }
    }
  }
}