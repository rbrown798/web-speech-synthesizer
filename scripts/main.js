/*
* Parallel Formant Speech Synthesizer 
*/


// Parameters for synthesizing each phoneme
const PHONEMES = {
  iy: { type: "vowel", freqs: [270, 2290, 3010] },
  ih: { type: "vowel", freqs: [390, 1990, 2550] },
  ey: { type: "vowel", freqs: [480, 1720, 2520] },
  eh: { type: "vowel", freqs: [530, 1840, 2480] },
  er: { type: "vowel", freqs: [490, 1350, 1690] },
  ae: { type: "vowel", freqs: [660, 1720, 2410] },
  aa: { type: "vowel", freqs: [730, 1090, 2440] },
  ao: { type: "vowel", freqs: [600,  990, 2570] },
  ah: { type: "vowel", freqs: [570,  840, 2410] },
  ow: { type: "vowel", freqs: [414,  721, 2406] },
  uh: { type: "vowel", freqs: [440, 1020, 2240] },
  uw: { type: "vowel", freqs: [300,  870, 2240] },
  ax: { type: "vowel", freqs: [470, 1270, 1540] },  
  ay: { type: "vowel", freqs: [660, 1200, 2550] },
  aw: { type: "vowel", freqs: [640, 1230, 2550] },
  oy: { type: "vowel", freqs: [550,  960, 2400] },

  w: { type: "approximant", freqs: [290,  610, 2150] },
  y: { type: "approximant", freqs: [260, 2070, 3020] },
  r: { type: "approximant", freqs: [310, 1060, 1380] },
  l: { type: "approximant", freqs: [310, 1050, 2880] },

  m: { type: "nasal", freqs: [450, 1270, 2130] },
  n: { type: 'nasal', freqs: [450, 1340, 2470] },

  s: { type: "fricative", freqs: [4600, 0, 0], muls: [1.0, 0, 0] },
  sh: { type: "fricative", freqs: [2350, 0, 0], muls: [1.0, 0, 0] },
  f: { type: 'fricative', freqs: [2000, 0, 0], muls: [1.0, 0, 0] },
  th: { type: 'fricative', freqs: [1575, 0, 0], muls: [1.0, 0, 0] },

  z: { type: "fricative", voiced: true, freqs: [4600, 0, 0], muls: [1.0, 0, 0] },
  v: { type: 'fricative', voiced: true, freqs: [2000, 0, 0], muls: [1.0, 0, 0] },
  dh: { type: 'fricative', voiced: true, freqs: [1575, 0, 0], muls: [1.0, 0, 0] },


  t: { type: 'stop-consonant', oscFreqs: [400, 1600, 2600], noiseFreqs: [1902, 2913, 4040], noiseGains: [0.8, 0.2, 1, 0] },
  g: { type: 'stop-consonant', voiced: true, oscFreqs: [200, 1990, 2850], noiseFreqs: [1928, 4110, 4570], noiseGains: [0.8, 0.2, 1, 0] }, // added zero but weird


};


class AudioComponent {
  constructor(context) {
    this.context = context;
    this.output = new GainNode(this.context);
  }

  connect(destination) {
    this.output.connect(destination)
  }

  soundOn(time) {
    this.output.gain.setValueAtTime(1.0, time);
  }

  soundOff(time) {
    this.output.gain.setValueAtTime(0.001, time);
  }
}


class OscillatorSource extends AudioComponent {
  constructor(context) {
    super(context);

    this.context = context;
    this.oscillator = null;
    this.oscillatorType = 'sawtooth';

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

  setOscillatorType(type) {
    this.oscillatorType = type;
    if (this.oscillator) {
      this.oscillator.type = type;
    }
  }

  setModRate(freq) {

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
  }

  stop(time) {
    this.oscillator.stop(time);
  }
}


class Carrier extends AudioComponent {
  constructor(context) {
    super(context);

    this.context = context; 
    this.oscillatorSource = new OscillatorSource(this.context);
    this.noiseSource = new NoiseSource(this.context);
  }
  
}


class NoiseSource extends AudioComponent {
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



// Parallel filter bank with methods for setting filter frequencies, gains, and formant shift ratio
class FilterBank extends AudioComponent {
  constructor(context) {
    super(context);

    this.context = context;
    this.filters = null;
    this.filterGains = null;
    this.formantScale = 1.0;  // 1.0 is default 
    this.currentFreqs = null;
    this.createFilters();
  }

  createFilters() {
    // Create a bank of 3 resonant bandpass filters 
    this.createFilterGains();
    const filters = [];
    for (let i = 0; i < 4; i++) {                     // Change to 4 eventually 
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
}


class SpeechSynthesizer {
  constructor(context) {
    this.context = context;
    this.oscillatorSource = new OscillatorSource(audioContext);
    this.noiseSource = new NoiseSource(audioContext);
    this.filterBank = new FilterBank(audioContext);
    this.primaryGain = new GainNode(audioContext);
    this.lastPhoneme = null;
    this.speed = 1.0;
    this.useNoiseOnly = false;  // NOTE: all of the functions and conditionals within them are set when you press play

    this.filterBank.addInput(this.oscillatorSource);
    this.filterBank.addInput(this.noiseSource);
    this.filterBank.connect(this.primaryGain);
    this.primaryGain.connect(this.context.destination);
  }

  setFrequency(freq) {
    this.oscillatorSource.setFrequency(freq);
    this.noiseSource.setFrequency(freq);
  }

  setFormantScale(value) {
    this.filterBank.setFormantScale(value);
  }

  setOscillatorType(type) {
    if (type === 'noise') {
      this.useNoiseOnly = true;
      this.useNoiseSource(this.context.currentTime);
    } else {
      this.useNoiseOnly = false;
      this.oscillatorSource.setOscillatorType(type);
    }
  }

  setVibratoAmount(value) {
    this.oscillatorSource.setModAmount(value);
  }

  start(time) {
    this.oscillatorSource.start(time);
    this.noiseSource.start(time);
  }

  stop(time) {
    this.oscillatorSource.stop(time);
    this.noiseSource.stop(time);
  }

  say(inputString) {
    let time = this.context.currentTime;
    // Start audio
    this.start(time);

    // Convert the string into an array. Filter out any invalid input 
    const validNames = [...Object.keys(PHONEMES), 'hh', '.'];
    const phonemeNames = inputString.split(' ').filter(name => validNames.includes(name));

    // Loop through each phoneme/command name in the string and synthesize the phoneme it represents 
    for (let [index, phonemeName] of phonemeNames.entries()) {
      switch(phonemeName) {
        case '.':
          time += this.handlePause(time);
          break;
        case 'hh':  // The phoneme 'HH' is a special case, because it is an aspirated version of the upcoming vowel
          time += this.handleAspirate(phonemeNames[index+1], time);
          break;
        default:
          time += this.handlePhoneme(phonemeName, time);
          break;
      }
    }
    // Stop audio
    this.stop(time);
  }

  handlePause(time) {
    this.filterBank.soundOff(time);
    this.filterBank.soundOn(time+0.5);
    this.lastPhoneme = null;
    return 0.25 * 1/this.speed;
  }

  handleAspirate(nextPhonemeName, time) {            // make nextPhonemeName=null by default
    this.useNoiseSource(time);
    this.noiseSource.amplitudeModOff(time);
    
    // The 'HH' sound is an aspirated of the next phoneme. If the next phoneme isn't a vowel, or doesn't exist, 
    // default to using the formant frequencies of the 'AA' sound
    const nextPhoneme = PHONEMES[nextPhonemeName];
    if (nextPhoneme?.type === 'vowel') {
      this.filterBank.setFreqs(nextPhoneme.freqs, time, 0.0);
    } else {
      this.filterBank.setFreqs(PHONEMES['aa'].freqs, time, 0.0);
    }
    return 0.25 * 1/this.speed;
  }

  handlePhoneme(phonemeName, time) {
    const phoneme = PHONEMES[phonemeName];
    let duration = 0.0;

    switch (phoneme.type) {
      case 'vowel':
        duration = this.handleVowel(phoneme, time);
        break;
      case 'approximant':
        duration = this.handleApproximant(phoneme, time);
        break;
      case 'nasal':
        duration = this.handleNasal(phoneme, time);
        break;
      case 'fricative':
        duration = this.handleFricative(phoneme, time);
        break;
      case 'stop-consonant':
        duration = this.handleStopConsonant(phoneme, time);
        break;
      default:
        break;
    }
    this.lastPhoneme = phoneme;
    return duration;
  }

  handleVowel(phoneme, time) {
    this.handleSonorant(phoneme, time, 0.05);
    return 0.25 * 1/this.speed; 
  }

  handleApproximant(phoneme, time) {
    this.handleSonorant(phoneme, time, 0.02);
    return 0.05 * 1/this.speed;
  }

  handleNasal(phoneme, time) {
    this.handleSonorant(phoneme, time, 0.01);
    // this.filterBank.nasalFormantOn(time);
    return 0.05 * 1/this.speed;
  } 

  // Synthesize a sonorant sound 
  handleSonorant(phoneme, time, duration=0.05) { 
    // If the last phoneme was a sonorant, transition smoothly. If it was a fricative, transition abruptly  
    if (!this.lastPhoneme || this.lastPhoneme.type == 'fricative') {
      duration = 0.0;
    }
    if (this.useNoiseOnly) {
      this.useNoiseSource(time);
    } else {
      this.useOscillatorSource(time);
    }
    this.filterBank.setFreqs(phoneme.freqs, time, duration);
    this.filterBank.setGains([1,1,1,0], time, 0.0);
  }

  handleFricative(phoneme, time) {
    // Voiced fricatives are synthesized with amplitude-modulated noise 
    if (phoneme.voiced) {
      this.noiseSource.amplitudeModOn(time);
    } else {
      this.noiseSource.amplitudeModOff(time);
    }
    this.useNoiseSource(time);
    this.filterBank.setFreqs(phoneme.freqs, time, 0.0);
    this.filterBank.setGains([1, 0, 0, 0], time, 0.0);
    // this.filterBank.setGains(phoneme.muls, startTime, 0.0); // This needs to be modified since there are more than 3 filters 
    return 0.25 * 1/this.speed;
  }

  handleStopConsonant(phoneme, time) {
    this.handleOnGlide(phoneme, time);
    this.handleNoiseBurst(phoneme, time+0.05);
    return 0.1 * 1/this.speed;
  }

  handleOnGlide(phoneme, time) {
    if (phoneme.voiced) {
      this.filterBank.setFreqs(phoneme.oscFreqs, time, 0.05); // 0.02?
      this.filterBank.soundOff(time+0.05); 
    } 
    else {
      this.filterBank.setFreqs(phoneme.oscFreqs, time, 0.02);
      this.filterBank.soundOff(time+0.02);
    }
  }

  handleNoiseBurst(phoneme, time) {
    this.useNoiseSource(time);
    this.filterBank.setFreqs(phoneme.noiseFreqs, time, 0.0);
    this.filterBank.setGains(phoneme.noiseGains, time, 0.0);
    this.filterBank.soundOn(time);
    this.noiseSource.playEnvelope(time);
  }

  handleOffGlide(phoneme, time) {

  }  

  useOscillatorSource(time) {
    this.oscillatorSource.soundOn(time);
    this.noiseSource.soundOff(time);
  }

  useNoiseSource(time) {
    this.noiseSource.soundOn(time);
    this.oscillatorSource.soundOff(time);
  }
}




// -----------------------------------------------------------------------------

const audioContext = new (this.AudioContext || this.webkitAudioContext)();


const speechSynth = new SpeechSynthesizer(audioContext);
// speechSynth.setOscillatorType('square');

// const source = new OscillatorSource(audioContext);
// const filterBank = new FilterBank(audioContext);
// filterBank.addInput(source);
// filterBank.connect(audioContext.destination);
// filterBank.setFreqs(PHONEMES['aa'].freqs, audioContext.currentTime, 0.0);

const inputField = document.querySelector('#text-field');
const frequencySlider = document.querySelector('#frequency');
frequencySlider.addEventListener('input', () => {
  speechSynth.setFrequency(frequencySlider.value);
});

const formantShiftSlider = document.querySelector('#formant-shift');
formantShiftSlider.addEventListener('input', () => {
  speechSynth.setFormantScale(formantShiftSlider.value);
});

const oscillatorSelect = document.querySelector('#oscillator-select');
oscillatorSelect.addEventListener('change', () => { 
  speechSynth.setOscillatorType(oscillatorSelect.value);
});

// Set initial value 
speechSynth.setOscillatorType(oscillatorSelect.value); 


const vibratoSlider = document.querySelector('#vibrato');
vibratoSlider.addEventListener('change', () => {
  speechSynth.setVibratoAmount(vibratoSlider.value);
});


const playButton = document.querySelector('#say-button');
playButton.addEventListener('click', () => {
  // Get input text
  const phonemeString = inputField.value.trim().toLowerCase();  
  speechSynth.say(phonemeString);
  speechSynth.setFrequency(frequencySlider.value);
});