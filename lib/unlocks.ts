export type Feature = 
  | 'search_salon'      // Level 3
  | 'time_travel_3'     // Level 10
  | 'create_collection' // Level 15
  | 'time_travel_7'     // Level 30
  | 'publish_salon';    // Level 25

export const LEVEL_REQUIREMENTS: Record<Feature, number> = {
  search_salon: 3,
  time_travel_3: 10,
  create_collection: 15,
  publish_salon: 25,
  time_travel_7: 30,
};

export function canUnlock(feature: Feature, userLevel: number): boolean {
  return userLevel >= LEVEL_REQUIREMENTS[feature];
}

export function getMissingLevel(feature: Feature, userLevel: number): number {
  return Math.max(0, LEVEL_REQUIREMENTS[feature] - userLevel);
}
