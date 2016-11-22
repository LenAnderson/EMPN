// ==UserScript==
// @name         EMPN
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/EMPN/raw/master/empn.user.js
// @version      0.6
// @author       LenAnderson
// @match        http://*.empornium.me/*
// @match        https://*.empornium.me/*
// @match        http://*.empornium.sx/*
// @match        https://*.empornium.sx/*
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