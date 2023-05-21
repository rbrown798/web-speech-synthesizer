/*
*   formant-filter.js
*/

import { AudioComponent } from "./audio-component.js";
import { AudioRateValue } from "./audio-rate-value.js";

export class FormantFilter extends AudioComponent {
  constructor(context) {
    super(context);

    this.bandpassFilter = new BiquadFilterNode(context, {type: 'bandpass', Q: 15});
    this.bandpassFilter.frequency.value = 0;
    this.bandpassFilter.connect(this.output);

    this.formantScale = new AudioRateValue(context, 1.0);
    this.formantScale.start();
    this.baseFreqGain = new GainNode(context);

    this.formantScale.connect(this.baseFreqGain);
    this.baseFreqGain.connect(this.bandpassFilter.frequency);
  }

  addInput(input) {
    input.connect(this.bandpassFilter);
  }

  setGain(gain, time, duration=0.5) {
    this.output.gain.setTargetAtTime(gain, time, duration);
  }

  setBaseFreq(freq, time, duration=0.5) {
    this.baseFreqGain.gain.setTargetAtTime(freq, time, duration);
  }

  setFormantScale(value) {
    this.formantScale.setValue(value);
  }
}