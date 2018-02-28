import getUserMedia from 'getUserMedia';
//import screenLog from 'screenlog';
import Pitchfinder from 'Pitchfinder';

class Microphone {

	init() {
		this.maxVol = 1;
		this.pitch = 0;

		this.currentVol = 0;

		this.audio = document.querySelector('audio');

		this.micButton = document.getElementById('exp-mic-button');
		this.micButton.addEventListener('mousedown', this.onButton.bind(this));
		this.micButton.addEventListener('touchdown', this.onButton.bind(this));
		this.micButton.addEventListener('click', this.onButton.bind(this));
	}

	getPitchVal() {
		return this.pitch;
	}

	getCurrentVol() {
		return this.currentVol;
	}

	onButton() {
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new AudioContext();

		this.processor = this.audioContext.createScriptProcessor(2048);
		this.processor.connect(this.audioContext.destination);

		this.askForAccess();

		this.micButton.style.display = 'none';

		this.audio.muted = true;
		this.audio.volume = 0.000001;

		this.detectPitch = new Pitchfinder.YIN();

		this.processor.onaudioprocess = this.onAudioProcess.bind(this);
	}

	askForAccess() {
		getUserMedia(
			{video: false, audio: true}, this.onGetMedia.bind(this)
		);
	}

	onGetMedia(err, stream) {
		if (err) {
			console.log('error: ', err);
		} else {
			this.onAudioAccess(stream);
		}
	}

	onAudioAccess(stream) {
		this.audio.srcObject = stream;

		const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
		mediaStreamSource.connect(this.processor);
	}

	onAudioProcess(event) {
		this.buf = event.inputBuffer.getChannelData(0);
	    this.bufLength = this.buf.length;

		const p = this.detectPitch(this.buf);
		const fundalmentalFreq = p;
		if(fundalmentalFreq > 0) {
			this.pitch += (fundalmentalFreq - this.pitch )/4;
		} else {
			this.pitch = fundalmentalFreq;
		}
		if(this.pitch > 10000) this.pitch = null;

		this.calcVolume();
	}

	calcVolume() {
		let sum = 0;
		let x;
		let i;
		let iMax;
		const countEvery = 10;
		const length = this.buf.length;
		//let's calculate only every 10 elements
		for(i = 0, iMax = length; i < iMax; i=i+countEvery) {
			x = this.buf[i];
			sum += x*x;
		}
		//for (i=0; i<this.buf.length; i++) {
		//	x = this.buf[i];
		//	sum += x*x;
		//}
		this.currentVol = Math.sqrt(sum/(length/countEvery));

		this.maxVol = Math.max(this.maxVol, this.currentVol);
		this.maxVol *= 0.995;
		this.maxVol = Math.max(this.maxVol, 0.1);

		this.currentVol = (this.currentVol + this.currentVol/this.maxVol) * 0.5;
	}

}
export default Microphone;
