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
});


const markerOptions = {
    color: 'green',
}

cbData.forEach((record) => {
    new mapboxgl.Marker(markerOptions)
        .setLngLat([record.longitude, record.latitude])
        .setPopup(
            new mapboxgl.Popup({ offset: 30 }).setText(
                `${record.restaurant_name} has been issued their Outdoor Dining License by NYC DOT.`
            )
        )
        .addTo(map);
});