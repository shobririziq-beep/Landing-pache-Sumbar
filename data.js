/* =========================================================
   RANAH SUMBAR — COMPRESSED DESTINATION DATABASE
   19 kabupaten/kota | 334 curated destinations | 27 matched photos
   Data is gzip-compressed to keep this source file manageable.
   Requires a modern browser with DecompressionStream support.
========================================================= */

(() => {
    "use strict";

    const compressedBase64 = [
        "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"
    ].join("");

    window.SUMBAR_DATA_READY = (async () => {
        if (typeof DecompressionStream === "undefined") {
            throw new Error("Browser tidak mendukung DecompressionStream. Gunakan Chrome atau Edge versi terbaru.");
        }

        const binary = atob(compressedBase64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) {
            bytes[index] = binary.charCodeAt(index);
        }

        const stream = new Blob([bytes])
            .stream()
            .pipeThrough(new DecompressionStream("gzip"));

        const jsonText = await new Response(stream).text();
        const database = JSON.parse(jsonText);

        window.SUMBAR_SOURCES = database.sources;
        window.SUMBAR_REGIONS = database.regions;
        window.SUMBAR_WISATA = database.destinations;

        const regions = window.SUMBAR_REGIONS || [];
        const destinations = window.SUMBAR_WISATA || [];
        const ids = new Set();
        const errors = [];

        for (const item of destinations) {
            if (ids.has(item.id)) errors.push(`Duplicate ID: ${item.id}`);
            ids.add(item.id);
            if (!regions.some(region => region.slug === item.region)) {
                errors.push(`Missing region: ${item.name} (${item.region})`);
            }
            for (const related of item.relatedRegions || []) {
                if (!regions.some(region => region.slug === related)) {
                    errors.push(`Missing related region: ${item.name} (${related})`);
                }
            }
        }

        console.group("RANAH SUMBAR DATABASE");
        console.log("Regions:", regions.length);
        console.log("Destinations:", destinations.length);
        console.log("Photographs with recorded licensing:", destinations.filter(item => item.imageStatus === "license-recorded").length);
        console.log("Destinations still needing a verified photo:", destinations.filter(item => item.imageStatus === "photo-needed").length);
        regions.forEach(region => {
            const count = destinations.filter(item => item.region === region.slug || (item.relatedRegions || []).includes(region.slug)).length;
            console.log(`${region.name}: ${count}`);
        });
        if (errors.length) console.error(errors);
        else console.log("Validation: OK");
        console.groupEnd();

        return database;
    })();
})();