




/****************************************\
| $HELPERS
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