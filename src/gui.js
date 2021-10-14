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
	
	prefs: ${include: gui-prefs.js},
	
	init: function() {
		this.tplItem = document.createElement('div');
		this.tplItem.addClass('empn-item');
		this.tplItem.innerHTML = '${include-min-esc: html/item.html}';
		
		document.body.innerHTML = '';
		document.title = 'EMPN :: Empornium';
		var container = document.createElement('div');
		container.innerHTML = '${include-min-esc: html/empn.html}';
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
		itm.setAttribute('data-dl', item.url);
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