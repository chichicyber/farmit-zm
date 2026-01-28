'use client';

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type AnimalLocation = {
  id: string;
  tagId: string;
  type: string;
  position: { lat: number; lng: number };
};

// Center of Lusaka, Zambia - as a fallback
const LUSAKA_CENTER = { lat: -15.416667, lng: 28.283333 };

const fields = [
    { name: 'North Pasture', center: { lat: -15.40, lng: 28.29 }, radius: 0.02 },
    { name: 'East Field', center: { lat: -15.43, lng: 28.31 }, radius: 0.015 },
    { name: 'Main Homestead', center: { lat: LUSAKA_CENTER.lat, lng: LUSAKA_CENTER.lng }, radius: 0.05 },
];

const getInitialAnimalLocations = (): AnimalLocation[] => [
    { id: '1', tagId: 'ZM-C-001', type: 'Cattle', position: { lat: -15.40, lng: 28.29 } }, // in North Pasture
    { id: '2', tagId: 'ZM-G-015', type: 'Goat', position: { lat: -15.42, lng: 28.27 } }, // in Main Homestead
    { id: '3', tagId: 'ZM-P-120', type: 'Chicken', position: { lat: -15.43, lng: 28.30 } }, // in East Field
    { id: '4', tagId: 'ZM-C-005', type: 'Cattle', position: { lat: -15.48, lng: 28.32 } }, // outside all fences
];

const isOutsideGeofence = (position: { lat: number; lng: number }, field: typeof fields[0]) => {
    const dist = Math.sqrt(
        Math.pow(position.lat - field.center.lat, 2) +
        Math.pow(position.lng - field.center.lng, 2)
    );
    return dist > field.radius;
};

// Custom icons
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const outOfBoundsIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// Component to update map view when center changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function AnimalMapPage() {
  const [locations, setLocations] = useState<AnimalLocation[]>(getInitialAnimalLocations());
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(null);
  const [selectedField, setSelectedField] = useState(fields[0]);
  const [time, setTime] = useState(new Date());

  const simulateMovement = () => {
    setLocations(prevLocations =>
      prevLocations.map(animal => {
        const outOfBounds = isOutsideGeofence(animal.position, selectedField);
        let newLat = animal.position.lat;
        let newLng = animal.position.lng;
        const movementFactor = 0.0005; // controls speed of movement

        if (outOfBounds) {
          // Move towards the center of the selected field if they wander off
          const angle = Math.atan2(
            selectedField.center.lat - animal.position.lat,
            selectedField.center.lng - animal.position.lng
          );
          newLat += Math.sin(angle) * movementFactor;
          newLng += Math.cos(angle) * movementFactor;
        } else {
          // Move randomly
          newLat += (Math.random() - 0.5) * movementFactor;
          newLng += (Math.random() - 0.5) * movementFactor;
        }
        
        return {
          ...animal,
          position: {
            lat: newLat,
            lng: newLng,
          },
        };
      })
    );
    setTime(new Date());
  };

  const handleFieldChange = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (field) {
        setSelectedField(field);
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Animal Map View</h1>
        <p className="text-muted-foreground">
            Monitor your livestock locations across different fields using OpenStreetMap.
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Map Controls</CardTitle>
                        <CardDescription>Select a field and manage the view.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="field-select">Field to View</Label>
                            <Select onValueChange={handleFieldChange} defaultValue={selectedField.name}>
                                <SelectTrigger id="field-select">
                                    <SelectValue placeholder="Select a field" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fields.map(field => (
                                        <SelectItem key={field.name} value={field.name}>
                                            {field.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <Button onClick={simulateMovement} variant="outline" className="w-full">
                            <RefreshCw /> Simulate Movement
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Last Update</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{time.toLocaleTimeString()}</p>
                        <p className="text-xs text-muted-foreground">Location data is updated in real-time.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                 <Card className="h-[70vh]">
                    <CardContent className="p-0 h-full rounded-lg overflow-hidden">
                        <MapContainer
                            center={[selectedField.center.lat, selectedField.center.lng]}
                            zoom={14}
                            scrollWheelZoom={false}
                            className="h-full w-full"
                        >
                            <ChangeView center={[selectedField.center.lat, selectedField.center.lng]} zoom={14} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {locations.map((animal) => {
                                const outOfBounds = isOutsideGeofence(animal.position, selectedField);
                                return (
                                    <Marker
                                        key={animal.id}
                                        position={[animal.position.lat, animal.position.lng]}
                                        icon={outOfBounds ? outOfBoundsIcon : defaultIcon}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedAnimal(animal);
                                            },
                                        }}
                                    >
                                    </Marker>
                                );
                            })}
                             {selectedAnimal && (
                                <Popup 
                                    position={[selectedAnimal.position.lat, selectedAnimal.position.lng]}
                                    onClose={() => setSelectedAnimal(null)}
                                >
                                    <div className="space-y-1 p-1">
                                        <h3 className="font-bold">Tag ID: {selectedAnimal.tagId}</h3>
                                        <p>Type: {selectedAnimal.type}</p>
                                        {isOutsideGeofence(selectedAnimal.position, selectedField) &&
                                            <Badge variant="destructive">Outside Geofence</Badge>
                                        }
                                    </div>
                                </Popup>
                            )}
                        </MapContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
