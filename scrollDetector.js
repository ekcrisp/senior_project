
document.onscroll = function (event) {

	var percentage = window.pageYOffset / (document.body.scrollHeight - document.body.offsetHeight);
	if (percentage > 1) {
		percentage = 1;
	}
	chrome.runtime.sendMessage({greeting:"pageScroll", url: window.location.href, percent: percentage});

}