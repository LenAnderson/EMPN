var prefs = {
	meta: {
		version: 1
	},
	
	autoThanks: true,
	autoComments: true,
	autoCommentsPrompt: false,
	comments: ['Thanks!', 'Thank you!'],
	thumbHeight: 200,
	keys: {
		'Next Torrent': null,
		'Previous Torrent': null,
		'Next Image': null,
		'Previous Image': null,
		'Show / Hide Image': null,
		'Toggle Zoom': null,
		'Open Image in a New Tab': null,
		'Show / Hide Comments': null,
		'Show / Hide Description': null,
		'Download': null,
		'Open Details in a New Tab': null,
		'Block Image': null,
		'Send Thanks': null,
		'Add Comment': null,
		'Add Manual Comment': null,
		'Catch Up': null,
		'Catch Up to Current Torrent': null
	},
	autoTags: true,
	tagLimit: 1000,
	tags: {},
	goodTags: {},
	vgoodTags: {},
	newestFirst: false,
	combine: true,
	combineHighest: true,
	blacklist: [],
	timeOffset: 0,
	latest: null,
	torrentLimit: 500,
	
	setNewestFirst: function(val) {
		this.newestFirst = val;
		this.save();
	},
	setAutoThanks: function(val) {
		this.autoThanks = val;
		this.save();
	},
	setAutoComments: function(val) {
		this.autoComments = val;
		this.save();
	},
	setAutoCommentsPrompt: function(val) {
		this.autoCommentsPrompt = val;
		this.save();
	},
	setThumbHeight: function(val) {
		this.thumbHeight = val;
		this.save();
	},
	setAutoTags: function(val) {
		this.autoTags = val;
		this.save();
	},
	setTagLimit: function(val) {
		this.tagLimit = val;
		this.save();
	},
	setComments: function(val) {
		this.comments = val;
		this.save();
	},
	setGoodTags: function(val) {
		this.goodTags = val;
		this.save();
	},
	setVgoodTags: function(val) {
		this.vgoodTags = val;
		this.save();
	},
	setKeys: function(val) {
		this.keys = val;
		this.save();
	},
	setCombine: function(val) {
		this.combine = val;
		this.save();
	},
	setCombineHighest: function(val) {
		this.combineHighest = val;
		this.save();
	},
	setTimeOffset: function(val) {
		this.timeOffset = val;
		this.save();
	},
	setTorrentLimit: function(val) {
		this.torrentLimit = val;
		this.save();
	},
	setLatest: function(val) { console.info('setLatest', val);
		this.latest = val;
		this.save();
	},
	raiseTag: function(tag) {
		if (!this.tags[tag]) {
			this.tags[tag] = 0;
		}
		this.tags[tag]++;
		this.save();
	},
	blockImage: function(url) {
		if (this.blacklist.lastIndexOf(url) != -1) return;
		this.blacklist.push(url);
		this.save();
		data.update();
	},
	
	hasComments: function() {
		return this.comments.length > 0;
	},
	getRandomComment: function() {
		return this.comments[Math.floor(Math.random()*this.comments.length)];
	},
	
	save: function() {
		localStorage.setItem('empn_prefs', JSON.stringify(this));
	},
	load: function() {
		var prefs = false;
		try {
			prefs = JSON.parse(localStorage.getItem('empn_prefs'));
		} catch(ex) {}
		if (prefs && prefs.meta && prefs.meta.version) {
			switch(prefs.meta.version) {
				case 1:
					this.initV1(prefs);
					break;
				default:
					alert('Unknown preferences format (version "' + prefs.meta.version + '").\n\nPreferences will be reset to default values.');
					this.save();
					break;
			}
		}
	},
	initV1: function(prefs) {
		for (var key in prefs) {
			if (prefs.hasOwnProperty(key) && this.hasOwnProperty(key)) {
				if (key == 'keys') {
					for (var _key in prefs[key]) {
						if (prefs[key].hasOwnProperty(_key) && this.keys.hasOwnProperty(_key)) {
							this.keys[_key] = prefs[key][_key];
						}
					}
				} else {
					this[key] = prefs[key];
				}
			}
		}
	}
};