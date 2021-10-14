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
		if (prefs.useSearchString && prefs.searchString) {
			this.listParams.action = 'advanced';
			this.listParams.searchtext = encodeURIComponent('"'+prefs.searchString.replace(/\r?\n/g, '"|"')+'"');
		}
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
				// item.url = 'torrents.php?action=download&id='+item.id+'&authkey='+auth+'&torrent_pass='+item.pass;
				item.url = row.$('a[data-href*="/torrents.php?action=download"]').getAttribute('data-href');
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
					var desc = html.$(`#content${item.id}`);
					// var dlId = (html.$('.torrent_buttons > [title="Download"]') || html.$('.torrent_buttons > a')).href.replace(/^.+id=(\d+).*$/, '$1');
					// item.url = 'torrents.php?action=download&id='+dlId+'&authkey='+auth+'&torrent_pass='+item.pass;
					// item.url = (html.$('.torrent_buttons > [title="Download"]') || html.$('.torrent_buttons > a')).href;
					item.comments = html.$$('.forum_post.box.vertical_margin:not(#quickreplypreview)');
					item.description = desc.innerHTML.replace(/ data-(src|href)=/g, ' $1=');
					desc.$$('img').forEach(function(it) {
						var thumb = {};
						let src = it.getAttribute('data-src').replace(/\.th\.jpg$/, '.jpg');
						thumb.src = src;
						if (it.parentNode.tagName == 'A') {
							thumb.link = it.parentNode.getAttribute('data-href');
						} else {
							thumb.link = src;
						}
						item.thumbs.push(JSON.stringify(thumb));
					});
					gui.updateLoadingSub(done+1+doneOffset + ' Torrents loaded');
					minDate = Math.min(minDate, item.date);
					if (++done + doneSkip == rows.length) {
						resolve(item.date > new Date(prefs.latest) && this._items.length < prefs.torrentLimit);
					}
					item.nfo = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\n<movie>\n\t<title>'+item.title+'</title>\n\t<plot>'+(desc.textContent.trim())+'</plot>';
					if (item.tags.length > 0) {
						item.nfo += '\n\t<tag>'+item.tags.join('</tag>\n\t<tag>')+'</tag>';
					}
					item.nfo += '\n</movie>';
				}.bind(this),
				function(err) {
					console.info(err);
					gui.updateLoadingSub(done+1+doneOffset + ' Torrents loaded');
					minDate = Math.min(minDate, item.date);
					if (++done + doneSkip == rows.length) {
						resolve(item.date > new Date(prefs.latest) && this._items.length < prefs.torrentLimit);
					}
				});
			}.bind(this));
		}.bind(this));
	},
};