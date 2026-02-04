'use client';

import { useEffect, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyAnimals } from '@/lib/dummy-data';
import { useLanguage } from '@/contexts/language-context';

type Animal = {
  id: string;
  tagId: string;
  animalType: string;
  locationLatitude?: number;
  locationLongitude?: number;
};

type AnimalLocation = {
  id: string;
  tagId: string;
  type: string;
  position: { lat: number; lng: number };
};

const fields = [
    { name: 'East Chongwe Bush', center: { lat: -15.3482, lng: 28.5204 }, radius: 0.0108 },
    { name: 'Ngwerere North', center: { lat: -15.2855, lng: 28.3611 }, radius: 0.009 },
    { name: 'Makeni West Farm', center: { lat: -15.4821, lng: 28.2150 }, radius: 0.0135 },
    { name: 'Shimabala South', center: { lat: -15.6120, lng: 28.2955 }, radius: 0.0099 },
];

const isOutsideGeofence = (position: { lat: number; lng: number }, field: typeof fields[0]) => {
    const dist = Math.sqrt(
        Math.pow(position.lat - field.center.lat, 2) +
        Math.pow(position.lng - field.center.lng, 2)
    );
    return dist > field.radius;
};

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function AnimalMap() {
    const { t } = useLanguage();
    const animals = dummyAnimals;
    const isLoading = false; // Data is loaded locally

    const [locations, setLocations] = useState<AnimalLocation[]>([]);
    const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(null);
    const [selectedField, setSelectedField] = useState(fields[0]);

    useEffect(() => {
        if (animals) {
            const validLocations = animals
                .filter(animal => animal.locationLatitude != null && animal.locationLongitude != null)
                .map(animal => ({
                    id: animal.id,
                    tagId: animal.tagId,
                    type: animal.animalType,
                    position: {
                        lat: animal.locationLatitude!,
                        lng: animal.locationLongitude!,
                    },
                }));
            setLocations(validLocations);
        }
    }, [animals]);

    const defaultIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
    }), []);

    const outOfBoundsIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
    }), []);

    const handleFieldChange = (fieldName: string) => {
        const field = fields.find(f => f.name === fieldName);
        if (field) {
            setSelectedField(field);
        }
    };
  
    const renderContent = () => {
      if(isLoading) {
        return (
          <div className="md:col-span-2">
            <Card className="h-[70vh]">
              <CardContent className="p-0 h-full rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
        );
      }

      if (locations.length === 0) {
        return (
          <div className="md:col-span-2">
            <Card className="h-[70vh]">
              <CardContent className="p-0 h-full rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">{t('animalMap.noData')}</p>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      return (
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
                                  <h3 className="font-bold">{t('animalMap.popup.tagId')}: {selectedAnimal.tagId}</h3>
                                  <p>{t('animalMap.popup.type')}: {t(`animalTypes.${selectedAnimal.type.toLowerCase()}`)}</p>
                                  {isOutsideGeofence(selectedAnimal.position, selectedField) &&
                                      <Badge variant="destructive">{t('animalMap.popup.outOfBounds')}</Badge>
                                  }
                              </div>
                          </Popup>
                      )}
                  </MapContainer>
              </CardContent>
          </Card>
        </div>
      );
    }

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('animalMap.title')}</h1>
        <p className="text-muted-foreground">
            {t('animalMap.description')}
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('animalMap.controls.title')}</CardTitle>
                        <CardDescription>{t('animalMap.controls.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="field-select">{t('animalMap.controls.fieldLabel')}</Label>
                            <Select onValueChange={handleFieldChange} defaultValue={selectedField.name}>
                                <SelectTrigger id="field-select">
                                    <SelectValue placeholder={t('animalMap.controls.fieldPlaceholder')} />
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
                    </CardContent>
                </Card>
            </div>
            {renderContent()}
        </div>
    </div>
  );
}
