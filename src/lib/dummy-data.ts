
export type Animal = {
  id: string;
  tagId: string;
  animalType: string;
  healthStatus: string;
  nextVaccinationDate: string;
  feedingSchedule?: string;
};

export type Crop = {
  id: string;
  userId: string;
  cropType: string;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
};


export const dummyAnimals: Animal[] = [
  {
    id: '1',
    tagId: 'ZM-C-001',
    animalType: 'Cattle',
    healthStatus: 'Healthy',
    nextVaccinationDate: new Date('2024-08-15').toISOString(),
    feedingSchedule: 'Twice daily with high-protein feed.',
  },
  {
    id: '2',
    tagId: 'ZM-G-001',
    animalType: 'Goat',
    healthStatus: 'Under Observation',
    nextVaccinationDate: new Date('2024-07-30').toISOString(),
    feedingSchedule: 'Grazing supplemented with pellets.',
  },
  {
    id: '3',
    tagId: 'ZM-CH-012',
    animalType: 'Chicken',
    healthStatus: 'Healthy',
    nextVaccinationDate: new Date('2024-09-01').toISOString(),
    feedingSchedule: 'Layers mash available ad libitum.',
  },
  {
    id: '4',
    tagId: 'ZM-P-005',
    animalType: 'Pig',
    healthStatus: 'Sick',
    nextVaccinationDate: new Date('2024-08-20').toISOString(),
    feedingSchedule: 'Swill and commercial pig feed.',
  },
  {
    id: '5',
    tagId: 'ZM-S-008',
    animalType: 'Sheep',
    healthStatus: 'Healthy',
    nextVaccinationDate: new Date('2024-09-10').toISOString(),
    feedingSchedule: 'Pasture grazing.',
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
  },
  {
    id: '2',
    userId: 'dummy-user',
    cropType: 'Soyabeans Plot 3',
    plantingDate: new Date('2023-12-01').toISOString(),
    expectedHarvestDate: new Date('2024-05-01').toISOString(),
    growthStage: 'Flowering',
  },
  {
    id: '3',
    userId: 'dummy-user',
    cropType: 'Groundnuts West',
    plantingDate: new Date('2024-01-10').toISOString(),
    expectedHarvestDate: new Date('2024-06-20').toISOString(),
    growthStage: 'Vegetative',
  },
  {
    id: '4',
    userId: 'dummy-user',
    cropType: 'Cotton East',
    plantingDate: new Date('2024-01-25').toISOString(),
    expectedHarvestDate: new Date('2024-07-15').toISOString(),
    growthStage: 'Germination',
  },
  {
    id: '5',
    userId: 'dummy-user',
    cropType: 'Wheat North',
    plantingDate: new Date('2024-05-05').toISOString(),
    expectedHarvestDate: new Date('2024-10-10').toISOString(),
    growthStage: 'Planting',
  },
];
