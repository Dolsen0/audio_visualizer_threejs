import Waveform from './waveform.js';


// Create a scene
var scene = new THREE.Scene();

// Create a camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create a renderer with antialiasing and set its size and background color
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x202020); // Dark grey background color
document.body.appendChild(renderer.domElement);

// Create a color object
var color = new THREE.Color();

// Create bars
var bars = [];
for (let i = 0; i < 32; i++) {
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  color.setHSL(i/32, 1, 0.5); // Set color based on hue
  let material = new THREE.MeshBasicMaterial({ color: color });
  let bar = new THREE.Mesh(geometry, material);
  bar.position.set(i - 16, 0, 0);
  bars.push(bar);
  scene.add(bar);
}

// Create an AudioContext
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create an AnalyserNode
var analyser = audioContext.createAnalyser();
analyser.fftSize = 64; // This needs to be a power of 2 and determines the number of bars

// Create a Waveform object
var waveform = new Waveform(scene, analyser);

// Fetch the audio file
const audioFileUrl = './assets/sample.mp3';
fetch(audioFileUrl)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    // Access metadata
    const artist = audioBuffer.artist;
    const title = audioBuffer.title;

    // Update HTML content
    document.getElementById('artist').textContent = artist || '';
    document.getElementById('title').textContent = title || '';

    // Extract the filename from the URL
    const filename = audioFileUrl.substring(audioFileUrl.lastIndexOf('/') + 1);

    // Update HTML content with the filename
    document.getElementById('filename').textContent = filename;

    // Create a BufferSourceNode
    let source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Connect the nodes
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Start the source playing
    source.start();

    // Start the render loop
    render();

    // Log the audioBuffer
    console.log(audioBuffer);
  })
  .catch(error => console.error('Error:', error));


// Create a data array for the frequency data
var frequencyData = new Uint8Array(analyser.frequencyBinCount);

// Define the render function
function render() {
  requestAnimationFrame(render);
  
  // Get the frequency data
  analyser.getByteFrequencyData(frequencyData);
  
  // Update the height of each bar
  for (let i = 0; i < bars.length; i++) {
    let value = frequencyData[i];
    let percent = value / 256;
    let height = 30 * percent;
    bars[i].scale.y = height;
  }

  // Update the waveform
  waveform.updateWaveform();

  // Render the scene
  renderer.render(scene, camera);
}


// mp3 must be added into assets folder. Can be titled 'sample.mp3' or modify fetch to match file name

// // run in terminal: npm install three

// // run in root folder to start: python -m http.server  

  // // Run this code in a browser with Three.js and OrbitControls loaded