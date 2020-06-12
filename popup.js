
let width = 256;
let firstX = 0;
let firstY = 0;
let lastX = 0;
let lastY = 0;
let radiusFirst = 0;
let chiralRadius = 0.0;
let scrollSpeed = 8;
let isChiral = false;

window.onload = function() {
	document.getElementById('pad-div').addEventListener('dragstart', onDragStartOnPad);
	document.getElementById('pad-div').addEventListener('dragover', onDraggingOnPad);
	document.getElementById('pad-div').addEventListener('dragend', onDragEndOnPad);

	document.getElementById('speed-slider').addEventListener('change', onChangeSpeed);
	document.getElementById('linear').addEventListener('click', onClickLinear);
	document.getElementById('chiral').addEventListener('click', onClickChiral);

	drawCanvas();

}

function onDragStartOnPad(event) {
	firstX = lastX = event.offsetX;
	firstY = lastY = event.offsetY;
	radiusFirst = Math.atan2(firstY - width / 2, firstX - width / 2);
}

function onDraggingOnPad(event) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		let x, y;
		if (isChiral) {
			let radiusBefore = Math.atan2(lastY - width / 2, lastX - width / 2);
			let radiusAfter = Math.atan2(event.offsetY - width / 2, event.offsetX - width / 2);
			let radiusDelta = radiusAfter - radiusBefore;
			if (radiusDelta >= Math.PI) {
				radiusDelta -= Math.PI * 2;
			}
			if (radiusDelta <= -Math.PI) {
				radiusDelta += Math.PI * 2;
			}

			x = 0;
			y = radiusDelta * 16 * scrollSpeed;
			chiralRadius = radiusAfter - radiusFirst;
		} else {
			x = (lastX - event.offsetX) * scrollSpeed;
			y = (lastY - event.offsetY) * scrollSpeed;
		}
		drawCanvas();

		chrome.tabs.sendMessage(tabs[0].id, {
			name: "scroll",
			x: x,
			y: y
		}, function(response) {
			lastX = event.offsetX;
			lastY = event.offsetY;
		});
	});
}

function onDragEndOnPad(event) {
	chiralRadius = 0.0;
	drawCanvas();
}

function onChangeSpeed(event) {
	scrollSpeed = parseInt(this.value);
}

function onClickLinear(event) {
	isChiral = false;
	drawCanvas();
}

function onClickChiral(event) {
	isChiral = true;
	drawCanvas();
}

function drawCanvas() {
	var canvas = document.getElementById('pad-canvas');
	var width = canvas.width;
	var height = canvas.height;

	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, width, height);

	ctx.fillStyle = '#888';
	ctx.fillRect(0, 0, width, height);

	if (isChiral) {
	    ctx.fillStyle = '#AAA';
		ctx.beginPath();
	    ctx.arc(128, 128, 112, Math.PI * 2, false);
	    ctx.fill();

	    ctx.fillStyle = '#888';
	    ctx.beginPath();
	    ctx.arc(128, 128, 16, Math.PI * 2, false);
	    ctx.fill();

		ctx.strokeStyle = '#888';
  		ctx.lineWidth = 2;
  		for (var r = 0; r < 4; r++) {
			ctx.beginPath();
		  	ctx.moveTo(128 + 32 * Math.cos(chiralRadius + Math.PI * (r + 0.5) / 2),
		  			   128 + 32 * Math.sin(chiralRadius + Math.PI * (r + 0.5) / 2));
			ctx.lineTo(128 + 96 * Math.cos(chiralRadius + Math.PI * (r + 0.5) / 2), 
				       128 + 96 * Math.sin(chiralRadius + Math.PI * (r + 0.5) / 2));
			ctx.stroke();
  		}
	} else {
		ctx.strokeStyle = '#AAA';
  		ctx.lineWidth = 1;

		for (var x = 32; x < 256; x += 32) {
		  	ctx.beginPath();
		  	ctx.moveTo(x, 0);
			ctx.lineTo(x, 256);
			ctx.stroke();
		}

		for (var y = 32; y < 256; y += 32) {
		  	ctx.beginPath();
		  	ctx.moveTo(0, y);
			ctx.lineTo(256, y);
			ctx.stroke();
		}
	}
 }