(function(){
    const $ = (id) => document.getElementById(id);

	// =========================
	// Theme (selected in Settings) + SITE BACKGROUND
	// =========================
	const THEME_KEY = "tosuOS_theme";
	const THEMES = [
	  { key: "dsi", label: "DSi" },
	  { key: "dark",    label: "Night" },
	  { key: "pixel",   label: "Sky Blue" },
	  { key: "miku",    label: "Miku" },
	  { key: "milk",    label: "Milk" },
	  { key: "dusk",    label: "Dusk" },
	  { key: "paper",   label: "Paper" },
	];

	const html = document.documentElement;

	function getThemeLabel(key){
	  return (THEMES.find(t => t.key === key) || THEMES[0]).label;
	}

	/* =========================
	   THEME -> SITE BG mapping
	   ========================= */
	const BG_STYLE_BY_THEME = {
	  pixel: {
	    img: "url('/assets/img/themes/pixel-background.gif')",
	    repeat: "repeat",
	    color: "transparent",
	    opacity: 0.35,
	  },
	  paper: {
	    img: "url('/assets/img/themes/eink-background.png')",
	    repeat: "no-repeat",
	    color: "#f2f1ef",
	    position: "right bottom",
	    opacity: 1,
	  },
	  miku: {
	    img: "url('/assets/img/themes/miku-background.png')",
	    repeat: "no-repeat",
	    position: "right bottom",
	    size: "auto", 
        color: "#171519",
	    opacity: 1,
	  },
	  dark: {
	    img: "url('/assets/img/themes/stars-background.gif')",
	    repeat: "repeat",
	    color: "transparent",
	    opacity: 0.35,
	  },
	  milk: {
	    // NOTE: MP4 cannot be used as CSS background-image; handled via <video id="siteBgVideo">.
	    video: "/assets/img/themes/milk-background.mp4",
	    // Keep the surrounding UI in dark mode (same base palette as dark/miku).
	    color: "#171519",
	    opacity: 1,
	    // Optional overlay image/pattern (set to "none" for clean video)
	    img: "none",
	  },
	  dusk: {
	    img: "url('/assets/img/themes/dusk-background.png')",
	    repeat: "repeat-x",
	    color: "#a2acca",
	    opacity: 1,
	  },
	  _default: {
	    img: "url('/assets/img/themes/dsi-background.png')",
	    repeat: "repeat",
	    color: "transparent",
	    opacity: 0.90,
	  },
	};

	function applySiteBackground(themeKey){
		const bgWrap = document.getElementById("siteBg");
		if (!bgWrap) return;
		const bgImg = document.getElementById("siteBgImg") || bgWrap;
		const bgVid = document.getElementById("siteBgVideo");

		const cfg = BG_STYLE_BY_THEME[themeKey] || BG_STYLE_BY_THEME._default;

		// Wrapper controls opacity + background color for both layers.
		bgWrap.style.backgroundColor = cfg.color || "transparent";
		bgWrap.style.opacity = String(cfg.opacity ?? 0.35);

		// VIDEO THEMES
		if (cfg.video && bgVid){
			// show video layer
			bgVid.style.display = "block";
			// set src only when it changes (avoid resetting playback)
			if (bgVid.dataset.src !== cfg.video){
				bgVid.dataset.src = cfg.video;
				bgVid.src = cfg.video;
				try { bgVid.load(); } catch(_e) {}
			}
			// best effort autoplay
			try { bgVid.play && bgVid.play().catch(()=>{}); } catch(_e) {}
		} else if (bgVid){
			// hide video layer
			try { bgVid.pause && bgVid.pause(); } catch(_e) {}
			bgVid.style.display = "none";
			bgVid.removeAttribute("src");
			delete bgVid.dataset.src;
			try { bgVid.load && bgVid.load(); } catch(_e) {}
		}

		// IMAGE / PATTERN LAYER (works for all themes, including optional video overlay)
		bgImg.style.backgroundImage = cfg.img || BG_STYLE_BY_THEME._default.img;
		bgImg.style.backgroundRepeat = cfg.repeat || "repeat";
		bgImg.style.backgroundPosition = cfg.position || "0 0";
		bgImg.style.backgroundSize = cfg.size || "auto";
	}

	/* =========================
	   APPLY THEME
	   ========================= */
	function isDarkThemeKey(k){
	  return k === "dark" || k === "miku" || k === "milk";
	}

	function applyTheme(key){
	  const t = THEMES.some(x => x.key === key) ? key : "dsi";
	  html.setAttribute("data-theme", t);
	  localStorage.setItem(THEME_KEY, t);

	  // UI labels
	  const tn = document.getElementById("themeName");
	  if (tn) tn.textContent = getThemeLabel(t);

	  const trv = document.getElementById("themeRowValue");
	  if (trv) trv.textContent = getThemeLabel(t);

	  const modeBtn = document.getElementById("modeToggle");
	  if (modeBtn) modeBtn.textContent = isDarkThemeKey(t) ? "LIGHT" : "DARK";

	  // Tiling background for the whole page
	  applySiteBackground(t);
	}

	/* =========================
	   INIT THEME (load saved or system)
	   ========================= */
	const savedTheme = localStorage.getItem(THEME_KEY);
	if (savedTheme) {
	  applyTheme(savedTheme);
	} else {
	  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
	  applyTheme(prefersDark ? "dark" : "dsi");
	}

    // =========================
    // Phone wallpapers
    // =========================
    const WALL_KEY = "tosuOS_wallpaper";
    const WALLPAPERS = {
      "1": "url('/assets/img/phone/wallpaper1.jpg')",
      "2": "url('/assets/img/phone/wallpaper2.jpg')",
      "3": "url('/assets/img/phone/wallpaper3.jpg')",
      "4": "url('/assets/img/phone/wallpaper4.jpg')",
      "5": "url('/assets/img/phone/wallpaper5.jpg')",
      "6": "url('/assets/img/phone/wallpaper6.jpg')",
    };

    function labelWallpaper(key){ return `Wallpaper ${key}`; }

    function applyWallpaper(key){
      const k = (key in WALLPAPERS) ? key : "1";
      html.style.setProperty("--phoneWall", WALLPAPERS[k]);
      localStorage.setItem(WALL_KEY, k);
      const wrv = $("wallRowValue");
      if (wrv) wrv.textContent = labelWallpaper(k);
    }

    applyWallpaper(localStorage.getItem(WALL_KEY) || "1");

	// =========================
	// WebNeko toggle
	// =========================

	const NEKO_KEY = "tosuOS_webneko";
	let webNekoEnabled = localStorage.getItem(NEKO_KEY) === "1";

	window.NekoType = "white";

	const nekoHost = document.getElementById("nl");

	function ensureWebNekoLoaded(){
	  // load exactly once
	  if (document.getElementById("webnekoScript")) return;

	  const s = document.createElement("script");
	  s.id = "webnekoScript";
	  s.src = "https://webneko.net/n20171213.js";
	  s.async = true;

	  (nekoHost || document.body).appendChild(s);
	}

	function applyNekoVisibility(){
	  if (!nekoHost) return;

	  nekoHost.style.display = webNekoEnabled ? "" : "none";
	}

	function setWebNekoEnabled(on){
	  webNekoEnabled = !!on;
	  localStorage.setItem(NEKO_KEY, webNekoEnabled ? "1" : "0");

	  if (webNekoEnabled) ensureWebNekoLoaded();
	  applyNekoVisibility();
	}

	// init (run once at boot)
	if (webNekoEnabled) ensureWebNekoLoaded();
	applyNekoVisibility();

    // =========================
    // Status Bar Clock
    // =========================

    const timeEl = document.getElementById("sbTime");
    function tick(){
      const d = new Date();
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      if (timeEl) timeEl.textContent = `${hh}:${mm}`;
    }
    tick();
    setInterval(tick, 1000 * 15);

	// =========================
	// Status Bar Clock Battery API + Charging + Percentage
	// =========================
	async function initBatteryStatusBar(){
	  const pctEl  = document.getElementById("sbBatteryPct");
	  const fillEl = document.getElementById("sbBatteryFill");
	  if (!pctEl || !fillEl) return;

	  const applyPct = (pct) => {
	    const p = Math.max(0, Math.min(100, Math.round(pct)));
	    pctEl.textContent = `${p}%`;
	    fillEl.style.width = `${p}%`;
	  };

	  // fallback
	  const setFallback = () => applyPct(67);

	  try{
	    if (!("getBattery" in navigator)){
	      setFallback();
	      return;
	    }
	    const bat = await navigator.getBattery();

	    const apply = () => applyPct((bat.level ?? 1) * 100);

	    apply();
	    bat.addEventListener("levelchange", apply);
	    bat.addEventListener("chargingchange", apply);
	  }catch(_){
	    setFallback();
	  }
	}

	initBatteryStatusBar();

    // =========================
    // tosuOS HOME + APP SHELLS
    // =========================
    const screen = $("screen");

    const SETTINGS_TEMPLATE = `
      <div class="settingsRoot">
        <div class="settingsHeader">
          <div class="settingsSearch">
            <span class="sIcon">🔎</span>
            <input class="settingsSearchInput" type="text" value="" placeholder="Search" disabled />
            <span class="sIcon">🎙️</span>
          </div>
        </div>

        <div class="settingsGroup">
          <div class="settingsRow">
            <div class="sRowLeft">
              <div class="sRowIcon iOrange">✈️</div>
              <div class="sRowTitle">Airplane Mode</div>
            </div>
            <button class="sSwitch" id="airplaneToggle" type="button" aria-label="Airplane Mode"><span class="sKnob"></span></button>
          </div>

          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft">
              <div class="sRowIcon iBlue">📶</div>
              <div class="sRowTitle">Wi-Fi</div>
            </div>
            <div class="sRowRight"><span class="sRowValue">HomeNet</span><span class="sChevron">›</span></div>
          </div>

          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft">
              <div class="sRowIcon iBlue">🅱️</div>
              <div class="sRowTitle">Bluetooth</div>
            </div>
            <div class="sRowRight"><span class="sRowValue">On</span><span class="sChevron">›</span></div>
          </div>

          <div class="settingsRow settingsRowNav" style="opacity:.55;">
            <div class="sRowLeft">
              <div class="sRowIcon iGreen2">🔗</div>
              <div class="sRowTitle">Personal Hotspot</div>
            </div>
            <div class="sRowRight"><span class="sRowValue">Off</span><span class="sChevron">›</span></div>
          </div>

          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft">
              <div class="sRowIcon iGreen">🔋</div>
              <div class="sRowTitle">Battery</div>
            </div>
            <div class="sRowRight"><span class="sChevron">›</span></div>
          </div>
        </div>

        <div class="settingsGroup">
          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft"><div class="sRowIcon iGrey">⚙️</div><div class="sRowTitle">General</div></div>
            <div class="sRowRight"><span class="sChevron">›</span></div>
          </div>
        </div>

        <div class="settingsGroup">
          <div class="settingsRow settingsRowNav" id="themeRow">
            <div class="sRowLeft"><div class="sRowIcon iPurple">🎨</div><div class="sRowTitle">Theme</div></div>
            <div class="sRowRight"><span class="sRowValue" id="themeRowValue">DSi</span><span class="sChevron">›</span></div>
          </div>

		<div class="settingsRow">
		  <div class="sRowLeft">
		    <div class="sRowIcon iTeal">🐾</div>
		    <div class="sRowTitle">WebNeko</div>
		  </div>
		  <button class="sSwitch" id="nekoToggle" type="button" aria-label="WebNeko">
		    <span class="sKnob"></span>
		  </button>
		</div>

          <div class="settingsRow settingsRowNav" id="wallRow">
            <div class="sRowLeft"><div class="sRowIcon iBlue2">🖼️</div><div class="sRowTitle">Wallpaper</div></div>
            <div class="sRowRight"><span class="sRowValue" id="wallRowValue">Wallpaper 1</span><span class="sChevron">›</span></div>
          </div>

          <div class="settingsRow">
            <div class="sRowLeft"><div class="sRowIcon iPink">▶️</div><div class="sRowTitle">Player Always Visible</div></div>
            <button class="sSwitch" id="autopinToggle" type="button" aria-label="Player autopin"><span class="sKnob"></span></button>
          </div>
        </div>

        <div class="settingsGroup">
          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft"><div class="sRowIcon iGrey">👤</div><div class="sRowTitle">Username</div></div>
            <div class="sRowRight"><span class="sRowValue">tosutosu</span><span class="sChevron">›</span></div>
          </div>
          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft"><div class="sRowIcon iGrey">📝</div><div class="sRowTitle">Bio</div></div>
            <div class="sRowRight"><span class="sRowValue">i dunno man T_T</span><span class="sChevron">›</span></div>
          </div>
          <div class="settingsRow settingsRowNav">
            <div class="sRowLeft"><div class="sRowIcon iGrey">✉️</div><div class="sRowTitle">Email</div></div>
            <div class="sRowRight"><span class="sRowValue">tosuxtosu@gmail.com</span><span class="sChevron">›</span></div>
          </div>
        </div>
      </div>
    `;

    // =========================
    // PHONE APPS
    // =========================

	const APP_LIST = [
	  { id: "notes",      name: "Notes",      icon: "/assets/img/phone/Notes.png",        group: "home" },
	  { id: "blog",       name: "Journal",    icon: "/assets/img/phone/Mail.png",         group: "home" },
	  { id: "gallery",    name: "Photos",     icon: "/assets/img/phone/Photos.png",      group: "home" },
	  { id: "camera",     name: "Camera",     icon: "/assets/img/phone/Camera.png",       group: "home" },
	
	  { id: "profile",    name: "Profile",    icon: "/assets/img/phone/Contacts.png",     group: "home" },
	  { id: "shrine",     name: "Shrine",     icon: "/assets/img/phone/News.png",         group: "home" },
	  { id: "interests",  name: "Interests",  icon: "/assets/img/phone/Stocks.png",       group: "home" },
	  { id: "guestbook",  name: "Guestbook",  icon: "/assets/img/phone/Books.png",        group: "home" },
	
	  { id: "music",      name: "Music",      icon: "/assets/img/phone/Apple-Music.png",  group: "home" },
	  { id: "reviews",    name: "Reviews",    icon: "/assets/img/phone/Apple-TV.png",     group: "home" },
	  { id: "poetry",     name: "Poetry",     icon: "/assets/img/phone/Notes.png",        group: "home" },
	  { id: "consoles",   name: "Consoles",   icon: "/assets/img/phone/Consoles.png",     group: "home" },
	
	  { id: "toys",       name: "Toys",       icon: "/assets/img/phone/Toys.png",         group: "home" },
	  // Re-purposed as a proper "Downloads" hub (UI-only label; internal id stays "links" so no routing changes are needed)
	  { id: "links",      name: "Downloads",  icon: "/assets/img/phone/AirDrop.JPG",    group: "home" },
	  { id: "youtube",    name: "YouTube",    icon: "/assets/img/phone/YouTube.png",      group: "home" },
	  { id: "minecraft",  name: "Minecraft",  icon: "/assets/img/phone/MinecraftPE.PNG",      group: "home" },
	
	  { id: "instagram",  name: "Instagram",  icon: "/assets/img/phone/Instagram.png",    group: "home" },
	  { id: "spotify",    name: "Spotify",    icon: "/assets/img/phone/Spotify.png",      group: "home" },
	  { id: "discord",    name: "Discord",    icon: "/assets/img/phone/Discord.png",      group: "home" },
	
	  // DOCK
	  { id: "phone",      name: "Phone",      icon: "/assets/img/phone/Phone.png",        group: "dock" },
	  { id: "messages",   name: "Messages",   icon: "/assets/img/phone/Messages.png",     group: "dock" },
	  { id: "safari",     name: "Safari",     icon: "/assets/img/phone/Safari.png",       group: "dock" },
	  { id: "settings",   name: "Settings",   icon: "/assets/img/phone/Settings.png",     group: "dock" },
	];


    // =========================
    // APPS SCREENS
    // =========================

    const APP_SCREENS = {
      guestbook: () => `
          <iframe
            src="https://tosutosu.atabook.org/"
            style="flex: 1; width: 100%; height: 100%; border: none;"
            title="Guestbook"
          ></iframe>
      `,
      /* NOTES jest teraz obsługiwany bezpośrednio w renderApp (poniżej),
         ale zostawiamy pusty wpis lub prosty fallback w razie czego */
      notes: () => ``,
      blog: () => `
        <div style="width: 100%; min-height: 100%; background: var(--setBg); padding: 0 16px 24px;">

            <!-- Search Bar (visual only) -->
            <div style="margin: 10px 0 10px; position: relative;">
                <div style="background: rgba(118, 118, 128, 0.12); border-radius: 10px; height: 36px; display: flex; align-items: center; padding: 0 8px; color: var(--setSub);">
                    <i class="fas fa-search" style="font-size: 14px; margin: 0 6px;"></i>
                    <span style="font-size: 16px;">Search</span>
                </div>
            </div>

            <div id="scJournalMeta" style="font-size: 12px; color: var(--setSub); margin: 0 2px 10px;">Loading status.cafe…</div>

            <div id="scJournalLoading" style="font-size: 13px; color: var(--setSub); padding: 10px 2px;">Loading statuses…</div>
            <div id="scJournalError" style="display:none; font-size: 13px; color: #b00020; padding: 10px 2px;"></div>

            <!-- Entries List (dynamic) -->
            <div id="scJournalList" style="display: flex; flex-direction: column; gap: 10px;"></div>

            <div style="height: 40px;"></div>
        </div>

        <!-- Full Screen Journal Viewer -->
        <div id="journalViewer" class="journalViewer">
            <div class="appTopbar journalViewerTopbar">
                <div class="navLeft">
                    <button class="backBtn" id="journalBack" type="button">Back</button>
                </div>

                <div class="appTitle">Journal</div>

                <div class="navRight"></div>
            </div>

            <div class="appBody journalViewerBody">
                <div class="jvWrap">
                    <div id="jvDate" class="jvDate"></div>
                    <h1 id="jvTitle" class="jvTitle"></h1>
                    <div id="jvBody" class="jvBody"></div>
                    <div class="jvSpacer" aria-hidden="true"></div>
                </div>
            </div>
        </div>

        </div>
      `,
      links: () => `
        <div class="dlRoot">
          <header class="dlHero">
            <div class="dlHeroKicker">Downloads</div>
            <h2 class="dlHeroTitle">Stuff you can grab</h2>
            <p class="dlHeroSub">A small shelf for projects, resource packs and other files I share publicly.</p>
          </header>

          <section class="dlList" id="downloadsList" aria-label="Download items">
            <div class="dlHint">Loading downloads...</div>
          </section>

          <div class="dlHint" id="downloadsHint">More coming soon!</div>

        </div>
      `,
      gallery: () => `
        <div id="galleryGrid" style="padding: 16px 0; min-height: 100%; background: var(--setBg);">
            <div style="padding: 0 20px 10px;">
              <h2 style="font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 0; color: var(--setText);">Library</h2>
              <p style="font-size: 14px; color: var(--setSub); margin: 2px 0 0;">All Photos</p>
            </div>

            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap: 2px;">
                ${[1,2,3,4,5,6].map(i => `
                    <div class="galItem" style="aspect-ratio:1/1; overflow:hidden; position:relative; cursor:pointer;">
                        <img src="assets/img/phone/wallpaper${i}.jpg" class="galImg" style="width:100%; height:100%; object-fit:cover; display:block;" loading="lazy">
                    </div>
                `).join('')}
                <div class="galItem" style="aspect-ratio:1/1; overflow:hidden; position:relative; cursor:pointer;"><img src="/assets/img/gallery/gallery1.png" class="galImg" style="width:100%; height:100%; object-fit:cover; display:block;"></div>
                <div class="galItem" style="aspect-ratio:1/1; overflow:hidden; position:relative; cursor:pointer;"><img src="/assets/img/gallery/gallery2.png" class="galImg" style="width:100%; height:100%; object-fit:cover; display:block;"></div>
                <div class="galItem" style="aspect-ratio:1/1; overflow:hidden; position:relative; cursor:pointer;"><img src="/assets/img/gallery/gallery3.png" class="galImg" style="width:100%; height:100%; object-fit:cover; display:block;"></div>
                <div class="galItem" style="aspect-ratio:1/1; overflow:hidden; position:relative; cursor:pointer;"><img src="/assets/img/gallery/gallery4.png" class="galImg" style="width:100%; height:100%; object-fit:cover; display:block;"></div>
                <div class="galItem" style="aspect-ratio:1/1; overflow:hidden; position:relative; cursor:pointer;"><img src="/assets/img/gallery/gallery5.png" class="galImg" style="width:100%; height:100%; object-fit:cover; display:block;"></div>
            </div>

            <div style="height: 60px;"></div>
        </div>

        <!-- Fullscreen Viewer -->
        <div id="galleryViewer" style="
            display: none;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #000;
            z-index: 300; /* Powyżej navbaru */
            flex-direction: column;
            justify-content: center;
            align-items: center;
        ">
            <img id="galleryViewerImg" src="" style="max-width:100%; max-height:100%; object-fit:contain;">

            <!-- Top Controls -->
            <div style="position:absolute; top: 0; left:0; right:0; padding: calc(var(--sbH) + 10px) 20px 20px; display:flex; justify-content:space-between; background:linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);">
                <button id="galleryBack" style="background:transparent; border:none; color:#fff; font-size:18px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:5px; font-family:var(--fontUI);">
                   <i class="fas fa-chevron-left" style="font-size:22px;"></i>
                </button>
            </div>

            <!-- Bottom Controls -->
            <div style="position:absolute; bottom: 0; width:100%; padding: 20px 0 40px; display:flex; justify-content:space-around; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); font-size: 22px; color: #fff;">
               <i class="fas fa-share-square" style="cursor:pointer; opacity:0.8;"></i>
               <i class="far fa-heart" style="cursor:pointer; opacity:0.8;"></i>
               <i class="far fa-trash-alt" style="cursor:pointer; opacity:0.8;"></i>
            </div>
        </div>
      `,
      shrine: () => `
        <div style="height: 100%; position: relative; background: #000; background-image: url('img/themes/stars-background.gif'); color: #0f0; font-family: 'Courier New', Courier, monospace; overflow: hidden; display: flex; flex-direction: column;">

            <!-- Main List Area -->
            <div style="flex: 1; overflow-y: auto; padding: 12px; padding-bottom: 40px;">

                <!-- Retro Header -->
                <div style="text-align: center; border: 2px solid #0f0; padding: 8px; margin-bottom: 20px; background: #001100; box-shadow: 4px 4px 0px #004400;">
                    <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; color: #0f0; text-shadow: 2px 2px #000;">★ SHRINE.EXE ★</h1>
                    <div style="height: 1px; background: #0f0; margin: 6px 0;"></div>
                    <marquee scrollamount="4" style="font-size: 11px; color: #fff;">Welcome to my digital collection • Best viewed in Netscape Navigator • Under Construction •</marquee>
                </div>

                <!-- Shrines Grid -->
                <div id="shrineGrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="grid-column: 1 / -1; text-align: center; color: #666; font-size: 11px;">Loading shrines…</div>
                </div>
                <div id="shrineEmpty" style="display: none; text-align: center; color: #666; font-size: 11px; padding: 6px 0;">No shrines found.</div>

                <div style="text-align: center; margin-top: 20px;">
                    <small style="color: #666;">(C) COPYRIGHT 1999-2026</small>
                </div>
            </div>

            <!-- Viewer Overlay (Inside APP body, so Navbar stays visible) -->
            <div id="shrineViewer" style="
                display: none;
                position: absolute;
                inset: 0;
                background: #000;
                background-image: url('img/themes/stars-background.gif');
                z-index: 50;
                flex-direction: column;
            ">
                <!-- Retro Window Bar -->
                <div style="background: #c0c0c0; border-bottom: 2px solid #000; padding: 4px; display: flex; align-items: center; justify-content: space-between; box-shadow: inset 1px 1px 0 #fff;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span id="svTitle" style="color: #000; font-weight: bold; font-size: 12px; margin-left: 4px;">PAGE_TITLE</span>
                    </div>
                    <button id="shrineClose" style="
                        background: #c0c0c0;
                        border: 2px outset #fff;
                        color: #000;
                        font-weight: bold;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1;
                        cursor: pointer;
                        padding: 2px 5px;
                    ">X</button>
                </div>

                <!-- Content -->
                <div id="svContent" style="flex: 1; padding: 20px; overflow-y: auto; color: #fff; text-shadow: 1px 1px #000;">
                    <!-- Content injected here -->
                </div>
            </div>

        </div>
      `,
		music: () => `
		  <div class="nowPlaying">

		    <div class="npMetaPanel">
		      <div class="npTitle" id="npTitle">—</div>
		      <div class="npArtist" id="npArtist">—</div>

		      <div class="npPlaylistRow">
		        <select class="npPlaylistSelect" id="npPlaylist" aria-label="Playlist"></select>
		      </div>
		    </div>

		    <div class="npDiskStage" aria-hidden="true">
		      <div class="npDiskWrap">
		        <img class="npDisk" id="npCover" src="img/cover.jpg" alt="" />
		      </div>
		    </div>

		    <div class="npIosPanel">

		      <div class="npSeekWrap">
		        <input class="npSeek npSeekIos" id="npSeek" type="range" min="0" max="1000" value="0" />
		        <div class="npTimes npTimesIos">
		          <span id="npCur">0:00</span>
		          <span id="npDur">0:00</span>
		        </div>
		      </div>

		      <div class="npTransportIos">
		        <button class="npTransportBtn" id="npPrev" type="button" aria-label="Previous">⏮</button>
		        <button class="npPlayMain" id="npPlay" type="button" aria-label="Play/Pause">▶</button>
		        <button class="npTransportBtn" id="npNext" type="button" aria-label="Next">⏭</button>
		      </div>

		      <div class="npVolIos">
		        <span class="npVolIcon" aria-hidden="true">🔈</span>
		        <input class="npVol npVolIosSlider" id="npVol" type="range" min="0" max="100" value="90" />
		        <span class="npVolIcon" aria-hidden="true">🔊</span>

		        <div class="npVolPctWrap">
		          <span class="npVolPct" id="npVolPct">90%</span>
		        </div>
		      </div>

		    </div>

		  </div>
		`,      toys: () => `
        <div style="padding: 16px 20px;">
            <div class="glassCard">
              <div class="toysGrid" id="toysGrid" aria-label="Toys grid"></div>
            </div>
        </div>
      `,

      profile: () => `
        <div style="min-height: 100%; font-family: Verdana, Arial, sans-serif; font-size: 11px; color: #000; padding-bottom: 20px; background: #ffffff">

          <!-- Top Nav -->
          <div style="padding: 6px 8px; font-size: 10px; color: #000;">
             <a href="#" style="color:#003399; text-decoration:none; cursor:pointer;"> </a>
          </div>

          <!-- Main Container -->
          <div style="background: #fff; margin: 0 8px; border: 1px solid #000; padding: 8px;">

            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">

                <!-- Left Col -->
                <div style="flex: 0 0 108px;">
                    <div style="width: 108px; margin-bottom: 4px;">
                        <div style="font-weight:bold; font-size:12px; margin-bottom:2px;">tosutosu</div>
                        <div style="width: 108px; height: 108px; border: 1px solid #000; padding: 2px; background: #fff;">
                            <img src="/assets/img/milkchan.gif" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                    </div>

                    <!-- Contact Box -->
                    <div style="border: 1px solid #6699cc; margin-bottom: 8px; background: #fff;">
                        <div style="background: #6699cc; color: white; font-weight: bold; padding: 2px 4px; font-size: 10px;">Contacting tosu</div>
                        <div style="padding: 4px; display:flex; flex-direction:column; gap:2px;">
                            <div style="font-size:10px; align-items:center; cursor:pointer;">
                                <a href="https://spacehey.com/tosutosu" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:#003399; text-decoration:none;">👥 Check out my real SpaceHey here! </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Col -->
                <div style="flex: 1; min-width: 140px;">

                    <!-- Bio -->
                    <div style="border: 1px solid #ffcc99; margin-bottom: 8px;">
                        <div style="background: #ffcc99; color: #000; font-weight: bold; padding: 2px 4px; font-size: 11px;">tosu's Blurb</div>
                        <div style="padding: 6px; font-size: 11px; line-height: 1.3;">
                            <p style="margin:0 0 6px;"><b>About me:</b><br>
                            Hello, welcome to my corner of the internet. I still don't know what to do with my life nor what this website will ultimately contain. I want it to have a little bit of everything.<br>
                            </p>

                            <p style="margin:0;"><b>A little more about me</b><br>
                            I'm an adult loser (I am not really a loser but I see myself this way, being 25+ and still figuring life out, without a life partner...) trying to navigate through life and still have hope that I can find, meet and exist in a world where future is bright and human connections are valued.<br><br>
                            I spend my days working in a big corporation and spending both my free and work time in front of a computer screen, oh well.<br><br>
                            I was born in the big year 2000, so there I am, not being old enough to be old, not young enough to be young. Too religious for regular people, not sinless/perfect enough for the regular religious people. I'm a jack of all trades and a master of none, as you may notice by this website, oh well again!<br><br>
                            I'm mostly here to look at other people's blogs & stuff, I like older media (mostly 90's-2000's), video games, nostalgia, anything cozy, CAS, and select anime. And also I am Catholic.</p>
                            
                        </div>
                    </div>

                    <!-- Interests (Short) -->
                    <div style="border: 1px solid #99ccff;">
                        <div style="background: #99ccff; color: #000; font-weight: bold; padding: 2px 4px; font-size: 11px;">Interests</div>
                        <div style="padding: 6px; font-size: 10px;">
                            <span style="color:#666; font-weight:bold;">General:</span> East Asia (mainly Japan and China), anime, physical media, modding (hardware and software), gaming, interior design, religion in fiction media and reality.<br>
                            <span style="color:#666; font-weight:bold;">Music:</span> Cigarettes After S*x, Lana Del Rey, Linkin Park, Coldplay, Low Roar, The Marias, Cocteau Twins, Suki Waterhouse, Radiohead
                            <span style="color:#666; font-weight:bold;">Movies:</span> Interstellar, Inception, Bladerunner 2049, Star Wars (mostly pre-Disney) 
                        </div>
                    </div>

                </div>
            </div>

            <!-- Friend Space -->
            <div style="margin-bottom: 12px;">
                <div style="background: #ffcc99; color: #000; font-weight: bold; padding: 2px 4px; margin-bottom: 4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Check These Cool People Out:</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                    <div style="text-align:center;">
                        <div style="font-weight:bold; font-size:10px; margin-bottom:2px; color:#003399;">Empty!</div>
                        <img src="/assets/site_buttons/nekoweb.gif" style="width:100%; aspect-ratio:1; object-fit:cover; border:1px solid #ccc;">
                    </div>
                    <div style="text-align:center;">
                        <div style="font-weight:bold; font-size:10px; margin-bottom:2px; color:#003399;">Empty!</div>
                        <img src="/assets/site_buttons/nekoweb.gif" style="width:100%; aspect-ratio:1; object-fit:contain; background:#fff; border:1px solid #ccc;">
                    </div>
                    <div style="text-align:center;">
                        <div style="font-weight:bold; font-size:10px; margin-bottom:2px; color:#003399;">Empty!</div>
                        <img src="/assets/site_buttons/nekoweb.gif" style="width:100%; aspect-ratio:1; object-fit:contain; background:#fff; border:1px solid #ccc;">
                    </div>
                    <div style="text-align:center;">
                        <div style="font-weight:bold; font-size:10px; margin-bottom:2px; color:#003399;">Empty!</div>
                        <img src="/assets/site_buttons/nekoweb.gif" style="width:100%; aspect-ratio:1; object-fit:cover; border:1px solid #ccc;">
                    </div>
                </div>
            </div>
          </div>

          <div style="text-align:center; padding: 12px; font-size: 9px; color: #000;">
             <br>
             &copy; 2005-2026 tosuSpace
          </div>

        </div>
      `,

      settings: () => SETTINGS_TEMPLATE,

      reviews: () => `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;">
            <div class="iosSegWrap">
                <div class="iosSeg">
                    <button class="iosSegBtn active" data-filter="all">All</button>
                    <button class="iosSegBtn" data-filter="anime">Anime</button>
                    <button class="iosSegBtn" data-filter="movie">Movies</button>
                    <button class="iosSegBtn" data-filter="game">Games</button>
                    <button class="iosSegBtn" data-filter="tech">Tech</button>
                </div>
            </div>
            <div id="reviewsList" class="iosList" style="flex: 1; overflow-y: auto;"></div>
        </div>

        <div id="reviewViewer" class="reviewViewer">
            <div class="appTopbar reviewViewerTopbar">
                <div class="navLeft">
                    <button class="backBtn" id="reviewBack" type="button">Back</button>
                </div>

                <div class="appTitle">Reviews</div>

                <div class="navRight"></div>
            </div>

            <div class="appBody reviewViewerBody">
                <div class="iosSegWrap reviewSegWrap">
                    <div class="iosSeg">
                        <button class="iosSegBtn active" data-filter="all">All</button>
                        <button class="iosSegBtn" data-filter="anime">Anime</button>
                        <button class="iosSegBtn" data-filter="movie">Movies</button>
                        <button class="iosSegBtn" data-filter="game">Games</button>
                        <button class="iosSegBtn" data-filter="tech">Tech</button>
                    </div>
                </div>

                <div class="reviewViewerContent">
                    <div class="rvWrap">
                        <div class="rvTitleRow">
                            <h1 id="rvTitle" class="rvTitle"></h1>
                            <span id="rvTier" class="rvTier" aria-label="Rating"></span>
                        </div>
                        <div id="rvLead" class="rvLead"></div>
                        <div class="rvDivider" aria-hidden="true"></div>
                        <div id="rvBody" class="rvBody"></div>
                        <div class="rvSpacer" aria-hidden="true"></div>
                    </div>
                </div>
            </div>
        </div>
      `,

            poetry: () => `
            <div style="position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; color: #0f0; font-family: 'Courier New', Courier, monospace; font-size: 11px;">
              <div style="width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;">
                <div style="padding: 8px 10px; background: #000080; color: #fff; border-bottom: 1px solid #c0c0c0; letter-spacing: 1px;">
                  POETRY
                </div>
                <div id="poetryList" style="flex: 1; min-height: 0; overflow-y: auto;"></div>
              </div>

              <div id="poetryViewer" style="display: none; position: absolute; inset: 0; z-index: 80; width: 100%; height: 100%; flex-direction: column; overflow: hidden; background: #000; color: #0f0; font-family: 'Courier New', Courier, monospace;">
                <div class="appTopbar poetryViewerTopbar" style="background: #000080; color: #fff; border-bottom: 1px solid #c0c0c0;">
                  <div class="navLeft">
                    <button class="backBtn" id="poetryBack" type="button">Back</button>
                  </div>

                  <div class="appTitle" id="poetryViewerTitle">Poetry</div>

                  <div class="navRight"></div>
                </div>

                <div style="flex: 1; min-height: 0; overflow-y: auto; padding: 12px 12px 44px; box-sizing: border-box;">
                  <div id="poetryFolder" style="font-size: 11px; color: #aaa; margin-bottom: 8px;"></div>
                  <div id="poetryDate" style="font-size: 11px; color: #aaa; margin-bottom: 10px;"></div>
                  <h1 id="poetryTitle" style="margin: 0 0 12px; font-size: 16px; color: #0f0; border-bottom: 1px solid #0f0; padding-bottom: 6px;"></h1>
                  <div id="poetryContent" style="white-space: pre-wrap; line-height: 1.5; font-size: 12px;"></div>
                </div>
              </div>
            </div>
            `,

      camera: () => `
        <div class="iosCameraApp">
          <div class="iosCameraView" id="camView">
            <div class="camFocus" aria-hidden="true"></div>
          </div>

          <div class="iosCameraTop">
            <button class="camBtn camBackBtn" id="camBack" type="button">Cancel</button>
            <div class="camTitle">Camera</div>
            <button class="camBtn camFlashBtn" type="button">⚡︎ Auto</button>
          </div>

          <div class="iosCameraBottom">
            <div class="camModeBar">
              <button class="camMode">Video</button>
              <button class="camMode active">Photo</button>
              <button class="camMode">Square</button>
              <button class="camMode">Pano</button>
            </div>
            <div class="camControls">
              <button class="camThumb" type="button" aria-label="Last photo"></button>
              <button class="camShutter" id="camShutter" type="button" aria-label="Take photo"></button>
              <button class="camSwitch" type="button" aria-label="Switch camera">🔄</button>
            </div>
          </div>
        </div>
      `,
      phone: () => `
        <div class="callScreen ringing" id="callScreen" style="--callbg:url('/assets/img/john.png')">

          <div class="callBgLayer"></div>

          <div class="callTop">
            <img class="callAvatar" src="/assets/img/john.png" alt="John Pork" />
            <div class="callName">John Pork</div>
            <div class="callSub">mobile</div>
          </div>

          <div class="callControls">
            <!-- Incoming Call UI -->
            <div class="incomingOnly">
              <!-- Utility Buttons -->
              <div class="callMiniRow">
                <div class="callMini">
                  <button class="callMiniBtn" id="callRemind" type="button">⏰</button>
                  <div>Remind Me</div>
                </div>
                <div class="callMini">
                  <button class="callMiniBtn" id="callMsg" type="button">💬</button>
                  <div>Message</div>
                </div>
              </div>

              <!-- Main Buttons -->
              <div class="callMainRow">
                <button class="callMainBtn callDecline" id="callDecline" type="button">Decline</button>
                <button class="callMainBtn callAccept" id="callAccept" type="button">Answer</button>
              </div>
            </div>

            <!-- Active Call UI -->
            <div class="inCallOnly">
              <div class="callInCallGrid">
                <button class="callCtlBtn" type="button">Mute</button>
                <button class="callCtlBtn" type="button">Keypad</button>
                <button class="callCtlBtn" type="button">Speaker</button>
                <button class="callCtlBtn" type="button">Add Call</button>
                <button class="callCtlBtn" type="button">FaceTime</button>
                <button class="callCtlBtn" type="button">Contacts</button>
              </div>

              <div class="callEndRow">
                <button class="callEndBtn" id="callEnd" type="button">End</button>
              </div>
            </div>
          </div>

        </div>
`,
      messages: () => `
        <div class="iosMsgApp">
          <div class="iosMsgList" id="iosMsgList">
            <div class="iosMsgDate">Today 9:41 AM</div>

            <div class="iosMsgRow left">
              <div class="iosMsgBubble">We have to talk.</div>
            </div>

            <div class="iosMsgRow right">
              <div class="iosMsgBubble">Sorry, do I know you?</div>
            </div>

            <div class="iosMsgDate">Today 11:37 AM</div>

            <div class="iosMsgRow left">
              <div class="iosMsgBubble">You know who I am.</div>
            </div>
          </div>

          <div class="iosMsgToolbar">
            <div class="iosMsgCam"></div>
            <input type="text" class="iosMsgInput" id="iosMsgInput" placeholder="Text Message" />
            <button class="iosMsgSendBtn" id="iosMsgSendBtn">Send</button>
          </div>
        </div>
      `,
      safari: () => `
        <div class="safariApp">
          <div class="safariTop">
            <div class="safariAddress">
              <span class="safariLock" aria-hidden="true">🔒</span>
              <input id="safariSearch" class="safariInput" type="text" placeholder="Search or Enter an Animal" spellcheck="false" />
              <button id="safariClear" class="safariClear" type="button" aria-label="Clear search">×</button>
            </div>

            <div class="safariSeg" role="tablist" aria-label="Safari tabs">
              <button class="iosSegBtn active" type="button" data-safari-filter="all">All</button>
              <button class="iosSegBtn" type="button" data-safari-filter="mammals">Mammals</button>
              <button class="iosSegBtn" type="button" data-safari-filter="birds">Birds</button>
              <button class="iosSegBtn" type="button" data-safari-filter="reptiles">Reptiles</button>
              <button class="iosSegBtn" type="button" data-safari-filter="weird">Weird</button>
            </div>

            <div class="safariHint">If I used Opera, this app would sing instead.</div>
          </div>

          <div class="safariBody">
            <div class="safariGrid" id="safariGrid" aria-label="Animals"></div>
            <div class="safariEmpty" id="safariEmpty" style="display:none;">No animals found. Try a different “URL”.</div>
          </div>


          <!-- Fullscreen Animal Viewer -->
          <div class="safariViewer" id="safariViewer" style="display:none;">
            <div class="safariViewerNav">
              <button class="backBtn" id="safariViewerBack" type="button">Back</button>
              <div class="safariViewerTitle" id="safariViewerTitle">Animal</div>
              <div class="navRight"></div>
            </div>

            <div class="safariViewerBody">
              <div class="safariHeroCard">
                <div class="safariHeroBg" aria-hidden="true"></div>
                <div class="safariHero" id="safariHero" aria-hidden="true"></div>
              <div class="safariHeroMeta">
                <div class="safariHeroName" id="safariHeroName">Animal</div>
                <div class="safariHeroTags">
                  <span class="safariTag" id="safariWhereTag">—</span>
                  <span class="safariTag" id="safariGroupTag">—</span>
                </div>
              </div>
            </div>

              <div class="safariFacts">
                <div class="safariFactCard">
                  <div class="safariFactLabel">Where</div>
                  <div class="safariFactValue" id="safariWhere">—</div>
                </div>
                <div class="safariFactCard">
                  <div class="safariFactLabel">Vibe</div>
                  <div class="safariFactValue" id="safariVibe">—</div>
                </div>
                <div class="safariFactCard safariFactWide">
                  <div class="safariFactLabel">Fun fact</div>
                  <div class="safariFactValue" id="safariFact">—</div>
                </div>
              </div>

              <div class="safariViewerFooter">Tip: you can’t pinch-to-zoom wildlife. The wildlife will zoom you.</div>
            </div>
          </div>
        </div>
      `,};

    function escapeHtml(str){
      return String(str).replace(/[&<>\"']/g, s => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      }[s]));
    }

    // =========================
    // FALLBACK FOR APPS WITHOUT TEMPLATES
    // =========================

    const PLACEHOLDERS = ["☆","✿","☁︎","☾","✦","♫","✧","❖","✪","⚡"];
    function pickPlaceholder(id){
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      return PLACEHOLDERS[h % PLACEHOLDERS.length];
    }

    function appIconHTML(app){
      if (app.icon){
        const src = escapeHtml(app.icon);
        return `<img class="appIconImg" src="${src}" alt="" />`;
      }
      return `<div class="appIconPh" aria-hidden="true">${escapeHtml(pickPlaceholder(app.id))}</div>`;
    }

    // =========================
    // RENDER HOME SCREEN APPS AND DOCK
    // =========================

	function renderHome(){
	  if (!screen) return;

	  const homeApps = APP_LIST.filter(a => a.group === "home");
	  const dockApps = APP_LIST.filter(a => a.group === "dock");

	  screen.innerHTML = `

	    <div class="iconGridWrap">
	      <div class="iconGrid" id="iconGrid">
	        ${homeApps.map(a => `
	          <button class="appIcon" type="button" data-open-app="${a.id}">
	            <div class="appIconBox ${a.icon ? "hasImg" : ""}" aria-hidden="true">
	              ${appIconHTML(a)}
	            </div>
	            <div class="appLabel">${escapeHtml(a.name)}</div>
	          </button>
	        `).join("")}
	      </div>
	    </div>

	    <div class="dock">
	      <div class="dockGlass">
	        ${dockApps.map(a => `
	          <button class="appIcon" type="button" data-open-app="${a.id}">
	            <div class="appIconBox ${a.icon ? "hasImg" : ""}" aria-hidden="true">
	              ${appIconHTML(a)}
	            </div>
	          </button>
	        `).join("")}
	      </div>
	      <div class="homeIndicator" aria-hidden="true"></div>
	    </div>
	  `;

	}

    // =========================
    // tosuOS APP RENDERING
    // =========================

	function renderApp(appId){
	  window.__activeAppId = appId;
    invalidateNowPlayingCache();
	  if (!screen) return;

	  const app = APP_LIST.find(a => a.id === appId);
	  const title = app ? app.name : "App";

	  // ✅ MUSIC — standard navbar; playlist select lives under title/artist in the player UI
	  if (appId === "music"){
	    screen.innerHTML = `
	      <div class="appTopbar">
	        <div class="navLeft">
	          <button class="backBtn" id="npHomeMini" type="button">Back</button>
	        </div>

	        <div class="appTitle">${escapeHtml(title)}</div>

	        <div class="navRight"></div>
	      </div>

	      <div class="appBody isMusic">
	        <div class="musicRoot">
	          ${APP_SCREENS.music()}
	        </div>
	      </div>
	    `;
	    wireAppHooks("music");
	    return;
	  }

      // ✅ NOTES - iOS 6 Style Layout
      if (appId === "notes"){
        screen.innerHTML = `
          <div class="iosNotes">
            <div class="iosNotesNav">
               <button class="iosNotesBtn back" id="notesBack">Back</button>
               <div class="iosNotesTitle">New Note</div>
            </div>

            <div class="iosNotesBody">
              <div class="iosNotesTopMargin"></div>
              <textarea
                id="myNotesArea"
                class="iosTextarea"
                placeholder=""
                spellcheck="false"
              ></textarea>
            </div>
          </div>
        `;
        wireAppHooks("notes");
        return;
      }

	  if (appId === "settings"){
		screen.innerHTML = `
		  <div class="appTopbar">
		    <div class="navLeft"></div>
		    <div class="appTitle">${escapeHtml(title)}</div>
		    <div class="navRight"></div>
		  </div>

		  <div class="appBody isSettings" style="position:relative;">
		    ${APP_SCREENS.settings()}
		  </div>
		`;
		wireAppHooks("settings");
		return;
		}

	  const body = (APP_SCREENS[appId]
	    ? APP_SCREENS[appId]()
	    : `<div class="glassCard"><h2>${escapeHtml(title)}</h2><p>Work in progress section.</p></div>`);

	  if (appId === "phone"){
	    screen.innerHTML = `<div class="appBody callBody">${body}</div>`;
	    wireAppHooks("phone");
	    return;
	  }

	  if (appId === "camera"){
	    screen.innerHTML = `<div class="appBody cameraBody">${body}</div>`;
	    wireAppHooks("camera");
	    return;
	  }


    // =========================
    // DEFAULT APP LAYOUT - NAVBAR + BODY
    // =========================

		const rightHtml = (appId === "blog")
		  ? `<button class="navIconBtn" id="journalCompose" type="button" aria-label="Add status">+</button>`
		  : ``;

		screen.innerHTML = `
	      <div class="appTopbar">
	        <div class="navLeft">
	          <button class="backBtn" id="npHomeMini" type="button">Back</button>
	        </div>

		    <div class="appTitle">${escapeHtml(title)}</div>

		    <div class="navRight">${rightHtml}</div>
		  </div>

        <!-- ZMIANA: Zawsze dodajemy klasę edgeToEdge -->
	    <div class="appBody edgeToEdge">
	      ${body}
	    </div>
	  `;

      // FIX: Obsługa przycisku Back dla domyślnych aplikacji
      document.getElementById("npHomeMini")?.addEventListener("click", () => {
          setScreenOriginPct(50, 92);
          setState({ view:"home" });
      });

		// Journal: quick "add" button (status.cafe)
		document.getElementById("journalCompose")?.addEventListener("click", () => {
			try{
				window.open(
					"https://status.cafe/add",
					"status.cafe",
					"resizable,scrollbars,width=350,height=350"
				);
			}catch(_e){}
		});

	  wireAppHooks(appId);
	}


    function syncNav(active){
      document.querySelectorAll(".navBtn").forEach(b => {
        b.classList.toggle("active", (active === "home" && b.dataset.open === "home") || (b.dataset.open === active));
      });
    }

    // =========================
    // iOS-like transitions
    // =========================

    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const raf = () => new Promise(r => requestAnimationFrame(r));

    function setScreenOriginFromEl(el){
      if (!el || !screen) return;
      const r = el.getBoundingClientRect();
      const sr = screen.getBoundingClientRect();
      const cx = (r.left + r.width/2) - sr.left;
      const cy = (r.top + r.height/2) - sr.top;
      const ox = Math.max(0, Math.min(100, (cx / sr.width) * 100));
      const oy = Math.max(0, Math.min(100, (cy / sr.height) * 100));
      screen.style.setProperty("--ox", ox + "%");
      screen.style.setProperty("--oy", oy + "%");
    }

    function setScreenOriginPct(x, y){
      if (!screen) return;
      screen.style.setProperty("--ox", x + "%");
      screen.style.setProperty("--oy", y + "%");
    }

    let isSwitchingView = false;
    async function iosTransition(renderFn){
      if (!screen || isSwitchingView) return;
      isSwitchingView = true;

      screen.classList.add("ios-exit");
      await wait(180);

      renderFn();

      screen.classList.remove("ios-exit");
      screen.classList.add("ios-enter");
      await raf(); await raf();
      screen.classList.add("ios-enter-active");

      await wait(360);
      screen.classList.remove("ios-enter", "ios-enter-active");

      isSwitchingView = false;
    }


	// =========================
	// TOYS: shelf + persistent activations
	// =========================

	const TOY_SHELF_KEY  = "tosuOS_toy_shelf_unlocked";
	const TOY_ACTIVE_KEY = "tosuOS_toys_active";

	const toyShelfWin  = document.getElementById("toyShelfWin");
	const toyShelfGrid = document.getElementById("toyShelfGrid");

	// Register toys (add more here later)
	const TOYS = [
	  {
	    id: "miku",
	    name: "Miku",
	    icon: "/assets/img/toys/miku.gif",
	    el: document.getElementById("mikuToy"),
	    posKey: "tosuOS_toypos_miku",
	  },
	  {
	    id: "cinna",
	    name: "Cinna",
	    icon: "/assets/img/toys/cinnafloat.gif",
	    el: document.getElementById("cinnaToy"),
	    posKey: "tosuOS_toypos_cinna",
	  },
	  {
	    id: "konata",
	    name: "Konata",
	    icon: "/assets/img/toys/konata.gif",
	    el: document.getElementById("konataToy"),
	    posKey: "tosuOS_toypos_konata",
	  },
	];

	let toyShelfUnlocked = localStorage.getItem(TOY_SHELF_KEY) === "1";
	let activeToys = new Set();

	function loadActiveToys(){
	  activeToys = new Set();
	  try{
	    const raw = localStorage.getItem(TOY_ACTIVE_KEY);
	    const arr = JSON.parse(raw || "[]");
	    if (Array.isArray(arr)) arr.forEach(id => activeToys.add(String(id)));
	  }catch(_){ }
	}
	function persistActiveToys(){
	  try{ localStorage.setItem(TOY_ACTIVE_KEY, JSON.stringify(Array.from(activeToys))); }catch(_){ }
	}

	let toyZ = 10000;
	function bumpToyZ(el){
	  if (!el) return;
	  toyZ += 1;
	  el.style.zIndex = String(toyZ);
	}

	function setToyShelfVisible(on){
	  if (!toyShelfWin) return;
	  toyShelfWin.classList.toggle("isHidden", !on);
	}

	function unlockToyShelf(){
	  if (toyShelfUnlocked) return;
	  toyShelfUnlocked = true;
	  try{ localStorage.setItem(TOY_SHELF_KEY, "1"); }catch(_){ }
	  setToyShelfVisible(true);
	  renderToyShelf();
	}

	function setToyVisible(id, on){
	  const toy = TOYS.find(t => t.id === id);
	  if (!toy || !toy.el) return;

	  toy.el.classList.toggle("is-visible", !!on);

	  if (on){
	    bumpToyZ(toy.el);
	    // restore saved position (if any)
	    try{
	      const saved = JSON.parse(localStorage.getItem(toy.posKey) || "null");
	      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)){
	        toy.el.style.left = saved.x + "px";
	        toy.el.style.top  = saved.y + "px";
	        toy.el.style.right = "auto";
	        toy.el.style.bottom = "auto";
	      }
	    }catch(_){ }
	  }
	}

	function activateToy(id){
	  if (activeToys.has(id)) return;
	  activeToys.add(id);
	  persistActiveToys();
	  setToyVisible(id, true);
	  updateToyUI();
	}
	function deactivateToy(id){
	  if (!activeToys.has(id)) return;
	  activeToys.delete(id);
	  persistActiveToys();
	  setToyVisible(id, false);
	  updateToyUI();
	}
	function toggleToy(id){
	  if (activeToys.has(id)) deactivateToy(id);
	  else activateToy(id);
	}

	function renderToyShelf(){
	  if (!toyShelfGrid) return;
	  toyShelfGrid.innerHTML = TOYS.map(t => {
	    const isOn = activeToys.has(t.id);
	    return `
	      <button class="toyShelfItem ${isOn ? "isActive" : ""}" type="button" data-toy-id="${escapeHtml(t.id)}" aria-label="${escapeHtml(t.name)}">
	        <img src="${escapeHtml(t.icon)}" alt="" />
	        <span>${escapeHtml(t.name)}</span>
	      </button>
	    `;
	  }).join("");
	}

	function renderPhoneToyGrid(){
	  const host = document.getElementById("toysGrid");
	  if (!host) return;

	  host.innerHTML = TOYS.map(t => {
	    const isOn = activeToys.has(t.id);
	    return `
	      <button class="toyTile ${isOn ? "isActive" : ""}" type="button" data-toy-id="${escapeHtml(t.id)}">
	        <div class="toyTileImg"><img src="${escapeHtml(t.icon)}" alt="" /></div>
	        <div class="toyTileName">${escapeHtml(t.name)}</div>
	      </button>
	    `;
	  }).join("");

	  if (host.dataset.bound !== "1"){
	    host.dataset.bound = "1";
	    host.addEventListener("click", (e) => {
	      const btn = e.target.closest("[data-toy-id]");
	      if (!btn) return;
	      toggleToy(btn.getAttribute("data-toy-id"));
	    });
	  }
	}

	function updateToyUI(){
	  // Shelf states
	  toyShelfGrid?.querySelectorAll("[data-toy-id]").forEach(btn => {
	    const id = btn.getAttribute("data-toy-id");
	    btn.classList.toggle("isActive", activeToys.has(id));
	  });

	  // Phone Toys app states (if open)
	  document.querySelectorAll("#toysGrid [data-toy-id]").forEach(btn => {
	    const id = btn.getAttribute("data-toy-id");
	    btn.classList.toggle("isActive", activeToys.has(id));
	  });
	}

	function bindToyDrag(toy){
	  const el = toy?.el;
	  if (!el || el.dataset.dragBound === "1") return;
	  el.dataset.dragBound = "1";

	  // Prevent native image drag ghost
	  el.addEventListener("dragstart", (e) => e.preventDefault());

	  let dragging = false;
	  let startX = 0, startY = 0;
	  let origX = 0, origY = 0;

	  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

	  const onMove = (e) => {
	    if (!dragging) return;

	    const dx = e.clientX - startX;
	    const dy = e.clientY - startY;

	    const x = clamp(origX + dx, 0, window.innerWidth  - el.offsetWidth);
	    const y = clamp(origY + dy, 0, window.innerHeight - el.offsetHeight);

	    el.style.left = x + "px";
	    el.style.top  = y + "px";
	    el.style.right = "auto";
	    el.style.bottom = "auto";
	  };

	  const end = () => {
	    if (!dragging) return;
	    dragging = false;

	    el.classList.remove("is-dragging");
	    window.removeEventListener("pointermove", onMove);
	    window.removeEventListener("pointerup", end);

	    const x = parseFloat(el.style.left);
	    const y = parseFloat(el.style.top);
	    if (Number.isFinite(x) && Number.isFinite(y)){
	      try{ localStorage.setItem(toy.posKey, JSON.stringify({ x, y })); }catch(_){ }
	    }
	  };

	  el.addEventListener("pointerdown", (e) => {
	    if (!el.classList.contains("is-visible")) return;

	    bumpToyZ(el);

	    dragging = true;
	    el.classList.add("is-dragging");

	    const rect = el.getBoundingClientRect();
	    startX = e.clientX; startY = e.clientY;
	    origX = rect.left;  origY = rect.top;

	    window.addEventListener("pointermove", onMove);
	    window.addEventListener("pointerup", end);

	    e.preventDefault();
	  });
	}

	function initToys(){
	  loadActiveToys();

	  // Safety: if any toy is active, consider the shelf unlocked
	  if (!toyShelfUnlocked && activeToys.size){
	    toyShelfUnlocked = true;
	    try{ localStorage.setItem(TOY_SHELF_KEY, "1"); }catch(_){ }
	  }

	  if (toyShelfUnlocked){
	    setToyShelfVisible(true);
	    renderToyShelf();
	  }

	  // Bind shelf click once
	  if (toyShelfGrid && toyShelfGrid.dataset.bound !== "1"){
	    toyShelfGrid.dataset.bound = "1";
	    toyShelfGrid.addEventListener("click", (e) => {
	      const btn = e.target.closest("[data-toy-id]");
	      if (!btn) return;
	      toggleToy(btn.getAttribute("data-toy-id"));
	    });
	  }

	  // Bind drags
	  TOYS.forEach(bindToyDrag);

	  // Restore active toy visibility
	  TOYS.forEach(t => setToyVisible(t.id, activeToys.has(t.id)));

	  updateToyUI();
	}

	initToys();


    // =========================
    // PHONE ringtone controller
    // =========================

    let callAudio = null;

    // Current caller label (shared across Phone + Messages UI)
    let currentCallerName = "John Pork";

    // Current caller avatar (used by Phone call screen)
    let currentCallerAvatar = "/assets/img/john.png";										
										 

    // Optional: auto-rename the caller mid-call
    const CALLER_RENAME_TO = "Epstein";          // <- change this
    const CALLER_RENAME_AFTER_MS = 20;          // <- and/or this (milliseconds)

																  
    const CALLER_AVATAR_RENAME_TO = "/assets/img/ep.png"; // <- change this (path)			  
																		   
    let callVoiceAudio = null;
    let callRenameTimeoutId = null;
    let callTimerId = null;
    let callStartTs = 0;

    function formatCallTime(totalSeconds){
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const ss = String(totalSeconds % 60).padStart(2, "0");
      return `${mm}:${ss}`;
    }

    function setCallSubtitle(text){
      const cs = $("callScreen");
      const sub = cs?.querySelector(".callSub");
      if (sub) sub.textContent = text;
    }

    function setCallName(name){
      currentCallerName = String(name || "").trim() || "Unknown";

      const cs = $("callScreen");
      const nameEl = cs?.querySelector(".callName");
      if (nameEl) nameEl.textContent = currentCallerName;

      const av = cs?.querySelector(".callAvatar");
      if (av) av.alt = currentCallerName;

      // If you're currently inside Messages, keep the navbar title in sync too
      const titleEl = document.querySelector(".appTitle");
      if (titleEl && window.__activeAppId === "messages"){
        titleEl.textContent = currentCallerName;
      }
    }

	function setCallAvatar(src){
	  const next = String(src || "").trim();
      if (next) currentCallerAvatar = next;

      const cs = $("callScreen");
      const img = cs?.querySelector(".callAvatar");
      if (img) img.src = currentCallerAvatar;

      // Keep blurred wallpaper in sync with avatar (optional but looks consistent)
      if (cs) cs.style.setProperty("--callbg", `url('${currentCallerAvatar}')`);
    }

    function scheduleCallRename(){
      if (callRenameTimeoutId){
        clearTimeout(callRenameTimeoutId);
        callRenameTimeoutId = null;
      }
																		
		const hasName = Boolean(String(CALLER_RENAME_TO || "").trim());
		const hasAvatar = Boolean(String(CALLER_AVATAR_RENAME_TO || "").trim());

		// Nothing to change
		if (!hasName && !hasAvatar) return;

		// Allow 0ms (instant). Null/undefined disables scheduling.
		if (CALLER_RENAME_AFTER_MS == null) return;

		const delayMs = Math.max(0, Number(CALLER_RENAME_AFTER_MS) || 0);

		callRenameTimeoutId = setTimeout(() => {
		  if (hasName) setCallName(CALLER_RENAME_TO);
		  if (hasAvatar) setCallAvatar(CALLER_AVATAR_RENAME_TO);
		}, delayMs);
    }

    function stopActiveCall(){
      const cs = $("callScreen");
      if (cs) cs.classList.remove("inCall");

      if (callRenameTimeoutId){
        clearTimeout(callRenameTimeoutId);
        callRenameTimeoutId = null;
      }

      if (callTimerId){
        clearInterval(callTimerId);
        callTimerId = null;
      }

      if (callVoiceAudio){
        try{ callVoiceAudio.pause(); callVoiceAudio.currentTime = 0; }catch(e){}
        callVoiceAudio = null;
      }

      // Reset default label for next incoming call render
      setCallSubtitle("mobile");
    }

    function startActiveCall(){
      const cs = $("callScreen");
      if (!cs) return;

      cs.classList.add("inCall");
      cs.classList.remove("ringing");


      // Ensure the caller label starts from the default before any scripted rename
      setCallName("John Pork");
									
      callStartTs = Date.now();
      setCallSubtitle("00:00");

      if (callTimerId) clearInterval(callTimerId);
      callTimerId = setInterval(() => {
        const sec = Math.floor((Date.now() - callStartTs) / 1000);
        setCallSubtitle(formatCallTime(sec));
      }, 500);

      // Plays once on Answer click
      if (callVoiceAudio){
        try{ callVoiceAudio.pause(); callVoiceAudio.currentTime = 0; }catch(e){}
      }
      callVoiceAudio = new Audio("/assets/audio/ep.mp3");
      callVoiceAudio.volume = 0.9;
      callVoiceAudio.play().catch(()=>{});

      // Optional: rename the caller a moment into the call
      scheduleCallRename();
    }

    function stopIncomingCall(){
      const cs = $("callScreen");
      if (cs) cs.classList.remove("ringing");
      if (!callAudio) return;
      try{ callAudio.pause(); callAudio.currentTime = 0; }catch(e){}
      callAudio = null;
    }

function startIncomingCall(){
      stopActiveCall();
      stopIncomingCall();
      setCallSubtitle("mobile");
      setCallName("John Pork");
									
      const cs = $("callScreen");
      if (cs) cs.classList.add("ringing");
      callAudio = new Audio("/assets/audio/ringtone.mp3");
      callAudio.loop = true;
      callAudio.volume = 0.5;
      callAudio.play().catch(()=>{});
    }

	function setState(state, opts = {}){
	  stopIncomingCall();
	  stopActiveCall();
	  const { immediate = false } = opts;

	  const prevActiveApp = window.__activeAppId || null;
	  const activeApp = (state.view === "app") ? state.appId : null;

    // Leaving Shrine should also stop shrine-only music override (and restore the previous track, if any).
	  if (prevActiveApp === "shrine" && activeApp !== "shrine"){
      try{ stopShrineMusicOverride({ restore: true }); }catch(_e){}
	  }

	  if (screen){
        // Traktujemy "notes" tak samo jak "settings" - daje to pełne tło i systemowy navbar
	    screen.classList.toggle("isSettingsScreen", activeApp === "settings" || activeApp === "notes");
	    screen.classList.toggle("isMusicScreen",    activeApp === "music");
	  }

	  const statusBar = document.querySelector(".status");

	  // sbLightUI ma zależeć od tego, czy ekran jest jasny (Settings/Music/Notes)
	  const isLightUIScreen = (activeApp === "settings" || activeApp === "music" || activeApp === "notes");
	  statusBar?.classList.toggle("sbLightUI", isLightUIScreen);


	  const doRender = () => {
	    if (state.view === "home") renderHome();
	    else if (state.view === "app") renderApp(state.appId);
	  };

	  if (immediate) doRender();
	  else iosTransition(doRender);

	  if (state.view === "home"){
	    syncNav("home");
	    history.replaceState(null, "", "#home");
	  } else if (state.view === "app"){
	    syncNav(state.appId);
	    history.replaceState(null, "", "#" + state.appId);
	  }
	}

    // =========================
    // iOS 6 ALERT CONTROLLER
    // =========================
    function showIos6Alert(title, message, confirmCallback) {
        const overlay = document.getElementById("ios6AlertOverlay");
        const titleEl = document.getElementById("ios6AlertTitle");
        const msgEl = document.getElementById("ios6AlertMsg");
        const cancelBtn = document.getElementById("ios6AlertCancel");
        const okBtn = document.getElementById("ios6AlertOk");

        if(!overlay) return;

        titleEl.textContent = title;
        msgEl.textContent = message;
        overlay.style.display = "flex";

        cancelBtn.onclick = () => { overlay.style.display = "none"; };
        okBtn.onclick = () => { overlay.style.display = "none"; confirmCallback(); };
    }

    screen?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-app]");
      if (!btn) return;

      const id = btn.getAttribute("data-open-app");

      // LINKI ZEWNĘTRZNE
      const externalLinks = {
        youtube: "https://www.youtube.com/@tosutosu_",
        spotify: "https://open.spotify.com/user/ckbarthone?si=a6d0aa1d687e4af6",
        instagram: "https://www.instagram.com/ja.kot.ako/",
        discord: "https://discord.com/users/tosutosu",
        minecraft: "https://classic.minecraft.net/",
        profile: "https://spacehey.com/tosutosu"
      };

      if (externalLinks[id]) {
        // ZMIANA: Zamiast window.open, pokazujemy modal
        const appName = id.charAt(0).toUpperCase() + id.slice(1);
        showIos6Alert("Open in New Tab", `This app will open ${appName} in a new browser tab. Do you want to proceed?`, () => {
            window.open(externalLinks[id], "_blank");
        });
        return;
      }

      setScreenOriginFromEl(btn.querySelector(".appIconBox") || btn);
      setState({ view:"app", appId: id });
    });

    $("nav")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".navBtn");
      if (!btn) return;
      const target = btn.dataset.open;

      if (target === "home"){
        setScreenOriginPct(50, 92);
        setState({ view:"home" });
      } else {
        setScreenOriginPct(18, 28);
        setState({ view:"app", appId: target });
      }
    });

    $("themePill")?.addEventListener("click", () => {
      setScreenOriginPct(82, 10);
      setState({ view:"app", appId:"settings" });
    });

    function initFromHash(){
      const key = (location.hash || "#home").slice(1);
      if (!key || key === "home") setState({ view:"home" }, { immediate:true });
      else setState({ view:"app", appId: key }, { immediate:true });
    }

	// =========================
	// SHARED MEDIA CONTROLLER (ONE audio, MANY playlists)
	// =========================

	const playerWin = $("playerWin");

	const AUTOPIN_KEY = "tosuOS_autopin";
	let playerAutopin = localStorage.getItem(AUTOPIN_KEY) === "1";

	const VOL_KEY = "tosuOS_volume";
	function clamp01(x){ x = Number(x); return isFinite(x) ? Math.min(1, Math.max(0, x)) : 0.9; }
	let userVolume = clamp01(localStorage.getItem(VOL_KEY) ?? 0.10);

	function setPlayerVisible(visible){
	  if (!playerWin) return;
	  playerWin.classList.toggle("isHidden", !visible);
	}

	function showPlayerIfNeeded(){
	  setPlayerVisible(true);
	}

	function setAutopin(next){
	  playerAutopin = !!next;
	  localStorage.setItem(AUTOPIN_KEY, playerAutopin ? "1" : "0");
	}

	/* =========================
	   PLAYLISTS
	   ========================= */

	const PLAYLIST_KEY = "tosuOS_playlist";

	const PLAYLIST_META = {
	  main: { label: "Frutiger Aero" },
	  abo:  { label: "Abo Takeshi" },
	  c418: { label: "C418" },
	  myslovitz: { label: "Myslovitz" },
	  spore: { label: "Spore" },
	};

	const PLAYLISTS = {
	  main: [
	    { file: "/assets/audio/shibuya.mp3", title: "Shibuya", artist: "Abo Takeshi", cover: "/assets/img/music/shibuya.jpg" },
	    { file: "/assets/audio/illusions-takeshi-abo.mp3", title: "Illusions", artist: "Abo Takeshi", cover: "/assets/img/music/illusions.jpg" },
	    { file: "/assets/audio/lease-takeshi-abo.mp3", title: "Lease", artist: "Abo Takeshi", cover: "/assets/img/music/illusions.jpg" },
	    { file: "/assets/audio/C418/24 - C418 - Droopy Likes Your Face.mp3", title: "Droopy Likes Your Face", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	    { file: "/assets/audio/x360-avatar-theme-song.mp3", title: "Xbox 360 Avatar Theme Song", artist: "Steve Burke", cover: "/assets/img/music/x360.jpg" },
	  ],
	  abo: [
	    { file: "/assets/audio/shibuya.mp3", title: "Shibuya", artist: "Abo Takeshi", cover: "/assets/img/music/shibuya.jpg" },
	    { file: "/assets/audio/illusions-takeshi-abo.mp3", title: "Illusions", artist: "Abo Takeshi", cover: "/assets/img/music/illusions.jpg" },
	    { file: "/assets/audio/lease-takeshi-abo.mp3", title: "Lease", artist: "Abo Takeshi", cover: "/assets/img/music/illusions.jpg" },
	  ],
	  c418: [
	    { file: "/assets/audio/C418/06 - C418 - Moog City.mp3", title: "Moog City", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	    { file: "/assets/audio/C418/12 - C418 - Dry Hands.mp3", title: "Dry Hands", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	    { file: "/assets/audio/C418/13 - C418 - Wet Hands.mp3", title: "Wet Hands", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	    { file: "/assets/audio/C418/19 - C418 - Cat.mp3", title: "Cat", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	    { file: "/assets/audio/C418/20 - C418 - Dog.mp3", title: "Dog", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	    { file: "/assets/audio/C418/24 - C418 - Droopy Likes Your Face.mp3", title: "Droopy Likes Your Face", artist: "C418", cover: "/assets/img/music/c418.jpg" },
	  ],
	  myslovitz: [
	    { file: "/assets/audio/myslovitz-sprzedawcy-marzen-bocchi.mp3", title: "Sprzedawcy marzeń", artist: "Myslovitz", cover: "/assets/img/music/Myslovitz.png" },
	    { file: "/assets/audio/myslovitz-dlugosc-dzwieku-samotnosci-bocchi.MP3", title: "Długość dźwięku samotności", artist: "Myslovitz",  cover: "/assets/img/music/Myslovitz.png" },
	  ],
	  spore: [
	    { file: "/assets/audio/Spore/01-02. Your Own Personal Universe.mp3", title: "Your Own Personal Universe", artist: "Spore", cover: "/assets/img/music/Spore.webp" },
	    { file: "/assets/audio/Spore/06-01. Among The Stars.mp3", title: "Among The Stars", artist: "Spore", cover: "/assets/img/music/Spore.webp" },
	    { file: "/assets/audio/Spore/01-04. Sporepedia Galactica.mp3", title: "Sporepedia Galactica", artist: "Spore", cover: "/assets/img/music/Spore.webp" },
  ],

	};

	function getPlaylistKey(){
	  const k = localStorage.getItem(PLAYLIST_KEY) || "main";
	  return (k in PLAYLISTS) ? k : "main";
	}

	let activePlaylistKey = getPlaylistKey();

	function getActivePlaylist(){
	  return PLAYLISTS[activePlaylistKey] || PLAYLISTS.main;
	}


// --- Helpers (internal)

function extractWebampVolume01_(state){
  // Try common paths first
  try{
    const candidates = [
      state?.media?.volume,
      state?.media?.status?.volume,
      state?.media?.volumeValue,
      state?.player?.volume,
      state?.volume
    ];
    for (const c of candidates){
      const n = Number(c);
      if (Number.isFinite(n) && n >= 0 && n <= 100) return n / 100;
      if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
    }
  }catch(_){}

  // Fallback: search for a numeric key named "volume" in the state tree (shallow-first).
  const seen = new Set();
  const q = [state];
  while (q.length){
    const cur = q.shift();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur)) continue;
    seen.add(cur);

    for (const k of Object.keys(cur)){
      const v = cur[k];
      if (k.toLowerCase() === "volume"){
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0 && n <= 100) return n / 100;
        if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
      }
      if (v && typeof v === "object") q.push(v);
    }
  }
  return null;
}

function silenceWebampAudio_(webamp){
  // Try to find and suspend any AudioContexts referenced from the Webamp instance.
  // This prevents double-audio even if Webamp volume is >0 (for shared volume UI).
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const seen = new Set();
    const stack = [webamp];
    let suspended = 0;

    while (stack.length){
      const obj = stack.pop();
      if (!obj || typeof obj !== "object") continue;
      if (seen.has(obj)) continue;
      seen.add(obj);

      // Direct instance
      if (obj instanceof AudioCtx){
        try { obj.suspend && obj.suspend(); suspended++; } catch(_) {}
        continue;
      }

      for (const key of Object.keys(obj)){
        const v = obj[key];
        if (!v || (typeof v !== "object" && typeof v !== "function")) continue;
        // Avoid traversing huge DOM trees
        if (v instanceof Element || v instanceof Document || v instanceof Window) continue;
        stack.push(v);
      }
    }

    // If we couldn't suspend anything, fall back to muting by volume (not shared-safe).
    // We do NOT enforce it continuously; it is only a last resort.
    if (suspended === 0){
      try { if (webamp.setVolume) webamp.setVolume(0); } catch(_) {}
    }
  }catch(_){}
}


;


	function esc(str){
	  return String(str).replace(/[&<>\"']/g, s => ({
	    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
	  }[s]));
	}

	function syncPlaylistUI(){
	  const sel = $("npPlaylist");
	  if (!sel) return;

	  const keys = Object.keys(PLAYLIST_META).filter(k => k in PLAYLISTS);

	  sel.innerHTML = keys.map(k => {
	    const label = PLAYLIST_META[k]?.label || k;
	    return `<option value="${esc(k)}">${esc(label)}</option>`;
	  }).join("");

	  sel.value = activePlaylistKey;
	}

	function setActivePlaylist(key, { autoplay = null, resetIndex = true } = {}){
	  const nextKey = (key in PLAYLISTS) ? key : "main";
	  activePlaylistKey = nextKey;
	  localStorage.setItem(PLAYLIST_KEY, nextKey);

	  const pl = getActivePlaylist();

	  if (!pl.length){
	    idx = 0;
	    if (audio){
	      audio.pause();
	      audio.removeAttribute("src");
	    }
	    syncPlaylistUI();
	    return;
	  }

	  if (resetIndex) idx = 0;

	  const shouldAutoplay =
	    (autoplay === null) ? (audio ? !audio.paused : false) : !!autoplay;

	  setTrack(idx, { autoplay: shouldAutoplay });
	  syncPlaylistUI();
	}

	/* =========================
	   AUDIO + UI getters
	   ========================= */
	const audio = $("audioSide");

	// =========================
  // Shrine-only music override (per-shrine track)
	// =========================
  const SHRINE_MUSIC_OVERRIDES = {
    nijika: {
      src: "assets/audio/lostkitten.mp3",
      title: "MY LOST KITTEN  •  Nijika Shrine",
    },
    isabelle: {
      src: "assets/audio/towntree.mp3",
      title: "Town Tree  •  Animal Crossing: New Leaf",
    },
  };

  let shrineMusicOverrideState = null;

  function startShrineMusicOverride(shrineId){
	  if (!audio) return;

    const id = String(shrineId || "").toLowerCase();
    const cfg = SHRINE_MUSIC_OVERRIDES[id];

    if (!cfg){
      stopShrineMusicOverride({ restore: true });
      return;
    }

    if (shrineMusicOverrideState && shrineMusicOverrideState.shrineId === id) {
      // already active for this shrine
	    audio.play().catch(()=>{});
	    return;
	  }

    if (!shrineMusicOverrideState){
      // Snapshot current playback state so we can restore it when leaving/closing shrine viewer.
      shrineMusicOverrideState = {
        shrineId: id,
        playlistKey: (typeof activePlaylistKey !== "undefined") ? activePlaylistKey : null,
        idx: (typeof idx !== "undefined") ? idx : 0,
        src: audio.currentSrc || audio.getAttribute("src") || "",
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        paused: !!audio.paused,
        loop: !!audio.loop,
      };
    } else {
      shrineMusicOverrideState.shrineId = id;
    }

	  try{ audio.pause(); }catch(_e){}
	  try{ audio.currentTime = 0; }catch(_e){}
	  audio.loop = true;
	  // Use a relative URL resolved against the current page to work both on domain root and subpaths.
    audio.src = new URL(cfg.src, window.location.href).toString();
	  try{ audio.load(); }catch(_e){}
	  audio.play().catch(()=>{});

	  // Best-effort label in the mini Apple player.
	  const appleTitle = document.querySelector("#playerWin .songtitle");
    if (appleTitle) appleTitle.textContent = cfg.title;
	}

  function stopShrineMusicOverride({ restore = true } = {}){
    if (!audio || !shrineMusicOverrideState) return;
    const prev = shrineMusicOverrideState;
    shrineMusicOverrideState = null;

	  try{ audio.pause(); }catch(_e){}
	  audio.loop = prev.loop;

	  if (!restore){
	    try{ audio.removeAttribute("src"); audio.load(); }catch(_e){}
	    try{ syncPlayButtons(); }catch(_e){}
	    return;
	  }

	  // Prefer restoring via the playlist engine (keeps UI state consistent) if possible.
	  const canRestorePlaylist = prev.playlistKey && (typeof setActivePlaylist === "function") && (typeof setTrack === "function");
	  if (canRestorePlaylist){
	    try{ setActivePlaylist(prev.playlistKey, { autoplay: false, resetIndex: false }); }catch(_e){}
	    try{ setTrack(prev.idx || 0, { autoplay: false }); }catch(_e){}
	
	    const restoreTime = () => {
	      try{ audio.currentTime = prev.currentTime; }catch(_e){}
	      if (!prev.paused) audio.play().catch(()=>{});
	      try{ syncPlayButtons(); }catch(_e){}
	    };
	
	    // Ensure currentTime restore doesn't throw before metadata is ready.
	    audio.addEventListener("loadedmetadata", restoreTime, { once: true });
	    // Fallback in case metadata is already available.
	    if (audio.readyState >= 1) restoreTime();
	    return;
	  }

	  // Fallback: restore raw src.
	  if (prev.src){
	    audio.src = prev.src;
	    try{ audio.load(); }catch(_e){}
	
	    const restoreTime = () => {
	      try{ audio.currentTime = prev.currentTime; }catch(_e){}
	      if (!prev.paused) audio.play().catch(()=>{});
	      try{ syncPlayButtons(); }catch(_e){}
	    };
	    audio.addEventListener("loadedmetadata", restoreTime, { once: true });
	    if (audio.readyState >= 1) restoreTime();
	  } else {
	    try{ audio.removeAttribute("src"); audio.load(); }catch(_e){}
	    try{ syncPlayButtons(); }catch(_e){}
	  }
	}

  let nowPlayingEls = null;
  let nowPlayingVolEls = null;

  function invalidateNowPlayingCache(){
    nowPlayingEls = null;
    nowPlayingVolEls = null;
  }

  const np = () => {
    if (nowPlayingEls) return nowPlayingEls;
    nowPlayingEls = {
      cover: $("npCover"),
      title: $("npTitle"),
      artist: $("npArtist"),
      cur: $("npCur"),
      dur: $("npDur"),
      seek: $("npSeek"),
      play: $("npPlay"),
      prev: $("npPrev"),
      next: $("npNext"),
    };
    return nowPlayingEls;
  };

  function npVolUI(){
    if (nowPlayingVolEls) return nowPlayingVolEls;
    nowPlayingVolEls = { vol: $("npVol"), pct: $("npVolPct") };
    return nowPlayingVolEls;
  }

	function fmtTime(t){
	  if (!isFinite(t) || t < 0) return "0:00";
	  const m = Math.floor(t / 60);
	  const s = Math.floor(t % 60);
	  return `${m}:${String(s).padStart(2,"0")}`;
	}

	function applyVolume(v, { persist=true } = {}){
	  userVolume = clamp01(v);
	  if (audio) audio.volume = userVolume;
	  if (persist) localStorage.setItem(VOL_KEY, String(userVolume));

	  const pct = Math.round(userVolume * 100) + "%";
	  const ui = npVolUI();
	  if (ui.vol && document.activeElement !== ui.vol) ui.vol.value = String(Math.round(userVolume * 100));
	  if (ui.pct) ui.pct.textContent = pct;
	}

	// init volume
	if (audio) audio.volume = userVolume;
	applyVolume(userVolume, { persist:false });

	/* =========================
	   TRACK STATE
	   ========================= */
	let idx = 0;

	function setTrack(i, { autoplay=false } = {}){
	  if (!audio) return;

	  const pl = getActivePlaylist();
	  if (!pl.length){
	    audio.pause();
	    audio.removeAttribute("src");
	    return;
	  }

	  idx = (i + pl.length) % pl.length;
	  const tr = pl[idx];

	  audio.src = tr.file;
	  audio.load();

	  const ui = np();
	  if (ui.title) ui.title.textContent = tr.title || tr.file;
	  if (ui.artist) ui.artist.textContent = tr.artist || "";
	  if (ui.cover) ui.cover.src = tr.cover || "img/cover.jpg";

	  // Apple player title sync (+ playlist name)
	  const appleTitle = document.querySelector("#playerWin .songtitle");
	  if (appleTitle){
	    const plName = PLAYLIST_META[activePlaylistKey]?.label || activePlaylistKey;
	    appleTitle.textContent = `${tr.title || "—"}${tr.artist ? " — " + tr.artist : ""}  •  ${plName}`;
	  }

	  if (autoplay) audio.play().catch(()=>{});
	}

	function syncPlayButtons(){
	  if (!audio) return;
	  const playing = !audio.paused;

    const apple = getApplePlayerEls();

	  const ui = np();
	  if (ui.play) ui.play.textContent = playing ? "❚❚" : "▶";
	  if (ui.cover) ui.cover.classList.toggle("isPlaying", playing);

    const applePlay = apple.play;
	  if (applePlay){
	    applePlay.classList.remove("fa-play","fa-pause");
	    applePlay.classList.add(playing ? "fa-pause" : "fa-play");
	  }
	}

  const APPLE_PLAYER_SEL = {
    cur: "#playerWin .current-time",
    dur: "#playerWin .total-duration",
    seek: "#playerWin .seek_slider",
    play: "#playerWin .playpause-track",
  };
  let applePlayerEls = null;

  function getApplePlayerEls(){
    if (applePlayerEls) return applePlayerEls;
    applePlayerEls = {
      cur: document.querySelector(APPLE_PLAYER_SEL.cur),
      dur: document.querySelector(APPLE_PLAYER_SEL.dur),
      seek: document.querySelector(APPLE_PLAYER_SEL.seek),
      play: document.querySelector(APPLE_PLAYER_SEL.play),
    };
    return applePlayerEls;
  }

	function syncTimes(){
	  if (!audio) return;
    const apple = getApplePlayerEls();

	  const cur = audio.currentTime || 0;
	  const dur = audio.duration || 0;

	  const ui = np();
	  if (ui.cur) ui.cur.textContent = fmtTime(cur);
	  if (ui.dur) ui.dur.textContent = fmtTime(dur);

	  const v1000 = dur ? Math.round((cur / dur) * 1000) : 0;
	  if (ui.seek && document.activeElement !== ui.seek) ui.seek.value = String(v1000);

	  // Apple times + seek (0..100)
    const aCur  = apple.cur;
    const aDur  = apple.dur;
    const aSeek = apple.seek;

	  if (aCur) aCur.textContent = fmtTime(cur);
	  if (aDur) aDur.textContent = fmtTime(dur);

	  if (aSeek && document.activeElement !== aSeek){
	    const v100 = dur ? Math.round((cur / dur) * 100) : 0;
	    aSeek.value = String(v100);
	  }
	}

	/* =========================
	   AUDIO EVENTS: show/hide + sync
	   ========================= */

	audio?.addEventListener("play", () => {
	  showPlayerIfNeeded();
	  syncPlayButtons();
	});

	audio?.addEventListener("pause", () => {
	  syncPlayButtons();
	  if (!playerAutopin) setPlayerVisible(false);
	});

	audio?.addEventListener("timeupdate", syncTimes);
	audio?.addEventListener("loadedmetadata", syncTimes);

	audio?.addEventListener("ended", () => {
	  setTrack(idx + 1, { autoplay:true });
	});

	/* =========================
	   NOW PLAYING (when Music app opens)
	   ========================= */

	function bindNowPlayingControls(){
	  const ui = np();
	  if (!ui.play || ui.play.dataset.bound === "1") return;

	  ui.play.dataset.bound = "1";
	  ui.prev && (ui.prev.dataset.bound = "1");
	  ui.next && (ui.next.dataset.bound = "1");
	  ui.seek && (ui.seek.dataset.bound = "1");

	  // playlist select (render + bind)
	  syncPlaylistUI();
	  const sel = $("npPlaylist");
	  if (sel && sel.dataset.bound !== "1"){
	    sel.dataset.bound = "1";
	    sel.addEventListener("change", () => {
	      setActivePlaylist(sel.value, { autoplay: null, resetIndex:true });
	    });
	  }

	  ui.play.addEventListener("click", () => {
	    if (!audio) return;
	    if (audio.paused) audio.play().catch(()=>{});
	    else audio.pause();
	  });

	  ui.prev?.addEventListener("click", () => {
	    setTrack(idx - 1, { autoplay: audio ? !audio.paused : false });
	  });

	  ui.next?.addEventListener("click", () => {
	    setTrack(idx + 1, { autoplay: audio ? !audio.paused : false });
	  });

	  ui.seek?.addEventListener("input", () => {
	    if (!audio) return;
	    const dur = audio.duration || 0;
	    if (!dur) return;
	    audio.currentTime = (Number(ui.seek.value) / 1000) * dur;
	  });

	  const vUI = npVolUI();
	  if (vUI.vol && vUI.vol.dataset.bound !== "1"){
	    vUI.vol.dataset.bound = "1";
	    vUI.vol.addEventListener("input", () => applyVolume(Number(vUI.vol.value) / 100));
	  }

	  // refresh UI now
	  const pl = getActivePlaylist();
	  const tr = pl[idx] || pl[0];
	  if (tr){
	    ui.title && (ui.title.textContent = tr.title || tr.file);
	    ui.artist && (ui.artist.textContent = tr.artist || "");
	    ui.cover && (ui.cover.src = tr.cover || "img/cover.jpg");
	  }

	  applyVolume(userVolume, { persist:false });
	  syncPlayButtons();
	  syncTimes();
	}

	/* =========================
	   APPLE PLAYER: seek input -> shared audio
	   ========================= */
  getApplePlayerEls().seek?.addEventListener("input", (e) => {
	  if (!audio) return;
	  const dur = audio.duration || 0;
	  if (!dur) return;
	  audio.currentTime = (Number(e.target.value) / 100) * dur;
	});

	/* =========================
	   EXPOSE functions used in Apple HTML
	   ========================= */
	window.playpauseTrack = function(){
	  if (!audio) return;
	  if (audio.paused) audio.play().catch(()=>{});
	  else audio.pause();
	};

	window.nextTrack = function(){
	  setTrack(idx + 1, { autoplay: audio ? !audio.paused : false });
	};

	window.prevTrack = function(){
	  setTrack(idx - 1, { autoplay: audio ? !audio.paused : false });
	};

	window.volumeUp = function(){
	  applyVolume(userVolume + 0.2);
	};

	window.volumeDown = function(){
	  applyVolume(userVolume - 0.2);
	};

	window.seekTo = function(){
    const slider = getApplePlayerEls().seek;
	  if (!audio || !slider) return;
	  const dur = audio.duration || 0;
	  if (!dur) return;
	  audio.currentTime = (Number(slider.value) / 100) * dur;
	};


    // =========================
    // Settings picker sheet
    // =========================
    function setSwitchState(el, on){
      if (!el) return;
      el.classList.toggle("isOn", !!on);
    }

    function openPicker(type){
      // Mount to the full Settings screen so the sheet doesn't scroll with content.
      const host = document.querySelector(".screen.isSettingsScreen");
      if (!host) return;

      const existing = host.querySelector(".settingsPicker");
      if (existing) existing.remove();

      const curTheme = html.getAttribute("data-theme") || "dsi";
      const curWall = localStorage.getItem(WALL_KEY) || "1";

      let inner = "";
      if (type === "theme"){
        inner = `
          <div class="spTitle">Theme</div>
          <div class="spGrid" role="list">
            ${THEMES.map(t => {
              const cfg = BG_STYLE_BY_THEME[t.key] || BG_STYLE_BY_THEME._default;
              const isVideo = !!cfg.video;
              const bgColor = cfg.color || "transparent";
              const bgImg = (cfg.img && cfg.img !== "none") ? cfg.img : "none";
              const bgRepeat = cfg.repeat || "no-repeat";
              const bgPos = cfg.position || "center";
              const bgSize = cfg.size || "cover";
              const active = t.key === curTheme;

              return `
                <button
                  class="spCard${active ? " isActive" : ""}"
                  type="button"
                  data-set-theme="${t.key}"
                  aria-pressed="${active ? "true" : "false"}"
                  role="listitem"
                >
                  <div class="spThumb" style="background-color:${escapeHtml(bgColor)}; background-image:${escapeHtml(bgImg)}; background-repeat:${escapeHtml(bgRepeat)}; background-position:${escapeHtml(bgPos)}; background-size:${escapeHtml(bgSize)};">
                    ${isVideo ? `<video class=\"spThumbVid\" muted playsinline autoplay loop preload=\"metadata\" src=\"${escapeHtml(cfg.video)}\"></video>` : ""}
                  </div>
                  <div class="spLabel">${escapeHtml(t.label)}</div>
                  <span class="spSelected" aria-hidden="true">${active ? "✓" : ""}</span>
                </button>
              `;
            }).join("")}
          </div>
        `;
      } else {
        inner = `
          <div class="spTitle">Wallpaper</div>
          <div class="spGrid" role="list">
            ${Object.keys(WALLPAPERS).map(k => {
              const active = k === curWall;
              return `
                <button
                  class="spCard${active ? " isActive" : ""}"
                  type="button"
                  data-set-wall="${k}"
                  aria-pressed="${active ? "true" : "false"}"
                  role="listitem"
                >
                  <div class="spThumb">
                    <img class="spThumbImg" src="/assets/img/phone/wallpaper${escapeHtml(k)}.jpg" alt="${escapeHtml(labelWallpaper(k))}" loading="lazy">
                  </div>
                  <div class="spLabel">${escapeHtml(labelWallpaper(k))}</div>
                  <span class="spSelected" aria-hidden="true">${active ? "✓" : ""}</span>
                </button>
              `;
            }).join("")}
          </div>
        `;
      }

      const picker = document.createElement("div");
      picker.className = "settingsPicker";
      picker.innerHTML = `
        <div class="spSheet">
          ${inner}
        </div>
      `;
      host.appendChild(picker);
      picker.addEventListener("click", (e) => { if (e.target === picker) picker.remove(); });

      picker.querySelectorAll("[data-set-theme]").forEach(btn => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-set-theme");
          applyTheme(key);
          $("themeRowValue") && ($("themeRowValue").textContent = getThemeLabel(key));
          picker.remove();
        });
      });

      picker.querySelectorAll("[data-set-wall]").forEach(btn => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-set-wall");
          applyWallpaper(key);
          $("wallRowValue") && ($("wallRowValue").textContent = labelWallpaper(key));
          picker.remove();
        });
      });
    }



    // =========================
    // Status.cafe (Atom) -> Journal
    // =========================

    const STATUSCAFE_ATOM_DEFAULT_USER = "tosutosu";
    const SC_ATOM_CACHE_TTL_MS = 60 * 1000;

    function scLinkify(escapedText){
      // expects escaped input
      return String(escapedText).replace(/(https?:\/\/[^\s<]+)/g, (m) => {
        return `<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`;
      });
    }

    function scFormatDate(iso){
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("pl-PL", { day:"2-digit", month:"2-digit", year:"numeric" });
    }

    async function scFetchStatusCafeAtom(user){
      const cacheKey = `tosuOS_sc_atom_cache_${user}`;
      try{
        const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        if (cached && (Date.now() - cached.ts) < SC_ATOM_CACHE_TTL_MS && Array.isArray(cached.items)){
          return cached.items;
        }
      }catch(_){ }

      const url = `https://status.cafe/users/${encodeURIComponent(user)}.atom`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Atom HTTP ${res.status}`);
      const xml = await res.text();

      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const entries = Array.from(doc.getElementsByTagName("entry"));

      const items = entries.map((e) => {
        const contentEl = e.getElementsByTagName("content")[0];
        const publishedEl = e.getElementsByTagName("published")[0];
        const updatedEl = e.getElementsByTagName("updated")[0];

        const rawContent = (contentEl && contentEl.textContent) ? contentEl.textContent.trim() : "";
        const iso = (publishedEl && publishedEl.textContent) ? publishedEl.textContent : ((updatedEl && updatedEl.textContent) ? updatedEl.textContent : "");

        // Safe HTML: escape -> linkify -> preserve new lines
        const text = rawContent; // czysty tekst, bez escape
        const safe = scLinkify(escapeHtml(rawContent)).replaceAll("\n", "<br>");

        return {
          title: "status.cafe",
          date: scFormatDate(iso),
          html: safe,
        };
      });

      try{
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), items }));
      }catch(_){ }

      return items;
    }

    function scRenderJournalFromItems(items, user){
      const list = document.getElementById("scJournalList");
      const loading = document.getElementById("scJournalLoading");
      const error = document.getElementById("scJournalError");
      const meta = document.getElementById("scJournalMeta");

      if (meta) meta.textContent = `status.cafe: @${user}`;
      if (loading) loading.style.display = "none";
      if (error) error.style.display = "none";
      if (!list) return;

      if (!items || !items.length){
        list.innerHTML = `<div style="padding: 12px 2px; font-size: 13px; color: var(--setSub);">No statuses found.</div>`;
        return;
      }

		list.innerHTML = items.map((it) => `
		  <div class="journalEntry" style="background: var(--setCard); border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid var(--setStroke); cursor: pointer;">
		
		    <!-- Header: DATE instead of 'status.cafe' -->
		    <div class="jeTitle" style="font-weight:700; font-size:16px; margin-bottom:6px; color:var(--setText);">
		      ${it.date}
		    </div>
		
		    <!-- Preview ONLY (no date anywhere else) -->
		    <div class="jePreview" style="font-size:14px; line-height:1.4; color:var(--setSub); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
		      ${it.html}
		    </div>
		
		    <!-- Keep full content for viewer -->
		    <div class="jeContent" style="display:none;">${it.html}</div>
		
		    <!-- Optional: keep a hidden jeDate so existing viewer code doesn't break -->
		    <div class="jeDate" style="display:none;">${it.date}</div>
		  </div>
		`).join("");

    }

    async function scLoadJournalFromAtom(user){
      const loading = document.getElementById("scJournalLoading");
      const error = document.getElementById("scJournalError");
      const meta = document.getElementById("scJournalMeta");

      if (meta) meta.textContent = `status.cafe: @${user}`;
      if (loading) loading.style.display = "";
      if (error) error.style.display = "none";

      try{
        const items = await scFetchStatusCafeAtom(user);
        scRenderJournalFromItems(items, user);
      }catch(err){
        if (loading) loading.style.display = "none";
        if (error){
          error.style.display = "";
          error.textContent = `Could not load status.cafe Atom (${String(err && err.message ? err.message : err)})`;
        }
      }
    }

    // =========================
    // APP HOOKS
    // =========================

    const DOWNLOADS_FALLBACK = [
      {
        id: "minecraft-compromise",
        title: "Minecraft Compromise",
        thumb: "https://static.planetminecraft.com/files/resource_media/screenshot/16670565-obraz_thumb.jpg",
        thumbAlt: "Minecraft Compromise resource pack preview",
        version: "26.1 and below",
        url: "https://www.planetminecraft.com/texture-pack/minecraft-compromise-4303464/",
        visitLabel: "Visit",
        visitAria: "Visit Minecraft Compromise on PlanetMinecraft",
        desc: "Vanilla-style resource pack that blends the modern look with a touch of classic Minecraft: more programmer-art patterns, nostalgic UI tweaks and a mix of old/new sounds.",
        fine: "Updated Mar 24, 2026 • 16x • Texture/Resource pack",
        visible: true,
        referrerPolicy: "no-referrer",
      },
      {
        id: "monikai",
        title: "Monikai",
        url: "https://github.com/xtosutosu/monikai",
        visitLabel: "GitHub",
        visitAria: "Open Monikai on GitHub",
        desc: "Source code repository for Monikai.",
        fine: "GitHub repository",
        visible: true,
      },
    ];

    const SHRINES_FALLBACK = [
      {
        id: "nijika",
        barLabel: "NIJIKA",
        barBg: "#000080",
        cardTitle: "NIJIKA - BOCCHI THE ROCK!",
        thumb: "/assets/img/shrine/nijika/the-nijika-pledge.webp",
        thumbStyle: "height: 64px; object-fit: contain; image-rendering: pixelated;",
        title: "THE NIJIKA PLEDGE",
        contentHtml: "<p>MY LOST KITTEN • Nijika Shrine</p>",
        visible: true,
      },
      {
        id: "animal-crossing",
        barLabel: "Animal Crossing",
        barBg: "#800000",
        cardTitle: "Animal Crossing",
        thumb: "🐇️",
        title: "Animal Crossing",
        contentHtml: "<p>PRESENT DAY, PRESENT TIME</p>",
        visible: false,
      },
      {
        id: "retro",
        barLabel: "OLD_PC.BMP",
        barBg: "#004000",
        cardTitle: "RETRO",
        thumb: "💾",
        title: "RETRO HARDWARE",
        contentHtml: "<p>Collecting plastic memories.</p>",
        visible: false,
      },
      {
        id: "web",
        barLabel: "WWW.HTML",
        barBg: "#400040",
        cardTitle: "WEB",
        thumb: "🌐",
        title: "OLD WEB",
        contentHtml: "<p>Reject modernity, embrace HTML 1.0</p>",
        visible: false,
      },
    ];

    const REVIEWS_FALLBACK = [
      { id: "nge", title: "Neon Genesis Evangelion", cat: "anime", tier: "S", desc: "I hate the fact that I relate to half the characters there :( but it is a masterpiece", body: "I hate the fact that I relate to half the characters there :( but it is a masterpiece" },
      { id: "nier-automata", title: "Nier: Automata", cat: "game", tier: "S", desc: "For the glory of mankind.", body: "For the glory of mankind." },
      { id: "blade-runner-2049", title: "Blade Runner 2049", cat: "movie", tier: "S", desc: "I have rewatched this movie like 16 times now.", body: "I have rewatched this movie like 16 times now." },
      { id: "serial-experiments-lain", title: "Serial Experiments Lain", cat: "anime", tier: "S", desc: "Present day, present time.", body: "Present day, present time." },
      { id: "cyberpunk-2077", title: "Cyberpunk 2077", cat: "game", tier: "S", desc: "Had a rough launch and broken promises but it managed to become one of best time great games in the end.", body: "Had a rough launch and broken promises but it managed to become one of best time great games in the end." },
      { id: "iphone-5", title: "iPhone 5", cat: "tech", tier: "S", desc: "Peak Apple design. Any other SE iPhone user knows that.", body: "Peak Apple design. Any other SE iPhone user knows that." },
      { id: "minecraft", title: "Minecraft", cat: "game", tier: "C", desc: "Great game plagued by lackluster updates and many unaddressed issues.", body: "Great game plagued by lackluster updates and many unaddressed issues." },
      { id: "sony-walkman", title: "Sony Walkman", cat: "tech", tier: "A", desc: "I have a very fond memory of charging my Walkman before school trips.", body: "I have a very fond memory of charging my Walkman before school trips." },
    ];

    const APP_DATA_CACHE = {
      downloads: null,
      shrines: null,
      reviews: null,
    };

    const APP_DATA_CACHE_TS = {
      downloads: 0,
      shrines: 0,
      reviews: 0,
    };

    const APP_DATA_PENDING = {
      downloads: null,
      shrines: null,
      reviews: null,
    };

    const APP_DATA_TTL_MS = 2 * 60 * 1000;
    const DOWNLOADS_URL = new URL("assets/data/downloads.json", window.location.href).toString();
    const SHRINES_URL = new URL("assets/data/shrines.json", window.location.href).toString();
    const REVIEWS_URL = new URL("assets/data/reviews.json", window.location.href).toString();
    const POETRY_URL = new URL("assets/data/poetry.json", window.location.href).toString();

    const SAFARI_FILTER_KEY = "tosuOS_safari_filter";
    const SAFARI_DB = [
      {
        id:"lion",
        name:"Lion",
        group:"mammals",
        image:"/assets/img/phone/safari/lion.jpg",
        sound:"/assets/audio/animals/lion.mp3",
        where:"Savannah",
        vibe:"Regal and loud",
        fact:"A pride can include up to ~30 lions."
      },
      {
        id:"elephant",
        name:"Elephant",
        group:"mammals",
        image:"/assets/img/phone/safari/elephant.jpg",
        sound:"/assets/audio/animals/elephant.mp3",
        where:"Savannah",
        vibe:"Gentle tank",
        fact:"Their trunks have ~40,000 muscles."
      },
      {
        id:"giraffe",
        name:"Giraffe",
        group:"mammals",
        image:"/assets/img/phone/safari/giraffe.jpg",
        sound:"/assets/audio/animals/giraffe.mp3",
        where:"Savannah",
        vibe:"Tallest friend",
        fact:"A giraffe’s tongue can be ~45 cm long."
      },
      {
        id:"zebra",
        name:"Zebra",
        group:"mammals",
        image:"/assets/img/phone/safari/zebra.jpg",
        sound:"/assets/audio/animals/zebra.mp3",
        where:"Plains",
        vibe:"Barcode horse",
        fact:"Their stripe patterns are unique like fingerprints."
      },
      {
        id:"cheetah",
        name:"Cheetah",
        group:"mammals",
        image:"/assets/img/phone/safari/cheetah.jpg",
        sound:"/assets/audio/animals/cheetah.mp3",
        where:"Open grassland",
        vibe:"Built for speed",
        fact:"Cheetahs are the fastest land animals."
      },
      {
        id:"hippo",
        name:"Hippo",
        group:"weird",
        image:"/assets/img/phone/safari/hippo.jpg",
        sound:"/assets/audio/animals/hippo.mp3",
        where:"Rivers & lakes",
        vibe:"Looks chill, isn’t",
        fact:"Hippos can run surprisingly fast on land."
      },
      {
        id:"rhino",
        name:"Rhino",
        group:"mammals",
        image:"/assets/img/phone/safari/rhino.jpg",
        sound:"/assets/audio/animals/rhino.mp3",
        where:"Grassland",
        vibe:"Armored bulldozer",
        fact:"A rhino horn is made of keratin (like hair/nails)."
      },
      {
        id:"croc",
        name:"Crocodile",
        group:"reptiles",
        image:"/assets/img/phone/safari/croc.jpg",
        sound:"/assets/audio/animals/croc.mp3",
        where:"Rivers",
        vibe:"Prehistoric patience",
        fact:"Crocodiles can go weeks without eating."
      },
      {
        id:"flamingo",
        name:"Flamingo",
        group:"birds",
        image:"/assets/img/phone/safari/flamingo.jpg",
        sound:"/assets/audio/animals/flamingo.mp3",
        where:"Wetlands",
        vibe:"Pink icon",
        fact:"Their pink color comes from their diet."
      },
      {
        id:"eagle",
        name:"Eagle",
        group:"birds",
        image:"/assets/img/phone/safari/eagle.jpg",
        sound:"/assets/audio/animals/eagle.mp3",
        where:"Cliffs & skies",
        vibe:"Air superiority",
        fact:"Eagles have excellent long-distance vision."
      },
      {
        id:"ostrich",
        name:"Ostrich",
        group:"birds",
        image:"/assets/img/phone/safari/ostrich.jpg",
        sound:"/assets/audio/animals/ostrich.mp3",
        where:"Savannah",
        vibe:"No-fly sprinter",
        fact:"Ostriches are the largest living birds."
      },
      {
        id:"meerkat",
        name:"Meerkat",
        group:"weird",
        image:"/assets/img/phone/safari/meerkat.jpg",
        sound:"/assets/audio/animals/meerkat.mp3",
        where:"Desert burrows",
        vibe:"Full-time lookout",
        fact:"Meerkats take turns acting as sentries."
      },
    ];

    const SAFARI_AUDIO = new Audio();
    SAFARI_AUDIO.preload = "auto";
    SAFARI_AUDIO.volume = 0.9;

    async function loadNormalizedList({ key, url, normalize, fallback, tag }){
      const now = Date.now();
      const hasFreshCache = Array.isArray(APP_DATA_CACHE[key]) && (now - APP_DATA_CACHE_TS[key]) < APP_DATA_TTL_MS;
      if (hasFreshCache) return APP_DATA_CACHE[key];

      if (APP_DATA_PENDING[key]) return APP_DATA_PENDING[key];

      APP_DATA_PENDING[key] = (async () => {
        try{
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const json = await res.json();
          if (!Array.isArray(json)) throw new Error("Invalid JSON");

          const normalized = json.map(normalize).filter(Boolean);
          APP_DATA_CACHE[key] = normalized;
          APP_DATA_CACHE_TS[key] = Date.now();
          return normalized;
        }catch(err){
          console.warn(`[${tag}] failed to load JSON, using fallback`, err);
          const fallbackList = Array.isArray(fallback) ? fallback.slice() : [];
          APP_DATA_CACHE[key] = fallbackList;
          APP_DATA_CACHE_TS[key] = Date.now();
          return fallbackList;
        }finally{
          APP_DATA_PENDING[key] = null;
        }
      })();

      return APP_DATA_PENDING[key];
    }

function wireAppHooks(appId){

	  // TOYS
	  if (appId === "toys"){
	    unlockToyShelf();
	    renderToyShelf();
	    renderPhoneToyGrid();
	    updateToyUI();
	  }

      // DOWNLOADS (LINKS)
      if (appId === "links"){
        const list = document.getElementById("downloadsList");
        const hint = document.getElementById("downloadsHint");

        const downloadSlugify = (text) => String(text || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        function normalizeDownload(raw){
          if (!raw || typeof raw !== "object") return null;

          const title = String(raw.title || raw.name || "").trim();
          const url = String(raw.url || raw.href || "").trim();
          if (!title || !url) return null;

          const id = String(raw.id || downloadSlugify(title)).trim() || downloadSlugify(title) || "download-item";
          const thumb = String(raw.thumb || raw.image || "").trim();
          const thumbAlt = String(raw.thumbAlt || raw.alt || `${title} preview`).trim();
          const version = String(raw.version || raw.badge || "").trim();
          const visitLabel = String(raw.visitLabel || "Visit").trim() || "Visit";
          const visitAria = String(raw.visitAria || `Visit ${title}`).trim();
          const desc = String(raw.desc || raw.description || "").trim();
          const fine = String(raw.fine || raw.meta || "").trim();
          const visible = raw.visible !== false;
          const referrerPolicy = String(raw.referrerPolicy || "no-referrer").trim() || "no-referrer";

          return { id, title, thumb, thumbAlt, version, url, visitLabel, visitAria, desc, fine, visible, referrerPolicy };
        }

        function renderDownloads(items){
          if (!list) return;

          const visible = Array.isArray(items)
            ? items.filter(item => item.visible === true)
            : [];

          if (!visible.length){
            list.innerHTML = "";
            if (hint) hint.textContent = "No downloads yet.";
            return;
          }

          list.innerHTML = visible.map((item) => {
            const thumbHtml = item.thumb
              ? `<img class="dlThumb" src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.thumbAlt)}" loading="lazy" referrerpolicy="${escapeHtml(item.referrerPolicy)}" />`
              : `<div class="dlThumb" aria-hidden="true"></div>`;

            const versionHtml = item.version
              ? `<span class="dlBadge" title="Target version">${escapeHtml(item.version)}</span>`
              : "";

            const descHtml = item.desc
              ? `<p class="dlDesc">${escapeHtml(item.desc)}</p>`
              : "";

            const fineHtml = item.fine
              ? `<div class="dlFine">${escapeHtml(item.fine)}</div>`
              : "";

            return `
              <article class="dlCard" data-download-id="${escapeHtml(item.id)}">
                ${thumbHtml}
                <div class="dlMeta">
                  <div class="dlTitleRow">
                    <h3 class="dlTitle">${escapeHtml(item.title)}</h3>
                    ${versionHtml}
                    <a class="dlVisit" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener" aria-label="${escapeHtml(item.visitAria)}">${escapeHtml(item.visitLabel)}</a>
                  </div>
                  ${descHtml}
                  ${fineHtml}
                </div>
              </article>
            `;
          }).join("");

          if (hint) hint.textContent = "More coming soon!";
        }

        async function loadDownloads(){
          if (hint) hint.textContent = "Loading downloads...";

          const normalized = await loadNormalizedList({
            key: "downloads",
            url: DOWNLOADS_URL,
            normalize: normalizeDownload,
            fallback: DOWNLOADS_FALLBACK,
            tag: "downloads",
          });

          renderDownloads(normalized.length ? normalized : DOWNLOADS_FALLBACK);
        }

        loadDownloads();
      }

      // GALLERY HOOKS
      if (appId === "gallery"){
          const grid = document.getElementById("galleryGrid");
          const viewer = document.getElementById("galleryViewer");
          const viewerImg = document.getElementById("galleryViewerImg");
          const backBtn = document.getElementById("galleryBack");

          if (grid && grid.dataset.bound !== "1"){
            grid.dataset.bound = "1";
            // Delegation keeps one listener even if the gallery grows.
            grid.addEventListener("click", (event) => {
              const item = event.target.closest(".galItem");
              if (!item || !grid.contains(item)) return;

              const img = item.querySelector("img");
              if(img && viewer && viewerImg){
                viewerImg.src = img.src;
                viewer.style.display = "flex";
                viewer.classList.add("open"); // Opcjonalnie do animacji
              }
            });
          }

          // Zamknięcie
          backBtn?.addEventListener("click", () => {
              if(viewer) viewer.style.display = "none";
          });
      }

      // NOTES
      if (appId === "notes"){
        const area = document.getElementById("myNotesArea");
        const backBtn = document.getElementById("notesBack");
        const KEY = "tosuOS_user_notes";

        // Back button -> Home
        backBtn?.addEventListener("click", () => {
            setScreenOriginPct(50, 92);
            setState({ view:"home" });
        });

        if (area){
          // Wczytaj zapisane notatki
          area.value = localStorage.getItem(KEY) || "";

          // Zapisz przy każdej zmianie
          area.addEventListener("input", () => {
             localStorage.setItem(KEY, area.value);
          });
        }
      }

      // JOURNAL (BLOG) - status.cafe Atom + Viewer Logic
      if (appId === "blog"){
        const list = document.getElementById("scJournalList");
        const viewer = document.getElementById("journalViewer");
        const jvTitle = document.getElementById("jvTitle");
        const jvDate = document.getElementById("jvDate");
        const jvBody = document.getElementById("jvBody");
        const backBtn = document.getElementById("journalBack");

        // Load statuses
        scLoadJournalFromAtom(STATUSCAFE_ATOM_DEFAULT_USER);

        // Delegated click for dynamic entries
        if (list && list.dataset.bound !== "1"){
          list.dataset.bound = "1";
          list.addEventListener("click", (e) => {
            const entry = e.target.closest(".journalEntry");
            if (!entry) return;

            const title = entry.querySelector(".jeTitle")?.textContent || "";
            const date = entry.querySelector(".jeDate")?.textContent || "";
            const content = entry.querySelector(".jeContent")?.innerHTML || "";

            if(viewer && jvTitle && jvDate && jvBody){
              jvTitle.textContent = title;
              jvDate.textContent = date;
              jvBody.innerHTML = content;
              viewer.style.display = "flex";
            }
          });
        }

        backBtn?.addEventListener("click", () => {
          if(viewer) viewer.style.display = "none";
        });
      }

      // SHRINE HOOKS
      if (appId === "shrine"){
        const grid = document.getElementById("shrineGrid");
        const empty = document.getElementById("shrineEmpty");
        const viewer = document.getElementById("shrineViewer");
        const svTitle = document.getElementById("svTitle");
        const svContent = document.getElementById("svContent");
        const closeBtn = document.getElementById("shrineClose");

        let shrineData = [];
        let shrineById = new Map();

        function slugify(text){
          return String(text || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        function normalizeShrine(raw){
          if (!raw || typeof raw !== "object") return null;

          const titleRaw = String(raw.title || raw.viewerTitle || raw.name || "").trim();
          const barLabel = String(raw.barLabel || raw.label || titleRaw || raw.cardTitle || "").trim();
          const cardTitle = String(raw.cardTitle || raw.subtitle || titleRaw || barLabel).trim();
          const id = String(raw.id || slugify(titleRaw || barLabel || cardTitle)).trim();

          if (!id) return null;

          const barBg = String(raw.barBg || raw.barColor || "#000080").trim();
          const barText = String(raw.barText || "#fff").trim();
          const thumb = raw.thumb ?? raw.icon ?? "";
          const thumbStyle = String(raw.thumbStyle || "").trim();
          const contentHtml = (typeof raw.contentHtml === "string")
            ? raw.contentHtml
            : (typeof raw.html === "string" ? raw.html : "");
          const content = (typeof raw.content === "string") ? raw.content : "";
          const title = titleRaw || barLabel || cardTitle || "SHRINE";
          const visible = raw.visible === true;

          return { id, title, barLabel, barBg, barText, cardTitle, thumb, thumbStyle, contentHtml, content, visible };
        }

        function isThumbImage(value){
          const v = String(value || "").trim();
          if (!v) return false;
          if (/^https?:/i.test(v)) return true;
          if (v.startsWith("/") || v.startsWith("assets/") || v.startsWith("./") || v.startsWith("../")) return true;
          return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(v);
        }

        function formatShrineText(text){
          return escapeHtml(text || "").replaceAll("\n", "<br>");
        }

        function renderShrines(list){
          if (!grid) return;
          const visible = Array.isArray(list)
            ? list.filter(item => item.visible === true)
            : [];

          if (visible.length === 0){
            grid.innerHTML = "";
            if (empty) empty.style.display = "block";
            return;
          }

          if (empty) empty.style.display = "none";

          grid.innerHTML = visible.map(item => {
            const barLabel = escapeHtml(item.barLabel || item.title || "SHRINE");
            const barBg = escapeHtml(item.barBg || "#000080");
            const barText = escapeHtml(item.barText || "#fff");
            const cardTitle = escapeHtml(item.cardTitle || item.title || "");
            const id = escapeHtml(item.id);
            const thumb = String(item.thumb || "");

            const thumbHtml = isThumbImage(thumb)
              ? `<img src="${escapeHtml(thumb)}" style="${escapeHtml(item.thumbStyle || "height: 64px; object-fit: contain; image-rendering: pixelated;")}">`
              : `<div style="font-size: 42px; line-height: 64px;">${escapeHtml(thumb || "★")}</div>`;

            return `
              <div class="shrineItem" data-shrine-id="${id}" style="border: 2px outset #ccc; background: #c0c0c0; padding: 3px; cursor: pointer;">
                <div style="background: ${barBg}; color: ${barText}; padding: 2px 4px; font-weight: bold; font-size: 10px; display: flex; justify-content: space-between;">
                  <span>${barLabel}</span><span>X</span>
                </div>
                <div style="padding: 8px; text-align: center; background: #fff; border: 2px inset #fff; margin-top: 2px;">
                  ${thumbHtml}
                  <div style="margin-top: 4px; font-weight: bold; color: #000; font-size: 11px;">${cardTitle}</div>
                </div>
              </div>
            `;
          }).join("");
        }

        function openShrine(item){
          if (!item || !viewer || !svTitle || !svContent) return;

          const content = item.contentHtml || formatShrineText(item.content || "");
          svTitle.textContent = item.title || "SHRINE";
          svContent.innerHTML = content;
          svContent.scrollTop = 0;
          viewer.style.display = "flex";

          startShrineMusicOverride(item.id);
        }

        async function loadShrines(){
          if (grid) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #666; font-size: 11px;">Loading shrines…</div>`;
          }

          const normalized = await loadNormalizedList({
            key: "shrines",
            url: SHRINES_URL,
            normalize: normalizeShrine,
            fallback: SHRINES_FALLBACK,
            tag: "shrines",
          });

          shrineData = normalized.length ? normalized : SHRINES_FALLBACK;

          const visibleShrines = shrineData.filter(item => item.visible === true);
          shrineById = new Map(visibleShrines.map(item => [item.id, item]));
          renderShrines(visibleShrines);
        }

        if (grid && grid.dataset.bound !== "1"){
          grid.dataset.bound = "1";
          grid.addEventListener("click", (event) => {
            const card = event.target.closest(".shrineItem");
            if (!card || !grid.contains(card)) return;
            const id = card.dataset.shrineId;
            const item = shrineById.get(id);
            if (!item) return;
            openShrine(item);
          });
        }

        if (closeBtn && closeBtn.dataset.bound !== "1"){
          closeBtn.dataset.bound = "1";
          closeBtn.addEventListener("click", () => {
            if (viewer) viewer.style.display = "none";
            stopShrineMusicOverride({ restore: true });
          });
        }

        loadShrines();
      }

	  // MUSIC
	  if (appId === "music"){
	    bindNowPlayingControls();
	    syncPlaylistUI();

	    document.getElementById("npHomeMini")?.addEventListener("click", () => {
	      setScreenOriginPct(50, 92);
	      setState({ view:"home" });
	    });
	  }

	  // REVIEWS
	  if (appId === "reviews"){
          const list = document.getElementById("reviewsList");
          const filters = document.querySelectorAll(".iosSegBtn");
          const viewer = document.getElementById("reviewViewer");
          const reviewBack = document.getElementById("reviewBack");
          const rvTitle = document.getElementById("rvTitle");
          const rvTier = document.getElementById("rvTier");
          const rvLead = document.getElementById("rvLead");
          const rvBody = document.getElementById("rvBody");

          const VALID_CATS = new Set(["anime", "movie", "game", "tech", "all"]);
          const VALID_TIERS = new Set(["S", "A", "B", "C", "D"]);

          const TIER_COLORS = {
              "S": "#ffcc00", // Gold
              "A": "#ff3b30", // Red
              "B": "#007aff", // Blue
              "C": "#4cd964", // Green
              "D": "#8e8e93"  // Gray
          };

          const formatReviewBody = (text) =>
              formatReviewMarkdown(text || "");

          function formatReviewMarkdown(text){
              let out = escapeHtml(text || "");

              // Images: ![alt](url)
              out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
                  const safeAlt = escapeHtml(alt || "");
                  const safeUrl = escapeHtml(url || "");
                  return `<img class="rvImg" src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;
              });

              // Links: [label](url)
              out = out.replace(/(^|[^!])\[(.+?)\]\(([^)]+)\)/g, (_m, pre, label, url) => {
                  const safeLabel = label || "";
                  const safeUrl = escapeHtml(url || "");
                  return `${pre}<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
              });

              // Bold **text**
              out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
              // Italic *text*
              out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");

              return out;
          }

          let reviewsData = [];
          let activeReviewFilter = "all";

          function slugify(text){
              return String(text || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
          }

          function normalizeReview(raw){
              if (!raw || typeof raw !== "object") return null;

              const title = String(raw.title || "").trim();
              if (!title) return null;

              const id = String(raw.id || slugify(title)).trim();
              const catRaw = String(raw.cat || raw.category || "all").toLowerCase();
              const cat = VALID_CATS.has(catRaw) ? catRaw : "all";

              const tierRaw = String(raw.tier || "C").toUpperCase();
              const tier = VALID_TIERS.has(tierRaw) ? tierRaw : "C";

              const desc = String(raw.desc || raw.subtitle || raw.lead || "").trim();
              const body = String(raw.body || raw.text || desc).trim();
              const bodyHtml = (typeof raw.bodyHtml === "string") ? raw.bodyHtml : (typeof raw.html === "string" ? raw.html : "");

              return { id, title, cat, tier, desc, body, bodyHtml };
          }

          async function loadReviews(){
              const normalized = await loadNormalizedList({
                key: "reviews",
                url: REVIEWS_URL,
                normalize: normalizeReview,
                fallback: REVIEWS_FALLBACK,
                tag: "reviews",
              });

              reviewsData = normalized.length ? normalized : REVIEWS_FALLBACK;

              renderReviews(activeReviewFilter);
              syncReviewFilters(activeReviewFilter);
          }

          function syncReviewFilters(filter){
              filters.forEach(btn => {
                  const isActive = btn.dataset.filter === filter;
                  btn.classList.toggle("active", isActive);
              });
          }

          function renderReviews(filter = activeReviewFilter){
              if(!list) return;

              activeReviewFilter = filter || "all";

              if (!reviewsData.length){
                  list.innerHTML = `<div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">Loading reviews…</div>`;
                  return;
              }

                const filtered = (filter === "all"
                  ? reviewsData
                  : reviewsData.filter(r => r.cat === filter)).slice();

              // Sort by Tier (S > A > B > C > D)
              const tierOrder = { "S":5, "A":4, "B":3, "C":2, "D":1 };
              filtered.sort((a,b) => tierOrder[b.tier] - tierOrder[a.tier]);

              if (filtered.length === 0) {
                  list.innerHTML = `<div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">No items found.</div>`;
                  return;
              }

              let html = `<div class="iosGroup">`;

              filtered.forEach((item, index) => {
                  const bg = TIER_COLORS[item.tier] || "#999";
                  html += `
                    <div class="iosRow" data-review-id="${item.id}">
                        <div class="iosRowMain">
                            <button class="iosRowTitle" type="button">${escapeHtml(item.title)}</button>
                            <div class="iosRowDesc">${escapeHtml(item.desc)}</div>
                        </div>
                        <div class="iosBadge" style="background:${bg}">${item.tier}</div>
                    </div>
                  `;
              });

              html += `</div>`;
              html += `<div style="text-align: center; color: #6d6d72; font-size: 12px; padding-bottom: 20px; text-shadow: 0 1px 0 #fff;">${filtered.length} Review${filtered.length !== 1 ? 's' : ''}</div>`;

              list.innerHTML = html;
          }

          renderReviews(activeReviewFilter);
          syncReviewFilters(activeReviewFilter);
          loadReviews();

          if (list && list.dataset.viewerBound !== "1"){
              list.dataset.viewerBound = "1";
              list.addEventListener("click", (event) => {
                  const row = event.target.closest(".iosRow");
                  if (!row || !list.contains(row)) return;
                  const reviewId = row.dataset.reviewId;
                  const item = reviewsData.find(r => r.id === reviewId);
                  if (!item || !viewer) return;

                  if (rvTitle) rvTitle.textContent = item.title;
                  if (rvTier){
                      const tier = String(item.tier || "").toUpperCase();
                      rvTier.textContent = tier;
                      rvTier.style.background = TIER_COLORS[tier] || "#999";
                      rvTier.style.display = tier ? "grid" : "none";
                  }
                  if (rvLead) rvLead.textContent = item.desc || "";
                  if (rvBody) rvBody.innerHTML = item.bodyHtml ? item.bodyHtml : formatReviewBody(item.body || item.desc);
                  viewer.style.display = "flex";
              });
          }

          reviewBack?.addEventListener("click", () => {
              if (viewer) viewer.style.display = "none";
          });

          filters.forEach(btn => {
              if (btn.dataset.reviewFilterBound === "1") return;
              btn.dataset.reviewFilterBound = "1";
              btn.addEventListener("click", () => {
                  const next = btn.dataset.filter || "all";
                  renderReviews(next);
                  syncReviewFilters(next);
                  if (viewer && viewer.style.display === "flex") viewer.style.display = "none";
              });
          });
      }

	  // SETTINGS
	  if (appId === "settings"){
	    const autoSw = document.getElementById("autopinToggle");
	    const airSw  = document.getElementById("airplaneToggle");
	    const nekoSw = document.getElementById("nekoToggle");

	    setSwitchState(autoSw, playerAutopin);
	    setSwitchState(airSw, false);
	    setSwitchState(nekoSw, webNekoEnabled);

	    const trv = document.getElementById("themeRowValue");
	    if (trv) trv.textContent = getThemeLabel(html.getAttribute("data-theme") || "dsi");

	    const wrv = document.getElementById("wallRowValue");
	    if (wrv) wrv.textContent = labelWallpaper(localStorage.getItem(WALL_KEY) || "1");

	    if (autoSw && autoSw.dataset.bound !== "1"){
	      autoSw.dataset.bound = "1";
	      autoSw.addEventListener("click", () => {
	        setAutopin(!playerAutopin);
	        setSwitchState(autoSw, playerAutopin);
	        if (!playerAutopin && audio && audio.paused) setPlayerVisible(false);
	      });
	    }

	    if (nekoSw && nekoSw.dataset.bound !== "1"){
	      nekoSw.dataset.bound = "1";
	      nekoSw.addEventListener("click", () => {
	        setWebNekoEnabled(!webNekoEnabled);
	        setSwitchState(nekoSw, webNekoEnabled);
	      });
	    }

	    if (airSw && airSw.dataset.bound !== "1"){
	      airSw.dataset.bound = "1";
	      airSw.addEventListener("click", () => {
	        const on = !airSw.classList.contains("isOn");
	        setSwitchState(airSw, on);
	      });
	    }

	    document.getElementById("themeRow")?.addEventListener("click", () => openPicker("theme"));
	    document.getElementById("wallRow")?.addEventListener("click", () => openPicker("wallpaper"));
	  }

	  if (appId === "phone"){
	    startIncomingCall();

	    document.getElementById("callDecline")?.addEventListener("click", () => {
	      stopIncomingCall();
	      stopActiveCall();
	      setScreenOriginPct(50, 92);
	      setState({ view:"home" });
	    });

	    document.getElementById("callAccept")?.addEventListener("click", () => {
	      stopIncomingCall();
	      startActiveCall();
	    });

	    document.getElementById("callEnd")?.addEventListener("click", () => {
	      stopIncomingCall();
	      stopActiveCall();
	      setScreenOriginPct(50, 92);
	      setState({ view:"home" });
	    });
	  }

	  // MESSAGES
	  if (appId === "messages"){
        // Keep Navbar title aligned with the current caller label
        const titleEl = document.querySelector(".appTitle");
        if(titleEl) titleEl.textContent = currentCallerName;

        // Handle Send
        const input = document.getElementById("iosMsgInput");
        const sendBtn = document.getElementById("iosMsgSendBtn");
        const list = document.getElementById("iosMsgList");

        function sendMsg(){
           const txt = input.value.trim();
           if(!txt) return;

           // User Bubble
           const row = document.createElement("div");
           row.className = "iosMsgRow right";
           row.innerHTML = `<div class="iosMsgBubble">${escapeHtml(txt)}</div>`;
           list.appendChild(row);

           input.value = "";
           list.scrollTop = list.scrollHeight;

           // Fake Reply
           setTimeout(() => {
               const rep = document.createElement("div");
               rep.className = "iosMsgRow left";
               // Random reply
               const replies = ["You will hear from me.", "I will be waiting."];
               const rText = replies[Math.floor(Math.random()*replies.length)];

               rep.innerHTML = `<div class="iosMsgBubble">${rText}</div>`;
               list.appendChild(rep);
               list.scrollTop = list.scrollHeight;
           }, 1500);
        }

        sendBtn?.addEventListener("click", sendMsg);
        input?.addEventListener("keydown", (e) => {
            if(e.key === "Enter") sendMsg();
        });
      }
	
      // SAFARI (NOT A BROWSER) — iOS 6 wildlife "presentation"
      if (appId === "safari"){
        const grid = document.getElementById("safariGrid");
        const empty = document.getElementById("safariEmpty");
        const search = document.getElementById("safariSearch");
        const clearBtn = document.getElementById("safariClear");

        const viewer = document.getElementById("safariViewer");
        const vBack  = document.getElementById("safariViewerBack");
        const vTitle = document.getElementById("safariViewerTitle");
        const vHero  = document.getElementById("safariHero");
        const vHeroName = document.getElementById("safariHeroName");
        const vWhereTag = document.getElementById("safariWhereTag");
        const vGroupTag = document.getElementById("safariGroupTag");
        const vWhere = document.getElementById("safariWhere");
        const vVibe  = document.getElementById("safariVibe");
        const vFact  = document.getElementById("safariFact");

        let activeFilter = "all";
        let activeAnimal = null;
        try { activeFilter = localStorage.getItem(SAFARI_FILTER_KEY) || "all"; } catch(e){}

        const filterBtns = Array.from(document.querySelectorAll("[data-safari-filter]"));

        function setActiveFilter(next){
          activeFilter = next || "all";
          try { localStorage.setItem(SAFARI_FILTER_KEY, activeFilter); } catch(e){}
          filterBtns.forEach(b => b.classList.toggle("active", b.getAttribute("data-safari-filter") === activeFilter));
          renderSafari();
        }

        function matchQuery(a, q){
          if (!q) return true;
          const hay = (a.name + " " + a.where + " " + a.vibe).toLowerCase();
          return hay.includes(q);
        }

        function groupLabel(group){
          switch(group){
            case "mammals": return "Mammal";
            case "birds": return "Bird";
            case "reptiles": return "Reptile";
            case "weird": return "Oddball";
            default: return "Wildlife";
          }
        }

        function markThumbReady(thumb, img){
          if (!thumb || !img) return;
          const markLoaded = () => thumb.classList.add("hasImage");
          const markError = () => {
            thumb.classList.remove("hasImage");
            try { img.remove(); } catch(e){}
          };

          if (img.complete && img.naturalWidth > 0){
            markLoaded();
          } else {
            img.addEventListener("load", markLoaded, { once:true });
            img.addEventListener("error", markError, { once:true });
          }
        }

        function wireThumbImages(){
          if (!grid) return;
          grid.querySelectorAll(".safariThumb").forEach((thumb) => {
            const img = thumb.querySelector(".safariThumbImg");
            markThumbReady(thumb, img);
          });
        }

        function setHeroImage(a){
          if (!vHero || !a) return;
          vHero.classList.remove("hasImage");
            vHero.innerHTML = `
              ${a.image ? `<img class="safariHeroImg" src="${escapeHtml(a.image)}" alt="" />` : ""}
            `;

          const img = vHero.querySelector(".safariHeroImg");
          if (!img) return;

          const markLoaded = () => vHero.classList.add("hasImage");
          const markError = () => {
            vHero.classList.remove("hasImage");
            try { img.remove(); } catch(e){}
          };

          if (img.complete && img.naturalWidth > 0){
            markLoaded();
          } else {
            img.addEventListener("load", markLoaded, { once:true });
            img.addEventListener("error", markError, { once:true });
          }
        }

        function playSafariSound(a){
          if (!a || !a.sound) return;
          try{
            SAFARI_AUDIO.pause();
            SAFARI_AUDIO.currentTime = 0;
            SAFARI_AUDIO.src = a.sound;
            const p = SAFARI_AUDIO.play();
            if (p && typeof p.catch === "function") p.catch(()=>{});
          }catch(_e){}
        }

        function renderSafari(){
          if (!grid) return;

          const q = (search?.value || "").trim().toLowerCase();
          const items = SAFARI_DB.filter(a =>
            (activeFilter === "all" || a.group === activeFilter) && matchQuery(a, q)
          );

          grid.innerHTML = items.map(a => `
            <button class="safariTile" type="button" data-safari-id="${escapeHtml(a.id)}">
              <div class="safariThumb" aria-hidden="true">
                ${a.image ? `<img class="safariThumbImg" src="${escapeHtml(a.image)}" alt="" loading="lazy" decoding="async">` : ""}
              </div>
              <div class="safariTileMeta">
                <div class="safariTileTitle">${escapeHtml(a.name)}</div>
                <div class="safariTileSub">${escapeHtml(a.where)}</div>
              </div>
              <div class="safariChevron" aria-hidden="true">›</div>
            </button>
          `).join("");

          if (empty) empty.style.display = items.length ? "none" : "block";
          wireThumbImages();
        }

        function openViewer(id){
          const a = SAFARI_DB.find(x => x.id === id);
          if (!a || !viewer) return;

          activeAnimal = a;

          if (vTitle) vTitle.textContent = a.name;
          if (vHeroName) vHeroName.textContent = a.name;
          if (vWhereTag) vWhereTag.textContent = a.where;
          if (vGroupTag) vGroupTag.textContent = groupLabel(a.group);
          setHeroImage(a);
          if (vWhere) vWhere.textContent = a.where;
          if (vVibe)  vVibe.textContent  = a.vibe;
          if (vFact)  vFact.textContent  = a.fact;

          viewer.style.display = "flex";
          viewer.dataset.safariGroup = a.group || "all";
          viewer.classList.add("isOpen");
          playSafariSound(a);
        }

        function closeViewer(){
          activeAnimal = null;
          if (viewer){
            viewer.style.display = "none";
            viewer.classList.remove("isOpen");
          }
          try { SAFARI_AUDIO.pause(); } catch(_e){}
        }

        // Events
        filterBtns.forEach(btn => {
          btn.addEventListener("click", () => setActiveFilter(btn.getAttribute("data-safari-filter")));
        });

        search?.addEventListener("input", renderSafari);

        clearBtn?.addEventListener("click", () => {
          if (!search) return;
          search.value = "";
          search.focus();
          renderSafari();
        });

        grid?.addEventListener("click", (e) => {
          const tile = e.target.closest(".safariTile");
          if (!tile) return;
          openViewer(tile.getAttribute("data-safari-id"));
        });

        vBack?.addEventListener("click", closeViewer);
        viewer?.addEventListener("click", (e) => { if (e.target === viewer) closeViewer(); });

        // Init
        setActiveFilter(activeFilter);
        renderSafari();
      }

    if (appId === "poetry"){
      const list = document.getElementById("poetryList");
      const viewer = document.getElementById("poetryViewer");
      const backBtn = document.getElementById("poetryBack");
      const poetryViewerTitle = document.getElementById("poetryViewerTitle");
      const poetryFolder = document.getElementById("poetryFolder");
      const poetryDate = document.getElementById("poetryDate");
      const poetryTitle = document.getElementById("poetryTitle");
      const poetryContent = document.getElementById("poetryContent");

      let poetryData = [];
      let currentFolder = null;

      function escapeText(text){
        return String(text ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function formatPoetryDate(value){
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      function folderLabel(item){
        return item?.name || item?.folder || "Folder";
      }

      function poemRow(poem, nested){
        const row = document.createElement("button");
        row.type = "button";
        row.style.cssText = [
          "display:flex",
          "align-items:center",
          "gap:8px",
          "width:100%",
          "padding:8px 10px",
          "border:0",
          "border-bottom:1px solid #303030",
          "background:#000",
          "color:#0f0",
          "text-align:left",
          "font:inherit",
          "cursor:pointer",
        ].join(";");
        row.onmouseenter = () => row.style.background = "#000080";
        row.onmouseleave = () => row.style.background = "#000";
        row.innerHTML = `${nested ? "<span style=\"opacity:.7\">└─</span>" : "<span>📄</span>"}<span>${escapeText(poem.title || "Untitled")}</span>`;
        row.addEventListener("click", () => showPoem(poem, currentFolder));
        return row;
      }

      function showPoem(poem, folder){
        if (!viewer) return;
        viewer.style.display = "flex";
        poetryViewerTitle.textContent = poem.title || "Poetry";
        poetryFolder.textContent = folder ? `Folder: ${folderLabel(folder)}` : "";
        poetryFolder.style.display = folder ? "block" : "none";
        poetryDate.textContent = poem.date ? `Written: ${formatPoetryDate(poem.date)}` : "Written: —";
        poetryTitle.textContent = poem.title || "Untitled";
        if (poem.contentHtml){
          poetryContent.style.whiteSpace = "normal";
          poetryContent.innerHTML = poem.contentHtml;
        } else {
          poetryContent.style.whiteSpace = "pre-wrap";
          poetryContent.textContent = poem.content || poem.body || "";
        }
      }

      function renderRoot(){
        currentFolder = null;
        if (viewer) viewer.style.display = "none";
        if (!list) return;
        list.innerHTML = "";

        if (!poetryData.length){
          list.innerHTML = `<div style="padding:12px; color:#ff6666;">No poetry found.</div>`;
          return;
        }

        poetryData.forEach((entry) => {
          if (entry && entry.type === "folder"){
            const folderRow = document.createElement("button");
            folderRow.type = "button";
            folderRow.style.cssText = [
              "display:flex",
              "align-items:center",
              "gap:8px",
              "width:100%",
              "padding:9px 10px",
              "border:0",
              "border-bottom:1px solid #303030",
              "background:#001100",
              "color:#0f0",
              "text-align:left",
              "font:inherit",
              "cursor:pointer",
            ].join(";");
            folderRow.onmouseenter = () => folderRow.style.background = "#000080";
            folderRow.onmouseleave = () => folderRow.style.background = "#001100";
            folderRow.innerHTML = `<span>📁</span><span>${escapeText(folderLabel(entry))}</span><span style="margin-left:auto; color:#aaa;">${Array.isArray(entry.poems) ? entry.poems.length : 0}</span>`;
            folderRow.addEventListener("click", () => renderFolder(entry));
            list.appendChild(folderRow);
            return;
          }

          list.appendChild(poemRow(entry, false));
        });
      }

      function renderFolder(folder){
        currentFolder = folder;
        if (viewer) viewer.style.display = "none";
        if (!list) return;
        list.innerHTML = "";

        const backRow = document.createElement("button");
        backRow.type = "button";
        backRow.style.cssText = [
          "display:flex",
          "align-items:center",
          "gap:8px",
          "width:100%",
          "padding:9px 10px",
          "border:0",
          "border-bottom:1px solid #303030",
          "background:#000080",
          "color:#0f0",
          "text-align:left",
          "font:inherit",
          "cursor:pointer",
        ].join(";");
        backRow.innerHTML = `<span>↩</span><span>..</span>`;
        backRow.addEventListener("click", renderRoot);
        list.appendChild(backRow);

        const header = document.createElement("div");
        header.style.cssText = "padding:8px 10px; border-bottom:1px solid #303030; background:#001100; color:#0f0; font-weight:bold;";
        header.textContent = folderLabel(folder);
        list.appendChild(header);

        const poems = Array.isArray(folder.poems) ? folder.poems : [];
        if (!poems.length){
          const empty = document.createElement("div");
          empty.style.cssText = "padding:12px; color:#aaa;";
          empty.textContent = "No poems in this folder.";
          list.appendChild(empty);
          return;
        }

        poems.forEach((poem) => {
          list.appendChild(poemRow(poem, true));
        });
      }

      backBtn?.addEventListener("click", () => {
        if (currentFolder){
          renderFolder(currentFolder);
        } else {
          renderRoot();
        }
      });

      async function loadPoetry(){
        try {
          const res = await fetch(POETRY_URL, { cache: "no-store" });
          if (!res.ok) throw new Error("HTTP " + res.status);
          poetryData = await res.json();
          if (!Array.isArray(poetryData)) throw new Error("Poetry data is not an array");
          renderRoot();
        } catch (err){
          console.warn("[poetry] failed to load JSON", err);
          if (list) list.innerHTML = `<div style="padding:12px; color:#ff6666;">Error loading poetry: ${escapeText(err.message)}</div>`;
        }
      }

      loadPoetry();
    }

	  // CAMERA
	  if (appId === "camera"){
	    const backBtn = document.getElementById("camBack");
	    const shutter = document.getElementById("camShutter");
	    const view = document.getElementById("camView");

	    backBtn?.addEventListener("click", () => {
	      setScreenOriginPct(50, 92);
	      setState({ view:"home" });
	    });

	    shutter?.addEventListener("click", () => {
	      if (!view) return;
	      view.classList.add("isSnap");
	      setTimeout(() => view.classList.remove("isSnap"), 120);
	    });
	  }

}

	// start
	initFromHash();
	window.addEventListener("hashchange", initFromHash);


    // Picker CSS
    const style = document.createElement("style");
    style.textContent = `
      .settingsPicker{
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.22);
        display:flex;
        align-items:flex-end;
        justify-content:center;
        padding: 10px;
      }
      .spSheet{
        width: 100%;
        border-radius: 22px;
        border: 1px solid var(--setStroke);
        background: var(--setCard);
        box-shadow: 0 18px 60px rgba(0,0,0,.22);
        padding: 12px;
      }
      .spTop{ display:flex; justify-content:flex-end; margin-bottom: 6px; }
      .spClose{
        border: 1px solid var(--setStroke);
        background: color-mix(in srgb, var(--setCard) 85%, transparent);
        border-radius: 14px;
        padding: 8px 10px;
        font: 12px/1 var(--mono);
        color: var(--setText);
        cursor:pointer;
      }
      .spTitle{ font-weight: 950; font-size: 14px; margin: 4px 2px 10px; color: var(--setText); }
      .spList{
        display:flex;
        flex-direction:column;
        border-radius: 18px;
        overflow:hidden;
        border: 1px solid color-mix(in srgb, var(--setStroke) 75%, transparent);
      }
      .spItem{
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding: 12px;
        border: none;
        background: transparent;
        color: var(--setText);
        cursor:pointer;
        font: 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      .spItem + .spItem{ border-top: 1px solid color-mix(in srgb, var(--setStroke) 75%, transparent); }
      .spMark{ font-weight: 950; opacity:.8; }
    `;
    document.head.appendChild(style);

	// init
	setTrack(0, { autoplay:false });
	syncPlayButtons();
	syncTimes();
	applyTheme(html.getAttribute("data-theme") || "dsi");
	applyVolume(userVolume, { persist:false });

	if (audio) {
	  audio.muted = true;
	  audio.play().then(() => {
	    audio.muted = false;
	    applyVolume(userVolume, { persist:false });
	    showPlayerIfNeeded();
	    syncPlayButtons();
	  }).catch(() => {
	    audio.muted = false;
	    applyVolume(userVolume, { persist:false });
	  });
	}

	document.addEventListener("pointerdown", () => {
	  if (!audio || !audio.paused) return;
	  audio.play().catch(()=>{});
	}, { once:true });

    /* =========================
       WIN98 WIDGETS (Unified Loader)
       Fixes: Duplication, Centering, White Bar
       ========================= */
	function initWin98Widget(config) {
	  const { id, frameId, fallbackId, title, contentHtml, styles } = config;
	  const host = document.getElementById(id);
	  const frame = document.getElementById(frameId);
	  const fallback = document.getElementById(fallbackId);

	  if (!host || !frame) return;

	  // Safe base href
	  let baseHref = "";
	  try { baseHref = new URL(".", location.href).href; } catch(e){}

	  const src = `<!doctype html>
	  <html lang="en">
	  <head>
	    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
	    ${baseHref ? `<base href="${baseHref}">` : ""}
        <link rel="stylesheet" href="https://unpkg.com/98.css">
	    <style>
	      html, body { margin:0; padding:0; background: transparent !important; overflow: hidden; }

	      .window {
            display: block;
            width: 100%;
            box-sizing: border-box;
            margin: 0;
          }

	      .window-body {
            /* Domyślny padding, nadpisywany w configu */
            padding: 3px;
            margin: 0;
          }

	      /* Kursor */
		  html, body, a, button, input{
		    cursor: url("/assets/cursors/win-cursor.cur") 0 0, auto;
		  }
		
		  a, button{
		    cursor: url("/assets/cursors/win-pointer.cur") 0 0, pointer;
		  }

	      ${styles}
	    
/* =====================================================================
   NAVBAR + SETTINGS THEME FIX (single source of truth; token-driven)
   ===================================================================== */

/* 1) Settings in Pixel/Miku/Dusk should NOT force dark UI
   (dark Settings remains only for html[data-theme="dark"]) */
html[data-theme="pixel"],
html[data-theme="dusk"]{
  --setBg: rgba(245,245,247,1);
  --setCard: #ffffff;
  --setStroke: rgba(0,0,0,.10);
  --setText: #111111;
  --setSub: rgba(17,17,17,.55);
}

/* 2) Disable legacy ::before navbar chrome hacks (they were fighting each other) */
.appTopbar::before{
  content: none !important;
  display: none !important;
}

/* 3) Navbar tokens */
:root{
  /* Settings navbar (light) */
  --navSettingsBg: linear-gradient(to bottom, #b0c4de 0%, #88abc0 50%, #7295b0 51%, #6d8bb8 100%);
  --navSettingsBorder: #2d3f55;
  --navSettingsShadow: 0 1px 0 rgba(255,255,255,.35) inset, 0 1px 2px rgba(0,0,0,.25);

  /* Music navbar (always silver) */
  --navMusicBg: linear-gradient(to bottom, #f2f2f2 0%, #d1d1d1 50%, #b8b8b8 51%, #a6a6a6 100%);
  --navMusicBorder: #666;
  --navMusicShadow: 0 1px 0 rgba(255,255,255,.40) inset, 0 1px 2px rgba(0,0,0,.25);

  /* Default navbar (base theme) */
  --navBg: var(--navSettingsBg);
  --navBorder: var(--navSettingsBorder);
  --navShadow: var(--navSettingsShadow);

  --navTitleColor: #fff;
  --navTitleShadow: 0 -1px 0 rgba(0,0,0,.45);

  /* Back button (default: keep current “glass + blue label” look) */
  --navBackBg: rgba(0,0,0,.18);
  --navBackBorder: rgba(255,255,255,.22);
  --navBackColor: var(--accent);
  --navBackShadow: inset 0 1px 0 rgba(255,255,255,.16);
  --navBackTextShadow: none;
}

/* Dark theme: Settings navbar becomes dark (only when data-theme="dark") */
html[data-theme="dark"],html[data-theme="miku"],html[data-theme="milk"]{
  --navSettingsBg: linear-gradient(to bottom, #3a3a3c 0%, #2c2c2e 50%, #1f1f20 51%, #111111 100%);
  --navSettingsBorder: #000;
  --navSettingsShadow: 0 1px 0 rgba(255,255,255,.10) inset, 0 1px 2px rgba(0,0,0,.55);

  /* Default navbar in dark theme follows Settings chrome */
  --navBg: var(--navSettingsBg);
  --navBorder: var(--navSettingsBorder);
  --navShadow: var(--navSettingsShadow);

  --navTitleColor: #fff;
  --navTitleShadow: 0 -1px 0 rgba(0,0,0,.55);

  --navBackBg: rgba(255,255,255,.08);
  --navBackBorder: rgba(255,255,255,.18);
  --navBackColor: #0a84ff;
  --navBackShadow: inset 0 1px 0 rgba(255,255,255,.12);
  --navBackTextShadow: none;
}

/* Pixel / Miku / Dusk: distinctive navbars for apps (but NOT Settings / Music) */
html[data-theme="pixel"]{
  --navBg:
    repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 6px, rgba(0,0,0,.12) 6px 12px),
    linear-gradient(to bottom, #5d6a7a 0%, #2e3642 50%, #1d2330 51%, #121722 100%);
  --navBorder: rgba(0,0,0,.65);
  --navShadow: 0 1px 0 rgba(255,255,255,.18) inset, 0 1px 2px rgba(0,0,0,.35);
  --navTitleColor: #fff;
  --navTitleShadow: 0 2px 0 rgba(0,0,0,.55);
}

html[data-theme="miku"],html[data-theme="milk"]{
  --navBg: linear-gradient(to bottom, rgba(10,10,14,.88) 0%, rgba(0,0,0,.96) 100%);
  --navBorder: rgba(0,0,0,.85);
  --navShadow:
    0 0 14px rgba(0,255,255,.22),
    0 0 10px rgba(255,0,255,.18),
    0 1px 0 rgba(255,255,255,.10) inset,
    0 1px 2px rgba(0,0,0,.45);
  --navTitleColor: #e9fbff;
  --navTitleShadow: 0 0 8px rgba(0,255,255,.35);
}

html[data-theme="dusk"]{
  --navBg: linear-gradient(to bottom, #5b4c86 0%, #3b2f66 50%, #2a214d 51%, #181335 100%);
  --navBorder: rgba(0,0,0,.75);
  --navShadow: 0 1px 0 rgba(255,255,255,.14) inset, 0 1px 2px rgba(0,0,0,.45);
  --navTitleColor: #fff;
  --navTitleShadow: 0 1px 0 rgba(0,0,0,.55);
}

/* App-specific navbar token overrides */
.screen.isSettingsScreen{
  --navBg: var(--navSettingsBg);
  --navBorder: var(--navSettingsBorder);
  --navShadow: var(--navSettingsShadow);
  --navTitleColor: #fff;
  --navTitleShadow: 0 -1px 0 rgba(0,0,0,.45);
}

.screen.isMusicScreen{
  --navBg: var(--navMusicBg);
  --navBorder: var(--navMusicBorder);
  --navShadow: var(--navMusicShadow);
  --navTitleColor: #444;
  --navTitleShadow: 0 1px 0 rgba(255,255,255,.80);

  /* Match existing Music back button style */
  --navBackBg: linear-gradient(to bottom, #9ea8b5 0%, #687788 50%, #56687e 51%, #4b5e75 100%);
  --navBackBorder: #2d3f55;
  --navBackColor: #fff;
  --navBackShadow: inset 0 1px 0 rgba(255,255,255,.20);
  --navBackTextShadow: 0 -1px 0 rgba(0,0,0,.50);
}

/* Apply navbar tokens */
.appTopbar{
  background: var(--navBg) !important;
  border-bottom: 1px solid var(--navBorder) !important;
  box-shadow: var(--navShadow) !important;

  /* Cover the status bar without pseudo-elements */
  margin-top: calc(-1 * var(--sbH)) !important;
  height: calc(var(--navH) + var(--sbH)) !important;
  padding-top: var(--sbH) !important;
}

.appTitle{
  color: var(--navTitleColor) !important;
  text-shadow: var(--navTitleShadow) !important;
}

.backBtn{
  background: var(--navBackBg) !important;
  border-color: var(--navBackBorder) !important;
  color: var(--navBackColor) !important;
  box-shadow: var(--navBackShadow) !important;
  text-shadow: var(--navBackTextShadow) !important;
}

</style>
	  </head>
	  <body>
        <!-- Wrap style is crucial for correct height calculation -->
	    <div id="wrap" style="display:inline-block; width:100%;">
	      <div class="window">
	        <div class="title-bar">
	          <div class="title-bar-text">${title}</div>
	          <div class="title-bar-controls"><button aria-label="Close" disabled></button></div>
	        </div>
	        <div class="window-body">${contentHtml}</div>
	      </div>
	    </div>
	    <script>
	      function notify(){
	        const w = document.getElementById("wrap");
	        if(w) parent.postMessage({ type: "${id}:resize", h: w.offsetHeight }, "*");
	      }
	      window.addEventListener("load", () => {
             notify();
             setTimeout(notify, 100);
             setTimeout(notify, 500);
          });
	      if("ResizeObserver" in window) new ResizeObserver(notify).observe(document.getElementById("wrap"));
	    <\/script>
	  </body></html>`;

	  frame.srcdoc = src;

	  let ready = false;
	  function markReady(){
	    if(ready) return;
        ready=true;
	    host.classList.add("isReady");
	    if(fallback) fallback.style.display="none";
	  }

    window.addEventListener("message", (e) => {
      if (e.source !== frame.contentWindow) return;
      if(e.data && e.data.type === `${id}:resize`){
         const h = Number(e.data.h);
         if(isFinite(h) && h>0) { frame.style.height = h + "px"; markReady(); }
      }
    });

      // Fallback
	  frame.addEventListener("load", () => setTimeout(markReady, 800));
	  setTimeout(() => { if(!ready) markReady(); }, 2000);
	}

	// 1. SETUP BUTTONS
	initWin98Widget({
	  id: "buttons98Win",
	  frameId: "buttons98Frame",
	  fallbackId: "buttonsFallback",
	  title: "Buttons.exe",
	  styles: `
	    .btnGrid {
            display:grid;
            grid-template-columns:repeat(3, 88px);
            gap:8px;
            padding: 6px;
            justify-content:center;
        }
	    .btnGrid a { display:block; }
	    img { width:88px!important; height:31px!important; display:block; image-rendering:pixelated; }
	  `,
	  contentHtml: `
		  <div class="btnGrid">
		    <span><img src="/assets/img/site_buttons/www.gif" alt="WWW"></span>
		    <span><img src="/assets/img/site_buttons/bestvwmonitor.gif" alt="Best"></span>
		    <span><img src="/assets/img/site_buttons/css.gif" alt="CSS"></span>
		    <span><img src="/assets/img/site_buttons/internetarchive.gif" alt="Archive"></span>
		    <span><img src="/assets/img/site_buttons/mobile.gif" alt="Mobile"></span>
		
		    <a href="https://nekoweb.org" target="_blank" rel="noopener noreferrer">
		      <img src="/assets/img/site_buttons/nekoweb.gif" alt="Neko">
		    </a>
		
		    <span><img src="/assets/img/site_buttons/gloober.png" alt="gloober"></span>
		    <span><img src="/assets/img/site_buttons/aperture.jpg" alt="aperture"></span>
		    <span><img src="/assets/img/site_buttons/minecraft.jpg" alt="MC"></span>
		    <span><img src="/assets/img/site_buttons/rainworld.png" alt="RW"></span>
		    <span><img src="/assets/img/site_buttons/wow_wow.gif" alt="Wow"></span>
		
		    <a href="https://status.cafe" target="_blank" rel="noopener noreferrer">
		      <img src="https://status.cafe/assets/button.png" alt="Status Cafe">
		    </a>
		    <span><img src="/assets/img/site_buttons/milk-button.png" alt="Milk"></span>
		  </div>
		
		  <div style="width:100%; text-align:center;">
		    tosutosu.nekoweb.org © 2025 - forever ♡
		  </div>
	  `
	});

	// 2. SETUP STAMPS
	const stampsList = [
	   {s:"/assets/img/stamps/madoka-stamp.gif",a:"Madoka"}, {s:"/assets/img/stamps/miku-stamp.png",a:"Miku"}, {s:"/assets/img/stamps/stamp_3d.gif",a:"3D"},
	   {s:"/assets/img/stamps/stamp_tf2.gif",a:"TF2"}, {s:"/assets/img/stamps/stamp_tamagotchicolors.gif",a:"Tama"}, {s:"/assets/img/stamps/INFJstamp.png",a:"INFJ"},
	   {s:"/assets/img/stamps/sai.gif",a:"SAI"}, {s:"/assets/img/stamps/bliss_stamp.png",a:"Bliss"}
	];
	const stampsHtml = stampsList.map(x => `<img src="${x.s}" alt="${x.a}">`).join("") + stampsList.map(x => `<img src="${x.s}" alt="${x.a}">`).join("");

	initWin98Widget({
	  id: "stamps98Win",
	  frameId: "stamps98Frame",
	  fallbackId: "stampsFallback",
	  title: "Stamps.exe",
	  styles: `
        .window-body { padding: 0px !important; }

	    .stampTrack img { width:99px!important; height:56px!important; display:block; }
	    .stampMarquee {
            overflow:hidden;
            /* Maska gradientowa */
            -webkit-mask-image: linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);
        }
	    .stampTrack { display:flex; gap:8px; padding: 6px; width:max-content; animation:scroll 14s linear infinite; }
	    .stampMarquee:hover .stampTrack { animation-play-state:paused; }
	    @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
	  `,
	  contentHtml: `<div class="stampMarquee"><div class="stampTrack">${stampsHtml}</div></div>`
	});

	// 3. SETUP ABOUT
	initWin98Widget({
	  id: "about98Win",
	  frameId: "about98Frame",
	  fallbackId: null,
	  title: "ABOUT me.exe",
	  styles: `
	    .window-body{ padding:8px !important; }
	    .aboutWrap{ display:grid; grid-template-columns:70px 1fr; gap:10px; align-items:start; }
	    .aboutAvatar{ width:70px; height:70px; border:1px solid #808080; background:#fff; object-fit:cover; }
	    .aboutName{ font-weight:700; margin:0 0 2px; }
	    .aboutMeta{ margin:0 0 8px; color:#404040; }
	    .aboutBio{ margin:0 0 6px; line-height:1.3; }
	    .sep{ margin:6px 0; }
	    ul{ margin:6px 0 0; padding-left:18px; }
	    li{ margin:6px 0; }
	    .tip{ margin-top:10px; padding:8px; border:1px solid #808080; background:#fff; font-size:12px; }
	  `,
	  contentHtml: `
	    <div class="aboutWrap">
	      <img class="aboutAvatar" src="/assets/img/milkchan.gif" alt="Avatar">
	      <div>
	        <div class="aboutName">tosu</div>
	        <div class="aboutMeta">INFJ 4w5 • 25+</div>
	        <div class="aboutBio">Welcome to my corner of the Internet. Using the phone on the right will take you to all of the places I've created.<br><br>Navigate using the apps, I think you know how to use a phone, after all, do you guys not have phones?</div>
	      </div>
	    </div>
	    <hr class="sep">
	    <div><b>What to Check Out</b></div>
	    <ul>
	      <li><b>Music Player</b> contains some of my favorite tracks ever. You can select some of my work too.</li>
	      <li><b>Reviews</b> are dedicated to some good games and movies I have experienced.</li>
	      <li>Check out <b>Toys</b> for some desktop companions c:</li>
	      <li>Please feel free to leave a note in my <b>Guestbook</b>, I will truly appreciate it.</li>
	    </ul>
	    <div class="tip">Some of the phone apps open in new tabs, it is mostly for my socials.</div><br>
	    <iframe src="https://nekoweb.org/frame/follow" frameborder="0" height="28"></iframe>
	  `
	});


	// =========================
	// Last.fm pill (no iframe)
	// =========================
	function initLastfmPill(){
	  const pill = document.getElementById("lastfmPill");
	  const inner = document.getElementById("lastfmInner");
	  const link = document.getElementById("lastfmLink");
	  if (!pill || !inner || !link) return;

	  const USERNAME = "tosutosu";
	  const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${encodeURIComponent(USERNAME)}/latest-song`;

	  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
	    "&":"&amp;",
	    "<":"&lt;",
	    ">":"&gt;",
	    '"':"&quot;",
	    "'":"&#39;",
	  }[c]));

	  async function getTrack(){
	    try{
	      const req = await fetch(BASE_URL, { cache: "no-store" });
	      if (!req.ok) throw new Error("HTTP " + req.status);
	      const json = await req.json();
	      const track = json?.track;
	      if (!track) throw new Error("No track");

	      const isPlaying = track["@attr"]?.nowplaying === "true";
	      const title = track.name || "Unknown";
	      const artist = track.artist?.["#text"] || "Unknown";
	      const cover = track.image?.[1]?.["#text"] || track.image?.[0]?.["#text"] || "";
	      const url = track.url || `https://www.last.fm/user/${USERNAME}`;

	      link.href = url;

	      inner.innerHTML = `
	        <div class="lfmRow">
	          ${cover ? `<img class="lfmCover" src="${esc(cover)}" alt="">` : ``}
	          <div class="lfmMeta">
	            <div class="lfmState">${isPlaying ? "tosu is now listening to:" : "tosu was recently listening to:"}</div>
	            <div class="lfmTitle">${esc(title)}</div>
	            <div class="lfmArtist">${esc(artist)}</div>
	          </div>
	        </div>
	      `;
	    }catch(e){
	      link.href = `https://www.last.fm/user/${USERNAME}`;
	      inner.innerHTML = `<div class="lfmSkeleton">Accessing last.fm...</div>`;
	    }
	  }

    const LASTFM_POLL_MS = 15000;
    let pollId = null;

    function stopPolling(){
      if (!pollId) return;
      clearInterval(pollId);
      pollId = null;
    }

    function startPolling(){
      if (pollId) return;
      pollId = setInterval(() => {
        if (document.hidden) return;
        getTrack();
      }, LASTFM_POLL_MS);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden){
        stopPolling();
        return;
      }
      getTrack();
      startPolling();
    });

    getTrack();
    startPolling();
	}

	initLastfmPill();


	const navHome = document.getElementById("navHome");
	const navBack = document.getElementById("navBack");

	// Hardware hitbox
	const hwHomeHit = document.getElementById("hwHomeHit");

	function goHome(originEl){
	  if (originEl) {
	    setScreenOriginFromEl(originEl);
	  } else {
	    setScreenOriginPct(50, 92);
	  }
	  setState({ view: "home" });
	}

	navHome?.addEventListener("click", (e) => {
	  e.preventDefault();
	  goHome(navHome);
	});

	navBack?.addEventListener("click", (e) => {
	  e.preventDefault();
	});

	hwHomeHit?.addEventListener("click", (e) => {
	  e.preventDefault();
	  e.stopPropagation();
	  goHome(hwHomeHit);
	});

	function initNekowebStats(){
	  const domain = "tosutosu.nekoweb.org"; // <- ustaw tu swoją domenę
	
	  const set = (id, html) => {
	    const el = document.getElementById(id);
	    if (el) el.innerHTML = html;
	  };
	
	  (async () => {
	    try {
	      const request = await fetch(`https://nekoweb.org/api/site/info/${encodeURIComponent(domain)}`, {
	        cache: "no-store"
	      });
	      if (!request.ok) throw new Error("HTTP " + request.status);
	
	      const json = await request.json();
	
	      const updated = new Date(json.updated_at).toLocaleDateString();
	      const created = "12/12/2025";
	
	      set("created",   `<em>Created</em>: ${created}`);
	      set("updated",   `<em>Updated</em>: ${updated}`);
	      set("visitors",  `<em>Unique Visits</em>: ${json.views}`);
	      set("followers", `<em>Followers</em>: ${json.followers}`);
	    } catch (error) {
	      console.warn("[nekoweb stats] failed", error);
	      // fallback
	      set("created",   `<em>Created</em>: —`);
	      set("updated",   `<em>Updated</em>: —`);
	      set("visitors",  `<em>Unique Visits</em>: —`);
	      set("followers", `<em>Followers</em>: —`);
	    }
	  })();
	}
	
	initNekowebStats();



	// =========================
	// Mobile drawers (left/right columns)
	// =========================
	function initMobileDrawers(){
	  const leftBtn = document.getElementById("mobileLeftBtn");
	  const rightBtn = document.getElementById("mobileRightBtn");
	  const shade = document.getElementById("mobileShade");
	  const b = document.body;

	  if (!leftBtn || !rightBtn || !shade) return;

	  function closeAll(){
	    b.classList.remove("mobile-left-open", "mobile-right-open");
	  }

	  leftBtn.addEventListener("click", () => {
	    const willOpen = !b.classList.contains("mobile-left-open");
	    closeAll();
	    if (willOpen) b.classList.add("mobile-left-open");
	  });

	  rightBtn.addEventListener("click", () => {
	    const willOpen = !b.classList.contains("mobile-right-open");
	    closeAll();
	    if (willOpen) b.classList.add("mobile-right-open");
	  });

	  shade.addEventListener("click", closeAll);

	  window.addEventListener("keydown", (e) => {
	    if (e.key === "Escape") closeAll();
	  });
	}

	initMobileDrawers();

  })();
