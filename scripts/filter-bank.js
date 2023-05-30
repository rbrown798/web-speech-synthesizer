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


/*
export class FilterBank extends AudioComponent {
  constructor(context) {
    super(context);
  
    this.context = context;
    this.filters = null;
    this.filterGains = null;
    this.filterBaseFreqGains = null;
    this.formantScale = new AudioRateValue(context, 1.0);
    this.formantScale = 1.0;  // 1.0 is default 

    this.currentFreqs = null;
    this.createFilters();
  }
  
  createFilters() {
    // Create a bank of 3 resonant bandpass filters 
    this.createFilterGains();
    const filters = [];
    for (let i = 0; i < 4; i++) {
      filters[i] = new BiquadFilterNode(this.context, {type: 'bandpass', Q: 15});
      filters[i].connect(this.filterGains[i]);
    }
    this.filters = filters;
  }
  
  createFilterGains() {
    const filterGains = [];
    for (let i = 0; i < 4; i++) {
      filterGains[i] = new GainNode(this.context);
      filterGains[i].connect(this.output);
    }
    this.filterGains = filterGains;
  }
  
  setFreqs(freqs, time, duration=0.5) {    
    for (let i = 0; i < freqs.length; i++) {
      this.filters[i].frequency.setTargetAtTime(freqs[i]*this.formantScale, time, duration);
    }  
    this.currentFreqs = freqs;
  }
  
  setGains(gains, time, duration=0.5) {
    for (let [index, filterGain] of this.filterGains.entries()) {
      filterGain.gain.setTargetAtTime(gains[index], time, duration);
    }
  }
  
  setFormantScale(scaleFactor) {
    this.formantScale = scaleFactor;
    this.setFreqs(this.currentFreqs, this.context.currentTime, 0.0); // This won't work right because setFreqs was already called with a previous scaleFactor
    // Maybe make a gain node that controls the frequency of each filter?
    // Maybe AudioParam() with some value that goes into a gain node that goes into the filter frequency? 
  }
  
  addInput(input) {
    for (let filter of this.filters) {
      input.connect(filter);
    }
  }

  cancel() {
    super.cancel();
    if (this.filters) {
      for (let filt of this.filters) {
        filt.frequency.cancelScheduledValues(this.context.currentTime);
        filt.gain.cancelScheduledValues(this.context.currentTime);
      }
    }
  }
}

*/