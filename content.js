
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.dir(request);
		if (request.name == "scroll") {
			const x = parseFloat(request.x);
			const y = parseFloat(request.y);
			window.scrollBy(x, y);
		}
		sendResponse(undefined);
	});
