export default function getPointerPosition(event) {
    return (event.targetTouches && event.targetTouches.length >= 1 ?
        {x: parseInt(event.targetTouches[0].pageX, 10), y: parseInt(event.targetTouches[0].pageY, 10)} :
        {x: parseInt(event.clientX, 10), y: parseInt(event.clientY, 10)}
    );
}
