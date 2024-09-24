class RecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.recording = false;
    this.buffers = [];
  }

  process(inputs, outputs, parameters) {
    if (this.recording) {
      const input = inputs[0];
      this.buffers.push(input[0].slice());
    }
    return true;
  }
}

registerProcessor('recorder-worklet', RecorderWorklet);