/*
*   main.js
*/

// TODO: Clean stuff up. handleNasal and handleSonorant do almost the same thing 
// 'D' followed by 'B' sounds broken
// Figure out why envelope for stop-consonants isn't doing anything
// Cancel scheduled value changes


import { SpeechSynthesizer } from "./speech-synth.js";

import { cmudict } from "./cmudict.js";

// convert text to arpabet using the cmudict
const toPhonemes = inputString => {
  let phonemeStr = '';
  for (let word of inputString.split(' ')) {
    const phonemes = cmudict[word.toUpperCase()];
    const trimmedPhonemes = [];
    for (let p of phonemes) {
      const trimmed = p.replace(/\d+$/, '');  // trim stress number
      trimmedPhonemes.push(trimmed);
    }
    phonemeStr += trimmedPhonemes.join(' ') + ' ';
  }
  return phonemeStr;
};

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
  speechSynth.say(toPhonemes(inputString).toLowerCase());

  speechSynth.setFrequency(frequencySlider.value);
  speechSynth.setFormantScale(formantShiftSlider.value);
  speechSynth.setWaveform(oscillatorSelect.value); 
  speechSynth.setBreathiness(breathinessSlider.value);
});


// Set initial values
speechSynth.setFormantScale(formantShiftSlider.value);
speechSynth.setWaveform(oscillatorSelect.value); 
speechSynth.setBreathiness(breathinessSlider.value);