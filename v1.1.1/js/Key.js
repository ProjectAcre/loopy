(function(exports){

	// Singleton
	var Key = {};
	exports.Key = Key;

	// Keycodes to words mapping
	var KEY_CODES = {
		17: ["control"],
		91: ["control"], // macs
		13: ["enter"], // enter'
		27: ["cancel"], // escape

		// Zoom
		61: ["zoomin"], // Num row =/+
		107: ["zoomin"], // Num pad +
		173: ["zoomout"], // Num row -
		109: ["zoomout"], // Num pad -

		// Panning
		65: ["panleft"], // A
		37: ["panleft"], // Left Arrow
		87: ["panup"], // W
		38: ["panup"], // Up Arrow
		68: ["panright"], // D
		39: ["panright"], // Right Arrow
		//83: "pandown", // S (Specified in array with save)
		40: ["pandown"], // Down arrow


		// TODO: Standardize the NAMING across files?!?!
		78: ["ink"], // Pe(n)cil
		86: ["drag"], // Mo(v)e
		69: ["erase"], // (E)rase
		84: ["label"], // (T)ext
		83: ["save", "pandown"], // (S)ave
		77: ["templates"], // te(M)plate
		49: ["template1"], // template: 1to1pos, one node pointing positively to a second
		50: ["template2"], // template: feedbackOscillator, one node pointing positively to a second, while the second points negatively to the first
		51: ["template3"], // template: feedbackPositive, two nodes pointing positvely to each other
		52: ["template4"], // template: sharedStarter, one node pointing positvely to two other nodes
		53: ["template5"], // template (5)
	};

	// Event Handling
	// TODO: cursors stay when click button? orrrrr switch over to fake-cursor.
	Key.onKeyDown = function(event){
		if(window.loopy && loopy.modal && loopy.modal.isShowing) return;
		let codes = KEY_CODES[event.keyCode];

		for(let i = 0; i < codes.length; i++) {
			let code = codes[i];
			Key[code] = true;
	    	publish("key/"+code);
		}
	}
	Key.onKeyUp = function(event){
		if(window.loopy && loopy.modal && loopy.modal.isShowing) return;
		let codes = KEY_CODES[event.keyCode];

		for(let i = 0; i < codes.length; i++) {
			let code = codes[i];
			Key[code] = false;
		}
	}
	window.addEventListener("keydown",Key.onKeyDown,false);
	window.addEventListener("keyup",Key.onKeyUp,false);

})(window);