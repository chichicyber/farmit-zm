
export type Animal = {
  id: string;
  tagId: string;
  animalType: string;
  healthStatus: string;
  vaccinationSchedule: {
    vaccineName: string;
    nextVaccinationAt: string;
  };
  feedingSchedule: {
    time: string;
    frequency: string;
  };
  locationLatitude: number;
  locationLongitude: number;
};

export type Crop = {
  id: string;
  userId: string;
  cropType: string;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  fertilizerSchedule: {
    nextApplicationAt: string;
  };
  weedingSchedule: {
    nextWeedingAt: string;
  };
  sprayingSchedule: {
    nextSprayingAt: string;
  };
};


export const dummyAnimals: Animal[] = [
  {
    id: '1',
    tagId: 'ZM-C-001',
    animalType: 'Cattle',
    healthStatus: 'Healthy',
    vaccinationSchedule: {
      vaccineName: 'Anthrax',
      nextVaccinationAt: new Date('2024-08-15').toISOString(),
    },
    feedingSchedule: {
      time: '07:00 & 17:00',
      frequency: 'Twice daily',
    },
    locationLatitude: -15.3480,
    locationLongitude: 28.5200,
  },
  {
    id: '2',
    tagId: 'ZM-G-001',
    animalType: 'Goat',
    healthStatus: 'Under Observation',
    vaccinationSchedule: {
      vaccineName: 'Pulpy Kidney',
      nextVaccinationAt: new Date('2024-07-30').toISOString(),
    },
    feedingSchedule: {
      time: '08:00',
      frequency: 'Once daily',
    },
    locationLatitude: -15.2850,
    locationLongitude: 28.3615,
  },
  {
    id: '3',
    tagId: 'ZM-CH-012',
    animalType: 'Chicken',
    healthStatus: 'Healthy',
    vaccinationSchedule: {
      vaccineName: 'Newcastle',
      nextVaccinationAt: new Date('2024-09-01').toISOString(),
    },
    feedingSchedule: {
      time: 'Ad libitum',
      frequency: 'Constant',
    },
    locationLatitude: -15.4825,
    locationLongitude: 28.2155,
  },
  {
    id: '4',
    tagId: 'ZM-P-005',
    animalType: 'Pig',
    healthStatus: 'Sick',
    vaccinationSchedule: {
      vaccineName: 'Swine Fever',
      nextVaccinationAt: new Date('2024-08-20').toISOString(),
    },
    feedingSchedule: {
      time: '06:30 & 16:30',
      frequency: 'Twice daily',
    },
    locationLatitude: -15.4818,
    locationLongitude: 28.2145,
  },
  {
    id: '5',
    tagId: 'ZM-S-008',
    animalType: 'Sheep',
    healthStatus: 'Healthy',
    vaccinationSchedule: {
      vaccineName: 'Tetanus',
      nextVaccinationAt: new Date('2024-09-10').toISOString(),
    },
    feedingSchedule: {
      time: '10:00',
      frequency: 'Grazing',
    },
    locationLatitude: -15.6122,
    locationLongitude: 28.2958,
  },
];

export const dummyCrops: Crop[] = [
  {
    id: '1',
    userId: 'dummy-user',
    cropType: 'Maize Field A',
    plantingDate: new Date('2023-11-15').toISOString(),
    expectedHarvestDate: new Date('2024-04-15').toISOString(),
    growthStage: 'Harvesting',
    fertilizerSchedule: {
      nextApplicationAt: new Date('2024-01-15').toISOString(),
    },
    weedingSchedule: {
      nextWeedingAt: new Date('2023-12-20').toISOString(),
    },
    sprayingSchedule: {
      nextSprayingAt: new Date('2024-02-01').toISOString(),
    },
  },
  {
    id: '2',
    userId: 'dummy-user',
    cropType: 'Soyabeans Plot 3',
    plantingDate: new Date('2023-12-01').toISOString(),
    expectedHarvestDate: new Date('2024-05-01').toISOString(),
    growthStage: 'Flowering',
    fertilizerSchedule: {
      nextApplicationAt: new Date('2024-02-10').toISOString(),
    },
    weedingSchedule: {
      nextWeedingAt: new Date('2024-01-05').toISOString(),
    },
    sprayingSchedule: {
      nextSprayingAt: new Date('2024-03-15').toISOString(),
    },
  },
  {
    id: '3',
    userId: 'dummy-user',
    cropType: 'Groundnuts West',
    plantingDate: new Date('2024-01-10').toISOString(),
    expectedHarvestDate: new Date('2024-06-20').toISOString(),
    growthStage: 'Vegetative',
    fertilizerSchedule: {
      nextApplicationAt: new Date('2024-03-01').toISOString(),
    },
    weedingSchedule: {
      nextWeedingAt: new Date('2024-02-15').toISOString(),
    },
    sprayingSchedule: {
      nextSprayingAt: new Date('2024-04-10').toISOString(),
    },
  },
  {
    id: '4',
    userId: 'dummy-user',
    cropType: 'Cotton East',
    plantingDate: new Date('2024-01-25').toISOString(),
    expectedHarvestDate: new Date('2024-07-15').toISOString(),
    growthStage: 'Germination',
    fertilizerSchedule: {
      nextApplicationAt: new Date('2024-03-20').toISOString(),
    },
    weedingSchedule: {
      nextWeedingAt: new Date('2024-03-01').toISOString(),
    },
    sprayingSchedule: {
      nextSprayingAt: new Date('2024-04-20').toISOString(),
    },
  },
  {
    id: '5',
    userId: 'dummy-user',
    cropType: 'Wheat North',
    plantingDate: new Date('2024-05-05').toISOString(),
    expectedHarvestDate: new Date('2024-10-10').toISOString(),
    growthStage: 'Planting',
    fertilizerSchedule: {
      nextApplicationAt: new Date('2024-06-15').toISOString(),
    },
    weedingSchedule: {
      nextWeedingAt: new Date('2024-06-01').toISOString(),
    },
    sprayingSchedule: {
      nextSprayingAt: new Date('2024-07-20').toISOString(),
    },
  },
];
