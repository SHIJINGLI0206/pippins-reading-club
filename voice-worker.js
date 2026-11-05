import { env, pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
let transcriber;

self.onmessage = async ({ data: samples }) => {
  try {
    transcriber ||= await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
      revision: '79fb389fc764e7c395bd330e9531d9d32ada7049',
      device: 'wasm',
      dtype: 'q8',
    });
    const result = await transcriber(samples, { max_new_tokens: 24 });
    self.postMessage({ text: result.text.trim() });
  } catch (error) {
    self.postMessage({ error: String(error) });
  }
};
