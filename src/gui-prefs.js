	{
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
		_useSearchString: undefined,
		_searchString: undefined,
		_dlgSearchString: undefined,
		
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
			this._useSearchString = $('#prefs-use-search-string');
			this._searchString = $('#dlg-prefs-search-string-input');
			this._dlgSearchString = $('#dlg-prefs-search-string');
			
			this.initValues();
			
			$('#prefs-comments')._('click', this._dlgComments.show);
			$('#prefs-tags')._('click', this._dlgTags.show);
			$('#prefs-thumb-height')._('click', stopProp);
			$('#prefs-tag-limit')._('click', stopProp);
			$('#prefs-timezone-offset')._('click', stopProp);
			$('#prefs-torrent-limit')._('click', stopProp);
			$('#prefs-latest-torrent')._('click', stopProp);
			$('#prefs-search-string')._('click', this._dlgSearchString.show);
			
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
			
			this._useSearchString._('change', function() {
				prefs.setUseSearchString(this.checked);
			});
			
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
			
			// dlg: search string
			$('#dlg-prefs-search-string-ok')._('click', function() {
				this._dlgSearchString.hide();
				prefs.setSearchString(this._searchString.value.trim());
			}.bind(this));
			$('#dlg-prefs-search-string-cancel')._('click', function() {
				this._dlgSearchString.hide();
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
			this._latestTorrent.value = (prefs.latest || {empnFormat: function() {}}).empnFormat();
			md.input.blur(this._latestTorrent.parentNode);
			this._useSearchString.checked = prefs.useSearchString;
			this._searchString.value = prefs.searchString;
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
	}