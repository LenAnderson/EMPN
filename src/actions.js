var actions = {
	activateItem: function(idx) {
		if (idx == state.torrentIndex) return;
		if (state.torrentIndex != undefined)
			$('#item-' + state.torrentIndex).delClass('empn-active');
		var oldIdx = state.torrentIndex;
		state.torrentIndex = idx;
		this.activateImage(0, oldIdx);
		var el = $('#item-' + state.torrentIndex);
		gui._items.scrollToV(el.offsetTop - (gui._items.offsetHeight - gui.height) / 2);
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
		var thumbsEl = $('#item-' + state.torrentIndex + ' .empn-thumbs');
		if (el) thumbsEl.scrollToH(el.offsetLeft + el.offsetWidth - thumbsEl.offsetWidth);
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
		if (prefs.nfo) {
			var nfo = new Blob([itm.nfo], {
				type: 'text/xml;charset=utf-8'
			});
			var nfoUrl = window.URL.createObjectURL(nfo);
			var nfoLink = document.createElement('a');
			nfoLink.href = nfoUrl;
			nfoLink.download = itm.title + '.nfo';
			nfoLink.click();
			window.URL.revokeObjectURL(nfoUrl);
		}
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