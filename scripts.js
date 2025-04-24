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

const cbData = [
    {
        "restaurant_name": "Whiskey Tavern",
        "longitude": -73.999572,
        "latitude": 40.716425
    },
    {
        "restaurant_name": "Diaspora",
        "longitude": -73.999494,
        "latitude": 40.71685
    },
    {
        "restaurant_name": "Bowery Meat Company",
        "longitude": -73.991816,
        "latitude": 40.724585
    },
    {
        "restaurant_name": "Cafe Maud",
        "longitude": -73.987314,
        "latitude": 40.728605
    },
    {
        "restaurant_name": "B&H Dairy",
        "longitude": -73.988016,
        "latitude": 40.7284226
    }
];


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