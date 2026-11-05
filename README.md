# Pippin’s Reading Club

A seven-day Year 2 reading and pen-and-paper writing practice site for families in Aotearoa New Zealand.

Serve the folder with `python3 -m http.server 8000` and open http://localhost:8000. The site has no dependencies or build step.

To publish on GitHub Pages, open the repository’s **Settings → Pages**, select **Deploy from a branch**, and publish **main / (root)**. All asset links are relative and the pages use hash navigation.

The site saves progress and optional notes in browser local storage. Clearing that storage removes the records. Notes and handwriting stay with the family. The Review page includes a printable summary.

Speaker buttons use the browser’s text-to-speech voices. New Zealand English is preferred when available. Open **Hear a word** under a passage to listen to individual words.

**Spell with Pippin** accepts spoken words or short spelling questions and displays a flashcard. It tries browser recognition first, preferring installed New Zealand or Australian English speech packs. If the speech service fails, it can record a short clip and transcribe it on the device using [Transformers.js](https://huggingface.co/docs/transformers.js/v3.8.1/en/installation) and [Whisper Tiny English](https://huggingface.co/Xenova/whisper-tiny.en). The fallback downloads model files once per browser cache and processes the audio locally. The site keeps requests in the open page only. Keyboard dictation and typed input also work.
