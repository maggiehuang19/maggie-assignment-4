mapboxgl.accessToken = 'pk.eyJ1IjoibWFnZ2llaHVhbmcxOSIsImEiOiJjbTk5NnM2bW4wMWRkMnFwdmJnajNudWxxIn0.haaMtxye2pY0sKfahY6hHQ';

const mapOptions = {
  container: 'map-container',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-73.9965, 40.7163], // centered within polygon
  zoom: 13.5,
};

const map = new mapboxgl.Map(mapOptions);

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
      'fill-color': 'steelblue',
      'fill-opacity': 0.35,
      'fill-outline-color': 'black'
    }
  });


  // Create a big rectangle covering the whole visible world
  const outer = turf.bboxPolygon([-180, -85, 180, 85]);

  // Invert the polygon by cutting your polygon out of the rectangle
  const mask = turf.difference(outer, cbBoundary);

  // Add a layer that blocks everything outside your polygon
  map.addSource('mask', {
    type: 'geojson',
    data: mask
  });

  map.addLayer({
    id: 'mask',
    type: 'fill',
    source: 'mask',
    paint: {
      'fill-color': 'white',
      'fill-opacity': 0.8
    }
  });


});


// const markerOptions = {
//     color: 'green',
// }

// cbData.forEach((record) => {
//     new mapboxgl.Marker(markerOptions)
//         .setLngLat([record.longitude, record.latitude])
//         .setPopup(
//             new mapboxgl.Popup({ offset: 30 }).setText(
//                 `${record.restaurant_name} has been issued their Outdoor Dining License by NYC DOT.`
//             )
//         )
//         .addTo(map);
// });

// Add markers to the map
cbData.forEach(function (restaurant) {
  new mapboxgl.Marker()
    .setLngLat([restaurant.longitude, restaurant.latitude])
    .setPopup(new mapboxgl.Popup().setHTML(`<p>${restaurant.restaurant_name}</p>`)) // Optional popup
    .addTo(map)
    .getElement()
    .addEventListener('click', function () {
      // Show the sidebar and populate it with restaurant info
      showSidebar(restaurant);
    });
});

// Function to show the sidebar and populate it with restaurant info
function showSidebar(restaurant) {
  // Show the sidebar (remove 'collapsed' class)
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('collapsed');

  // Populate the sidebar with restaurant info including address
  sidebar.innerHTML = `
      <h2>${restaurant.restaurant_name}</h2>
      <p><strong>Address:</strong> ${restaurant.address || 'Not available'}</p>
      <p><strong>Longitude:</strong> ${restaurant.longitude}</p>
      <p><strong>Latitude:</strong> ${restaurant.latitude}</p>
      <button id="closeSidebar">Close</button>
    `;

  // Close the sidebar when the close button is clicked
  document.getElementById('closeSidebar').addEventListener('click', () => {
    sidebar.classList.add('collapsed');
  });
}