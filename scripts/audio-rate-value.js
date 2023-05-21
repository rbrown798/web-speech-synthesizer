/*
*   audio-rate-value.js
*/

import { AudioComponent } from './audio-component.js';

export class AudioRateValue extends AudioComponent {  // ConstantSignal
  constructor(context, defaultValue=1.0) {
    super(context);

    this.output.gain.setValueAtTime(defaultValue, this.context.currentTime);
    this.buffer = null;
    this.sourceNode = null;
    this.createBuffer();
  }

  createBuffer() {
    // Define the buffer properties
    const numberOfChannels = 1; // Mono
    const sampleRate = this.context.sampleRate;
    const bufferSize = 1; // Single-sample buffer

    // Create an AudioBuffer with a single value 1
    const audioBuffer = this.context.createBuffer(numberOfChannels, bufferSize, sampleRate);
    const channelData = audioBuffer.getChannelData(0); // Get the audio data for the single channel      
    channelData[0] = 1; 

    this.buffer = audioBuffer;
  }

  createSourceNode() {
    // Create an AudioBufferSourceNode
    const sourceNode = this.context.createBufferSource();  // constant output of 1 at audio rate
    // Set the audio buffer to the source node
    sourceNode.buffer = this.buffer;
    sourceNode.loop = true;
    sourceNode.connect(this.output);
    this.sourceNode = sourceNode;
  }

  start() {
    this.createSourceNode();
    this.sourceNode.start(this.context.currentTime);
  }

  setValue(value) {
    this.output.gain.setValueAtTime(value, this.context.currentTime);
  }
}