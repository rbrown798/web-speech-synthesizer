/*
*   audio-component.js
*   Base class with simple methods for connecting output and turning sound on and off
*/

export class AudioComponent {
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