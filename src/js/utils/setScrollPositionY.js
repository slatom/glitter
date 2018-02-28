export default function getScrollPositionY(pos) {
	document.documentElement.scrollTop = document.body.scrollTop = pos;
}
