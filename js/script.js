// JavaScript Document

// Real Time Clock (not yet working)
function realTimeClock() {
	
	var clock = new Date();
	
	var hours = clock.getHours();
	var minutes = clock.getMinutes();
	var seconds = clock.getSeconds();
	var day = clock.getDay();
	var month = clock.getMonth();
	var year = clock.getFullYear();
	
	// am or pm?
	var tod = ( hours < 12 ) ? "am" : "pm";
	
	// convert to 12 hour format
	hours = ( hours > 12 ) ? hours - 12: hours;
	
	// padding to make it look a bit nicer
	hours = ("0" + hours).slice(-2);
	minutes = ("0" + minutes).slice(-2);
	seconds = ("0" + seconds).slice(-2);
	day = ("0" + day).slice(-2);
	month = ("0" + month).slice(-2);
	
	// actually show the clock
	document.getElementById('clock').innerHTML = hours + " : " + minutes + " : " + seconds;
	document.getElementById('ampm').innerHTML = tod;
	document.getElementById('date').innerHTML = day + " / " + month + " / " + year;
	var t = setTimeout( realTimeClock, 500 );
}