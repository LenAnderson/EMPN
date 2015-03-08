// ==UserScript==
// @name         EMPN
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/EMPN/raw/master/empn.user.js
// @version      0.3
// @author       LenAnderson
// @match        http://*.empornium.me/*
// @match        https://*.empornium.me/*
// @grant        none
// ==/UserScript==






/****************************************\
| $HELPERS
\****************************************/
Object.prototype.addListener = function(type, func) {
	if (!this.listeners) {
		Object.defineProperty(this, 'listeners', {
			writable: true,
			value: {}
		});
	}
	if (!this.listeners[type])
		this.listeners[type] = [];
	this.listeners[type].push(func);
	return func;
};
Object.prototype.removeListener = function(type, func) {
	if (!this.listeners[type])
		return;
	for (var i=0;i<this.listeners[type].length;i++) {
		if (this.listeners[type][i] != func) continue;
		this.listeners[type].splice(i,1);
	}
};
Object.prototype.raiseEvent = function(type, evt) {
	if (!this.listeners[type])
		return;
	this.listeners[type].forEach(function(it) {
		it(evt);
	});
};

Date.prototype.getHoursPadded = function() {
	var hours = this.getHours();
	if (hours < 10) hours = '0' + hours;
	return hours;
};
Date.prototype.getMinutesPadded = function() {
	var minutes = this.getMinutes();
	if (minutes < 10) minutes = '0' + minutes;
	return minutes;
};
Date.prototype.empnFormat = function() {
	var dt = new Date(this.getTime());
	dt.setHours(dt.getHours() + prefs.timeOffset);
	return dt.toDateString() + ', ' + dt.getHoursPadded() + ':' + dt.getMinutesPadded();
};

Array.prototype.spread = function(prop) {
	var ret = [];
	this.forEach(function(it) {
		ret.push(it[prop]);
	});
	return ret;
};

Array.prototype.unique = function() {
	return this.filter(function(it, i) {
		return this.indexOf(it, i+1) == -1;
	}.bind(this));
};

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
Node.prototype.$ = Element.prototype.querySelector;
Node.prototype.$$ = Element.prototype.querySelectorAll;

HTMLCollection.prototype.lastIndexOf = Array.prototype.lastIndexOf;
HTMLCollection.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.map = Array.prototype.map;
NodeList.prototype.lastIndexOf = Array.prototype.lastIndexOf;
NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.map = Array.prototype.map;

Node.prototype.addClass = function(cl) { this.classList.add(cl); return this; };
Node.prototype.delClass = function(cl) { this.classList.remove(cl); return this; };
Node.prototype.toggleClass = function(cl) { this.classList.toggle(cl); return this; };
Node.prototype.hasClass = function(cl) { return this.classList.contains(cl); };

Node.prototype._ = Node.prototype.addEventListener;

Node.prototype.removeChildren = function(offset) {
    if (offset == null) offset = 0;
    while(this.children.length > offset) {
        this.children[offset].remove();
    }
};

Node.prototype.scrollTo = function(y) {
	var el = this;
	var timeLapsed = 0;
	var percentage = 0;
	var position = el.scrollTop;
	var distance = y - el.scrollTop;
	var startLocation = el.scrollTop;
	var interval = undefined;
	
	var pattern = function(time) {
		return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
	};
	
	var start = function() {
		interval = setInterval(loop, 16);
	};
	var loop = function() {
		timeLapsed += 16;
		percentage = timeLapsed / 500;
		percentage = percentage > 1 ? 1 : percentage;
		position = startLocation + (distance * pattern(percentage));
		el.scrollTop = position;
		stop();
	};
	var stop = function() {
		if (percentage < 1) return;
		
		clearInterval(interval);
	};
	
	start();
};
Node.prototype.scrollToH = function(x) {
	var el = this;
	var timeLapsed = 0;
	var percentage = 0;
	var position = el.scrollLeft;
	var distance = x - el.scrollLeft;
	var startLocation = el.scrollLeft;
	var interval = undefined;
	
	var pattern = function(time) {
		return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
	};
	
	var start = function() {
		interval = setInterval(loop, 16);
	};
	var loop = function() {
		timeLapsed += 16;
		percentage = timeLapsed / 500;
		percentage = percentage > 1 ? 1 : percentage;
		position = startLocation + (distance * pattern(percentage));
		el.scrollLeft = position;
		stop();
	};
	var stop = function() {
		if (percentage < 1) return;
		
		clearInterval(interval);
	};
	
	start();
};

function stopProp(evt) {
    evt.stopPropagation();
}

function keyIdentifier(evt) {
	if (evt == null) return '';
	if (typeof evt == 'string') evt = JSON.parse(evt);
	var key = [];
	if (evt.ctrlKey) key.push('Ctrl');
	if (evt.shiftKey) key.push('Shift');
	
	var ki;
	if (evt.keyIdentifier) {
		ki = evt.keyIdentifier;
	} else {
		if (evt.keyCode == 16) ki = 'Shift';
		else if (evt.keyCode == 17) ki = 'Ctrl';
		else if (evt.keyCode == 18) ki = 'Alt';
		else if (evt.keyCode == 37) ki = 'Left';
		else if (evt.keyCode == 38) ki = 'Up';
		else if (evt.keyCode == 39) ki = 'Right';
		else if (evt.keyCode == 40) ki = 'Down';
		else if (evt.keyCode == 46) ki = 'U+007F'; // Del
		else if (evt.keyCode == 18) ki = 'U+0020'; // Space
		else if (evt.keyCode == 8) ki = 'U+0008'; // Backspace
		else if (evt.keyCode == 9) ki = 'U+0009'; // Tab
		else if (evt.keyCode == 27) ki = 'U+001B'; // Esc
		else ki = 'U+' + ('0000' + evt.keyCode.toString(16)).slice(-4);
	}
    if (ki == undefined) return '';
    if (ki.search(/^U\+([0-9A-F]){4}$/) == 0) {
        if (ki == 'U+0020')
            key.push('Space');
		else if (ki == 'U+007F')
			key.push('Del');
		else if (ki == 'U+0008')
			key.push('Backspace');
		else if (ki == 'U+0009')
			key.push('Tab');
		else if (ki == 'U+001B')
			key.push('Esc');
        else
            key.push(String.fromCharCode(Number.parseInt(ki.substring(2), 16).toString(10)));
    } else {
        key.push(ki);
    }
	
	return key.unique().join('+');
}

function mapToQuery() {
	var params = [];
	for (var key in this) {
		if (!this.hasOwnProperty(key) || typeof this[key] == 'function') continue;
		params.push(encodeURIComponent(key) + '=' + encodeURIComponent(this[key]));
	}
	return params.join('&');
}

function get(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.addEventListener('load', function() {
            if (xhr.status == 200) {
                resolve(xhr.responseText);
            } else {
                reject(Error(xhr.statusText));
            }
        });
        xhr.send();
    });
}
function post(url, args) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.addEventListener('load', function() {
			if (xhr.status == 200) {
				resolve(xhr.responseText);
			} else {
				reject(Error(xhr.statusText));
			}
		});
		if (args) {
			args.toString = mapToQuery;
		}
		xhr.send(args);
	});
}
function getHTML(url) {
    return get(url).then(function(txt) {
        var html = document.createElement('div');
        html.innerHTML = txt.replace(/ (src|href)=/g, ' data-$1=');
        return html;
    });
}





/****************************************\
| $MD
\****************************************/
var md = {
	init: function() {
		this.dialog.init($$('.empn-empn-dialog'));
		this.menu.init($$('.empn-empn-menu'));
		this.tabbar.init($$('.empn-empn-tabbar'));
		this.ripple.init($$('button, input[type="button"], input[type="submit"], .empn-tabbar .empn-item, .empn-menu .empn-item, .empn-toolbar .empn-item'));
		this.progress.bar.init($$('.empn-empn-progress-bar'));
		this.input.init($$('.empn-empn-input'));
	},
	
	toasts: {
		init: function(tstss) {
			if (tstss instanceof Element) {
				tstss = [tstss];
			}
			tstss.forEach(function(tsts) {
				tsts.add = function(title, desc) {
					return this.add(tsts, title, desc);
				}.bind(this);
			}.bind(this));
		},
		add: function(tsts, title, desc) {
			var tst = document.createElement('li');
			tst.addClass('empn-toast');
			var tstTitle = document.createElement('div');
			tstTitle.addClass('empn-title');
			var tstInfo = document.createElement('div');
			tstInfo.addClass('empn-info');
			tstTitle.textContent = title;
			tstInfo.textContent = desc;
			tst.appendChild(tstTitle);
			tst.appendChild(tstInfo);
			
			tsts.appendChild(tst);
			tst.style.marginTop = -tst.offsetHeight + 'px';
			if (tsts.children.length > 0) {
				tsts.insertBefore(tst, tsts.children[0]);
			} else {
				tsts.appendChild(tst);
			}
			tst.addClass('empn-preactive');
			setTimeout(function() { tst.addClass('empn-active'); }.bind(this), 1);
			setTimeout(function() {
				tst.delClass('empn-active');
				setTimeout(function() { tst.remove(); }, 205);
			}.bind(this), 5000);
		}
	},
	
	dialog: {
		init: function(dlgs) {
			if (dlgs instanceof Element) {
				dlgs = [dlgs];
			}
			dlgs.forEach(function(dlg) {
				dlg.show = function(src) {
					return this.show(dlg, src);
				}.bind(this);
				dlg.hide = function() {
					return this.hide(dlg);
				}.bind(this);
			}.bind(this));
		},
		show: function(dlg, src) {
			src = src || dlg;
			return new Promise(function(resolve, reject) {
				dlg.mdDlgSrc = src;
				dlg.addClass('empn-preactive');
				var c = dlg.$('.empn-content');
				var b = c.getBoundingClientRect();
				
				var bb;
				if (src instanceof MouseEvent) {
					bb = {top: src.clientY, height: 0, left: src.clientX, width: 0};
				} else {
					bb = src.getBoundingClientRect();
				}
				
				var y = Math.round((bb.top + bb.height * 0.5) - (b.top + b.height * 0.5)) + 'px';
				var x = Math.round((bb.left + bb.width * 0.5) - (b.left + b.width * 0.5)) + 'px';
				
				c.style.transform = 'translate('+x+', '+y+') scale(0)';
				
				setTimeout(function() { dlg.addClass('empn-active'); }, 20);
				setTimeout(function() {
					c.style.transition = 'all 0.4s ease-in-out';
					
					resolve(dlg);
				}, 500);
			});
		},
		hide: function(dlg) {
			return new Promise(function(resolve, reject) {
				var src = dlg.mdDlgSrc || dlg;
				var c = dlg.$('.empn-content');
				var b = c.getBoundingClientRect();
				
				var bb;
				if (src instanceof MouseEvent) {
					bb = {top: src.clientY, height: 0, left: src.clientX, width: 0};
				} else {
					bb = src.getBoundingClientRect();
				}
				
				var y = Math.round((bb.top + bb.height * 0.5) - (b.top + b.height * 0.5)) + 'px';
				var x = Math.round((bb.left + bb.width * 0.5) - (b.left + b.width * 0.5)) + 'px';
				
				c.style.transform = 'translate('+x+', '+y+') scale(0)';
				
				dlg.delClass('empn-active');
				setTimeout(function() {
					dlg.delClass('empn-preactive');
					c.style.transform = '';
					c.style.transition = '';
					
					resolve(dlg);
				}, 400);
			});
		}
	},
	
	menu: {
		init: function(menus) {
			if (menus instanceof Element) {
				menus = [menus];
			}
			menus.forEach(function(menu) {
				menu.show = function() {
					return this.show(menu);
				}.bind(this);
				menu.hide = function() {
					return this.hide(menu);
				}.bind(this);
				menu.addEventListener('click', menu.hide);
				menu.$('.empn-content').addEventListener('click', function(evt) { evt.stopPropagation(); });
			}.bind(this));
		},
		show: function(menu) {
			return new Promise(function(resolve, reject) {
				menu.addClass('empn-preactive');
				
				setTimeout(function() {
					// $('#app').style.transform = 'translateX(' + menu.$('.empn-content').offsetWidth + 'px' + ')';
					menu.addClass('empn-active');
				}, 20);
				setTimeout(function() { resolve(menu); }, 420);
			});
		},
		hide: function(menu) {
			return new Promise(function(resolve, reject) {
				// $('#app').style.transform = '';
				menu.delClass('empn-active');
				setTimeout(function() {
					menu.delClass('empn-preactive');
					resolve(menu);
				}, 400);
			});
		}
	},
	
	tabbar: {
		init: function(bars) {
			if (bars instanceof Element) {
				bars = [bars];
			}
			bars.forEach(function(bar) {
				var items = bar.$$('.empn-item');
				for (var i=0;i<items.length;i++) {
					items[i].style.width = Math.floor(100 / items.length * 1000) / 1000 + '%';
					(function(i){
						items[i].addEventListener('click', function() {
							bar.switchTo(items[i]);
						});
					})(i);
				}
				bar.$('.empn-marker').style.width = Math.floor(100 / items.length * 1000) / 1000 + '%';
				
				this.switchTo(bar, bar.$('.empn-active'));
				
				bar.switchTo = function(tab) {
					return this.switchTo(bar, tab);
				}.bind(this);
			}.bind(this));
		},
		switchTo: function(tabs, tab) {
			return new Promise(function(resolve, reject) {
				var items = tabs.$$('.empn-item');
				for (var i=0;i<items.length;i++) {
					items[i].delClass('empn-active');
				}
				tab.addClass('empn-active');
				var b = tab.getBoundingClientRect();
				tabs.$('.empn-marker').style.left = tab.offsetLeft + 'px';
				var content = tab.getAttribute('data-content');
				if (content) {
					content = $('#' + content);
					content.parentNode.style.transform = 'translateX(' + (content.parentNode.children.lastIndexOf(content)*100) + '%)';
				}
				
				setTimeout(function() { resolve(tabs); }, 400);
			});
		}
	},
	
	ripple: {
		init: function(btns) {
			if (btns instanceof Element) {
				btns = [btns];
			}
			btns.forEach(function(btn) {
				btn.ripple = function(evt) {
					this.ripple(btn, evt);
				}.bind(this);
				btn.rippleEl = document.createElement('div');
				btn.rippleEl.addClass('empn-ripple');
				btn.appendChild(btn.rippleEl);
				btn.addEventListener('click', btn.ripple);
			}.bind(this));
		},
		ripple: function(btn, evt) {
			return new Promise(function(resolve, reject) {
				btn.rippleEl.style.top = evt.pageY - btn.getBoundingClientRect().top - 250 + 'px';
				btn.rippleEl.style.left = evt.pageX - btn.getBoundingClientRect().left - 250 + 'px';
				btn.addClass('empn-clicked'),
					setTimeout(function() {
						btn.delClass('empn-clicked');
						resolve(btn);
					}, 550);
			});
		}
	},
	
	progress: {
		bar: {
			init: function(bars) {
				if (bars instanceof Element) {
					bars = [bars];
				}
				bars.forEach(function(bar) {
					bar.progress = function(prog) {
						this.progress(bar, prog);
					}.bind(this);
					bar.getProgress = function() {
						return this.getProgress(bar);
					}.bind(this);
				}.bind(this));
			},
			progress: function(bar, prog) {
				bar.$('.empn-inner').style.width = prog + '%';
			},
			getProgress: function(bar) {
				return bar.$('.empn-inner').style.width.replace('%','') * 1;
			}
		}
	},
	
	input: {
		init: function(inps) {
			if (inps instanceof Node) {
				inps = [inps];
			}
			inps.forEach(function(inp) {
				inp.input = inp.$('input');
				var plc = document.createElement('div');
				plc.addClass('empn-placeholder');
				plc.textContent = inp.input.placeholder;
				plc.style.font = window.getComputedStyle(inp.input).font;
				plc.addEventListener('click', function() { inp.input.focus(); });
				inp.appendChild(plc);
				inp.input.placeholder = '';
				if (inp.input.type.search(/^(range|date)$/) != -1) {
					inp.addClass('empn-no-placeholder');
				}
				
				inp.input.addEventListener('focus', function() {
					this.focus(inp);
				}.bind(this));
				inp.input.addEventListener('blur', function() {
					this.blur(inp);
				}.bind(this));
			}.bind(this));
		},
		focus: function(inp) {
			inp.addClass('empn-focus');
		},
		blur: function(inp) {
			if (inp.input.value.trim() != '' || inp.input.validity.badInput) {
				inp.addClass('empn-has-content');
			} else {
				inp.delClass('empn-has-content');
			}
			inp.delClass('empn-focus');
		}
	}
}
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
		'Next Torrent': {ctrlKey:false,shiftKey:false,keyIdentifier:"Down"},
		'Previous Torrent': {ctrlKey:false,shiftKey:false,keyIdentifier:"Up"},
		'Next Image': {ctrlKey:false,shiftKey:false,keyIdentifier:"Right"},
		'Previous Image': {ctrlKey:false,shiftKey:false,keyIdentifier:"Left"},
		'Show / Hide Image': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0020"},
		'Toggle Zoom': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0046"},
		'Open Image in a New Tab': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0047"},
		'Show / Hide Comments': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0043"},
		'Show / Hide Description': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0044"},
		'Download': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0053"},
		'Open Details in a New Tab': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0041"},
		'Block Image': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0042"},
		'Send Thanks': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0054"},
		'Add Comment': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+0056"},
		'Add Manual Comment': {ctrlKey:false,shiftKey:true,keyIdentifier:"U+0056"},
		'Catch Up': {ctrlKey:false,shiftKey:true,keyIdentifier:"U+007F"},
		'Catch Up to Current Torrent': {ctrlKey:false,shiftKey:false,keyIdentifier:"U+007F"}
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
	torrentLimit: 100,
	
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
var gui = {
	tplItem: undefined,
	
	// elements
	_items: undefined,
	_dlgImg: undefined,
	_img: undefined,
	_dlgDesc: undefined,
	_dlgComm: undefined,
	_dlgQuality: undefined,
	_dlgComment: undefined,
	_comment: undefined,
	_prefs: undefined,
	_toast: undefined,
	
	fullsized: false,
	height: 0,
	vis: [],
	
	prefs: 	{
		_dlgComments: undefined,
		_commentsInput: undefined,
		_dlgTags: undefined,
		_thumbHeight: undefined,
		_autoTags: undefined,
		_tagLimit: undefined,
		_newestFirst: undefined,
		_autoThanks: undefined,
		_autoComments: undefined,
		_autoCommentsPrompt: undefined,
		_dlgKeys: undefined,
		_tblKeys: undefined,
		_tagsGood: undefined,
		_tagsBad: undefined,
		_tagsVGood: undefined,
		_tagsVBad: undefined,
		_combine: undefined,
		_combineHighest: undefined,
		_timeOffset: undefined,
		_torrentLimit: undefined,
		_latestTorrent: undefined,
		
		init: function() {
			this._dlgComments = $('#dlg-prefs-comments');
			this._commentsInput = $('#dlg-prefs-comments-input');
			this._dlgTags = $('#dlg-prefs-tags');
			this._thumbHeight = $('#prefs-thumb-height');
			this._tagLimit = $('#prefs-tag-limit');
			this._newestFirst = $('#prefs-newest-first');
			this._autoThanks = $('#prefs-auto-thanks');
			this._autoComments = $('#prefs-auto-comments');
			this._autoCommentsPrompt = $('#prefs-auto-comments-prompt');
			this._dlgKeys = $('#dlg-prefs-keys');
			this._tblKeys = $('#dlg-prefs-keys tbody');
			this._tagsGood = $('#dlg-prefs-tags-good');
			this._tagsBad = $('#dlg-prefs-tags-bad');
			this._tagsVGood = $('#dlg-prefs-tags-vgood');
			this._tagsVBad = $('#dlg-prefs-tags-vbad');
			this._autoTags = $('#prefs-auto-tags');
			this._combine = $('#prefs-combine');
			this._combineHighest = $('#prefs-combine-highest');
			this._timeOffset = $('#prefs-timezone-offset');
			this._torrentLimit = $('#prefs-torrent-limit');
			this._latestTorrent = $('#prefs-latest-torrent');
			
			this.initValues();
			
			$('#prefs-comments')._('click', this._dlgComments.show);
			$('#prefs-tags')._('click', this._dlgTags.show);
			$('#prefs-thumb-height')._('click', stopProp);
			$('#prefs-tag-limit')._('click', stopProp);
			$('#prefs-timezone-offset')._('click', stopProp);
			$('#prefs-torrent-limit')._('click', stopProp);
			$('#prefs-latest-torrent')._('click', stopProp);
			
			this._newestFirst._('change', function() {
				prefs.setNewestFirst(this.checked);
				data.update();
			});
			
			this._combine._('change', function() {
				prefs.setCombine(this.checked);
				data.update();
			});
			this._combineHighest._('change', function() {
				prefs.setCombineHighest(this.checked);
			});
			
			this._autoThanks._('change', function() {
				prefs.setAutoThanks(this.checked);
			});
			
			this._autoComments._('change', function() {
				prefs.setAutoComments(this.checked);
			});
			
			this._autoCommentsPrompt._('change', function() {
				prefs.setAutoCommentsPrompt(this.checked);
			});
			
			this._thumbHeight._('change', function() {
				prefs.setThumbHeight(this.value*1);
				gui.repaint(true);
			});
			
			this._autoTags._('change', function() {
				prefs.setAutoTags(this.checked);
				gui.repaint(true);
			});
			
			this._tagLimit._('change', function() {
				prefs.setTagLimit(this._tagLimit.value*1);
				this.initValues();
				gui.repaint(true);
			}.bind(this));
			
			$('#prefs-keys')._('click', this._dlgKeys.show);
			
			// dlg: comments
			$('#dlg-prefs-comments-ok')._('click', function() {
				this._dlgComments.hide();
				prefs.setComments(this._commentsInput.value.split('\n###\n').map(function(it) { return it.trim(); }));
			}.bind(this));
			$('#dlg-prefs-comments-cancel')._('click', function() {
				this._dlgComments.hide();
				this.initValues();
			}.bind(this));
			
			// dlg: tags
			$('#dlg-prefs-tags-ok')._('click', function() {
				this._dlgTags.hide();
				var tags = {};
				this._tagsGood.value.split(/\s+/).map(function(it) { return it.trim(); }).forEach(function(it) { if (it.length == 0) return; tags[it] = true; });
				this._tagsBad.value.split(/\s+/).map(function(it) { return it.trim(); }).forEach(function(it) { if (it.length == 0) return; tags[it] = false; });
				prefs.setGoodTags(tags);
				
				tags = {};
				this._tagsVGood.value.split(/\s+/).map(function(it) { return it.trim(); }).forEach(function(it) { if (it.length == 0) return; tags[it] = true; });
				this._tagsVBad.value.split(/\s+/).map(function(it) { return it.trim(); }).forEach(function(it) { if (it.length == 0) return; tags[it] = false; });
				prefs.setVgoodTags(tags);
				data.update();
				gui.repaint(true);
			}.bind(this));
			$('#dlg-prefs-tags-cancel')._('click', function() {
				this._dlgTags.hide();
				this.initValues();
			}.bind(this));
			
			// dlg: keys
			$('#dlg-prefs-keys-ok')._('click', function() {
				this._dlgKeys.hide();
				var keys = {};
				this._tblKeys.$$('tr td:nth-child(1)').forEach(function(it) {
					keys[it.textContent] = it.getAttribute('data-key');
				});
				prefs.setKeys(keys);
			}.bind(this));
			$('#dlg-prefs-keys-cancel')._('click', function() {
				this._dlgKeys.hide();
				this.initValues();
			}.bind(this));
			
			this._timeOffset._('change', function() {
				prefs.setTimeOffset(this._timeOffset.value*1);
				this.initValues();
				gui.repaint(true);
			}.bind(this));
			
			this._torrentLimit._('change', function() {
				prefs.setTorrentLimit(this._torrentLimit.value*1);
				this.initValues();
			}.bind(this));
			
			this._latestTorrent._('change', function() {
				prefs.setLatest(this._latestTorrent.value*1);
				this.initValues();
			}.bind(this));
		},
		
		initValues: function() {
			this._newestFirst.checked = prefs.newestFirst;
			this._combine.checked = prefs.combine;
			this._combineHighest.checked = prefs.combineHighest;
			this._autoThanks.checked = prefs.autoThanks;
			this._autoComments.checked = prefs.autoComments;
			this._autoCommentsPrompt.checked = prefs.autoCommentsPrompt;
			this._commentsInput.value = prefs.comments.join('\n###\n');
			this._thumbHeight.value = prefs.thumbHeight;
			md.input.blur(this._thumbHeight.parentNode);
			this._autoTags.checked = prefs.autoTags;
			this._tagLimit.value = prefs.tagLimit;
			md.input.blur(this._tagLimit.parentNode);
			this._timeOffset.value = prefs.timeOffset;
			md.input.blur(this._timeOffset.parentNode);
			this._torrentLimit.value = prefs.torrentLimit;
			md.input.blur(this._torrentLimit.parentNode);
			this._latestTorrent.value = (prefs.latestTorrent || {empnFormat: function() {}});
			md.input.blur(this._latestTorrent.parentNode);
			var g = [];
			var b = [];
			for(var tag in prefs.goodTags) {
				if (!prefs.goodTags.hasOwnProperty(tag)) continue;
				if (prefs.goodTags[tag]) g.push(tag);
				else b.push(tag);
			}
			this._tagsGood.value = g.join(' ');
			this._tagsBad.value = b.join(' ');
			var vg = [];
			var vb = [];
			for(var tag in prefs.vgoodTags) {
				if (!prefs.vgoodTags.hasOwnProperty(tag)) continue;
				if (prefs.vgoodTags[tag]) vg.push(tag);
				else vb.push(tag);
			}
			this._tagsVGood.value = vg.join(' ');
			this._tagsVBad.value = vb.join(' ');
			$('#dlg-prefs-tags-ratings tbody').removeChildren();
			var tagRows = [];
			for (tag in prefs.tags) {
				if (!prefs.tags.hasOwnProperty(tag)) continue;
				var tr = document.createElement('tr');
					var td1 = document.createElement('td');
					td1.textContent = tag;
					td1.style.backgroundColor = 'rgba(174, 213, 129, ' + (prefs.tags[tag] / prefs.tagLimit) + ')';
					tr.appendChild(td1);
					var td2 = document.createElement('td');
					td2.textContent = prefs.tags[tag];
					tr.appendChild(td2);
					tagRows.push(tr);
			}
			tagRows.sort(function(a,b) { return a.children[1].textContent*1 > b.children[1].textContent*1 ? -1 : 1; });
			tagRows.forEach(function(tr) { $('#dlg-prefs-tags-ratings tbody').appendChild(tr); });
			
			this._tblKeys.removeChildren();
			for (var act in prefs.keys) {
				if (!prefs.keys.hasOwnProperty(act)) continue;
				(function(act) {
					var tr = document.createElement('tr');
					var tdA = document.createElement('td');
					tdA.textContent = act;
					tdA.setAttribute('data-key', prefs.keys[act]);
					tr.appendChild(tdA);
					var tdK = document.createElement('td');
					tdK.textContent = keyIdentifier(prefs.keys[act]);
					tr.appendChild(tdK);
					var listening = false;
					addEventListener('keydown', function(evt) {
						if (!listening) return;
						evt.stopPropagation();
						evt.preventDefault();
					});
					addEventListener('keyup', function(evt) {
							if (!listening) return;
							listening = false;
							evt.stopPropagation();
							evt.preventDefault();
							var key = {
								ctrlKey: evt.ctrlKey,
								shiftKey: evt.shiftKey,
								keyIdentifier: evt.keyIdentifier
							};
							tdA.setAttribute('data-key', JSON.stringify(key));
							tdK.textContent = keyIdentifier(evt);
							tdK.delClass('empn-active');
						});
					tdK._('click', function() {
						listening = true;
						tdK.addClass('empn-active');
					});
					this._tblKeys.appendChild(tr);
				}.bind(this))(act);
			}
		}
	},
	
	init: function() {
		this.tplItem = document.createElement('div');
		this.tplItem.addClass('empn-item');
		this.tplItem.innerHTML = '<a class=\"empn-title\"></a><ul class=\"empn-tags\"></ul><dl class=\"empn-info\"><dt>Date</dt><dd class=\"empn-date\"></dd><dt>Category</dt><dd class=\"empn-category\"></dd><dt>Size</dt><dd class=\"empn-size\"></dd><dt>Snatches</dt><dd class=\"empn-snatches\"></dd><dt>Comments</dt><dd class=\"empn-comments\"></dd><dt>Uploaded By</dt><dd class=\"empn-uploader\"></dd></dl><div class=\"empn-thumbs\"></div>';
		
		document.body.innerHTML = '';
		document.title = 'EMPN :: Empornium';
		var container = document.createElement('div');
		container.innerHTML = '<style type=\"text/css\">html, body {height: 100%;margin: 0;overflow: hidden;padding: 0;}body {background-color: rgb(245, 245, 245);font-family: Helvetica, sans-serif;}ul {margin: 0;padding: 0;}.empn-dialog {  background-color: rgba(0, 0, 0, 0);  bottom: 0;  display: none;  left: 0;  position: fixed;  right: 0;  text-align: center;  top: 0;  transition: 250ms;  white-space: nowrap;  z-index: 5;}.empn-dialog .empn-height {  height: 100%;  display: inline-block;  vertical-align: middle;  width: 0;}.empn-dialog .empn-content {  box-shadow: 0 19px 60px rgba(0, 0, 0, 0.3);  box-sizing: border-box;  background: #ffffff;  display: inline-block;  max-height: 100%;  overflow-x: hidden;  overflow-y: auto;  padding: 17px;  text-align: left;  vertical-align: middle;  white-space: normal;}.empn-dialog .empn-content .empn-title {  color: #616161;  font-size: 1.25em;  font-weight: bold;  margin: 0.5em 0;}.empn-dialog .empn-content .empn-actions {  text-align: right;}.empn-dialog.empn-preactive {  display: block;}.empn-dialog.empn-active {  background-color: rgba(0, 0, 0, 0.3);}.empn-dialog.empn-active .empn-content {  transform: translate(0, 0) scale(1) !important;  transition: all 0.4s ease-in-out;}.empn-menu {  background-color: rgba(0, 0, 0, 0);  bottom: 0;  display: none;  left: 0;  position: fixed;  right: 0;  top: 0;  transition: 250ms linear;  z-index: 4;}.empn-menu .empn-content {  box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25);  background-color: #ffffff;  bottom: 0;  left: 0;  position: absolute;  top: 0;  transform: translatex(-100%);  transition: all 0.4s ease-in-out;}.empn-menu .empn-content .empn-title {  background-color: rgb(1, 87, 155);  color: #ffffff;  font-size: 1.25em;  font-weight: normal;  margin: 0 0 0.5em 0;  padding: 1em 0.5em;}.empn-menu .empn-content .empn-items {margin: 0;padding: 0;}.empn-menu .empn-content .empn-items .empn-item {  margin: 0.5em 0;  overflow: hidden;  position: relative;}.empn-menu .empn-content .empn-items .empn-item .empn-item-link, .empn-menu .empn-content .empn-items .empn-item .empn-item-link * {  cursor: pointer;}.empn-menu .empn-content .empn-items .empn-item .empn-item-link {  display: block;  padding: 1em 1.25em;  transition: 250ms;}.empn-menu .empn-content .empn-items .empn-item .empn-item-link:hover {  background-color: rgba(0, 0, 0, 0.12);}.empn-menu.empn-preactive {  display: block;}.empn-menu.empn-active {  background-color: rgba(0, 0, 0, 0.3);}.empn-menu.empn-active .empn-content {  transform: translatex(0);}.empn-input {  display: inline-block;  font-size: 1em;  position: relative;}.empn-input input {  border: none;  border-bottom: 1px solid #e0e0e0;  color: #616161;  font: inherit;  margin: 1em 0 0 0;  outline: none;  transition: 250ms ease-in-out;}.empn-input input:focus {  border-bottom-color: rgb(1, 87, 155);}.empn-input input:invalid {  border-color: #e51c23;}.empn-input .empn-placeholder {  position: absolute;  top: 1em;  left: 0;  color: #bdbdbd;  transition: 250ms ease-in-out;}.empn-input.empn-focus .empn-placeholder {  top: 0;  font-size: 0.75em !important;  color: rgb(1, 87, 155);}.empn-input.empn-has-content .empn-placeholder,.empn-input.empn-no-placeholder .empn-placeholder {  top: 0;  font-size: 0.75em !important;}.empn-ripple {  content: \"\";  background-color: rgba(0, 0, 0, 0.4);  border-radius: 50%;  display: block;  height: 500px;  left: 0;  opacity: 1;  position: absolute;  top: 0;  transform: scale(0);  width: 500px;}.empn-clicked .empn-ripple {  opacity: 0;  transform: scale(1);  transition: transform 550ms ease-in-out, opacity 550ms ease-in-out;}button,input[type=\"button\"],input[type=\"submit\"] {  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);  background-color: rgb(1, 87, 155);  border: none;  color: white;  cursor: pointer;  font: inherit;  margin: 1em;  outline: none;  overflow: hidden;  padding: 0.5em;  position: relative;  transition: 200ms linear;  vertical-align: bottom;  width: 10em;}button:hover,input[type=\"button\"]:hover,input[type=\"submit\"]:hover {  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);  background-color: rgb(2, 119, 189);  transform: translate3d(0, -1px, 0);}.empn-toasts {list-style: none;margin: 0;padding: 0;position: absolute;right: 2.5em;top: 2.5em;width: 20em;}.empn-toast {background-color: rgb(255,255,255);border-top: 0.5em solid rgb(1, 87, 155);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);box-sizing: border-box;margin: 0;opacity: 0;padding: 0.5em;}.empn-toast.empn-preactive {transition: 200ms ease-in-out;}.empn-toast.empn-active {margin-top: 0.5em !important;opacity: 1;}.empn-toast > .empn-title {font-weight: bold;}.empn-toast > .empn-info {font-size: small;}.empn-toolbar {  height: 2.5em;  position: relative;}.empn-toolbar .empn-sect {  height: 100%;  position: absolute;  top: 0;}.empn-toolbar .empn-sect .empn-item {  box-sizing: border-box;  display: inline-block;  height: 100%;  margin: 0 0.5em;  overflow: hidden;  position: relative;}.empn-toolbar .empn-sect .empn-item .empn-item-link {  box-sizing: border-box;  color: inherit;  cursor: pointer;  display: block;  font-size: 1.25em;  height: 100%;  padding: 0.45em 0.5em 0.25em 0.5em;  text-decoration: none;}.empn-toolbar .empn-sect .empn-item .empn-item-link:hover {  background-color: rgba(0, 0, 0, 0.12);}.empn-toolbar .empn-sect.empn-primary {  left: 0;}.empn-toolbar .empn-sect.empn-secondary {  right: 0;}.empn-tabbar {  height: 2.5em;  position: relative;}.empn-tabbar .empn-items {  height: 100%;}.empn-tabbar .empn-items .empn-item {  box-sizing: border-box;  display: inline-block;  height: 100%;  overflow: hidden;  position: relative;}.empn-tabbar .empn-items .empn-item .empn-item-link {  background-color: #03a9f4;  box-sizing: border-box;  color: #ffffff;  cursor: pointer;  display: block;  font-size: 1.25em;  height: 100%;  padding: 0.25em 0.5em 0.375em 0.5em;  text-align: center;}.empn-tabbar .empn-marker {  background-color: #ffeb3b;  bottom: 0;  height: 0.25em;  position: absolute;  transition: 400ms ease-in-out;}.empn-tabbar.empn-bottom .empn-items .empn-item .empn-item-link {  padding: 0.375em 0.5em 0.25em 0.5em;}.empn-tabbar.empn-bottom .empn-marker {  bottom: auto;  top: 0;}#app {position: absolute;top: 0;bottom: 0;right: 0;left: 0;transition: 400ms ease-in-out;}#appbar {background-color: rgb(1, 87, 155);box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);color: rgb(255,255,255);z-index: 2;}#items {bottom: 0;left: 0;overflow: auto;padding: 10px;position: absolute;right: 0;top: 40px;}#items .empn-item {background-color: rgb(255,255,255);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);margin: 0 0 16px 0;padding: 2px 2px 2px 5px;}.empn-item > .empn-title {color: rgb(117, 117, 117);display: inline-block;font-weight: bold;height: 16px;overflow: hidden;text-decoration: none;text-overflow: ellipsis;transition: 200ms;white-space: nowrap;max-width: 100%;}.empn-item.empn-active > .empn-title {color: red;height: auto;white-space: normal;}.empn-item > .empn-tags {height: 24px;list-style: none;margin: 0;overflow: hidden;padding: 0;white-space: nowrap;}.empn-item.empn-active > .empn-tags { height: auto; min-height: 24px; white-space: normal; }.empn-item > .empn-tags > li {background-color: rgb(255,255,255);border-radius: 2px;box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);display: inline-block;font-family: monospace;//font-size: 0.8em;padding: 0.125em 0.25em;margin: 0 0.25em 0.25em 0.25em;}.empn-item > .empn-tags > li > a { text-decoration: none; color: inherit; }.empn-item > .empn-tags > li.empn-good { background-color: rgb(174, 213, 129); }.empn-item > .empn-tags > li.empn-bad { background-color: rgb(249, 189, 187); }.empn-item > .empn-tags > li.empn-vgood { background-color: rgb(124, 179, 66); font-weight: bold; }.empn-item > .empn-tags > li.empn-vbad { background-color: rgb(243, 108, 96); font-weight: bold; }.empn-item > .empn-info {list-style: none;margin: 0;overflow: hidden;padding: 0;white-space: nowrap;}.empn-item > .empn-info > dt, .empn-item > .empn-info > dd {display: inline-block;font-size: 0.75em;margin: 0;}.empn-item > .empn-info > dt {color: rgb(117, 117, 117);}.empn-item > .empn-info > dt:after {content: \":\";}.empn-item > .empn-info > dd {margin: 0 1em 0 0.25em;}.empn-item > .empn-thumbs {//height: 221px;overflow-x: hidden;white-space: nowrap;}.empn-item > .empn-thumbs:hover {overflow-x: auto;}.empn-item > .empn-thumbs > .empn-img {border-bottom: 3px solid transparent;box-sizing: border-box;display: inline-block;//height: 200px;margin: 0 10px 0 0;transition: 200ms ease-in-out;}.empn-item > .empn-thumbs > .empn-img.empn-active {border-bottom: 3px solid red;}.empn-description.box, .empn-comments.box { border: none; }#dlg-img .empn-img {display: block;transition: 400ms ease-in-out;}/*#dlg-comments .empn-content{height: 90%;width: 90%;}#dlg-comments .empn-tabs {direction: rtl;list-style: none;transition: 400ms ease-in-out;}#dlg-comments .empn-tabs .empn-tab {direction: ltr;display: inline-block;vertical-align: top;width: 99.999%;}*/#dlg-comment-input {height: 100px;width: 95%;}#preferences > .empn-content > .empn-items {position: absolute;overflow: auto;bottom: 0;left: 0;}#preferences > .empn-content > .empn-items > .empn-item {white-space: nowrap;}#loading {background-color: rgb(255,255,255);bottom: 0;left: 0;position: fixed;right: 0;text-align: center;top: 0;white-space: nowrap;z-index: 100;}#loading .empn-height {display: inline-block;height: 100%;vertical-align: middle;width: 0;}#loading .empn-content {display: inline-block;vertical-align: middle;}#loading .empn-spinner {position: relative;display: inline-block;margin: 1em 0;}#loading .empn-spinner .empn-track {border-radius: 50%;border: 6px solid rgb(179, 229, 252);height: 50px;width: 50px;}#loading .empn-spinner .empn-blob {border-radius: 50%;background-color: rgb(79, 195, 247);height: 6px;left: 28px;position: absolute;top: 28px;width: 6px;animation-name: spinning;animation-duration: 1s;animation-iteration-count: infinite;animation-timing-function: linear;}@keyframes spinning {0% {transform-origin: 28px 0px;transform: translate(-28px) rotateZ(0deg);}25% {transform-origin: 28px 0px;transform: translate(-28px) rotateZ(90deg);}50% {transform-origin: 31px 0px;transform: translate(-28px) rotateZ(180deg);}75% {transform-origin: 31px 3px;transform: translate(-28px) rotateZ(270deg);}100% {transform-origin: 28px 0px;transform: translate(-28px) rotateZ(360deg);}}#dlg-prefs-comments-input {height: 200px;width: 500px;}#dlg-prefs-tags label {display: inline-block;}#dlg-prefs-tags .empn-dlg-prefs-tags-container {white-space: nowrap;}#dlg-prefs-tags textarea {height: 100px;width: 250px;}#dlg-prefs-tags .empn-dlg-prefs-tags-table-container {overflow: auto;}#dlg-prefs-tags-ratings td:nth-child(2) {text-align: right;}#dlg-prefs-keys table {width: 100%;}#dlg-prefs-keys td:nth-child(2) {background-color: rgb(236, 239, 241);font-family: monospace;min-width: 50px;}#dlg-prefs-keys td:nth-child(2).empn-active {background-color: rgb(179, 229, 252);}#dlg-comment-prompt-input {display: block;height: 100px;margin: auto;width: 90%;}</style><div id=\"app\"><div class=\"empn-toolbar\" id=\"appbar\"><ul class=\"empn-sect\"><li class=\"empn-item\"><a class=\"empn-item-link\" id=\"menu-link\">≡</a></li></ul><ul class=\"empn-sect empn-secondary\"><li class=\"empn-item\"><a href=\"index.php\" class=\"empn-item-link\">Back to EMP</a></li></ul></div><div id=\"items\"></div></div><div class=\"empn-dialog\" id=\"dlg-img\"><div class=\"empn-height\"></div><div class=\"empn-content\"><img class=\"empn-img\"></div></div><div class=\"empn-menu\" id=\"preferences\"><div class=\"empn-content\"><div class=\"empn-title\">Preferences</div><ul class=\"empn-items\"><li class=\"empn-item\" title=\"Checked: order by date, descending. Unchecked: order by date, ascending\"><label class=\"empn-item-link\" for=\"prefs-newest-first\"><input type=\"checkbox\" id=\"prefs-newest-first\"> Sort New to Old</label></li><li class=\"empn-item\" title=\"Combine torrents with the same name and different quality hint in the title (e.g. \'... [1080p]\')\"><label class=\"empn-item-link\" for=\"prefs-combine\"><input type=\"checkbox\" id=\"prefs-combine\"> Combine Torrents (<label for=\"prefs-combine-highest\" title=\"When downloading combined torrents automatically select the highest quality. If unchecked you will be asked to select the quality.\">Download Highest Quality: <input type=\"checkbox\" id=\"prefs-combine-highest\"></label>)</label></li><li class=\"empn-item\" title=\"Automatically send \'Thanks\' when downloading a torrent\"><label class=\"empn-item-link\" for=\"prefs-auto-thanks\"><input type=\"checkbox\" id=\"prefs-auto-thanks\"> Auto Thanks</label></li><li class=\"empn-item\" title=\"Automatically send a random or manually entered (when \'Prompt\' is checked) comment when downloading a torrent\"><label class=\"empn-item-link\" for=\"prefs-auto-comments\"><input type=\"checkbox\" id=\"prefs-auto-comments\"> Auto Comments (<label for=\"prefs-auto-comments-prompt\">Prompt: <input type=\"checkbox\" id=\"prefs-auto-comments-prompt\"></label>)</label></li><li class=\"empn-item\" title=\"Edit the list of random comments\"><a class=\"empn-item-link\" id=\"prefs-comments\">Edit Comments</a></li><li class=\"empn-item\" title=\"Height of the thumbnail images in pixel\"><label for=\"prefs-thumb-height\" class=\"empn-item-link\"><div class=\"empn-input\"><input type=\"number\" placeholder=\"Thumbnail Height\" id=\"prefs-thumb-height\"></div></label></li><li class=\"empn-item\" title=\"Automatically rate tags: when downloading a torrent, all of its tags\' ratings increase by 1. The higher a tag\'s rating the stronger it will be highlighted in the torrent list.\"><label class=\"empn-item-link\" for=\"prefs-auto-tags\"><input type=\"checkbox\" id=\"prefs-auto-tags\"> Auto Tag Ratings</label></li><li class=\"empn-item\" title=\"When the rating limit is reached the tag\'s highlight will not get any stronger\"><label for=\"prefs-tag-limit\" class=\"empn-item-link\"><div class=\"empn-input\"><input type=\"number\" placeholder=\"Tag Rating Limit\" id=\"prefs-tag-limit\"></div></label></li><li class=\"empn-item\" title=\"Edit the list of good and bad tags and view the tag ratings\"><a class=\"empn-item-link\" id=\"prefs-tags\">Edit Tags</a></li><li class=\"empn-item\" title=\"Edit the key bindings\"><a class=\"empn-item-link\" id=\"prefs-keys\">Key Bindings</a></li><li class=\"empn-item\" title=\"Timezone Offset\"><label for=\"prefs-timezone-offset\" class=\"empn-item-link\"><div class=\"empn-input\"><input type=\"number\" placeholder=\"Timezone Offset\" id=\"prefs-timezone-offset\"></div></label></li><li class=\"empn-item\" title=\"Maximum number of torrents to load\"><label for=\"prefs-torrent-limit\" class=\"empn-item-link\"><div class=\"empn-input\"><input type=\"number\" placeholder=\"Torrent Limit\" id=\"prefs-torrent-limit\"></div></label></li><li class=\"empn-item\" title=\"Date/time of latest viewed torrent\"><label for=\"prefs-torrent-limit\" class=\"empn-item-link\"><div class=\"empn-input\"><input type=\"datetime\" placeholder=\"Latest Torrent\" id=\"prefs-latest-torrent\" disabled></div></label></li></ul></div></div><div class=\"empn-dialog\" id=\"dlg-prefs-comments\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\">Edit Auto Comments</div><div><p>Separate comments with a line containing only <code>###</code></p><textarea id=\"dlg-prefs-comments-input\"></textarea></div><div class=\"empn-actions\"><button id=\"dlg-prefs-comments-ok\">OK</button><button id=\"dlg-prefs-comments-cancel\">Cancel</button></div></div></div><div class=\"empn-dialog\" id=\"dlg-prefs-tags\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\">Edit Tags</div><div class=\"empn-dlg-prefs-tags-container\"><label for=\"dlg-prefs-tags-good\">Good<br><textarea id=\"dlg-prefs-tags-good\"></textarea></label><label for=\"dlg-prefs-tags-bad\">Bad<br><textarea id=\"dlg-prefs-tags-bad\"></textarea></label></div><div class=\"empn-dlg-prefs-tags-container\"><label for=\"dlg-prefs-tags-vgood\">Outstanding <small>(trumps horrible tags)</small><br><textarea id=\"dlg-prefs-tags-vgood\"></textarea></label><label for=\"dlg-prefs-tags-vbad\">Horrible <small>(hides torrents from list)</small><br><textarea id=\"dlg-prefs-tags-vbad\"></textarea></label></div><div class=\"empn-dlg-prefs-tags-table-container\"><table iD=\"dlg-prefs-tags-ratings\"><thead><tr><th>Tag</th><th>Rating</th></tr></thead><tbody></tbody></table></div><div class=\"empn-actions\"><button id=\"dlg-prefs-tags-ok\">OK</button><button id=\"dlg-prefs-tags-cancel\">Cancel</button></div></div></div><div class=\"empn-dialog\" id=\"dlg-prefs-keys\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\">Key Bindings</div><table><thead><tr><th>Action</th><th>Key</th></tr></thead><tbody></tbody></table><div class=\"empn-actions\"><button id=\"dlg-prefs-keys-ok\">OK</button><button id=\"dlg-prefs-keys-cancel\">Cancel</button></div></div></div><div class=\"empn-dialog\" id=\"dlg-comment-prompt\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\">Please leave a comment</div><textarea id=\"dlg-comment-prompt-input\"></textarea><div class=\"empn-actions\"><button id=\"dlg-comment-prompt-ok\">Leave Comment</button><button id=\"dlg-comment-prompt-random\">Random Comment</button><button id=\"dlg-comment-prompt-cancel\">No Comment</button></div></div></div><div class=\"empn-dialog\" id=\"dlg-description\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\"></div><div class=\"empn-description box\"></div></div></div><div class=\"empn-dialog\" id=\"dlg-comments\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\"></div><div class=\"empn-comments box\"></div></div></div><div class=\"empn-dialog\" id=\"dlg-quality\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\">Select Quality</div><div class=\"empn-actions\"></div></div></div><div class=\"empn-dialog\" id=\"dlg-comment\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-title\">Enter a Comment</div><div><textarea id=\"dlg-comment-input\"></textarea></div><div class=\"empn-actions\"><button id=\"dlg-comment-ok\">Comment</button><button id=\"dlg-comment-cancel\">Don\'t Comment</button></div></div></div><ul class=\"empn-toasts\"></ul><div id=\"loading\"><div class=\"empn-height\"></div><div class=\"empn-content\"><div class=\"empn-info\">&nbsp;</div><div class=\"empn-spinner\"><div class=\"empn-track\"></div><div class=\"empn-blob\"></div></div><div class=\"empn-info\">&nbsp;</div></div></div>';
		document.body.appendChild(container);
		
		var bbcode = document.createElement('script');
		bbcode.src = 'static/functions/bbcode.js?v=';
		document.body.parentNode.children[0].appendChild(bbcode);
		
		this._items = $('#items');
		this._dlgImg = $('#dlg-img');
		this._img = this._dlgImg.$('.empn-img');
		this._dlgDesc = $('#dlg-description');
		this._dlgComm = $('#dlg-comments');
		this._dlgQuality = $('#dlg-quality');
		this._dlgComment = $('#dlg-comment');
		this._comment = $('#dlg-comment-input');
		this._prefs = $('#preferences');
		this._toast = $('.empn-toasts');
		
		md.dialog.init($$('.empn-dialog'));
		md.input.init($$('.empn-input'));
		md.ripple.init($$('button, .empn-item-link'));
		md.menu.init($$('.empn-menu'));
		md.toasts.init($$('.empn-toasts'));
		// md.tabbar.init($$('.empn-tabbar'));
		
		this.prefs.init();
		
		this._dlgImg._('click', actions.hideImage);
		this._img._('click', this.toggleImgSize.bind(this));
		
		this._dlgDesc._('click', actions.hideDescription);
		this._dlgDesc.$('.empn-content')._('click', stopProp);
		
		this._dlgComm._('click', actions.hideComments);
		this._dlgComm.$('.empn-content')._('click', stopProp);
		
		this._dlgQuality._('click', this._dlgQuality.hide);
		this._dlgQuality.$('.empn-content')._('click', stopProp);
		
		this._dlgComment._('click', this._dlgComment.hide);
		this._dlgComment.$('.empn-content')._('click', stopProp);
		$('#dlg-comment-ok')._('click', function() {
			actions.sendComment(this._dlgComment.item, this._comment.value);
			this._dlgComment.hide();
			state.listening = true;
		}.bind(this));
		$('#dlg-comment-cancel')._('click', function() {
			this._dlgComment.hide();
			state.listening = true;
		}.bind(this));
		
		$('#menu-link')._('click', $('#preferences').show);
		$('#menu-link')._('click', function() { state.listening = false; });
		this._prefs._('click', function() { state.listening = true; });
		
		addEventListener('resize', this.resizeListener.bind(this));
		this.resizeListener();
		
		this._items._('scroll', this.scrollListener.bind(this));
		this._items.focus();
		
		this.calcItemHeight();
	},
	
	initItems: function() { console.info('init items');
		this._items.removeChildren();
		for (var i=0;i<data.items.length;i++) {
			this._items.appendChild(this.createBlank(i));
		};
		this.repaint(true);
	},
	
	hideLoading: function() {
		$('#loading').remove();
	},
	updateLoading: function(txt) {
		$('#loading .empn-info').textContent = txt;
	},
	updateLoadingSub: function(txt) {
		$('#loading .empn-info:nth-child(3)').textContent = txt;
	},
	
	calcItemHeight: function() {
		this._items.appendChild(this.tplItem);
		this.tplItem.$('.empn-thumbs').style.height = (prefs.thumbHeight + 21) + 'px';
		this.height = this.tplItem.offsetHeight + 16;
		this.tplItem.remove();
	},
	
	toggleImgSize: function(evt) {
		if (evt) evt.stopPropagation();
		if (this.fullsized) {
			this.fullsized = false;
			document.body.style.overflow = '';
			this.resizeListener();
		} else {
			if (!this._dlgImg.hasClass('empn-active')) return;
			this.fullsized = true;
			this._img.style.maxHeight = this._img.naturalHeight / this._img.naturalWidth * (innerWidth - 48) + 'px';
			this._img.style.maxWidth = innerWidth - 48 + 'px';
			this._dlgImg.$('.empn-content').style.overflow = 'auto';
			document.body.style.overflow = 'hidden';
		}
	},
	
	createBlank: function(idx) {
		var itm = document.createElement('div');
		itm.id = 'item-' + idx;
		itm.addClass('empn-item').addClass('empn-blank');
		itm.style.height = this.height - 16 - 4 + 'px';
		
		return itm;
	},
	
	createItem: function(idx) {
		var item = data.items[idx];
		var itm = this.tplItem.cloneNode(true);
		if (idx == state.torrentIndex) {
			itm.addClass('empn-active');
		}
		itm.id = 'item-'+idx;
		itm.item = item;
		itm.$('.empn-title').textContent = item.title;
		itm.$('.empn-title').title = item.title;
		itm.$('.empn-title').href = item.urlDetails;
		itm.$('.empn-date').textContent = item.date.empnFormat();
		itm.$('.empn-category').textContent = item.category;
		itm.$('.empn-size').textContent = item.size;
		itm.$('.empn-snatches').textContent = item.snatches;
		itm.$('.empn-comments').textContent = item.comments.length;
		itm.$('.empn-uploader').appendChild(item.uploader);
		itm._('click', function() { actions.activateItem(idx) });
		item.tags.sort(this.tagSort);
		item.tags.forEach(function(it) {
			var tag = document.createElement('li');
			var tagLink = document.createElement('a');
			tagLink.textContent = it;
			tagLink.href = 'torrents.php?taglist=' + it;
			tag.appendChild(tagLink);
			if (prefs.vgoodTags[it]) {
				tag.addClass('empn-vgood');
			} else if (prefs.vgoodTags[it] === false) {
				tag.addClass('empn-vbad');
			} else if (prefs.goodTags[it]) {
				tag.addClass('empn-good');
			} else if (prefs.goodTags[it] === false) {
				tag.addClass('empn-bad');
			} else if (prefs.autoTags && prefs.tags[it]) {
				tag.style.backgroundColor = 'rgba(174, 213, 129, ' + (prefs.tags[it] / prefs.tagLimit) + ')';
			} else {}
			itm.$('.empn-tags').appendChild(tag);
		});
		itm.$('.empn-thumbs').style.height = (prefs.thumbHeight + 21) + 'px';
		item.thumbs.forEach(function(it, i) {
			var thumb = document.createElement('img');
			thumb.addClass('empn-img-' + i).addClass('empn-img');
			if (state.torrentIndex == idx && state.imgIndex == i) {
				thumb.addClass('empn-active');
			}
			thumb.src = it.src;
			thumb.setAttribute('data-link', it.link);
			thumb.style.maxHeight = prefs.thumbHeight + 'px';
			thumb._('click', function(evt) {
				evt.stopPropagation();
				actions.activateItem(idx);
				actions.activateImage(i);
				this._img.src = it.src;
				this._dlgImg.show(thumb);
			}.bind(this));
			itm.$('.empn-thumbs').appendChild(thumb);
		}.bind(this));
		return itm;
	},
	
	hide: function(i) { console.info('hide('+i+')');
		this.vis[i] = false;
		this._items.replaceChild(this.createBlank(i), $('#item-'+i));
	},
	show: function(i) { //console.info('show('+i+')');
		this.vis[i] = true;
		this._items.replaceChild(this.createItem(i), $('#item-'+i));
	},
	
	showCommentDialog: function(comments) {
		if (comments instanceof Array) {
			
		} else {
			this._dlgComm.$('.empn-comments').innerHTML = comments;
		}
	},
	
	repaint: function(forced) {
		var top = this._items.scrollTop - this._items.offsetHeight * 2;
		var bottom = this._items.scrollTop + this._items.offsetHeight * 3;
		
		for (var i=0;i<data.items.length;i++) {
			if ((i*this.height < top || i*this.height > bottom) && (this.vis[i] || forced)) {
				this.hide(i);
			} else if (i*this.height > top && i*this.height < bottom && (!this.vis[i] || forced)) {
				this.show(i);
			}
		}
	},
	
	scrollListener: function() {
		this.repaint();
	},
	
	resizeListener: function() {
		var img = $('#dlg-img .empn-img');
		img.style.maxWidth = innerWidth - 48 + 'px';
		if (this.fullsized) {
			img.style.maxHeight = '';
		} else {
			img.style.maxHeight = innerHeight - 48 + 'px';
		}
		
		this.repaint();
		
		this.prefs._dlgTags.$('.empn-dlg-prefs-tags-table-container').style.maxHeight = innerHeight - 17 - 59 - 301 /*this.prefs._dlgTags.$('.empn-dlg-prefs-tags-table-container').offsetTop*/ + 'px';
		this._prefs.style.display = 'block';
		this._prefs.$('.empn-items').style.top = this._prefs.$('.empn-title').getBoundingClientRect().bottom + 'px';
		this._prefs.$('.empn-content').style.width = this._prefs.$('.empn-items').getBoundingClientRect().width + 'px';
		this._prefs.style.display = '';
	},
	
	tagSort: function(a,b) {
		if ((prefs.vgoodTags[a] && prefs.vgoodTags[b]) || (prefs.vgoodTags[a] === false && prefs.vgoodTags[b] === false)) {
			return a.toLowerCase() > b.toLowerCase() ? 1 : a.toLowerCase() < b.toLowerCase() ? -1 : 0;
		}
		if (prefs.vgoodTags[a]) {
			return -1;
		}
		if (prefs.vgoodTags[b]) {
			return 1;
		}
		if (prefs.vgoodTags[a] === false) {
			return -1;
		}
		if (prefs.vgoodTags[b] === false) {
			return 1;
		}
		if ((prefs.goodTags[a] && prefs.goodTags[b]) || (prefs.goodTags[a] === false && prefs.goodTags[b] === false)) {
			return a.toLowerCase() > b.toLowerCase() ? 1 : a.toLowerCase() < b.toLowerCase() ? -1 : 0;
		}
		if (prefs.goodTags[a]) {
			return -1;
		}
		if (prefs.goodTags[b]) {
			return 1;
		}
		if (prefs.goodTags[a] === false) {
			return -1;
		}
		if (prefs.goodTags[b] === false) {
			return 1;
		}
		if (prefs.tags[a] >= prefs.tagLimit / 10 && prefs.tags[b] >= prefs.tagLimit / 10) {
			if (prefs.tags[a] > prefs.tags[b]) return -1;
			if (prefs.tags[a] < prefs.tags[b]) return 1;
			return a.toLowerCase() > b.toLowerCase() ? 1 : a.toLowerCase() < b.toLowerCase() ? -1 : 0;
		}
		if (prefs.tags[a] >= prefs.tagLimit / 10) {
			return -1;
		}
		if (prefs.tags[b] >= prefs.tagLimit / 10) {
			return 1;
		}
		return a.toLowerCase() > b.toLowerCase() ? 1 : a.toLowerCase() < b.toLowerCase() ? -1 : 0;
	}
};
var data = {
	listParams: {
		page: 1,
		toString: function() {
			var params = [];
			for (var key in this) {
				if (!this.hasOwnProperty(key) || typeof this[key] == 'function') continue;
				params.push(key + '=' + this[key]);
			}
			return params.join('&');
		}
	},
	
	_items: [],
	items: [],
	
	update: function() {
		var items = this._items.map(function(it) {
			var item = {};
			for (var key in it) {
				if (!it.hasOwnProperty(key)) continue;
				item[key] = it[key];
			}
			return item;
		});
		
		// combine torrents with same name
		if (prefs.combine) {
			var _items = [];
			var titles = [];
			items.forEach(function(item, i) {
				var title = item.title.replace(/(^|[^a-z0-9])\[?(\d+[pi]|\d+x\d+|\[\d+\])\]?([^a-z0-9]|$)/i, "$1[_EMPN_RESOLUTION_]$3")
										.replace(/(^|[^a-z0-9])(\d+(\.\d+)?mb?ps)([^a-z0-9]|$)/i, "$1_EMPN_BITRATE_$4")
										.replace(/(^|[^a-z0-9])(mp4|wmv|mkv)([^a-z0-9]|$)/i, "$1_EMPN_TYPE_$3");
				if (title == item.title) {
					item.quality = null;
					item.qualityValue = null;
					item.qualities = [];
					return;
				}
				item.quality = [];
				var resolution = item.title.replace(/^.*?(^|[^a-z0-9])((\d+[pi])|(\d+x\d+)|\[(\d+)\])([^a-z0-9]|$).*$/i, "$3$4$5");
				var bitrate = item.title.replace(/^.*?(^|[^a-z0-9])(\d+(\.\d+)?mb?ps)([^a-z0-9]|$).*$/i, "$2");
				var type = item.title.replace(/^.*?(^|[^a-z0-9])(mp4|wmv|mkv)([^a-z0-9]|$).*$/i, "$2");
				if (resolution != item.title) item.quality.push(resolution);
				if (bitrate != item.title) item.quality.push(bitrate);
				if (type != item.title) item.quality.push(type);
				var resValue = item.title.replace(/^.*?(^|[^a-z0-9])((\d+)[pi]|\d+x(\d+)|\[(\d+)\])([^a-z0-9]|$).*$/i, "$3$4$5")*1;
				var bitValue = item.title.replace(/^.*?(^|[^a-z0-9])((\d+(\.\d+)?)mb?ps)([^a-z0-9]|$).*$/i, "$3")*1;
				item.qualityValue = (resValue||1)*(bitValue||1);
				item.qualities = items.filter(function(itm) {
					return itm.title.replace(/(^|[^a-z0-9])\[?(\d+[pi]|\d+x\d+|\[\d+\])\]?([^a-z0-9]|$)/i, "$1[_EMPN_RESOLUTION_]$3")
										.replace(/(^|[^a-z0-9])(\d+(\.\d+)?mb?ps)([^a-z0-9]|$)/i, "$1_EMPN_BITRATE_$4")
										.replace(/(^|[^a-z0-9])(mp4|wmv|mkv)([^a-z0-9]|$)/i, "$1_EMPN_TYPE_$3") == title;
				});
			});
			items.forEach(function(item, i) {
				if (item.qualities.length > 1) {
					var title = item.title.replace(/(^|[^a-z0-9])\[?(\d+[pi]|\d+x\d+|\[\d+\])\]?([^a-z0-9]|$)/i, "$1[_EMPN_RESOLUTION_]$3")
										.replace(/(^|[^a-z0-9])(\d+(\.\d+)?mb?ps)([^a-z0-9]|$)/i, "$1_EMPN_BITRATE_$4")
										.replace(/(^|[^a-z0-9])(mp4|wmv|mkv)([^a-z0-9]|$)/i, "$1_EMPN_TYPE_$3");
					if (titles.lastIndexOf(title) != -1) {
						return;
					}
					var _item = {};
					_item.qualities = item.qualities;
					_item.qualities.sort(function(a,b) { return a.qualityValue > b.qualityValue ? -1 : 1; });
					_item.category = item.category;
					// _item.comments = item.qualities.spread('comments').join(', ');
					_item.comments = item.qualities[0].comments;
					_item.description = item.qualities[0].description;
					_item.date = item.date;
					_item.id = item.id;
					_item.idx = item.idx;
					_item.quality = null;
					_item.qualityValue = null;
					_item.size = item.qualities.spread('size').join(', ');
					_item.snatches = item.qualities.spread('snatches').join(', ');
					_item.uploader = item.uploader;
					_item.tags = [];
					item.qualities.spread('tags').forEach(function(tags) {
						_item.tags = _item.tags.concat(tags.filter(function(tag) { return _item.tags.lastIndexOf(tag) == -1; }));
					});
					_item.thumbs = [];
					item.qualities.spread('thumbs').forEach(function(thumbs) {
						_item.thumbs = _item.thumbs.concat(thumbs.filter(function(thumb) { return _item.thumbs.lastIndexOf(thumb) == -1; }));
					});
					_item.title = item.title.replace(/\[?(^|[^a-z0-9])(\d+[pi]|\d+x\d+|\[\d+\])([^a-z0-9]|$)\]?/i, "")
										.replace(/\[?(^|[^a-z0-9])(\d+(\.\d+)?mb?ps)([^a-z0-9]|$)\]?/i, "")
										.replace(/\[?(^|[^a-z0-9])(mp4|wmv|mkv)([^a-z0-9]|$)\]?/i, "") + ' [' + item.qualities.spread('quality').map(function(it) { return it.join('-'); }).join(', ') + ']';
					_items.push(_item);
					titles.push(title);
				} else {
					_items.push(item);
					titles.push(title);
				}
			});
			items = _items;
		}
		
		// filter out horrible tags
		items = items.filter(function(item) {
			var vbad = item.tags.filter(function(tag) { return prefs.vgoodTags[tag] === false; }).length > 0;
			var vgood = item.tags.filter(function(tag) { return prefs.vgoodTags[tag] === true; }).length > 0;
			
			return !vbad || vgood;
		});
		
		// sort items
		if (!prefs.newestFirst)
			items.reverse();
		
		// remove blacklisted thumbs
		items.forEach(function(item) {
			item.thumbs = item.thumbs.filter(function(thumb) {
				var src = JSON.parse(thumb).src;
				return prefs.blacklist.lastIndexOf(src) == -1;
			});
		});
		
		// parse thumbs (JSON)
		items.forEach(function(item) {
			item.thumbs = item.thumbs.map(function(thumb) {
				return JSON.parse(thumb);
			});
		});
		
		
		var change = true;
		if (items.map(function(it) { return it.id; }).join(';') == this.items.map(function(it) { return it.id; }).join(';')) {
			change = false;
		}
		
		this.items = items;
		
		if (change) {
			gui.initItems();
		}
	},
	
	load: function() {
		//DEBUG
		// this._items = [
			// {idx: 0, id: 'x', category: 'Pictures', url: 'Book.xlsx', title: 'This is the title', comments: 9, size: '123 GB', snatches: 100, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8943.JPG','/pix5/albums/Test/(001)/IMG_8959.JPG','/pix5/albums/Test/(001)/IMG_8946.JPG'], tags: ['1080p', 'maps', 'something.else', 'not.good', 'mmmmmmmmmmmmmmmmmmmmmmmmm', 'wwwwwwww.wwwwwwwwwww.wwwwwwwwwwwww', 'asdfhjlkasdfhjlkasdfhk', 'asdf', 'hkjl', 'mmmmmmmmmmmm.wwwwwwwwwwwww.mmmmmmmmmmmm', 'wwwwwwwww.mmmmmmmmm.wwwwwwwwmmmmm', 'aposiudlfkasjdhfÃ¶aslkdjf', 'aÃ¶lksjdhfalksjdhf', 'aÃ¶lkjf.asd,kjfÃ¶akshs', 'lakjsdhfl.as,dfjlaksdjf']},
			// {idx: 1, id: 'y', category: 'Pictures', url: 'Book.xlsx', title: 'This is the title', comments: 9, size: '123 GB', snatches: 100, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8943.JPG','/pix5/albums/Test/(001)/IMG_8959.JPG','/pix5/albums/Test/(001)/IMG_8946.JPG'], tags: ['1080p', 'maps', 'something.else', 'tags']},
			// {idx: 2, id: 'c', category: 'Pictures', url: 'Book.xlsx', title: 'This is the title', comments: 9, size: '123 GB', snatches: 100, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8943.JPG','/pix5/albums/Test/(001)/IMG_8959.JPG','/pix5/albums/Test/(001)/IMG_8946.JPG'], tags: ['1080p', 'maps', 'something.else', 'rag.tag']},
			// {idx: 3, id: 'v', category: 'Pictures', url: 'Book.xlsx', title: 'This is the title', comments: 9, size: '123 GB', snatches: 100, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8943.JPG','/pix5/albums/Test/(001)/IMG_8959.JPG','/pix5/albums/Test/(001)/IMG_8946.JPG'], tags: ['1080p', 'maps', 'something.else', 'bla', 'mmmmmmmmmmmmmmmmmmmmmmmmm', 'wwwwwwww.wwwwwwwwwww.wwwwwwwwwwwww', 'asdfhjlkasdfhjlkasdfhk', 'asdf', 'hkjl', 'mmmmmmmmmmmm.wwwwwwwwwwwww.mmmmmmmmmmmm', 'wwwwwwwww.mmmmmmmmm.wwwwwwwwmmmmm', 'aposiudlfkasjdhfÃ¶aslkdjf', 'aÃ¶lksjdhfalksjdhf', 'aÃ¶lkjf.asd,kjfÃ¶akshs', 'lakjsdhfl.as,dfjlaksdjf']},
			// {idx: 4, id: 'b', category: 'Pictures', url: 'Book.xlsx', title: 'This is the title', comments: 9, size: '123 GB', snatches: 100, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8943.JPG','/pix5/albums/Test/(001)/IMG_8959.JPG','/pix5/albums/Test/(001)/IMG_8946.JPG'], tags: ['1080p', 'maps', 'something.else', 'script']},
			// {idx: 5, id: 'n', category: 'Pictures', url: 'Book.xlsx', title: 'This is another title [1080x720]', comments: 9, size: '123 GB', snatches: 100, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8943.JPG','/pix5/albums/Test/(001)/IMG_8959.JPG','/pix5/albums/Test/(001)/IMG_8946.JPG'], tags: ['1080p', 'maps', 'something.else', 'dev']},
			// {idx: 6, id: 'm', category: 'Pictures', url: 'Book.xlsx', title: 'This one is different [480p]', comments: 2, size: '600 MB', snatches: 64, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8980.JPG','/pix5/albums/Test/(001)/IMG_8981.JPG','/pix5/albums/Test/(001)/IMG_8985.JPG','/pix5/albums/Test/(001)/IMG_8987.JPG'], tags: ['480p', 'maps', 'something.else', 'dev']},
			// {idx: 7, id: ',', category: 'Pictures', url: 'Book.xlsx', title: 'This one is different [720p]', comments: 4, size: '1.5 GB', snatches: 23, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8980.JPG','/pix5/albums/Test/(001)/IMG_8981.JPG','/pix5/albums/Test/(001)/IMG_8985.JPG','/pix5/albums/Test/(001)/IMG_8987.JPG'], tags: ['720p', 'maps', 'something.else', 'dev']},
			// {idx: 8, id: '.', category: 'Pictures', url: 'Book.xlsx', title: 'This one is different [1080p]', comments: 3, size: '7.8 GB', snatches: 45, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8980.JPG','/pix5/albums/Test/(001)/IMG_8981.JPG','/pix5/albums/Test/(001)/IMG_8985.JPG','/pix5/albums/Test/(001)/IMG_8994.JPG'], tags: ['1080p', 'maps', 'something.else', 'dev']},
			// {idx: 8, id: '.', category: 'Pictures', url: 'Book.xlsx', title: 'This one is different in another way [1920x1080]', comments: 3, size: '7.8 GB', snatches: 45, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8980.JPG','/pix5/albums/Test/(001)/IMG_8981.JPG','/pix5/albums/Test/(001)/IMG_8985.JPG','/pix5/albums/Test/(001)/IMG_8987.JPG'], tags: ['1080p', 'maps', 'something.else', 'dev']},
			// {idx: 8, id: '.', category: 'Pictures', url: 'Book.xlsx', title: 'This one is different in another way [1080x720]', comments: 3, size: '7.8 GB', snatches: 45, date: '2015-02-04', thumbs: ['/pix5/albums/Test/(001)/IMG_8980.JPG','/pix5/albums/Test/(001)/IMG_8981.JPG','/pix5/albums/Test/(001)/IMG_8985.JPG','/pix5/albums/Test/(001)/IMG_8987.JPG'], tags: ['1080p', 'maps', 'something.else', 'dev']},
		// ];
		// this.update();
		// gui.hideLoading();
		// state.listening = true;
		// return;
		this.loadPage().then(function(page) {
			this.parsePage(page).then(function(next) {
				if (next) {
					this.listParams.page++;
					this.load();
				} else {
					this.update();
					gui.hideLoading();
					state.listening = true;
				}
			}.bind(this));
		}.bind(this));
	},
	
	loadPage: function() {
		return getHTML('torrents.php?' + this.listParams);
	},
	parsePage: function(page) {
		var _href = page.$('[data-href*="authkey"][data-href*="torrent_pass"]').getAttribute('data-href');
		var auth = _href.replace(/^.*authkey=([^&]+)(&|$).*$/, '$1');
		var pass = _href.replace(/^.*torrent_pass=([^&]+)(&|$).*$/, '$1');
		return new Promise(function(resolve, reject) {
			var done = 0;
			var doneOffset = this._items.length;
			var doneSkip = 0;
			var minDate = new Date().getTime();
			var rows = page.$$('#torrent_table .torrent');
			rows.forEach(function(row) {
				var item = {};
				item.id = row.$('td:nth-child(2) > a').getAttribute('data-href').replace(/^.*(\?|&)id=(\d+)(&|$).*/, '$2');
				item.auth = auth;
				item.pass = pass;
				item.category = row.$('.cats_col img').getAttribute('data-src').replace(/^.+cat_([^\.]+)\.png/, '$1');
				item.urlDetails = row.$('td:nth-child(2) > a').getAttribute('data-href');
				item.url = 'torrents.php?action=download&id='+item.id+'&authkey='+auth+'&torrent_pass='+item.pass;
				item.title = row.$('td:nth-child(2) > a').textContent;
				// item.comments = row.$('td:nth-child(4)').textContent*1;
				item.comments = [];
				item.size = row.$('td:nth-child(6)').textContent;
				item.snatches = row.$('td:nth-child(7)').textContent*1;
				item.date = new Date(Date.parse(row.$('td:nth-child(5) span').title));
				item.uploader = row.$('td.user > a, td.user > span');
				item.uploader.href = item.uploader.getAttribute('data-href');
				item.thumbs = [];
				item.thumbLinks = [];
				item.tags = row.$$('td:nth-child(2) > .tags > a').map(function(it) { return it.textContent; });
				if (item.date < new Date(prefs.latest)) {
					doneSkip++;
					console.info(done, doneSkip, rows.length, item.date, new Date(prefs.latest));
					if (done + doneSkip == rows.length) {
						resolve(item.date > new Date(prefs.latest) && this._items.length < prefs.torrentLimit);
					}
					return;
				}
				this._items.push(item);
				gui.updateLoading((this._items.length) + ' Torrents found');
				getHTML(item.urlDetails).then(function(html) {
					var desc = html.$('#descbox');
					item.comments = html.$$('.forum_post.box.vertical_margin:not(#quickreplypreview)');
					item.description = desc.innerHTML.replace(/ data-(src|href)=/g, ' $1=');
					desc.$$('img').forEach(function(it) {
						var thumb = {};
						thumb.src = it.getAttribute('data-src');
						if (it.parentNode.tagName == 'A') {
							thumb.link = it.parentNode.getAttribute('data-href');
						} else {
							thumb.link = it.getAttribute('data-src');
						}
						item.thumbs.push(JSON.stringify(thumb));
					});
					gui.updateLoadingSub(done+1+doneOffset + ' Torrents loaded');
					minDate = Math.min(minDate, item.date);
					if (++done + doneSkip == rows.length) {
						resolve(item.date > new Date(prefs.latest) && this._items.length < prefs.torrentLimit);
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
	},
};
var actions = {
	activateItem: function(idx) {
		if (idx == state.torrentIndex) return;
		if (state.torrentIndex != undefined)
			$('#item-' + state.torrentIndex).delClass('empn-active');
		var oldIdx = state.torrentIndex;
		state.torrentIndex = idx;
		this.activateImage(0, oldIdx);
		var el = $('#item-' + state.torrentIndex);
		gui._items.scrollTo(el.offsetTop - (gui._items.offsetHeight - gui.height) / 2);
		el.addClass('empn-active');
		if (gui._dlgComm.hasClass('empn-active')) {
			this.showComments();
		}
		if (gui._dlgDesc.hasClass('empn-active')) {
			this.showDescription();
		}
		if (gui._dlgQuality.hasClass('empn-active')) {
			if (data.items[state.torrentIndex].qualities.length > 1) {
				this.download(true);
			} else {
				gui._dlgQuality.hide();
			}
		}
	},
	
	activateImage: function(idx, oldTorrentIndex) {
		if (oldTorrentIndex != undefined || idx != state.imgIndex) {
			var iel = $('#item-' + (oldTorrentIndex!=undefined? oldTorrentIndex : state.torrentIndex) + ' .empn-img-' + state.imgIndex);
			if (iel) iel.delClass('empn-active');
		}
		state.imgIndex = idx;
		var el = $('#item-' + state.torrentIndex + ' .empn-img-' + state.imgIndex);
		if (el) el.addClass('empn-active');
		if (gui._dlgImg.hasClass('empn-active')) {
			this.showImage();
		}
	},
	
	showHideImage: function() {
		if (gui._dlgImg.hasClass('empn-active')) {
			this.hideImage();
		} else {
			this.showImage();
		}
	},
	showImage: function() {
		gui._dlgComm.hide();
		gui._dlgDesc.hide();
		gui._dlgQuality.hide();
		$('#item-' + state.torrentIndex + ' .empn-img-' + state.imgIndex).click();
	},
	hideImage: function() {
		gui.fullsized = true;
		gui.toggleImgSize();
		gui._dlgImg.hide();
	},
	
	toggleZoom: function() {
		gui.toggleImgSize();
	},
	
	openImage: function() {
		window.open(data.items[state.torrentIndex].thumbs[state.imgIndex].link);
	},
	
	nextItem: function() {
		if (data.items.length <= state.torrentIndex+1) return;
		this.activateItem(state.torrentIndex+1);
	},
	prevItem: function() {
		if (state.torrentIndex-1 < 0) return;
		this.activateItem(state.torrentIndex-1);
	},
	
	nextImage: function() {
		if (data.items[state.torrentIndex].thumbs.length <= state.imgIndex+1) return;
		this.activateImage(state.imgIndex+1);
	},
	prevImage: function() {
		if (state.imgIndex-1 < 0) return;
		this.activateImage(state.imgIndex-1);
	},
	
	toggleComments: function() {
		if (gui._dlgComm.hasClass('empn-active')) {
			this.hideComments();
		} else {
			this.showComments();
		}
	},
	showComments: function() {
		this.hideImage();
		this.hideDescription();
		gui._dlgQuality.hide();
		gui._dlgComm.$('.empn-title').textContent = data.items[state.torrentIndex].title;
		// gui._dlgComm.$('.empn-comments').innerHTML = data.items[state.torrentIndex].comments;
		gui._dlgComm.$('.empn-comments').removeChildren();
		data.items[state.torrentIndex].comments.forEach(function(it) {
			gui._dlgComm.$('.empn-comments').appendChild(it);
		});
		gui._dlgComm.$('.empn-comments').innerHTML = gui._dlgComm.$('.empn-comments').innerHTML.replace(/ data-(src|href)=/g, ' $1=');
		gui._dlgComm.show($('#item-'+state.torrentIndex));
	},
	hideComments: function() {
		gui._dlgComm.hide();
	},
	
	toggleDescription: function() {
		if (gui._dlgDesc.hasClass('empn-active')) {
			this.hideDescription();
		} else {
			this.showDescription();
		}
	},
	showDescription: function() {
		this.hideImage();
		this.hideComments();
		gui._dlgQuality.hide();
		gui._dlgDesc.$('.empn-title').textContent = data.items[state.torrentIndex].title;
		gui._dlgDesc.$('.empn-description').innerHTML = data.items[state.torrentIndex].description;
		gui._dlgDesc.show($('#item-'+state.torrentIndex));
	},
	hideDescription: function() {
		gui._dlgDesc.hide();
	},
	
	download: function(forced) {
		var itm = data.items[state.torrentIndex];
		if (prefs.combine && !prefs.combineHighest && itm.qualities.length > 1) {
			if (gui._dlgQuality.hasClass('empn-active') && !forced) {
				gui._dlgQuality.hide();
				return;
			}
			gui._dlgImg.hide();
			gui._dlgComm.hide();
			gui._dlgDesc.hide();
			gui._dlgQuality.$('.empn-actions').removeChildren();
			itm.qualities.forEach(function(it, i) {
				var btn = document.createElement('button');
				btn.innerHTML = it.quality + ' <small>(' + it.size + '</small>)';
				gui._dlgQuality.$('.empn-actions').appendChild(btn);
				md.ripple.init(btn);
				btn._('click', function() {
					this.doDownload(it);
					gui._dlgQuality.hide();
				}.bind(this));
			}.bind(this));
			gui._dlgQuality.show($('#item-' + state.torrentIndex));
		} else if (prefs.combine && prefs.combineHighest && itm.qualities.length > 0) {
			this.doDownload(itm.qualities[0]);
		} else {
			this.doDownload(itm);
		}
	},
	doDownload: function(itm) {
		if (prefs.autoThanks) {
			this.sendThanks(itm);
		}
		if (prefs.autoComments) {
			if (prefs.autoCommentsPrompt) {
				this.promptComment(itm);
			} else {
				this.sendRandomComment(itm);
			}
		}
		if (prefs.autoTags) {
			itm.tags.forEach(function(it) {
				prefs.raiseTag(it);
				gui.prefs.initValues();
			});
		}
		var ifr = document.createElement('iframe');
		//TODO: iframe is not removed. onload event does not trigger with attachments.
		ifr.addEventListener('load', function() { console.info('load!'); ifr.remove(); delete ifr; });
		ifr.src = itm.url;
		ifr.style.display = 'none';
		document.body.appendChild(ifr);
	},
	
	sendThanks: function(itm) {
		itm = itm || data.items[state.torrentIndex];
		post('torrents.php?action=thank', {groupid: itm.id, action: 'thank', auth: itm.auth}).then(function() {
			gui._toast.add('Thanks for the Thanks!', itm.title);
		});
	},
	sendRandomComment: function(itm) {
		itm = itm || data.items[state.torrentIndex];
		if (prefs.hasComments()) {
			this.sendComment(itm, prefs.getRandomComment());
		} else {
			this.prompComment(itm);
		}
	},
	sendComment: function(itm, comment) {
		post('torrents.php?id=' + itm.id, {action: 'reply', auth: itm.auth, groupid: itm.id, body: comment}).then(function() {
			gui._toast.add('Thanks for the Comment!', itm.title);
		});
	},
	promptComment: function(itm) {
		itm = itm || data.items[state.torrentIndex];
		state.listening = false;
		gui._comment.value = '';
		gui._dlgComment.item = itm;
		gui._dlgComment.show();
		gui._comment.focus();
	},
	
	openDetails: function() {
		var itm = data.items[state.torrentIndex];
		if (prefs.combine && !prefs.combineHighest && itm.qualities.length > 1) {
			alert('Quality selection is not implemented!');
		} else if (prefs.combine && prefs.combineHighest && itm.qualities.length > 0) {
			window.open(itm.qualities[0].urlDetails);
		} else {
			window.open(itm.urlDetails);
		}
	},
	
	blockImage: function() {
		prefs.blockImage(data.items[state.torrentIndex].thumbs[state.imgIndex].src);
		gui.repaint(true);
	},
	
	catchUp: function(curr) {
		var itm;
		if (curr === true) itm = data.items[state.torrentIndex];
		else itm = data._items[0];
		prefs.setLatest(itm.date.toJSON());
		gui._toast.add('Catching Up!', '');
	}
}
var state = {
	torrentIndex: 0,
	imgIndex: 0,
	listening: false
};
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






/****************************************\
| $EMPN
\****************************************/
function init() {
	if (location.href.search(/empn.php$/) == -1) {
		var orig = $('#nav_torrents');
		var node = orig.cloneNode(true);
		node.id = 'nav_empn';
		var a = node.$('a');
		a.href = 'empn.php';
		a.textContent = 'EMPN';
		orig.parentNode.insertBefore(node, orig);
	} else {
		prefs.load();
		gui.init();
		keyboard.init();
		data.load();
	}
}
init();