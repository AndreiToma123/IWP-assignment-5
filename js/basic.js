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

    
    let currentIndex = 0;
    const getFeature = (feature, layer, migrationPos, migrationNeg) => {
        if (!feature.properties.nimi) {
            return;
        }
        const nimi = feature.properties.nimi; 
        layer.bindTooltip(nimi).openTooltip();
        
        const positiveMigration = parseFloat(migrationPos.dataset.value[currentIndex]);
        const negativeMigration = parseFloat(migrationNeg.dataset.value[currentIndex]);

        const hue = Math.min((Math.pow(positiveMigration / negativeMigration, 3) * 60), 120);

        const style = {
            fillColor: `hsl(${hue}, 75%, 50%)`,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    
        layer.setStyle(style);

        layer.bindPopup(
            `<ul>
                <li>Name: ${nimi}</li>
                <li>Migration positive: ${positiveMigration}</li>
                <li>Migration negative: ${negativeMigration}</li>
            </ul>`
        );

        currentIndex++;
        if (currentIndex >= migrationPos.dataset.value.length) {
            currentIndex = 0;
        }

        
    };

    fetchData();
}