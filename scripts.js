let activeRestaurantId = null;

// Restore default sidebar content
const defaultSidebarTitle = document.getElementById('restaurant-title').textContent;
const defaultSidebarContent = document.getElementById('sidebar-content').innerHTML;

// Create reset button once
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset';
resetButton.id = 'reset-button';
resetButton.className = 'custom-button'; // Style this in CSS

resetButton.addEventListener('click', () => {
  if (activeRestaurantId !== null) {
    map.setFeatureState(
      { source: 'restaurants', id: activeRestaurantId },
      { active: false }
    );
    activeRestaurantId = null;
  }

  document.getElementById('restaurant-title').textContent = defaultSidebarTitle;
  document.getElementById('sidebar-content').innerHTML = defaultSidebarContent;
});

const closeBtn = document.querySelector('.close-btn');
const splash = document.querySelector('.splash-screen');
const main = document.querySelector('.main-content');

closeBtn.addEventListener('click', () => {
  splash.classList.add('fade-out');
  setTimeout(() => {
    splash.style.display = 'none';
    main.style.display = 'block';
  }, 500);
});

mapboxgl.accessToken = 'pk.eyJ1IjoibWFnZ2llaHVhbmcxOSIsImEiOiJjbTk5NnM2bW4wMWRkMnFwdmJnajNudWxxIn0.haaMtxye2pY0sKfahY6hHQ';

const lowerManhattanBounds = [
  [-74.03, 40.69],
  [-73.97, 40.74]
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

  const outer = turf.bboxPolygon([-72, -74, 40.8, 40.6]);
  const mask = turf.difference(outer, cbBoundary);

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

  // Add unique ID to each restaurant feature
  restaurantData.features.forEach((feature, index) => {
    feature.id = feature.id || index;
  });

  map.addSource('restaurants', {
    type: 'geojson',
    data: restaurantData
  });

  // Halo layer for active marker
  map.addLayer({
    id: 'restaurant-halo',
    type: 'circle',
    source: 'restaurants',
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        14,
        0
      ],
      'circle-color': '#ffffff',
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        0.6,
        0
      ]
    }
  });

  // Main marker layer
  map.addLayer({
    id: 'restaurant-points',
    type: 'circle',
    source: 'restaurants',
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        10,
        6
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'circle-color': [
        'match',
        ['get', 'license_type'],
        'Roadway & Sidewalk', '#70308b',
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
      map.setFilter('restaurant-points', ['in', 'license_type', '']);
    }
  });
});

// Click handler with active halo logic
map.on('click', 'restaurant-points', function (e) {
  const feature = e.features[0];
  const id = feature.id;

  if (activeRestaurantId !== null) {
    map.setFeatureState(
      { source: 'restaurants', id: activeRestaurantId },
      { active: false }
    );
  }

  activeRestaurantId = id;
  map.setFeatureState(
    { source: 'restaurants', id: id },
    { active: true }
  );

  const name = feature.properties.restaurant_name || 'N/A';
  const address = feature.properties.restaurant_address || 'N/A';
  const license_status = feature.properties.license_status || 'N/A';
  const license_type = feature.properties.license_type || 'N/A';

  const typeColorMap = {
    'Roadway & Sidewalk': '#73348E',
    roadway: '#1749eb',
    sidewalk: '#e31a1c'
  };
  const color = typeColorMap[license_type] || '#aaaaaa';

  const circleIcon = `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${color}; margin-right:5px;"></span>`;

  document.getElementById('restaurant-title').textContent = name;
  document.getElementById('sidebar-content').innerHTML = `
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>License Status:</strong> ${license_status}</p>
    <p><strong>License Type:</strong> ${circleIcon}${license_type}</p>
  `;

  // Append styled reset button
  document.getElementById('sidebar-content').appendChild(resetButton);

  document.querySelector('.floating-sidebar').scrollTop = 0;
});

// Legend interactivity
document.getElementById('both-color').addEventListener('click', function () {
  map.setPaintProperty('restaurant-points', 'circle-color', [
    'match',
    ['get', 'license_type'],
    'Roadway & Sidewalk', '#70308b',
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
    'Roadway & Sidewalk', '#70308b',
    'sidewalk', '#e31a1c',
    '#aaaaaa'
  ]);
});

document.getElementById('sidewalk-color').addEventListener('click', function () {
  map.setPaintProperty('restaurant-points', 'circle-color', [
    'match',
    ['get', 'license_type'],
    'sidewalk', '#e31a1c',
    'Roadway & Sidewalk', '#70308b',
    'roadway', '#33a02c',
    '#aaaaaa'
  ]);
});