/*
*   speech-synth.js
*   Main speech synthesizer with methods to pronounce a string of phonemes and to set the voice characteristics
*/

import { PHONEMES } from "./phonemes.js";
import { DURATIONS } from "./phonemes.js";
import { VoicingSource } from "./voicing-source.js";
import { BreathSource } from "./breath-source.js";
import { FilterBank } from "./filter-bank.js";


export class SpeechSynthesizer {
  constructor(context) {
    this.context = context;
    this.voicingSource = new VoicingSource(context);
    this.breathSource = new BreathSource(context);
    this.filterBank = new FilterBank(context);
    this.primaryGain = new GainNode(context);
    
    this.filterBank.addInput(this.voicingSource);
    this.filterBank.addInput(this.breathSource);
    this.filterBank.connect(this.primaryGain);
    this.primaryGain.connect(this.context.destination);

    this.speed = 1.5;
    this.lastPhoneme = null;
    this.time = 0;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setFrequency(freq) {
    this.voicingSource.setFrequency(freq);
    this.breathSource.setFrequency(freq);
  }

  setFormantScale(value) {
    this.filterBank.setFormantScale(value);
  }

  setWaveform(type) {
    this.voicingSource.setWaveform(type);
  }

  setVibratoAmount(value) {
    this.voicingSource.setModAmount(value);
  }

  setBreathiness(value) {
    this.voicingSource.setBreathiness(value);
  }

  start() {
    // this.cancel();
    this.voicingSource.start(this.time);
    this.breathSource.start(this.time);
  }

  stop() {
    this.voicingSource.stop(this.time);
    this.breathSource.stop(this.time);
  }

  cancel() {
    this.voicingSource.cancel();
    this.breathSource.cancel();
    this.filterBank.cancel();
  }

  say(inputString) {
    this.cancel();

    this.time = this.context.currentTime;
    // Start audio
    this.start();

    // Convert the string into an array. Filter out any invalid input 
    const validNames = [...Object.keys(PHONEMES), 'hh', '.'];
    const phonemeNames = inputString.split(' ').filter(name => validNames.includes(name));

    // Loop through each phoneme/command name in the string and synthesize the phoneme it represents 
    for (let [index, phonemeName] of phonemeNames.entries()) {
      switch(phonemeName) {
        case '.':
          this.handlePause();
          break;
        case 'hh':  // The phoneme 'HH' is a special case, because it is an aspirated version of the upcoming vowel
          this.handleAspirate(phonemeNames[index+1]);
          break;
        default:
          this.handlePhoneme(phonemeName);
          break;
      }
    }
    // Stop audio
    this.stop();
    this.lastPhoneme = null;  // So that when it restarts it doesn't slide from the last sound
  }

  // handlePitchCurve(phonemeNames, index, inputString) {

  //   /*
  //     if it the first or last syllable in a sentence, the pitch will be 60 Hz
  //     otherwize, the pitch will be 70Hz 

  //   */

  //   const syllables = [['h','e'], ['l', 'ow']];
    
  //   const example = "hh eh l ow th ey r . hh ae w aa r y uw";
  //   const sentences = inputString.split('.'); // ["hh eh l ow dh ey r", "hh ae w aa r y uw"];

  //   for (let sentence of sentences) {
  //     const syllables = sentences.split()
  //   }

  //   const phonemeName = phonemeNames[index];
  //   const nextPhonemeName = phonemeNames[index+1];

  //   if (phonemeName === '.' || !this.lastPhoneme) {
  //     this.stopped = true;
  //     this.voicingSource.oscillator.frequency.setValueAtTime(60, this.time);
  //   }
  //   else if (phonemeName !== 'hh' && this.stopped) {
  //     this.voicingSource.oscillator.frequency.setValueAtTime(60, this.time);
  //     this.stopped = false;
  //   }
  //   else if (nextPhonemeName === '.') {
  //     console.log("YES")
  //     this.voicingSource.oscillator.frequency.setValueAtTime(60, this.time);
  //     this.stopped = true;
  //   }

  //   else if (phonemeName !== 'hh') {
  //     this.voicingSource.oscillator.frequency.setValueAtTime(70, this.time);
  //   }

  //   // sentences (separated by '.') --> syllables (separated by consonants) --> phonemes (separated by spaces);

  // }

  handlePause() {
    this.filterBank.soundOff(this.time);
    // this.filterBank.soundOn(this.time+0.5);  // maybe change this
    this.lastPhoneme = null;

    this.time += DURATIONS['pause'] * (1 / this.speed);
    this.filterBank.soundOn(this.time); // Unpause after the delay
  }

  handleAspirate(nextPhonemeName) {            // make nextPhonemeName=null by default
    this.usebreathSource();
    this.breathSource.amplitudeModOff(this.time);
    
    /* The 'HH' sound is an aspirated of the next phoneme. If the next phoneme isn't a vowel, or doesn't exist, 
       default to using the formant frequencies of the 'AA' sound */
    const nextPhoneme = PHONEMES[nextPhonemeName];
    if (nextPhoneme?.type === 'vowel') {
      this.filterBank.setFreqs(nextPhoneme.freqs, this.time, 0.005);  // Slightly above 0 to prevent popping
    } 
    else {
      this.filterBank.setFreqs(PHONEMES['aa'].freqs, this.time, 0.0);
    }

    // Set the last phoneme to null so that the next sonorant starts normally 
    // (in case the previous phoneme was a stop-consonant)
    this.lastPhoneme = null;

    this.time += DURATIONS['aspirate'] * (1 / this.speed);
  }

  setStress(stress) {

  }

  handlePhoneme(phonemeName) {

    // // If the phoneme name ends in a stress number, set the pitch
    // console.log('name', phonemeName.slice(-1));
    // if (!isNaN(phonemeName.slice(-1))) {
    //   this.setStress(phonemeName.slice(-1));
    //   phonemeName = phonemeName.slice(0, -1); // Remove the stress number
    // }

    const phoneme = PHONEMES[phonemeName];

    switch (phoneme.type) {
      case 'vowel':
        this.handleVowel(phoneme);
        break;
      case 'approximant':
        this.handleApproximant(phoneme);
        break;
      case 'nasal':
        this.handleNasal(phoneme);
        break;
      case 'fricative':
        this.handleFricative(phoneme);
        break;
      case 'stop-consonant':
        this.handleStopConsonant(phoneme);
        break;
      default:
        break;
    }
    this.lastPhoneme = phoneme;
    this.time += DURATIONS[phoneme.type] * (1 / this.speed);
  }

  handleVowel(phoneme) {
    if (this.lastPhoneme?.type === 'stop-consonant') {
      this.handleOffGlide(phoneme);
    } 
    else {
      this.handleSonorant(phoneme, 0.05);
    }
  }

  handleApproximant(phoneme) {
    this.handleSonorant(phoneme, 0.02);
  }

  handleNasal(phoneme) {
    let duration = 0.01
    if (!this.lastPhoneme || this.lastPhoneme.type == 'fricative') {
      duration = 0.0;
    }

    this.usevoicingSource();
    
    // Use 4th formant filter, set at 270 for nasal cavity resonance 
    this.filterBank.setFreqs([...phoneme.freqs, 270], this.time, duration);
    this.filterBank.setGains([0.3, 0.1, 0.1, 1.0], this.time, duration);
  } 

  handleSonorant(phoneme, duration=0.05) { 
    // If the last phoneme was also a sonorant, transition smoothly. 
    // If there was no last phoneme (ie. if this is the beginning of a word), 
    // or if the last phoneme was a fricative, transition abruptly  
    if (!this.lastPhoneme) {
      duration = 0.0;
    } 
    else if (this.lastPhoneme.type === 'fricative') {
      duration = 0.01; // Slightly above zero to prevent popping caused by changing the filter frequencies abruptly
    }

    this.usevoicingSource();

    // Set the filter parameters
    this.filterBank.setFreqs(phoneme.freqs, this.time, duration);
    this.filterBank.setGains([1, 1, 1, 0], this.time, 0.0);
  }

  handleFricative(phoneme) {
    // Voiced fricatives are synthesized with amplitude-modulated noise 
    if (phoneme.voiced) {
      this.breathSource.amplitudeModOn(this.time);
    } 
    else {
      this.breathSource.amplitudeModOff(this.time);
    }

    this.usebreathSource();
    this.filterBank.setFreqs(phoneme.freqs, this.time, 0.0);
    this.filterBank.setGains([1, 0, 0, 0], this.time, 0.0);
  }

  handleStopConsonant(phoneme) {
    // Stop consonants have two parts: First the on-glide, which is a vocal-chord sound, followed by a pause.
    // Then is the actual burst of noise 
    this.handleOnGlide(phoneme);
    this.handleNoiseBurst(phoneme);
  }

  handleOnGlide(phoneme) {
    this.usevoicingSource(); // This is necessary even if the previous sound was another stop-consonant
    if (phoneme.voiced) {
      this.filterBank.setFreqs(phoneme.oscFreqs, this.time, 0.05); // 0.02?
      this.filterBank.soundOff(this.time+0.05); 
    } 
    else {
      this.filterBank.setFreqs(phoneme.oscFreqs, this.time, 0.02);
      this.filterBank.soundOff(this.time+0.02);
    }
    this.time += 0.05;
  }

  handleNoiseBurst(phoneme) {
    this.usebreathSource();
    this.filterBank.setFreqs(phoneme.noiseFreqs, this.time, 0.0);
    this.filterBank.setGains(phoneme.noiseGains, this.time, 0.0);
    this.filterBank.soundOn(this.time);
    this.breathSource.amplitudeModOff(this.time);
    this.breathSource.playEnvelope(this.time);

    // this.time += 0.02;
  }

  handleOffGlide(phoneme) {
  /* Called when a sonorant begins after a stop consonant */
    this.filterBank.soundOff(this.time);
    this.filterBank.setFreqs(this.lastPhoneme.oscFreqs, this.time, 0.005);  // A little above one to prevent popping 

    // const startTime = this.time + this.lastPhoneme.voiceOnsetTime;  // The delay is different depending on the consonant 

    this.time += this.lastPhoneme.voiceOnsetTime;   // The delay is different depending on the consonant 

    this.filterBank.soundOn(this.time);

    if (this.lastPhoneme.voiced) {
      this.handleSonorant(phoneme, 0.05);  // Vowels following voiced stop consonants will have formant transitions
    }
    else {
      this.handleSonorant(phoneme, 0.0); // Vowels following unvoiced stop consonants will not
    }
  }  

  usevoicingSource() {
    this.voicingSource.soundOn(this.time);
    this.breathSource.soundOff(this.time);
  }

  usebreathSource() {
    this.breathSource.soundOn(this.time);
    this.voicingSource.soundOff(this.time);
  }
}