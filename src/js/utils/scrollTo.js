import getOffset from './getOffset';
import TweenMax from 'gsap';
import variables from './variables';
import getScrollPositionY from './getScrollPositionY';

const html = document.documentElement;
const body = document.body;
let tween;
window.addEventListener('wheel', onWheel);

export default function scrollTo(elem, container) {
	const pos = typeof elem === 'number' ? elem : getOffset(elem).top;
	const obj = {currentPos: 0};
	if(container) {
		obj.currentPos = container.scrollTop;
	} else {
		obj.currentPos = getScrollPositionY();
	}
	tween = TweenMax.to(obj, variables.animDuration, {currentPos: pos, ease: variables.animEaseInOut, onUpdate: applyValue, onUpdateParams: [obj, container]});
}

function applyValue (obj, container) {
	const p = obj.currentPos;
	if(container) {
		container.scrollTop = p;
	} else {
		html.scrollTop = p;
		body.scrollTop = p;
	}
}

function onWheel() {
	if( tween ) tween.kill();
}
