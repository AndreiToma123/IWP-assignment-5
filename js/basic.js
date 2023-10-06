if (document.readyState !== "loading") {
    console.log("Document ready");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        console.log("DOMContentLoaded event fired");
        initializeCode();
    });
}

async function initializeCode() {
    const fetchData = async () => {
        const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
        const url2 = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
        const url3 = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"
        const res = await fetch(url);
        const res2 = await fetch(url2);
        const res3 = await fetch(url3);
        const data = await res.json();
        const migrationPos = await res2.json();
        const migrationNeg = await res3.json();

        initMap(data, migrationPos, migrationNeg);
    };

    const initMap = (data, migrationPos, migrationNeg) => {
        let map = L.map('map', {
            minZoom: -3
        });

        let geoJson = L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                getFeature(feature, layer, migrationPos, migrationNeg);
            },
            weight: 2
        }).addTo(map);

        map.fitBounds(geoJson.getBounds());

        let maskMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);
    };

    
    let i = 0;
    const getFeature = (feature, layer, migrationPos, migrationNeg) => {
        if (!feature.properties.nimi) {
            return;
        }
        const nimi = feature.properties.nimi; 
        layer.bindTooltip(nimi).openTooltip();
        
        const positiveMigration = migrationPos.dataset.value[i];
        const negativeMigration = migrationNeg.dataset.value[i];

        layer.bindPopup(
            `<ul>
                <li>Name: ${nimi}</li>
                <li>Migration positive: ${positiveMigration}</li>
                <li>Migration negative: ${negativeMigration}</li>
            </ul>`
        );

        i++;
        if (i >= migrationPos.dataset.value.length) {
            i = 0;
        }
    };


    fetchData();
}