export default class Waveform {
    constructor(scene, analyser) {
      this.scene = scene;
      this.analyser = analyser;
      this.geometry = new THREE.BufferGeometry();
      this.waveformData = new Uint8Array(analyser.fftSize);
      this.createWaveform();
    }
  
    createWaveform() {
      var vertices = new Float32Array(this.analyser.fftSize * 3);
  
      for (var i = 0; i < this.analyser.fftSize; i++) {
        vertices[i * 3] = i - this.analyser.fftSize / 2;
        vertices[i * 3 + 1] = 0;
        vertices[i * 3 + 2] = 0;
      }
  
      this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  
      var material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
      this.waveform = new THREE.Points(this.geometry, material);
  
      this.scene.add(this.waveform);
    }
  
    updateWaveform() {
      this.analyser.getByteTimeDomainData(this.waveformData);
  
      var positions = this.waveform.geometry.attributes.position.array;
  
      for (var i = 0; i < this.analyser.fftSize; i++) {
        positions[i * 3 + 1] = (this.waveformData[i] / 128.0 - 1) * 10;
      }
  
      this.waveform.geometry.attributes.position.needsUpdate = true;
    }
  }
  
  // Export the Waveform class for usage in other scripts
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Waveform;
  } else {
    window.Waveform = Waveform;
  }
  