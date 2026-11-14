/* =========================================================
   RANAH SUMBAR — COMPLETE FRONT-END SCRIPT
   Destination data is loaded from data.js before this file.
   No category-wide substitute photos are used.
========================================================= */

(() => {
    "use strict";

    let regions = [];
    let destinations = [];

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    let revealObserver = null;

    /* =====================================================
       01. SAFE HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function safeURL(value) {
        if (!value) return "";
        try {
            const url = new URL(String(value), window.location.href);
            if (["https:", "http:"].includes(url.protocol)) return url.href;
            if (String(value).startsWith("assets/")) return String(value);
        } catch (error) {
            if (String(value).startsWith("assets/")) return String(value);
        }
        return "";
    }

    function getRegion(slug) {
        return regions.find(region => region.slug === slug) || null;
    }

    function getRegionName(slug) {
        return getRegion(slug)?.name || "Sumatera Barat";
    }

    function getImage(item) {
        // Intentionally no category fallback: a mismatched photo is worse than a placeholder.
        return safeURL(item?.image || "");
    }

    function getGoogleMapsUrl(item) {
        const query = [item.name, item.locality, getRegionName(item.region), "Sumatera Barat"]
            .filter(Boolean)
            .join(", ");
        return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
    }

    function getRegionDestinations(slug) {
        return destinations.filter(item =>
            item.region === slug || (item.relatedRegions || []).includes(slug)
        );
    }

    function hasUsableImage(item) {
        return Boolean(getImage(item));
    }

    function photoCreditMarkup(item, compact = false) {
        if (!hasUsableImage(item)) return "";

        const credit = escapeHTML(item.imageCredit || "Pencipta foto");
        const license = escapeHTML(item.imageLicense || "Lisensi tercantum pada sumber");
        const source = safeURL(item.imageSource);
        const licenseURL = safeURL(item.imageLicenseUrl);
        const text = compact
            ? `Foto: ${credit}`
            : `Foto: ${credit} · ${license}`;

        const sourceLink = source
            ? `<a href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer">Sumber foto</a>`
            : "";
        const licenseLink = licenseURL
            ? `<a href="${escapeHTML(licenseURL)}" target="_blank" rel="noopener noreferrer">Lisensi</a>`
            : "";

        return `
            <div class="photo-credit ${compact ? "photo-credit-compact" : ""}">
                <span>${text}</span>
                ${sourceLink}
                ${licenseLink}
            </div>
        `;
    }

    function sourceMarkup(url, label) {
        const safe = safeURL(url);
        if (!safe) return "";
        return `<a class="detail-source-link" href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label || "Sumber informasi")} ↗</a>`;
    }

    /* =====================================================
       02. SHARED HEADER
    ===================================================== */

    function renderHeader() {
        const target = document.getElementById("site-header");
        if (!target) return;

        let activePage = "home";
        if (["destinasi.html", "detail.html"].includes(currentPage)) activePage = "destinasi";
        if (currentPage === "daerah.html") activePage = "daerah";
        if (currentPage === "budaya.html") activePage = "budaya";
        if (currentPage === "tentang.html") activePage = "tentang";

        target.innerHTML = `
            <div class="scroll-progress" id="scroll-progress"></div>
            <header class="site-header" id="main-header">
                <div class="header-inner">
                    <a href="index.html" class="brand" aria-label="Ranah Sumbar - Beranda">
                        <div class="brand-symbol">R</div>
                        <div class="brand-text">
                            <strong>RANAH SUMBAR</strong>
                            <small>EXPLORE WEST SUMATRA</small>
                        </div>
                    </a>

                    <nav class="nav-menu" id="nav-menu" aria-label="Navigasi utama">
                        <a href="index.html" class="${activePage === "home" ? "active" : ""}">Beranda</a>
                        <a href="destinasi.html" class="${activePage === "destinasi" ? "active" : ""}">Destinasi</a>
                        <a href="daerah.html" class="${activePage === "daerah" ? "active" : ""}">Wilayah</a>
                        <a href="budaya.html" class="${activePage === "budaya" ? "active" : ""}">Budaya & Lifestyle</a>
                        <a href="tentang.html" class="${activePage === "tentang" ? "active" : ""}">Tentang</a>
                    </nav>

                    <a href="destinasi.html" class="header-action">Explore Now <span>↗</span></a>

                    <button class="menu-toggle" id="menu-toggle" type="button"
                        aria-label="Buka menu navigasi" aria-expanded="false">
                        <span></span><span></span>
                    </button>
                </div>
            </header>
        `;
    }

    /* =====================================================
       03. SHARED FOOTER
    ===================================================== */

    function renderFooter() {
        const target = document.getElementById("site-footer");
        if (!target) return;
        const year = new Date().getFullYear();

        target.innerHTML = `
            <footer class="site-footer">
                <div class="footer-top">
                    <div class="footer-brand">
                        <a href="index.html" class="brand">
                            <div class="brand-symbol">R</div>
                            <div class="brand-text">
                                <strong>RANAH SUMBAR</strong>
                                <small>EXPLORE WEST SUMATRA</small>
                            </div>
                        </a>
                        <p>Direktori kurasi untuk mengenal bentang alam, budaya, sejarah, kuliner, dan kehidupan di 19 kabupaten/kota Sumatera Barat.</p>
                    </div>
                    <div class="footer-column">
                        <h4>EXPLORE</h4>
                        <a href="index.html">Beranda</a>
                        <a href="destinasi.html">Destinasi wisata</a>
                        <a href="daerah.html">Kabupaten & kota</a>
                        <a href="budaya.html">Budaya & lifestyle</a>
                    </div>
                    <div class="footer-column">
                        <h4>DISCOVER</h4>
                        <a href="destinasi.html?kategori=Pantai">Pantai & laut</a>
                        <a href="destinasi.html?kategori=Gunung">Gunung</a>
                        <a href="destinasi.html?kategori=Danau">Danau</a>
                        <a href="destinasi.html?kategori=Budaya">Budaya</a>
                        <a href="tentang.html">Tentang kami</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© ${year} RANAH SUMBAR. ALL RIGHTS RESERVED.</p>
                    <p>MADE TO CELEBRATE WEST SUMATRA.</p>
                </div>
            </footer>
        `;
    }

    /* =====================================================
       04. DESTINATION CARD
    ===================================================== */

    function createDestinationCard(item, index = 0) {
        const regionName = escapeHTML(getRegionName(item.region));
        const name = escapeHTML(item.name);
        const category = escapeHTML(item.category || "Destinasi");
        const description = escapeHTML(item.description || "Informasi destinasi akan dilengkapi.");
        const image = getImage(item);
        const placeholderMarkup = `<div class="photo-placeholder-content"><span class="photo-placeholder-mark">RS</span><span>Foto asli destinasi belum tersedia</span><small>Foto berlisensi akan ditambahkan setelah diverifikasi</small></div>`;
        const imageMarkup = image
            ? `<img src="${escapeHTML(image)}" alt="${name}" loading="lazy" onerror="this.remove(); this.parentElement.classList.add('image-placeholder');">${placeholderMarkup}`
            : placeholderMarkup;

        return `
            <a class="destination-card" href="detail.html?id=${encodeURIComponent(item.id)}"
               data-reveal="up" style="--delay: ${(index % 3) * 80}ms">
                <div class="destination-card-image ${image ? "has-photo" : "image-placeholder"}">
                    ${imageMarkup}
                    <span class="destination-card-badge">${category.toUpperCase()}</span>
                    <span class="destination-card-index">${String(index + 1).padStart(2, "0")}</span>
                    ${image ? photoCreditMarkup(item, true) : ""}
                </div>
                <div class="destination-card-content">
                    <span class="destination-card-region">${regionName}</span>
                    <h3>${name}</h3>
                    <p>${description}</p>
                    <div class="destination-card-bottom">
                        <span>Explore destination</span>
                        <span class="card-arrow">↗</span>
                    </div>
                </div>
            </a>
        `;
    }

    /* =====================================================
       05. REGION CARDS
    ===================================================== */

    function createRegionCard(region, index = 0) {
        const count = getRegionDestinations(region.slug).length;
        return `
            <a href="destinasi.html?daerah=${encodeURIComponent(region.slug)}"
               class="region-full-card" data-reveal="up"
               style="--delay: ${(index % 3) * 70}ms">
                <small>${escapeHTML(region.type.toUpperCase())} · ${String(index + 1).padStart(2, "0")}</small>
                <div>
                    <h3>${escapeHTML(region.name)}</h3>
                    <p>${escapeHTML(region.description)}</p>
                </div>
                <div class="region-full-card-bottom">
                    <span>${count} entri katalog</span><strong>↗</strong>
                </div>
            </a>
        `;
    }

    function createHomeRegionCard(region, index = 0) {
        const count = getRegionDestinations(region.slug).length;
        return `
            <a href="destinasi.html?daerah=${encodeURIComponent(region.slug)}"
               class="region-card" data-reveal="${index % 2 === 0 ? "up" : "blur"}"
               style="--delay: ${(index % 3) * 80}ms">
                <div class="region-card-top">
                    <span>${escapeHTML(region.type.toUpperCase())}</span>
                    <span>${String(index + 1).padStart(2, "0")}</span>
                </div>
                <div>
                    <h3>${escapeHTML(region.name)}</h3>
                    <p>${escapeHTML(region.short)}</p>
                </div>
                <div class="region-card-top">
                    <span>${count} ENTRI KATALOG</span><span>↗</span>
                </div>
            </a>
        `;
    }

    /* =====================================================
       06. HOME PAGE
    ===================================================== */

    function renderHome() {
        const featuredGrid = document.getElementById("featured-grid");
        if (featuredGrid) {
            const featured = destinations.filter(item => item.featured).slice(0, 6);
            featuredGrid.innerHTML = featured.map((item, index) => createDestinationCard(item, index)).join("");
        }

        const regionPreview = document.getElementById("home-regions");
        if (regionPreview) {
            const preferred = ["pasaman-barat", "pesisir-selatan", "agam", "limapuluh-kota", "mentawai", "tanah-datar"];
            const selected = preferred.map(getRegion).filter(Boolean);
            regionPreview.innerHTML = selected.map((region, index) => createHomeRegionCard(region, index)).join("");
        }

        const total = document.getElementById("total-destinations");
        if (total) total.textContent = `${destinations.length}+`;

        observeReveals();
    }

    /* =====================================================
       07. CATALOGUE SEARCH & FILTER
    ===================================================== */

    function renderCatalogue() {
        const grid = document.getElementById("destination-grid");
        if (!grid) return;

        const searchInput = document.getElementById("search-input");
        const regionFilter = document.getElementById("region-filter");
        const categoryFilter = document.getElementById("category-filter");
        const resultCount = document.getElementById("result-count");
        const resetButton = document.getElementById("clear-filter");
        if (!searchInput || !regionFilter || !categoryFilter) return;

        const params = new URLSearchParams(window.location.search);
        const initialRegion = params.get("daerah") || "";
        const initialCategory = params.get("kategori") || "";

        if (regions.some(region => region.slug === initialRegion)) regionFilter.value = initialRegion;
        if ([...categoryFilter.options].some(option => option.value === initialCategory)) categoryFilter.value = initialCategory;

        function applyFilters() {
            const keyword = searchInput.value.trim().toLocaleLowerCase("id");
            const selectedRegion = regionFilter.value;
            const selectedCategory = categoryFilter.value;

            const filtered = destinations.filter(item => {
                const regionNames = [getRegionName(item.region), ...(item.relatedRegions || []).map(getRegionName)];
                const searchable = [
                    item.name,
                    item.description,
                    item.history || "",
                    item.locality || "",
                    item.category,
                    ...(item.aliases || []),
                    ...(item.keywords || []),
                    ...regionNames
                ].join(" ").toLocaleLowerCase("id");

                const matchesSearch = !keyword || searchable.includes(keyword);
                const matchesRegion = !selectedRegion || item.region === selectedRegion || (item.relatedRegions || []).includes(selectedRegion);
                const matchesCategory = !selectedCategory || item.category === selectedCategory;
                return matchesSearch && matchesRegion && matchesCategory;
            });

            if (!filtered.length) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <h3>Destinasi tidak ditemukan.</h3>
                        <p>Coba nama alternatif, daerah, atau kategori lain.</p>
                    </div>
                `;
            } else {
                grid.innerHTML = filtered.map((item, index) => createDestinationCard(item, index)).join("");
            }

            if (resultCount) {
                resultCount.innerHTML = `Menampilkan <strong>${filtered.length}</strong> dari <strong>${destinations.length}</strong> entri katalog`;
            }
            observeReveals();
        }

        searchInput.addEventListener("input", applyFilters);
        regionFilter.addEventListener("change", applyFilters);
        categoryFilter.addEventListener("change", applyFilters);

        if (resetButton) {
            resetButton.addEventListener("click", () => {
                searchInput.value = "";
                regionFilter.value = "";
                categoryFilter.value = "";
                window.history.replaceState({}, "", window.location.pathname);
                applyFilters();
            });
        }
        applyFilters();
    }

    /* =====================================================
       08. REGIONS PAGE
    ===================================================== */

    function renderRegionsPage() {
        const grid = document.getElementById("all-regions-grid");
        if (!grid) return;
        grid.innerHTML = regions.map((region, index) => createRegionCard(region, index)).join("");
        observeReveals();
    }

    /* =====================================================
       09. CULTURE & URBAN PAGE
    ===================================================== */

    function renderUrbanPage() {
        const grid = document.getElementById("urban-grid");
        if (!grid) return;
        const allowed = ["Budaya", "Sejarah", "Belanja", "Kuliner", "Taman", "Kota"];
        const entries = destinations.filter(item => allowed.includes(item.category));
        grid.innerHTML = entries.map((item, index) => createDestinationCard(item, index)).join("");
        observeReveals();
    }

    /* =====================================================
       10. DETAIL PAGE WITH HISTORY & PHOTO ATTRIBUTION
    ===================================================== */

    function renderDetailPage() {
        const container = document.getElementById("detail-container");
        if (!container) return;

        const id = new URLSearchParams(window.location.search).get("id");
        const item = destinations.find(destination => destination.id === id);

        if (!item) {
            container.innerHTML = `
                <section class="page-hero">
                    <p class="eyebrow">DESTINATION NOT FOUND</p>
                    <h1>Destinasi tidak <em>ditemukan.</em></h1>
                    <p>Halaman yang dicari tidak tersedia di katalog ini.</p>
                    <a href="destinasi.html" class="btn btn-primary">Kembali ke destinasi <span>↗</span></a>
                </section>
            `;
            document.title = "Destinasi Tidak Ditemukan — Ranah Sumbar";
            return;
        }

        const image = getImage(item);
        const name = escapeHTML(item.name);
        const regionName = escapeHTML(getRegionName(item.region));
        const category = escapeHTML(item.category || "Destinasi");
        const description = escapeHTML(item.description || "Informasi akan dilengkapi.");
        const locality = escapeHTML(item.locality || `${getRegionName(item.region)}, Sumatera Barat`);
        const mapURL = getGoogleMapsUrl(item);

        const heroPlaceholder = `<div class="detail-hero-photo-placeholder"><span class="photo-placeholder-mark">RS</span><strong>Foto asli ${name} belum tersedia</strong><small>Kami tidak menggantinya dengan foto lokasi lain.</small></div>`;
        const heroPhoto = image
            ? `<img class="detail-hero-photo" src="${escapeHTML(image)}" alt="${name}" onerror="this.remove(); document.querySelector('.detail-hero').classList.add('image-placeholder');">${heroPlaceholder}`
            : heroPlaceholder;

        const historySection = item.history
            ? `
                <section class="detail-story">
                    <p class="eyebrow">HISTORY & LOCAL STORY</p>
                    <h2>Sejarah dan cerita.</h2>
                    <p>${escapeHTML(item.history)}</p>
                    ${sourceMarkup(item.historySource || item.sourceUrl, item.sourceLabel || "Sumber cerita")}
                </section>
            `
            : `
                <section class="detail-story detail-story-pending">
                    <p class="eyebrow">LOCAL STORY</p>
                    <h2>Cerita lokal.</h2>
                    <p>Riwayat atau cerita lokal destinasi ini belum dicantumkan karena belum tersedia sumber yang cukup kuat dalam catatan katalog.</p>
                </section>
            `;

        const verification = escapeHTML(item.verification || "Informasi operasional perlu diperiksa sebelum kunjungan.");
        const infoSource = sourceMarkup(item.sourceUrl, item.sourceLabel || "Sumber informasi destinasi");

        container.innerHTML = `
            <section class="detail-hero ${image ? "has-photo" : "image-placeholder"}">
                ${heroPhoto}
                <div class="detail-hero-inner">
                    <div class="detail-labels">
                        <span>${category.toUpperCase()}</span>
                        <span>${regionName.toUpperCase()}</span>
                    </div>
                    <h1 data-reveal="up">${name}</h1>
                    <p data-reveal="blur">${description}</p>
                </div>
                ${image ? photoCreditMarkup(item, false) : ""}
            </section>

            <section class="detail-body">
                <div class="detail-main" data-reveal="left">
                    <p class="eyebrow">ABOUT THIS DESTINATION</p>
                    <h2>Kenali ${name}.</h2>
                    <p>${description}</p>
                    ${historySection}
                    <section class="detail-story">
                        <p class="eyebrow">VISITOR NOTES</p>
                        <h2>Catatan kunjungan.</h2>
                        <p>${verification}</p>
                        ${infoSource}
                    </section>
                    <p class="detail-respect-note">Hormati adat dan budaya masyarakat setempat, jaga kebersihan, dan patuhi arahan pengelola atau petugas kawasan.</p>
                </div>

                <aside class="detail-sidebar" data-reveal="right">
                    <h3>Plan your visit.</h3>
                    <p><strong>Wilayah</strong><br>${regionName}</p>
                    <p><strong>Lokasi</strong><br>${locality}</p>
                    <p><strong>Kategori</strong><br>${category}</p>
                    <p><strong>Informasi foto</strong><br>${image ? escapeHTML(item.imageLicense || "Periksa sumber foto") : "Foto khusus belum tersedia"}</p>
                    <a href="${escapeHTML(mapURL)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Cari di Google Maps <span>↗</span></a>
                </aside>
            </section>
        `;

        const relatedGrid = document.getElementById("related-grid");
        if (relatedGrid) {
            const related = destinations
                .filter(entry => entry.id !== item.id && (entry.region === item.region || (entry.relatedRegions || []).includes(item.region)))
                .slice(0, 3);
            relatedGrid.innerHTML = related.length
                ? related.map((entry, index) => createDestinationCard(entry, index)).join("")
                : `<div class="empty-state"><h3>Jelajahi daerah lainnya.</h3><p>Temukan destinasi lain di Sumatera Barat.</p></div>`;
        }

        document.title = `${item.name} — Ranah Sumbar`;
        observeReveals();
    }

    /* =====================================================
       11. MOBILE NAVIGATION
    ===================================================== */

    function setupNavigation() {
        const toggle = document.getElementById("menu-toggle");
        const nav = document.getElementById("nav-menu");
        if (!toggle || !nav) return;

        const closeMenu = () => {
            nav.classList.remove("open");
            document.body.classList.remove("menu-open");
            toggle.setAttribute("aria-expanded", "false");
        };

        toggle.addEventListener("click", () => {
            const opened = nav.classList.toggle("open");
            document.body.classList.toggle("menu-open", opened);
            toggle.setAttribute("aria-expanded", String(opened));
        });

        nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeMenu();
        });
    }

    /* =====================================================
       12. SCROLL PROGRESS & BACK TO TOP
    ===================================================== */

    function setupScrollEffects() {
        const header = document.getElementById("main-header");
        const progress = document.getElementById("scroll-progress");
        const backTop = document.createElement("button");
        backTop.className = "back-to-top";
        backTop.type = "button";
        backTop.setAttribute("aria-label", "Kembali ke atas");
        backTop.innerHTML = "↑";
        document.body.appendChild(backTop);

        function updateScroll() {
            const top = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const amount = height > 0 ? (top / height) * 100 : 0;
            if (progress) progress.style.width = `${amount}%`;
            if (header) header.classList.toggle("scrolled", top > 40);
            backTop.classList.toggle("visible", top > 500);
        }

        window.addEventListener("scroll", updateScroll, { passive: true });
        backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        updateScroll();
    }

    /* =====================================================
       13. SCROLL REVEAL
    ===================================================== */

    function observeReveals() {
        const elements = document.querySelectorAll("[data-reveal]:not(.is-visible)");
        if (!("IntersectionObserver" in window)) {
            elements.forEach(element => element.classList.add("is-visible"));
            return;
        }
        if (!revealObserver) {
            revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
        }
        elements.forEach(element => revealObserver.observe(element));
    }

    /* =====================================================
       14. CUSTOM CURSOR & TRAIL
    ===================================================== */

    function setupCursor() {
        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!finePointer || window.innerWidth <= 800) return;

        const dot = document.createElement("div");
        dot.className = "custom-cursor";
        const ring = document.createElement("div");
        ring.className = "cursor-ring";
        document.body.append(dot, ring);
        document.body.classList.add("cursor-ready");

        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, lastParticle = 0;

        window.addEventListener("mousemove", event => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;

            const now = performance.now();
            if (now - lastParticle > 75) {
                lastParticle = now;
                const particle = document.createElement("span");
                particle.className = "cursor-particle";
                particle.style.left = `${mouseX}px`;
                particle.style.top = `${mouseY}px`;
                document.body.appendChild(particle);
                window.setTimeout(() => particle.remove(), 700);
            }
        }, { passive: true });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.addEventListener("pointerover", event => {
            const interactive = event.target.closest("a, button, input, select, textarea");
            document.body.classList.toggle("cursor-hover", Boolean(interactive));
        });
    }

    /* =====================================================
       15. HERO VIDEO
    ===================================================== */

    function setupHeroVideo() {
        const video = document.querySelector(".hero-video");
        if (!video) return;
        video.muted = true;
        video.playsInline = true;
        video.addEventListener("error", () => video.classList.add("video-unavailable"), { once: true });
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => video.classList.add("video-unavailable"));
        }
    }

    /* =====================================================
       16. INITIALIZE
    ===================================================== */

    async function initialize() {
        try {
            if (window.SUMBAR_DATA_READY) await window.SUMBAR_DATA_READY;
        } catch (error) {
            console.error("RANAH SUMBAR: database gagal dimuat.", error);
            return;
        }

        regions = Array.isArray(window.SUMBAR_REGIONS) ? window.SUMBAR_REGIONS : [];
        destinations = Array.isArray(window.SUMBAR_WISATA) ? window.SUMBAR_WISATA : [];

        renderHeader();
        renderFooter();
        renderHome();
        renderCatalogue();
        renderRegionsPage();
        renderUrbanPage();
        renderDetailPage();
        setupNavigation();
        setupScrollEffects();
        setupCursor();
        setupHeroVideo();
        observeReveals();

        console.info("RANAH SUMBAR initialized", {
            regions: regions.length,
            destinations: destinations.length,
            licensedPhotos: destinations.filter(item => item.imageStatus === "license-recorded").length
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();