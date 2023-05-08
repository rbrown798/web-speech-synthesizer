/*
*   main.js
*/

// TODO: Clean stuff up. handleNasal and handleSonorant do almost the same thing 
// 'D' followed by 'B' sounds broken
// Figure out why envelope for stop-consonants isn't doing anything
// Cancel scheduled value changes


import { SpeechSynthesizer } from "./speech-synth.js";

import { cmudict } from "./cmudict.js";


// Translate from cmu version to our version
const convertDiphthongs = phonemeString => {

  const conversions = {
    'AY': 'AY Y',
    'AW': 'AW W',
    'EY': 'EY Y',
    'OW': 'OW W',
    'OY': 'OY Y'
  }

  for (let [diphthong, conversion] of Object.entries(conversions)) {
    phonemeString = phonemeString.replace(diphthong, conversion);
  }

  console.log(phonemeString);

  return phonemeString;
}

// convert text to arpabet using the cmudict
const toPhonemes = inputString => {
  inputString = inputString.replace('\n', ' '); // Treat new lines like spaces
  let phonemeStr = '';
  for (let word of inputString.split(' ')) {
    // Look up the word in the cmudict
    const phonemes = cmudict[word.toUpperCase()];

    // If it's in the dictionary, add the phonemes to the new string
    if (phonemes) {
      const trimmedPhonemes = [];
      for (let p of phonemes) {
        const trimmed = p.replace(/\d+$/, '');  // trim stress number
        trimmedPhonemes.push(trimmed);
        // trimmedPhonemes.push(p);
      }
      phonemeStr += trimmedPhonemes.join(' ') + ' ';
    }
  }
  return convertDiphthongs(phonemeStr);
};

// Split sentences and translate each one into phonemes
const sentencesToPhonemes = inputString => {
  const sentences = inputString.split('.');
  let translated = [];
  for (let sentence of sentences) {
    translated.push(toPhonemes(sentence.trim()));
  }
  return translated.join(' . ');
}

// console.log(toPhonemes('hello there friends i am here'));


const audioContext = new AudioContext(); //new (this.AudioContext || this.webkitAudioContext)();
const speechSynth = new SpeechSynthesizer(audioContext);


const oscillatorSelect = document.querySelector('#oscillator-select');
oscillatorSelect.addEventListener('change', () => { 
  speechSynth.setWaveform(oscillatorSelect.value);
});

const frequencySlider = document.querySelector('#frequency');
frequencySlider.addEventListener('input', () => {
  speechSynth.setFrequency(frequencySlider.value);
});

const formantShiftSlider = document.querySelector('#formant-shift');
formantShiftSlider.addEventListener('input', () => {
  speechSynth.setFormantScale(formantShiftSlider.value);
});

const vibratoSlider = document.querySelector('#vibrato');
vibratoSlider.addEventListener('input', () => {
  speechSynth.setVibratoAmount(vibratoSlider.value);
});

const breathinessSlider = document.querySelector('#breathiness');
breathinessSlider.addEventListener('input', () => {
  speechSynth.setBreathiness(breathinessSlider.value);
});

const inputField = document.querySelector('#text-field');

const playButton = document.querySelector('#say-button');
playButton.addEventListener('click', () => {
  // Get input text

  // const phonemeString = inputField.value.trim().toLowerCase();  
  // speechSynth.say(phonemeString);

  const inputString = inputField.value.trim();
  speechSynth.say(sentencesToPhonemes(inputString).toLowerCase());

  speechSynth.setFrequency(frequencySlider.value);
  // speechSynth.setFormantScale(formantShiftSlider.value);
  speechSynth.setWaveform(oscillatorSelect.value); 
  speechSynth.setBreathiness(breathinessSlider.value);
});


// Set initial values
speechSynth.setFormantScale(formantShiftSlider.value);
speechSynth.setWaveform(oscillatorSelect.value); 
speechSynth.setBreathiness(breathinessSlider.value);