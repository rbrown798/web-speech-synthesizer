/*
*   speech-synth.js
*   Main speech synthesizer with methods to pronounce a string of phonemes and to set the voice characteristics
*/

import { PHONEMES } from "./phonemes.js";
import { DURATIONS } from "./phonemes.js";
import { OscillatorSource } from "./oscillator-source.js";
import { NoiseSource } from "./noise-source.js";
import { FilterBank } from "./filter-bank.js";


export class SpeechSynthesizer {
  constructor(context) {
    this.context = context;
    this.oscillatorSource = new OscillatorSource(context);
    this.noiseSource = new NoiseSource(context);
    this.filterBank = new FilterBank(context);
    this.primaryGain = new GainNode(context);
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
    } 
    else {
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

    // return DURATIONS['pause'] * 1/this.speed;
    return 0.25 * 1/this.speed;
  }

  handleAspirate(nextPhonemeName, time) {            // make nextPhonemeName=null by default
    this.useNoiseSource(time);
    this.noiseSource.amplitudeModOff(time);
    
    /* The 'HH' sound is an aspirated of the next phoneme. If the next phoneme isn't a vowel, or doesn't exist, 
       default to using the formant frequencies of the 'AA' sound */
    const nextPhoneme = PHONEMES[nextPhonemeName];
    if (nextPhoneme?.type === 'vowel') {
      this.filterBank.setFreqs(nextPhoneme.freqs, time, 0.005);  // Slightly above 0 to prevent popping
    } 
    else {
      this.filterBank.setFreqs(PHONEMES['aa'].freqs, time, 0.0);
    }

    // Set the last phoneme to null so that the next sonorant starts normally 
    // (in case the previous phoneme was a stop-consonant)
    this.lastPhoneme = null;

    // return 0.25 * 1/this.speed;
    return DURATIONS['aspirate'] * 1/this.speed;
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
    if (this.lastPhoneme?.type === 'stop-consonant') {
      this.handleOffGlide(phoneme, time);
    } 
    else {
      this.handleSonorant(phoneme, time, 0.05);
    }
    // return 0.25 * 1/this.speed; 
    return DURATIONS['vowel'] * 1/this.speed;
  }

  handleApproximant(phoneme, time) {
    this.handleSonorant(phoneme, time, 0.02);
    // return 0.05 * 1/this.speed;
    return DURATIONS['approximant'] * 1/this.speed;
  }

  handleNasal(phoneme, time) {
    let duration = 0.01
    if (!this.lastPhoneme || this.lastPhoneme.type == 'fricative') {
      duration = 0.0;
    }

    if (this.useNoiseOnly) {
      this.useNoiseSource(time);
      this.noiseSource.amplitudeModOff(time);
    } 
    else {
      this.useOscillatorSource(time);
    }

    // Use 4th formant filter, set at 270 for nasal cavity resonance 
    this.filterBank.setFreqs([...phoneme.freqs, 270], time, duration);
    this.filterBank.setGains([0.3, 0.1, 0.1, 1.0], time, duration);
    // return 0.05 * 1/this.speed;
    return DURATIONS['nasal'] * 1/this.speed;
  } 

  handleSonorant(phoneme, time, duration=0.05) { 
    // If the last phoneme was also a sonorant, transition smoothly. 
    // If there was no last phoneme (ie. if this is the beginning of a word), 
    // or if the last phoneme was a fricative, transition abruptly  
    if (!this.lastPhoneme) {
      duration = 0.0;
    } 
    else if (this.lastPhoneme.type === 'fricative') {
      duration = 0.01; // Slightly above zero to prevent popping caused by changing the filter frequencies abruptly
    }

    // Use the oscillatorSource unless the waveform option is set to noise 
    if (this.useNoiseOnly) {
      this.useNoiseSource(time);
      this.noiseSource.amplitudeModOff(time);
    } 
    else {
      this.useOscillatorSource(time);
    }

    // Set the filter parameters
    this.filterBank.setFreqs(phoneme.freqs, time, duration);
    this.filterBank.setGains([1, 1, 1, 0], time, 0.0);
  }

  handleFricative(phoneme, time) {
    // Voiced fricatives are synthesized with amplitude-modulated noise 
    if (phoneme.voiced) {
      this.noiseSource.amplitudeModOn(time);
    } 
    else {
      this.noiseSource.amplitudeModOff(time);
    }

    this.useNoiseSource(time);
    this.filterBank.setFreqs(phoneme.freqs, time, 0.0);
    this.filterBank.setGains([1, 0, 0, 0], time, 0.0);
    // this.filterBank.setGains(phoneme.muls, startTime, 0.0); // This needs to be modified since there are more than 3 filters 
    // return 0.25 * 1/this.speed;
    return DURATIONS['fricative'] * 1/this.speed;
  }

  handleStopConsonant(phoneme, time) {
    // Stop consonants have two parts: First the on-glide, which is a vocal-chord sound, followed by a pause.
    // Then is the actual burst of noise 
    this.handleOnGlide(phoneme, time);
    this.handleNoiseBurst(phoneme, time+0.05);
    // return 0.1 * 1/this.speed;
    return DURATIONS['stopConsonant'] * 1/this.speed;
  }

  handleOnGlide(phoneme, time) {
    this.useOscillatorSource(time); // This is necessary even if the previous sound was another stop-consonant
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
    this.noiseSource.amplitudeModOff(time);
    this.noiseSource.playEnvelope(time);
  }

  handleOffGlide(phoneme, time) {
  /* Called when a sonorant begins after a stop consonant */
    this.filterBank.soundOff(time);
    this.filterBank.setFreqs(this.lastPhoneme.oscFreqs, time, 0.005);  // A little above one to prevent popping 

    const startTime = time + this.lastPhoneme.voiceOnsetTime;  // The delay is different depending on the consonant 

    this.filterBank.soundOn(startTime);

    if (this.lastPhoneme.voiced) {
      this.handleSonorant(phoneme, startTime, 0.05);  // Vowels following voiced stop consonants will have formant transitions
    }
    else {
      this.handleSonorant(phoneme, startTime, 0.0); // Vowels following unvoiced stop consonants will not
    }
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
