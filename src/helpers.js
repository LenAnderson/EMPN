




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