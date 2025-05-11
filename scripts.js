const closeBtn = document.querySelector('.close-btn');
const splash = document.querySelector('.splash-screen');
const main = document.querySelector('.main-content');

closeBtn.addEventListener('click', () => {
  splash.classList.add('fade-out');

  // Wait for the fade-out to finish (500ms), then hide splash and show main content
  setTimeout(() => {
    splash.style.display = 'none';
    main.style.display = 'block';
  }, 500);
});

mapboxgl.accessToken = 'pk.eyJ1IjoibWFnZ2llaHVhbmcxOSIsImEiOiJjbTk5NnM2bW4wMWRkMnFwdmJnajNudWxxIn0.haaMtxye2pY0sKfahY6hHQ';

const lowerManhattanBounds = [
  [-74.03, 40.69], // Southwest corner
  [-73.97, 40.74]  // Northeast corner
];

const map = new mapboxgl.Map({
  container: 'map-container',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-73.9965, 40.7163],
  zoom: 13.5,
  maxBounds: lowerManhattanBounds,
  minZoom: 12,
  maxZoom: 17,
});

map.on('load', () => {
  map.addSource('cbBoundary', {
    type: 'geojson',
    data: cbBoundary
  });

  map.addLayer({
    id: 'cbBoundary',
    type: 'fill',
    source: 'cbBoundary',
    paint: {
      'fill-color': '#306e2f',
      'fill-opacity': 0.35,
      'fill-outline-color': 'black'
    }
  });

  // Create a big rectangle covering the whole visible world
  const outer = turf.bboxPolygon([-72, -74, 40.8, 40.6]);

  // Invert the polygon by cutting your polygon out of the rectangle
  const mask = turf.difference(outer, cbBoundary);

  // Add a mask that blocks everything outside your polygon
  map.addSource('mask', {
    type: 'geojson',
    data: mask
  });

  map.addLayer({
    id: 'mask',
    type: 'fill',
    source: 'mask',
    paint: {
      'fill-color': 'gray',
      'fill-opacity': 0.3
    }
  });

  // Add restaurant data
  map.addSource('restaurants', {
    type: 'geojson',
    data: restaurantData
  });

  map.addLayer({
    id: 'restaurant-points',
    type: 'circle',
    source: 'restaurants',
    paint: {
      'circle-radius': 6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'circle-color': [
        'match',
        ['get', 'license_type'],
        'both', '#73348E',
        'roadway', '#1749eb',
        'sidewalk', '#e31a1c',
        '#aaaaaa'
      ]
    }
  });
});

// Filtering logic
const checkboxes = document.querySelectorAll('.filter-checkbox');

checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const selectedTypes = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selectedTypes.length > 0) {
      map.setFilter('restaurant-points', ['in', ['get', 'license_type'], ['literal', selectedTypes]]);
    } else {
      map.setFilter('restaurant-points', ['in', 'license_type', '']); // Hide all
    }
  });
});

  // Click on a restaurant point and populate sidebar information
  map.on('click', 'restaurant-points', function (e) {
    const feature = e.features[0];
    const name = feature.properties.restaurant_name || 'N/A';
    const address = feature.properties.restaurant_address || 'N/A';
    const license_status = feature.properties.license_status || 'N/A';
  
    // Update the sidebar title
    document.getElementById('restaurant-title').textContent = name;
  
    // Update the sidebar content
    document.getElementById('sidebar-content').innerHTML = `
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>License Status:</strong> ${license_status}</p>
    `;
  
    document.querySelector('.floating-sidebar').scrollTop = 0;
  });

    document.getElementById('sidebar-content').innerHTML = info;

    // Scroll to the top of the sidebar when new content is loaded
    document.querySelector('.floating-sidebar').scrollTop = 0;

  // Legend interactivity: Change marker color when legend option is clicked
document.getElementById('both-color').addEventListener('click', function () {
  map.setPaintProperty('restaurant-points', 'circle-color', [
    'match',
    ['get', 'license_type'],
    'both', '#1f78b4',
    'roadway', '#33a02c',
    'sidewalk', '#e31a1c',
    '#aaaaaa'
  ]);
});

document.getElementById('roadway-color').addEventListener('click', function () {
  map.setPaintProperty('restaurant-points', 'circle-color', [
    'match',
    ['get', 'license_type'],
    'roadway', '#33a02c',
    'both', '#1f78b4',
    'sidewalk', '#e31a1c',
    '#aaaaaa'
  ]);
});

document.getElementById('sidewalk-color').addEventListener('click', function () {
  map.setPaintProperty('restaurant-points', 'circle-color', [
    'match',
    ['get', 'license_type'],
    'sidewalk', '#e31a1c',
    'both', '#1f78b4',
    'roadway', '#33a02c',
    '#aaaaaa'
  ]);
});