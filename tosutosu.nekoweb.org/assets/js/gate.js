(function () {
	const gate = document.getElementById("preEnterGate");
	const btn = document.getElementById("preEnterGateBtn");
	const status = document.getElementById("preEnterGateStatus");
	if (!gate || !btn || !status) return;

	function setReady(msg) {
		gate.classList.add("isReady");
		status.textContent =
			msg || "All assets have been loaded, you may enter the site!";
		btn.disabled = false;
	}

	// After the page is loaded in, unlock the gate
	window.addEventListener(
		"load",
		function () {
			setReady("All assets have been loaded, you may enter the site!");
		},
		{ once: true },
	);

	// Fallback: if the load event doesn't fire after 6 seconds, unlock the gate anyway
	window.setTimeout(function () {
		if (btn.disabled)
			setReady("All assets have been loaded, you may enter the site!");
	}, 6000);

	btn.addEventListener("click", function () {
		gate.classList.add("isLeaving");
		window.setTimeout(function () {
			gate.remove();
		}, 220);
	});
})();
