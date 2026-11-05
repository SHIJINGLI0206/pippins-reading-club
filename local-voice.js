(() => {
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !OfflineContext || !window.Worker) return;
  const workerUrl = new URL('./voice-worker.js', document.currentScript.src);
  let worker;
  let pending;
  let warmedUp = false;

  function transcribe(samples) {
    if (pending) {
      const previous = pending;
      pending = undefined;
      previous.reject(new Error('The previous voice request was interrupted.'));
      worker.terminate();
      worker = undefined;
      warmedUp = false;
    }
    return new Promise((resolve, reject) => {
      if (!worker) {
        worker = new Worker(workerUrl, { type: 'module' });
        worker.onmessage = event => {
          if (event.data.error) {
            console.warn('Pippin’s on-device voice:', event.data.error);
            pending?.reject(new Error('On-device voice recognition failed.'));
          } else {
            warmedUp = true;
            pending?.resolve(event.data.text);
          }
          pending = undefined;
        };
        worker.onerror = event => {
          console.warn('Pippin’s on-device voice:', event.message);
          pending?.reject(new Error('On-device voice files could not be loaded.'));
          pending = undefined;
          worker.terminate();
          worker = undefined;
          warmedUp = false;
        };
      }
      const limit = setTimeout(() => {
        worker.terminate();
        worker = undefined;
        pending = undefined;
        warmedUp = false;
        reject(new Error('On-device voice recognition timed out.'));
      }, 90_000);
      pending = {
        resolve(value) {
          clearTimeout(limit);
          resolve(value);
        },
        reject(error) {
          clearTimeout(limit);
          reject(error);
        },
      };
      worker.postMessage(samples, [samples.buffer]);
    });
  }

  async function decodeSpeech(blob) {
    const decoder = new OfflineContext(1, 1, 16000);
    const audio = await decoder.decodeAudioData(await blob.arrayBuffer());
    const samples = audio.getChannelData(0).slice();
    for (let channel = 1; channel < audio.numberOfChannels; channel += 1) {
      const other = audio.getChannelData(channel);
      for (let index = 0; index < samples.length; index += 1) samples[index] += other[index];
    }
    let energy = 0;
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] /= audio.numberOfChannels;
      energy += samples[index] ** 2;
    }
    return Math.sqrt(energy / samples.length) >= .002 ? samples : null;
  }

  function capture({ onListening, onProcessing }) {
    let stream;
    let recorder;
    let timer;
    let cancelled = false;

    function release() {
      clearTimeout(timer);
      stream?.getTracks().forEach(track => track.stop());
    }

    function stop() {
      clearTimeout(timer);
      if (recorder?.state === 'recording') recorder.stop();
    }

    async function record() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled) return null;
      recorder = new MediaRecorder(stream);
      return await new Promise((resolve, reject) => {
        const chunks = [];
        recorder.ondataavailable = event => {
          if (event.data.size) chunks.push(event.data);
        };
        recorder.onerror = event => reject(event.error || new Error('Audio recording failed.'));
        recorder.onstop = () => resolve(cancelled || !chunks.length ? null : new Blob(chunks, { type: recorder.mimeType }));
        recorder.start();
        timer = setTimeout(stop, 6500);
        onListening();
      });
    }

    async function recognize() {
      let blob;
      try {
        blob = await record();
      } finally {
        release();
      }
      if (cancelled || !blob) return '';
      onProcessing(warmedUp);
      const samples = await decodeSpeech(blob);
      if (cancelled || !samples) return '';
      return await transcribe(samples);
    }

    return {
      result: recognize(),
      stop,
      abort() {
        cancelled = true;
        stop();
        release();
      },
    };
  }

  window.pippinDeviceVoice = { capture };
})();
