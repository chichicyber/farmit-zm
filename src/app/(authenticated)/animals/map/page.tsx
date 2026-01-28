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

export default function AnimalMapPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [locations, setLocations] = useState<AnimalLocation[]>(getInitialAnimalLocations());
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(null);
  const [selectedField, setSelectedField] = useState(fields[0]);
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

  const handleFieldChange = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (field) {
        setSelectedField(field);
    }
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
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Animal Map View</h1>
        <p className="text-muted-foreground">
            Monitor your livestock locations across different fields.
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
                            <RefreshCw className="mr-2 h-4 w-4" /> Simulate Movement
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
                        <APIProvider apiKey={apiKey}>
                            <Map
                            center={selectedField.center}
                            zoom={14}
                            mapId="farmit_map_2"
                            mapTypeControl={false}
                            streetViewControl={false}
                            >
                            {locations.map((animal) => {
                                const outOfBounds = isOutsideGeofence(animal.position, selectedField);
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
                                        {isOutsideGeofence(selectedAnimal.position, selectedField) &&
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
        </div>
    </div>
  );
}
