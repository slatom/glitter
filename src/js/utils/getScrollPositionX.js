export default function getScrollPositionX() {
	return (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
}
