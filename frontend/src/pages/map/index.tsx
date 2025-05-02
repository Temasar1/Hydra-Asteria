import { useChallengeStore } from '@/stores/challenge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png',
});

export default function Map() {
  const { current } = useChallengeStore();
  const [mapPoints, setMapPoints] = useState<any[]>([]);

  useEffect(() => {
    // Fetch map data using the same parameters as before
    const fetchMapData = async () => {
      try {
        const params = new URLSearchParams([
          ['shipyardPolicyId', current().shipyardPolicyId],
          ['fuelPolicyId', current().fuelPolicyId],
          ['shipAddress', current().shipAddress],
          ['fuelAddress', current().fuelAddress],
          ['asteriaAddress', current().asteriaAddress],
        ]);

        const response = await fetch(`${process.env.API_URL}/graphql?${params.toString()}`);
        const data = await response.json();
        setMapPoints(data.points || []);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchMapData();
  }, [current]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Zoom In
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Zoom Out
          </button>
          <select className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="default">Default View</option>
            <option value="satellite">Satellite View</option>
            <option value="terrain">Terrain View</option>
          </select>
        </div>
      </div>

      <MapContainer
        center={[0, 0]}
        zoom={3}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {mapPoints.map((point, index) => (
          <Marker
            key={index}
            position={[point.latitude, point.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{point.name}</h3>
                <div className="space-y-1">
                  <p className="text-sm">Ship ID: {point.shipyardPolicyId}</p>
                  <p className="text-sm">Fuel ID: {point.fuelPolicyId}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-10 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-2">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm">Ship Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Fuel Station</span>
          </div>
        </div>
      </div>
    </div>
  );
}