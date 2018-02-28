import Glitter3d from './world3d/Glitter3d';

class Glitter {
	init() {
		const glitter3d = new Glitter3d();
		glitter3d.init();
		this.loader = document.getElementById('exp-loadercont');
		this.loader.style.display = 'none';
	}
}
export default Glitter;
