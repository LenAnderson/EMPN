// ==UserScript==
// @name         EMPNews
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        http://*.empornium.me/*
// @match        http://localhost/empnews/empn.php
// @grant        none
// ==/UserScript==

${include: helpers.js}
${include: md.js}
${include: prefs.js}
${include: gui.js}
${include: data.js}
${include: actions.js}
${include: state.js}
${include: keyboard.js}






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