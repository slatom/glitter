import {VertexColors, Math as Math3, DoubleSide, WebGLRenderer, PerspectiveCamera, Scene, Color, Vector3, PointLight, AmbientLight, Mesh, CircleGeometry} from 'three';
import {PrefabBufferGeometry, PhongAnimationMaterial, ShaderChunk} from 'three-bas/dist/bas.js';
import Microphone from '../webcam/Microphone.js';
import getPointerPosition from '../../utils/getPointerPosition';
import ColorCalculations from './ColorCalculations';

class Glitter3d {

	init() {
		this.mParticleCount = 12000;

		this.dist = [0, 300, 600, 900];

		this.mTime = 0;
		this.mTimeStep = (1/60);
		this.mDuration = 13;

		this.microphone = new Microphone();
		this.microphone.init();

		this.colorCalculations = new ColorCalculations();
		this.colorCalculations.init();

		this.camxtarget = 0;
		this.camytarget = 0;

		this.xmouse = 0;
		this.ymouse = 0;
		this.xmouseTarget = 0;
		this.ymouseTarget = 0;

		this.pos = {x: 0, y: 0};

		this.rand1x = 0;
		this.rand1y = 0;
		this.rand2x = 0;
		this.rand2y = 0;

		this.minioffset2 = 0;
		this.minioffset = 0;

		this.prevposx = 0;
		this.prevposy = 0;
		this.posx = 0;
		this.posy = 0;

		this.randVolume = 4;

		this.ratio = 0;

		this.resizeHandler = window.addEventListener('resize', this.onResize.bind(this));
		this.mouseMoveHandler = window.addEventListener('mousemove', this.handleMouseMove.bind(this));
		this.touchMoveHandler = window.addEventListener('touchmove', this.handleMouseMove.bind(this));
		this.touchDownHandler = window.addEventListener('touchdown', this.handleMouseMove.bind(this));

		this.initTHREE();

		this.initParticleSystem();
		this.tick();
	}

	initTHREE() {
		this.mRenderer = new WebGLRenderer({antialias: false});
		this.mRenderer.setSize(window.innerWidth, window.innerHeight);

		this.mContainer = document.getElementById('three-container');
		this.mContainer.appendChild(this.mRenderer.domElement);

		this.mCamera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
		this.mCamera.position.set(0, 0, 880);

		this.mScene = new Scene();
		this.mScene.background = new Color(0x000000);

		const pointLight = new PointLight(0xffffff, 2, 20000, 2);
		pointLight.position.set(-500, 0, 300);
		this.mScene.add(pointLight);

		const ambientLight = new AmbientLight( 0xffffff, 0.45 );
		this.mScene.add(ambientLight);
	}

	handleMouseMove(event) {
		const pointerPosition = getPointerPosition(event);
		this.xmouseTarget = pointerPosition.x;
		this.ymouseTarget = pointerPosition.y;
	}

	calculateMousePosition() {
		this.xmouse += (this.xmouseTarget - this.xmouse)/4;
		this.ymouse += (this.ymouseTarget - this.ymouse)/4;

		const vector = new Vector3();
		vector.set((this.xmouse/window.innerWidth)*2-1, -(this.ymouse/window.innerHeight)*2+1, 0.5);
		vector.unproject(this.mCamera);

		const dir = vector.sub(this.mCamera.position).normalize();

		const distance = - this.mCamera.position.z / dir.z;

		this.pos = this.mCamera.position.clone().add(dir.multiplyScalar(distance));
	}

	onResize() {
		this.mCamera.aspect = window.innerWidth / window.innerHeight;
		this.mCamera.updateProjectionMatrix();

		this.mRenderer.setSize(window.innerWidth, window.innerHeight);
	}

	tick() {
		this.calculateMousePosition();
	    this.update();
	    this.render();

	    this.mTime += this.mTimeStep;

		requestAnimationFrame(this.tick.bind(this));
	}

	render() {
		this.mRenderer.render(this.mScene, this.mCamera);
	}

	update() {
		this.mParticleSystem.material.uniforms.uTime.value = this.mTime;

		const verticesLength = this.prefabGeometry.vertices.length;

		//start point random value
		const sstart = 5;
		//first control point random
		const s1 = 20;
		//second control point random
		const s2 = 20;

		//space size
		const spaceW = 300;
		const spaceH = 300;

		const sx = 0;
		const sx2 = 10;

		//end point random value
		const send = 200;

		const goback = 0.01;

		let x;
		let y;
		let z;

		//small camera movement
		this.moveCamera();

		//sometimes draw new values
		if(Math.random() > 0.9) {
			this.rand1x = Math3.randFloat(-s1, s1);
			this.rand1y = Math3.randFloat(-s1, s1);
		}
		if(Math.random() > 0.8) {
			this.rand2x = Math3.randFloat(-s2, s2);
			this.rand2y = Math3.randFloat(-s2, s2);
		}

		const targetposx = this.pos.x;
		const targetposy = this.pos.y;

		let speedx = 0;
		let speedy = 0;

		this.volume = this.microphone.getCurrentVol();

		const pitch = this.microphone.getPitchVal();

		const minFr = 10;
		const maxFr = 1500;
		const ratio = Math.max(0, Math.min(1, (pitch-minFr)/(maxFr-minFr)));
		const ratio2 = Math.min(this.volume*2, 1);

		const color = this.colorCalculations.getGradientValue(ratio, ratio2);

		let volRandX;
		let volRandY;
		let x1;
		let y1;
		let z1;
		let x2;
		let y2;
		let z2;
		let xend;
		let yend;
		let zend;
		let c;
		let arrPos;

		for(let i = 0; i < this.mParticleCount; i++) {
			const d = this.aOffset.array[i*verticesLength];

			if(d + this.mTime >= this.mDuration) {
				if(Math.random()>0.98) {
					x = Math3.randFloat(-spaceW, spaceW);
					y = Math3.randFloat(-spaceH, spaceH);
					z = 0;
				} else {
					this.prevposx = this.posx;
					this.prevposy = this.posy;
					this.posx += (targetposx - this.posx )/20;
					this.posy += (targetposy - this.posy )/20;

					speedx = this.prevposx-this.posx;
					speedy = this.prevposy-this.posy;

					x = this.posx + Math3.randFloat(-sstart, sstart);
					y = this.posy + Math3.randFloat(-sstart, sstart);
					z =  0;

					x += Math3.randFloat(-this.randVolume, this.randVolume) * this.volume * 0.9;
					y += Math3.randFloat(-this.randVolume, this.randVolume) * this.volume * 0.9;
				}

				this.minioffset++;
				this.minioffset2 += 1.7;

				volRandX = Math3.randFloat(-this.randVolume, this.randVolume) * this.volume * 0.7;
				volRandY = Math3.randFloat(-this.randVolume, this.randVolume) * this.volume * 0.7;


				this.aOffset.array[i*verticesLength] -= this.mDuration;

				x1 = -speedx*40 + x + Math.sin(this.minioffset2/50)*90 + Math.cos(this.minioffset2/100)*90 + this.rand1x;
				y1 = -speedy*40 + y + Math.sin(2+this.minioffset2/77)*90 + Math.cos(2+this.minioffset2/183)*90 + this.rand1y;
				z1 =  this.dist[1] +  Math.sin(1.1 + this.minioffset2/2000)*120;

				x1 += volRandX * 80;
			    y1 += volRandY * 80;

				x2 = x1 + Math.cos(this.minioffset2/250)*60 + Math.sin(this.mTime*3)*sx2 + this.rand2x;
				y2 = y1 + Math.sin(2+this.minioffset2/111)*60 + Math.cos(this.mTime*4)*sx2 +this.rand2y;
				z2 =  this.dist[2];

				x2 += volRandX * 170;
				y2 += volRandY * 170;

				xend = x2*goback+ Math3.randFloat(-send, send);
				yend = y2*goback + Math3.randFloat(-send, send);
				zend = 900 + Math.random()*1000;

				z1 += this.volume * 400;
				z2 += this.volume * 600;
				zend += this.volume * 600;

				c = color.clone();
				if(Math.random() > 0.97) {
					c = this.colorCalculations.addRandomness(c);
				}

				for(let j = 0; j < verticesLength; j++) {
					arrPos = (i*verticesLength + j)*3;
					this.aStartPosition.array[arrPos] = x;
					this.aStartPosition.array[arrPos+1] = y;
					this.aStartPosition.array[arrPos+2] = z;

					this.aControlPoint1.array[arrPos] = x1;
					this.aControlPoint1.array[arrPos+1] = y1;
					this.aControlPoint1.array[arrPos+2] =  z1;

					this.aControlPoint2.array[arrPos] = x2;
					this.aControlPoint2.array[arrPos+1] = y2;
					this.aControlPoint2.array[arrPos+2] = z2;

					this.aEndPosition.array[arrPos] = xend;
					this.aEndPosition.array[arrPos+1] = yend;
					this.aEndPosition.array[arrPos+2] = zend;

					this.aColor.array[arrPos] = c.r;
				    this.aColor.array[arrPos+1] = c.g;
				    this.aColor.array[arrPos+2] = c.b;
				}
				this.bufferGeometry.attributes.aStartPosition.needsUpdate = true;
				this.bufferGeometry.attributes.aControlPoint1.needsUpdate = true;
				this.bufferGeometry.attributes.aControlPoint2.needsUpdate = true;
				this.bufferGeometry.attributes.aEndPosition.needsUpdate = true;
				this.bufferGeometry.attributes.color.needsUpdate = true;
			}
		}
	}



	initParticleSystem() {
		this.prefabGeometry = new CircleGeometry(1.5, 5);
		this.bufferGeometry = new PrefabBufferGeometry(this.prefabGeometry, this.mParticleCount);

		this.bufferGeometry.computeVertexNormals();

		// generate additional geometry data
		this.aOffset = this.bufferGeometry.createAttribute('aOffset', 1);
		this.aStartPosition = this.bufferGeometry.createAttribute('aStartPosition', 3);
		this.aControlPoint1 = this.bufferGeometry.createAttribute('aControlPoint1', 3);
		this.aControlPoint2 = this.bufferGeometry.createAttribute('aControlPoint2', 3);
		this.aEndPosition = this.bufferGeometry.createAttribute('aEndPosition', 3);
		this.aAxisAngle = this.bufferGeometry.createAttribute('aAxisAngle', 4);
		this.aColor = this.bufferGeometry.createAttribute('color', 3);

		let i;
		let j;
		let offset;
		let delay;

		const verticesLength = this.prefabGeometry.vertices.length;

		for (i = 0, offset = 0; i < this.mParticleCount; i++) {
		    delay = i / this.mParticleCount * this.mDuration;
		    for (j = 0; j < verticesLength; j++) {
		        this.aOffset.array[i * verticesLength + j] = delay;
		    }
		}

		// buffer start positions
		let x;
		let y;
		let z;

		for (i = 0, offset = 0; i < this.mParticleCount; i++) {
			x = Math3.randFloat(-100, 100);
			y = Math3.randFloat(-100, 100);
			z = this.dist[0] + 10000;
			for (j = 0; j < this.prefabGeometry.vertices.length; j++) {
				  this.aStartPosition.array[(i*verticesLength + j)*3] = x;
				  this.aStartPosition.array[(i*verticesLength + j)*3+1] = y;
				  this.aStartPosition.array[(i*verticesLength + j)*3+2] = z;
				}
			}

			// buffer control points
			for (i = 0, offset = 0; i < this.mParticleCount; i++) {
			const xx = 200;
			const yy = 200;
			x = Math3.randFloat(-40 - xx, 40 + xx);
			y = Math3.randFloat(-40- yy, 40 + yy);
			z = this.dist[1] + 10000;
			for (j = 0; j < this.prefabGeometry.vertices.length; j++) {
			  this.aControlPoint1.array[offset++] = x;
			  this.aControlPoint1.array[offset++] = y;
			  this.aControlPoint1.array[offset++] = z;
			}
		}

		for (i = 0, offset = 0; i < this.mParticleCount; i++) {
			const xx = 100;
			const yy = 100;
			x = Math3.randFloat(-40 - xx, 40 + xx);
			y = Math3.randFloat(-40- yy, 40 + yy);
			z = this.dist[2] +10000;
			for (j = 0; j < this.prefabGeometry.vertices.length; j++) {
			  this.aControlPoint2.array[offset++] = x;
			  this.aControlPoint2.array[offset++] = y;
			  this.aControlPoint2.array[offset++] = z;
			}
		}

		// buffer end positions
		const spread = 1000;
		for (i = 0, offset = 0; i < this.mParticleCount; i++) {
			x = Math3.randFloat(-spread, spread);
			y = Math3.randFloat(-spread, spread);
			z = this.dist[3] +10000;

			for (j = 0; j < this.prefabGeometry.vertices.length; j++) {
			  this.aEndPosition.array[offset++] = x;
			  this.aEndPosition.array[offset++] = y;
			  this.aEndPosition.array[offset++] = z;
			}
		}

		// buffer color
		const color = new Color();
		for (i = 0, offset = 0; i < this.mParticleCount; i++) {
			color.setHSL(0, 1, 0);
			for (j = 0; j < this.prefabGeometry.vertices.length; j++) {
			  this.aColor.array[offset++] = color.r;
			  this.aColor.array[offset++] = color.g;
			  this.aColor.array[offset++] = color.b;
			}
		}

	    // buffer axis angle
	    const axis = new Vector3();
	    let angle = 0;
	    for (i = 0, offset = 0; i < this.mParticleCount; i++) {
	        axis.x = Math3.randFloatSpread(2);
	        axis.y = Math3.randFloatSpread(2);
	        axis.z = Math3.randFloatSpread(2);

	        axis.normalize();

	        angle = 3.14 * Math3.randInt(16, 32);
	        for (j = 0; j < this.prefabGeometry.vertices.length; j++) {
	            this.aAxisAngle.array[offset++] = axis.x;
	            this.aAxisAngle.array[offset++] = axis.y;
	            this.aAxisAngle.array[offset++] = axis.z;
	            this.aAxisAngle.array[offset++] = angle;
	        }
	    }

	    this.material = new PhongAnimationMaterial(
	        // custom parameters & THREE.MeshPhongMaterial parameters
	        {
	            vertexColors: VertexColors,
	            flatShading: true,
	            side: DoubleSide,
	            uniforms: {
	                uTime: {
	                    type: 'f',
	                    value: 0
	                },
	                uDuration: {
	                    type: 'f',
	                    value: this.mDuration
	                }
	            },
				vertexFunctions: [
					ShaderChunk.quaternion_rotation,
					ShaderChunk.cubic_bezier
				],
				vertexParameters: [
					'uniform float uTime;',
					'uniform float uDuration;',
					'attribute float aOffset;',
					'attribute vec3 aStartPosition;',
					'attribute vec3 aControlPoint1;',
					'attribute vec3 aControlPoint2;',
					'attribute vec3 aEndPosition;',
					'attribute vec4 aAxisAngle;'
				],
				vertexInit: [
					'float tProgress = mod((uTime + aOffset), uDuration) / uDuration;',
					//'float tProgress = (uTime + aOffset) / uDuration;',

					'float angle = aAxisAngle.w * tProgress / 3.0;',
					'vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, angle);'
				],
				vertexNormal: [
					'objectNormal = rotateVector(tQuat, objectNormal);'
				],
				vertexPosition: [
					'transformed = rotateVector(tQuat, transformed);',
					'transformed += cubicBezier(aStartPosition, aControlPoint1, aControlPoint2, aEndPosition, tProgress);'
				]
	        },
	        // THREE.MeshPhongMaterial uniforms
	        {
	            specular: 0xff0000,
	            shininess: 2000
	        }
	    );

		this.mParticleSystem = new Mesh(this.bufferGeometry, this.material);
		// because the bounding box of the particle system does not reflect its on-screen size
		// set this to false to prevent the whole thing from disappearing on certain angles
		this.mParticleSystem.frustumCulled = false;
		this.mScene.add(this.mParticleSystem);
	}

	moveCamera() {
		this.camxtarget += ((this.xmouse-window.innerWidth)/15-this.camxtarget)/30;
		this.camytarget += (-(this.ymouse-window.innerHeight)/15-this.camytarget)/30;
		this.mCamera.position.set(this.camxtarget, this.camytarget, 880);
	}
}
export default Glitter3d;
