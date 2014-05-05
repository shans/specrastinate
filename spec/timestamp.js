var lastTimestamp = undefined;

setInterval(function() {
  var request = new XMLHttpRequest();

  request.open("GET", "timestamp.txt");
  request.send();
  request.onload = function(e) {
    var timestamp = request.responseText;
    if (lastTimestamp !== undefined && timestamp != lastTimestamp) {
      console.log(timestamp);
      var r2 = new XMLHttpRequest();
      r2.open("GET", location);
      r2.send();
      r2.onload = function(e) {
	var oldScroll = window.scrollY;
	document.documentElement.innerHTML = r2.responseText;
	document.documentElement.offsetTop;
	window.scrollTo(0, oldScroll);
      }
    }
    lastTimestamp = timestamp;
  };
}, 1000);


