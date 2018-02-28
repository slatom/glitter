import {Color} from 'three';

class ColorCalculations {

	init() {
		this.color1 = new Color('#104469');
		this.color2 = new Color('#98d0d1');
		this.color3 = new Color('#9c8725');
		this.colorWhite = new Color('#222222');
	}

	getGradientValue(ratio, ratio2) {
		let c1;
		let c2;
		if(ratio < 0.5 ) {
			ratio = ratio * 2;
			c1 = this.color2.clone();
			c2 = this.color1.clone();
		} else {
			ratio = (ratio-0.5) * 2;
			c1 = this.color3.clone();
			c2 = this.color2.clone();
		}

		c1.lerp(c2, 1-ratio);

		return c1.lerp(this.colorWhite, 1-ratio2);
	}

	addRandomness(color) {
		const colorRand = new Color();
		colorRand.setRGB(Math.random(), Math.random(), Math.random());
		const ratio = Math.random()*0.5;

		return color.lerp(colorRand, ratio);
	}


}
export default ColorCalculations;
