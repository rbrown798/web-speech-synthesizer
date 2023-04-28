/*
*   main.js
*/

// TODO: Clean stuff up. handleNasal and handleSonorant do almost the same thing 
// 'D' followed by 'B' sounds broken


import { SpeechSynthesizer } from "./speech-synth.js";



const audioContext = new AudioContext(); //new (this.AudioContext || this.webkitAudioContext)();
const speechSynth = new SpeechSynthesizer(audioContext);

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