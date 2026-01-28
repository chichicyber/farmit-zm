'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type AnimalLocation = {
  id: string;
  tagId: string;
  type: string;
  position: { lat: number; lng: number };
};

// Center of Lusaka, Zambia
const LUSAKA_CENTER = { lat: -15.416667, lng: 28.283333 };
const GEOFENCE_RADIUS_DEGREES = 0.05; // Approx 5.5 km

const getInitialAnimalLocations = (): AnimalLocation[] => [
    { id: '1', tagId: 'ZM-C-001', type: 'Cattle', position: { lat: -15.40, lng: 28.29 } },
    { id: '2', tagId: 'ZM-G-015', type: 'Goat', position: { lat: -15.42, lng: 28.27 } },
    { id: '3', tagId: 'ZM-P-120', type: 'Chicken', position: { lat: -15.43, lng: 28.30 } },
    { id: '4', tagId: 'ZM-C-005', type: 'Cattle', position: { lat: -15.48, lng: 28.32 } }, // outside fence
];

const isOutsideGeofence = (position: { lat: number; lng: number }) => {
    const dist = Math.sqrt(
        Math.pow(position.lat - LUSAKA_CENTER.lat, 2) +
        Math.pow(position.lng - LUSAKA_CENTER.lng, 2)
    );
    return dist > GEOFENCE_RADIUS_DEGREES;
};


export default function AnimalMapPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [locations, setLocations] = useState<AnimalLocation[]>(getInitialAnimalLocations());
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(null);
  const [time, setTime] = useState(new Date());


  useEffect(() => {
    // In a real app, this would be fetched or set on the client
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null);
  }, []);

  const simulateMovement = () => {
    setLocations(prevLocations =>
      prevLocations.map(animal => ({
        ...animal,
        position: {
          lat: animal.position.lat + (Math.random() - 0.5) * 0.001,
          lng: animal.position.lng + (Math.random() - 0.5) * 0.001,
        },
      }))
    );
    setTime(new Date());
  };

  if (apiKey === null) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Map Unavailable</CardTitle>
                <CardDescription>
                    The Google Maps API key is not configured. Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
                </CardDescription>
            </CardHeader>
        </Card>
      );
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
        <div className="flex items-start justify-between">
            <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Real-Time Animal Map</h1>
            <p className="text-muted-foreground">
                Live locations of your tagged animals. Last updated: {time.toLocaleTimeString()}
            </p>
            </div>
            <Button onClick={simulateMovement} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Simulate Movement
            </Button>
      </div>

      <Card className="flex-1">
        <CardContent className="p-0 h-full rounded-lg overflow-hidden">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={LUSAKA_CENTER}
              defaultZoom={12}
              mapId="farmit_map"
              mapTypeControl={false}
              streetViewControl={false}
            >
              {locations.map((animal) => {
                  const outOfBounds = isOutsideGeofence(animal.position);
                  return (
                    <AdvancedMarker 
                        key={animal.id} 
                        position={animal.position}
                        onClick={() => setSelectedAnimal(animal)}
                    >
                        <Pin 
                            background={outOfBounds ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                            borderColor={outOfBounds ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                            glyphColor={'white'}
                        />
                    </AdvancedMarker>
                  )
              })}
              {selectedAnimal && (
                  <InfoWindow 
                    position={selectedAnimal.position}
                    onCloseClick={() => setSelectedAnimal(null)}
                  >
                    <div className="p-2 space-y-1">
                        <h3 className="font-bold">Tag ID: {selectedAnimal.tagId}</h3>
                        <p>Type: {selectedAnimal.type}</p>
                        {isOutsideGeofence(selectedAnimal.position) &&
                            <Badge variant="destructive">Outside Geofence</Badge>
                        }
                    </div>
                  </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </CardContent>
      </Card>
    </div>
  );
}
