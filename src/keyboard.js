var keyboard = {
	init: function() {
		addEventListener('keydown', this.reactDown);
		addEventListener('keyup', this.react);
	},
	
	reactDown: function(evt) {
		if (!state.listening) return;
		
		var keyMap = {};
		for (var act in prefs.keys) {
			if (!prefs.keys.hasOwnProperty(act)) continue;
			keyMap[keyIdentifier(prefs.keys[act])] = act;
		}
		
		if (keyMap[keyIdentifier(evt)]) {
			evt.preventDefault();
		}
	},
	react: function(evt) {
		if (!state.listening) return;
		
		var keyMap = {};
		for (var act in prefs.keys) {
			if (!prefs.keys.hasOwnProperty(act)) continue;
			keyMap[keyIdentifier(prefs.keys[act])] = act;
		}
		
		if (keyMap[keyIdentifier(evt)]) {
			evt.preventDefault();
		}
		
		console.info(keyIdentifier(evt), keyMap);
		
		switch(keyMap[keyIdentifier(evt)]) {
			case 'Next Torrent':
				actions.nextItem();
				break;
			case 'Previous Torrent':
				actions.prevItem();
				break;
			case 'Next Image':
				actions.nextImage();
				break;
			case 'Previous Image':
				actions.prevImage();
				break;
			case 'Show / Hide Image':
				actions.showHideImage();
				break;
			case 'Toggle Zoom':
				actions.toggleZoom();
				break;
			case 'Open Image in a New Tab':
				actions.openImage();
				break;
			case 'Show / Hide Comments':
				actions.toggleComments();
				break;
			case 'Show / Hide Description':
				actions.toggleDescription();
				break;
			case 'Download':
				actions.download();
				break;
			case 'Open Details in a New Tab':
				actions.openDetails();
				break;
			case 'Block Image':
				actions.blockImage();
				break;
			case 'Send Thanks':
				actions.sendThanks();
				break;
			case 'Add Comment':
				actions.sendRandomComment();
				break;
			case 'Add Manual Comment':
				actions.promptComment();
				break;
			case 'Catch Up':
				actions.catchUp();
				break;
			case 'Catch Up to Current Torrent':
				actions.catchUp(true);
				break;
		};
	}
};