export default function getScrollPositionY() {
	return (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
}
