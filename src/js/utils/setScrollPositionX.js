export default function getScrollPositionX(pos) {
	document.documentElement.scrollLeft = document.body.scrollLeft = pos;
}
