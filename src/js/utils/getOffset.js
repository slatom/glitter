export default function getOffset(elem) {
	const body = document.body.getBoundingClientRect();
	const element = elem.getBoundingClientRect();
	return {
		top: element.top - body.top,
		bottom: element.bottom - body.bottom,
		left: element.left - body.left,
		right: element.right - body.right,
	};
}
