
// Initialize Leaflet Map

const map = L.map('map').setView([20,0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);


// Elements

const resultsDiv = document.getElementById("results");
const magnitudeSelect = document.getElementById("magnitude");
const refreshBtn = document.getElementById("refresh");
const lastUpdated = document.getElementById("last-updated");


// Fetch Earthquake Data

async function fetchEarthquakes() {
  resultsDiv.innerHTML = "<p>Loading earthquake data...</p>";
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
    const data = await res.json();
    renderEarthquakes(data.features);
    lastUpdated.textContent = "Last updated: " + new Date().toLocaleTimeString();
  } catch(err) {
    console.error(err);
    resultsDiv.innerHTML = "<p>Failed to load data.</p>";
  }
}


// Render Earthquakes

function renderEarthquakes(features) {
  resultsDiv.innerHTML = "";
  map.eachLayer(layer=>{
    if(layer.options && layer.options.pane==="markerPane") map.removeLayer(layer);
  });

  const minMag = parseFloat(magnitudeSelect.value);

  features
    .filter(eq => eq.properties.mag >= minMag)
    .sort((a,b)=>b.properties.mag - a.properties.mag)
    .forEach(eq => {
      const { mag, place, time, url } = eq.properties;
      const [lat, lng, depth] = eq.geometry.coordinates;

      // Marker
      const color = mag >= 6 ? "#F1A6C7" : mag >=4 ? "#FFF3B0" : "#A8DADC";
      const marker = L.circleMarker([lng,lat],{
        radius: mag*2,
        fillColor: color,
        color: "#fff",
        weight:1,
        fillOpacity:0.7
      }).addTo(map);
      marker.bindPopup(`<strong>${place}</strong><br>Magnitude: ${mag}<br>Depth: ${depth} km<br><a href="${url}" target="_blank">More info</a>`);

      // Card
      const card = document.createElement("div");
      card.className="result-card";
      card.innerHTML=`
        <h3>${place}</h3>
        <p><strong>Magnitude:</strong> ${mag}</p>
        <p><strong>Depth:</strong> ${depth} km</p>
        <p><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
        <a href="${url}" target="_blank">More info</a>
      `;
      resultsDiv.appendChild(card);
    });
}

// Event Listeners

magnitudeSelect.addEventListener("change", fetchEarthquakes);
refreshBtn.addEventListener("click", fetchEarthquakes);

// Initial Load
fetchEarthquakes();