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
    
    this.filterBank.addInput(this.oscillatorSource);
    this.filterBank.addInput(this.noiseSource);
    this.filterBank.connect(this.primaryGain);
    this.primaryGain.connect(this.context.destination);

    this.speed = 1.5;
    this.lastPhoneme = null;
    this.time = 0;
  }

  setFrequency(freq) {
    this.oscillatorSource.setFrequency(freq);
    this.noiseSource.setFrequency(freq);
  }

  setFormantScale(value) {
    this.filterBank.setFormantScale(value);
  }

  setWaveform(type) {
    this.oscillatorSource.setWaveform(type);
  }

  setVibratoAmount(value) {
    this.oscillatorSource.setModAmount(value);
  }

  setBreathiness(value) {
    this.oscillatorSource.setBreathiness(value);
  }

  start() {
    // this.cancel();
    this.oscillatorSource.start(this.time);
    this.noiseSource.start(this.time);
  }

  stop() {
    this.oscillatorSource.stop(this.time);
    this.noiseSource.stop(this.time);
  }

  cancel() {
    this.oscillatorSource.cancel();
    this.noiseSource.cancel();
    this.filterBank.cancel();
  }

  say(inputString) {
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
  //     this.oscillatorSource.oscillator.frequency.setValueAtTime(60, this.time);
  //   }
  //   else if (phonemeName !== 'hh' && this.stopped) {
  //     this.oscillatorSource.oscillator.frequency.setValueAtTime(60, this.time);
  //     this.stopped = false;
  //   }
  //   else if (nextPhonemeName === '.') {
  //     console.log("YES")
  //     this.oscillatorSource.oscillator.frequency.setValueAtTime(60, this.time);
  //     this.stopped = true;
  //   }

  //   else if (phonemeName !== 'hh') {
  //     this.oscillatorSource.oscillator.frequency.setValueAtTime(70, this.time);
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
    this.useNoiseSource();
    this.noiseSource.amplitudeModOff(this.time);
    
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

    this.useOscillatorSource();
    
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

    this.useOscillatorSource();

    // Set the filter parameters
    this.filterBank.setFreqs(phoneme.freqs, this.time, duration);
    this.filterBank.setGains([1, 1, 1, 0], this.time, 0.0);
  }

  handleFricative(phoneme) {
    // Voiced fricatives are synthesized with amplitude-modulated noise 
    if (phoneme.voiced) {
      this.noiseSource.amplitudeModOn(this.time);
    } 
    else {
      this.noiseSource.amplitudeModOff(this.time);
    }

    this.useNoiseSource();
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
    this.useOscillatorSource(); // This is necessary even if the previous sound was another stop-consonant
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
    this.useNoiseSource();
    this.filterBank.setFreqs(phoneme.noiseFreqs, this.time, 0.0);
    this.filterBank.setGains(phoneme.noiseGains, this.time, 0.0);
    this.filterBank.soundOn(this.time);
    this.noiseSource.amplitudeModOff(this.time);
    this.noiseSource.playEnvelope(this.time);
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

  useOscillatorSource() {
    this.oscillatorSource.soundOn(this.time);
    this.noiseSource.soundOff(this.time);
  }

  useNoiseSource() {
    this.noiseSource.soundOn(this.time);
    this.oscillatorSource.soundOff(this.time);
  }
}






// export class SpeechSynthesizer {
//   constructor(context) {
//     this._context = context;
//     this._oscillatorSource = new OscillatorSource(context);  // voicingSource
//     this._noiseSource = new NoiseSource(context);  // fricationSource
//     this._filterBank = new FilterBank(context);
//     this._primaryGain = new GainNode(context);
//     this._lastPhoneme = null;
//     this._speed = 1.0;

//     this._filterBank.addInput(this._oscillatorSource);
//     this._filterBank.addInput(this._noiseSource);
//     this._filterBank.connect(this._primaryGain);
//     this._primaryGain.connect(this._context.destination);
//   }

//   setFrequency(freq) {
//     this._oscillatorSource.setFrequency(freq);
//     this._noiseSource.setFrequency(freq);
//   }

//   setFormantScale(value) {
//     this._filterBank.setFormantScale(value);
//   }

//   setWaveform(type) {
//     this._oscillatorSource.setWaveform(type);
//   }

//   setVibratoAmount(value) {
//     this._oscillatorSource.setModAmount(value);
//   }

//   start(time) {
//     this._oscillatorSource.start(time);
//     this._noiseSource.start(time);
//   }

//   stop(time) {
//     this._oscillatorSource.stop(time);
//     this._noiseSource.stop(time);
//   }

//   say(inputString) {
//     let time = this._context.currentTime;
//     // Start audio
//     this.start(time);

//     // Convert the string into an array. Filter out any invalid input 
//     const validNames = [...Object.keys(PHONEMES), 'hh', '.'];
//     const phonemeNames = inputString.split(' ').filter(name => validNames.includes(name));

//     // Loop through each phoneme/command name in the string and synthesize the phoneme it represents 
//     for (let [index, phonemeName] of phonemeNames.entries()) {
//       switch(phonemeName) {
//         case '.':
//           time += this._handlePause(time);
//           break;
//         case 'hh':  // The phoneme 'HH' is a special case, because it is an aspirated version of the upcoming vowel
//           time += this._handleAspirate(phonemeNames[index+1], time);
//           break;
//         default:
//           time += this._handlePhoneme(phonemeName, time);
//           break;
//       }
//     }
//     // Stop audio
//     this.stop(time);
//   }

//   _handlePause(time) {
//     this._filterBank.soundOff(time);
//     this._filterBank.soundOn(time+0.5);
//     this._lastPhoneme = null;

//     // return DURATIONS['pause'] * 1/this.speed;
//     return 0.25 * 1/this._speed;
//   }

//   _handleAspirate(nextPhonemeName, time) {            // make nextPhonemeName=null by default
//     this._useNoiseSource(time);
//     this._noiseSource.amplitudeModOff(time);
    
//     /* The 'HH' sound is an aspirated of the next phoneme. If the next phoneme isn't a vowel, or doesn't exist, 
//        default to using the formant frequencies of the 'AA' sound */
//     const nextPhoneme = PHONEMES[nextPhonemeName];
//     if (nextPhoneme?.type === 'vowel') {
//       this._filterBank.setFreqs(nextPhoneme.freqs, time, 0.005);  // Slightly above 0 to prevent popping
//     } 
//     else {
//       this._filterBank.setFreqs(PHONEMES['aa'].freqs, time, 0.0);
//     }

//     // Set the last phoneme to null so that the next sonorant starts normally 
//     // (in case the previous phoneme was a stop-consonant)
//     this._lastPhoneme = null;

//     // return 0.25 * 1/this.speed;
//     return DURATIONS['aspirate'] * 1/this._speed;
//   }

//   _handlePhoneme(phonemeName, time) {
//     const phoneme = PHONEMES[phonemeName];
//     let duration = 0.0;

//     switch (phoneme.type) {
//       case 'vowel':
//         duration = this._handleVowel(phoneme, time);
//         break;
//       case 'approximant':
//         duration = this._handleApproximant(phoneme, time);
//         break;
//       case 'nasal':
//         duration = this._handleNasal(phoneme, time);
//         break;
//       case 'fricative':
//         duration = this._handleFricative(phoneme, time);
//         break;
//       case 'stop-consonant':
//         duration = this._handleStopConsonant(phoneme, time);
//         break;
//       default:
//         break;
//     }
//     this._lastPhoneme = phoneme;
//     return duration;
//   }

//   _handleVowel(phoneme, time) {
//     if (this._lastPhoneme?.type === 'stop-consonant') {
//       this._handleOffGlide(phoneme, time);
//     } 
//     else {
//       this._handleSonorant(phoneme, time, 0.05);
//     }
//     // return 0.25 * 1/this.speed; 
//     return DURATIONS['vowel'] * 1/this._speed;
//   }

//   _handleApproximant(phoneme, time) {
//     this._handleSonorant(phoneme, time, 0.02);
//     // return 0.05 * 1/this.speed;
//     return DURATIONS['approximant'] * 1/this._speed;
//   }

//   _handleNasal(phoneme, time) {
//     let duration = 0.01
//     if (!this._lastPhoneme || this._lastPhoneme.type === 'fricative') {
//       duration = 0.0;
//     }

//     this._useOscillatorSource(time);
  

//     // Use 4th formant filter, set at 270 for nasal cavity resonance 
//     this._filterBank.setFreqs([...phoneme.freqs, 270], time, duration);
//     this._filterBank.setGains([0.3, 0.1, 0.1, 1.0], time, duration);
//     // return 0.05 * 1/this.speed;
//     return DURATIONS['nasal'] * 1/this._speed;
//   } 

//   _handleSonorant(phoneme, time, duration=0.05) { 
//     // If the last phoneme was also a sonorant, transition smoothly. 
//     // If there was no last phoneme (ie. if this is the beginning of a word), 
//     // or if the last phoneme was a fricative, transition abruptly  
//     if (!this._lastPhoneme) {
//       duration = 0.0;
//     } 
//     else if (this._lastPhoneme.type === 'fricative') {
//       duration = 0.01; // Slightly above zero to prevent popping caused by changing the filter frequencies abruptly
//     }

//     this._useOscillatorSource(time);
    
//     // Set the filter parameters
//     this._filterBank.setFreqs(phoneme.freqs, time, duration);
//     this._filterBank.setGains([1, 1, 1, 0], time, 0.0);
//   }

//   _handleFricative(phoneme, time) {
//     // Voiced fricatives are synthesized with amplitude-modulated noise 
//     if (phoneme._voiced) {
//       this._noiseSource.amplitudeModOn(time);
//     } 
//     else {
//       this._noiseSource.amplitudeModOff(time);
//     }

//     this._useNoiseSource(time);
//     this._filterBank.setFreqs(phoneme.freqs, time, 0.0);
//     this._filterBank.setGains([1, 0, 0, 0], time, 0.0);
//     // this.filterBank.setGains(phoneme.muls, startTime, 0.0); // This needs to be modified since there are more than 3 filters 
//     // return 0.25 * 1/this.speed;
//     return DURATIONS['fricative'] * 1/this._speed;
//   }

//   _handleStopConsonant(phoneme, time) {
//     // Stop consonants have two parts: First the on-glide, which is a vocal-chord sound, followed by a pause.
//     // Then is the actual burst of noise 
//     this._handleOnGlide(phoneme, time);
//     this._handleNoiseBurst(phoneme, time+0.05);
//     // return 0.1 * 1/this.speed;
//     return DURATIONS['stopConsonant'] * 1/this._speed;
//   }

//   _handleOnGlide(phoneme, time) {
//     this._useOscillatorSource(time); // This is necessary even if the previous sound was another stop-consonant
//     if (phoneme.voiced) {
//       this._filterBank.setFreqs(phoneme.oscFreqs, time, 0.05); // 0.02?
//       this._filterBank.soundOff(time+0.05); 
//     } 
//     else {
//       this._filterBank.setFreqs(phoneme.oscFreqs, time, 0.02);
//       this._filterBank.soundOff(time+0.02);
//     }
//   }

//   _handleNoiseBurst(phoneme, time) {
//     this._useNoiseSource(time);
//     this._filterBank.setFreqs(phoneme.noiseFreqs, time, 0.0);
//     this._filterBank.setGains(phoneme.noiseGains, time, 0.0);
//     this._filterBank.soundOn(time);
//     this._noiseSource.amplitudeModOff(time);
//     this._noiseSource.playEnvelope(time);
//   }

//   _handleOffGlide(phoneme, time) {
//   /* Called when a sonorant begins after a stop consonant */
//     this._filterBank.soundOff(time);
//     this._filterBank.setFreqs(this._lastPhoneme.oscFreqs, time, 0.005);  // A little above one to prevent popping 

//     const startTime = time + this._lastPhoneme.voiceOnsetTime;  // The delay is different depending on the consonant 

//     this._filterBank.soundOn(startTime);

//     if (this._lastPhoneme.voiced) {
//       this._handleSonorant(phoneme, startTime, 0.05);  // Vowels following voiced stop consonants will have formant transitions
//     }
//     else {
//       this._handleSonorant(phoneme, startTime, 0.0); // Vowels following unvoiced stop consonants will not
//     }
//   }  

//   _useOscillatorSource(time) {
//     this._oscillatorSource.soundOn(time);
//     this._noiseSource.soundOff(time);
//   }

//   _useNoiseSource(time) {
//     this._noiseSource.soundOn(time);
//     this._oscillatorSource.soundOff(time);
//   }
// }