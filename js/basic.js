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
        const res = await fetch(url);
        const data = await res.json();
        initMap(data);
    };

    const initMap = (data) => {
        let map = L.map('map', {
            minZoom: -3
        });

        let geoJson = L.geoJSON(data, {
            onEachFeature: addTooltip, 
            weight: 2
        }).addTo(map);

        map.fitBounds(geoJson.getBounds());

        let maskMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);
    };

    

    const addTooltip = (feature, layer) => {
        if (!feature.properties.nimi) {
            return;
        }
        const nimi = feature.properties.nimi; 
        layer.bindTooltip(nimi).openTooltip(); 
    };

    fetchData();
}
