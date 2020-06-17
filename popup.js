
const scrollDirections = [{x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}];

let width = 256;
let firstX = 0;
let firstY = 0;
let lastX = 0;
let lastY = 0;
let radiusFirst = 0;
let chiralRadius = 0.0;
let scrollSpeed = 8;
let isChiral = false;
let isDragging = false;
let directionIndex = 0;

window.onload = function() {
	document.getElementById('pad-div').addEventListener('mousemove', onMoveOnPad);
	document.getElementById('pad-div').addEventListener('mousedown', onDragStartOnPad);
	document.getElementById('pad-div').addEventListener('mouseup', onDragEndOnPad);

	document.getElementById('speed-slider').addEventListener('change', onChangeSpeed);
	document.getElementById('slide').addEventListener('click', onClickSlide);
	document.getElementById('chiral').addEventListener('click', onClickChiral);

	drawCanvas();
}

function onMoveOnPad(event) {
	if (isDragging) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			let x, y;
			if (!isDragging) {
				return;
			}
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

				x = radiusDelta * 16 * scrollSpeed * scrollDirections[directionIndex].x;
				y = radiusDelta * 16 * scrollSpeed * scrollDirections[directionIndex].y;
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
		return;
	}
}

function onDragStartOnPad(event) {
	chiralRadius = 0;
	isDragging = true;
	firstX = lastX = event.offsetX;
	firstY = lastY = event.offsetY;
	
	let radius = Math.atan2(lastY - width / 2, lastX - width / 2);
	if (radius >= Math.PI * (-3) / 4 && radius < Math.PI * (-1) / 4) {
		directionIndex = 1;
	} else if (radius >= Math.PI * (-1) / 4 && radius < Math.PI * (1) / 4) {
		directionIndex = 0;
	} else if (radius >= Math.PI * (1) / 4 && radius < Math.PI * (3) / 4) {
		directionIndex = 3;
	} else {
		directionIndex = 2;
	}

	radiusFirst = Math.atan2(firstY - width / 2, firstX - width / 2);
	drawCanvas();
}

function onDragEndOnPad(event) {
	isDragging = false;
	chiralRadius = 0.0;
	drawCanvas();
}

function onChangeSpeed(event) {
	scrollSpeed = parseInt(this.value);
}

function onClickSlide(event) {
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
	    if (isDragging) {
	    	ctx.fillStyle = '#B0B0B0';
	    } else {
	    	ctx.fillStyle = '#AAA';
	    }
		ctx.beginPath();
	    ctx.arc(128, 128, 112, Math.PI * 2, false);
	    ctx.fill();

	    ctx.fillStyle = '#888';
	    ctx.beginPath();
	    ctx.arc(128, 128, 32, Math.PI * 2, false);
	    ctx.fill();

		ctx.strokeStyle = '#888';
  		ctx.lineWidth = 2;
  		for (var r = 0; r < 4; r++) {
			ctx.beginPath();
		  	ctx.moveTo(128 + 48 * Math.cos(chiralRadius + Math.PI * (r + 0.5) / 2),
		  			   128 + 48 * Math.sin(chiralRadius + Math.PI * (r + 0.5) / 2));
			ctx.lineTo(128 + 96 * Math.cos(chiralRadius + Math.PI * (r + 0.5) / 2), 
				       128 + 96 * Math.sin(chiralRadius + Math.PI * (r + 0.5) / 2));
			ctx.stroke();
  		}

  		if (isDragging) {
		    ctx.strokeStyle = '#CCC';
	  		ctx.lineWidth = 2;
	  		if (directionIndex == 0 || directionIndex == 2) {
	  			let deltaX = directionIndex == 0 ? 1 : -1;

	  			ctx.beginPath();
			  	ctx.moveTo(128 + 72 * deltaX, 112);
			  	ctx.lineTo(128 + 72 * deltaX, 144);

			  	ctx.moveTo(128 + 72 * deltaX, 112);
			  	ctx.lineTo(120 + 72 * deltaX, 120);
	 
			  	ctx.moveTo(128 + 72 * deltaX, 112);
			  	ctx.lineTo(136 + 72 * deltaX, 120);
	 
			  	ctx.moveTo(128 + 72 * deltaX, 144);
			  	ctx.lineTo(120 + 72 * deltaX, 136);

			  	ctx.moveTo(128 + 72 * deltaX, 144);
			  	ctx.lineTo(136 + 72 * deltaX, 136);
				ctx.stroke();
	  		} else {
	  			let deltaY = directionIndex == 3 ? 1 : -1;

	  			ctx.beginPath();
			  	ctx.moveTo(112, 128 + 72 * deltaY);
			  	ctx.lineTo(144, 128 + 72 * deltaY);

			  	ctx.moveTo(112, 128 + 72 * deltaY);
			  	ctx.lineTo(120, 120 + 72 * deltaY);

			  	ctx.moveTo(112, 128 + 72 * deltaY);
			  	ctx.lineTo(120, 136 + 72 * deltaY);

			  	ctx.moveTo(144, 128 + 72 * deltaY);
			  	ctx.lineTo(136, 120 + 72 * deltaY);

			  	ctx.moveTo(144, 128 + 72 * deltaY);
			  	ctx.lineTo(136, 136 + 72 * deltaY);
				ctx.stroke();
	  		}
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