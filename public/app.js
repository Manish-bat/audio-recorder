let audioContext;
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;

const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const playButton = document.getElementById('playButton');
const restartButton = document.getElementById('restartButton');
const saveButton = document.getElementById('saveButton');
const audioPlayer = document.getElementById('audioPlayer');
const audioUrlInput = document.getElementById('audioUrl');
const copyButton = document.getElementById('copyButton');

recordButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
playButton.addEventListener('click', playRecording);
restartButton.addEventListener('click', restartRecording);
saveButton.addEventListener('click', saveRecording);
copyButton.addEventListener('click', copyUrl);

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    
    const worklet = await audioContext.audioWorklet.addModule('recorder-worklet.js');
    const recorder = new AudioWorkletNode(audioContext, 'recorder-worklet');
    
    source.connect(recorder).connect(audioContext.destination);
    
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
    });
    
    mediaRecorder.start();
    
    recordButton.disabled = true;
    stopButton.disabled = false;
    playButton.disabled = true;
    restartButton.disabled = true;
    saveButton.disabled = true;
}

function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.addEventListener('stop', () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.innerHTML = `<audio controls src="${audioUrl}"></audio>`;
        
        recordButton.disabled = false;
        stopButton.disabled = true;
        playButton.disabled = false;
        restartButton.disabled = false;
        saveButton.disabled = false;
    });
}

function playRecording() {
    const audio = audioPlayer.querySelector('audio');
    audio.play();
}

function restartRecording() {
    audioChunks = [];
    audioPlayer.innerHTML = '';
    audioUrlInput.value = '';
    
    recordButton.disabled = false;
    stopButton.disabled = true;
    playButton.disabled = true;
    restartButton.disabled = true;
    saveButton.disabled = true;
}

async function saveRecording() {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    try {
        const response = await fetch('/api/save-audio', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            audioUrlInput.value = data.url;
        } else {
            console.error('Failed to save recording');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function copyUrl() {
    audioUrlInput.select();
    document.execCommand('copy');
}