import type { Location, TransportMode } from '../pso/types';
import { haversineDistance } from '../lib/utils';

// ─── 15 Integrated Units (IUs) ─────────────────────────────
export const IU_LOCATIONS: Location[] = [
  { id: 'iu01', code: 'IU01', name: 'Rajasthan IU – Beawar', type: 'IU', latitude: 26.1007, longitude: 74.3234, state: 'Rajasthan', prodCapacity: 85000, prodCostPerMt: 295, initialInventory: 12000, safetyStock: 3000, maxInventory: 30000, demand: [12000, 13500, 11000] },
  { id: 'iu02', code: 'IU02', name: 'Gujarat IU – Surat', type: 'IU', latitude: 21.1702, longitude: 72.8311, state: 'Gujarat', prodCapacity: 75000, prodCostPerMt: 280, initialInventory: 9000, safetyStock: 2500, maxInventory: 25000, demand: [10000, 11000, 9500] },
  { id: 'iu03', code: 'IU03', name: 'Madhya Pradesh IU – Satna', type: 'IU', latitude: 24.5900, longitude: 80.8322, state: 'Madhya Pradesh', prodCapacity: 90000, prodCostPerMt: 270, initialInventory: 15000, safetyStock: 4000, maxInventory: 35000, demand: [14000, 16000, 13000] },
  { id: 'iu04', code: 'IU04', name: 'Andhra Pradesh IU – Kurnool', type: 'IU', latitude: 15.8281, longitude: 78.0373, state: 'Andhra Pradesh', prodCapacity: 70000, prodCostPerMt: 305, initialInventory: 8000, safetyStock: 2000, maxInventory: 22000, demand: [9000, 10000, 8500] },
  { id: 'iu05', code: 'IU05', name: 'Telangana IU – Nalgonda', type: 'IU', latitude: 17.0575, longitude: 79.2690, state: 'Telangana', prodCapacity: 65000, prodCostPerMt: 310, initialInventory: 7500, safetyStock: 2000, maxInventory: 20000, demand: [8500, 9500, 8000] },
  { id: 'iu06', code: 'IU06', name: 'Tamil Nadu IU – Ariyalur', type: 'IU', latitude: 11.1400, longitude: 79.0762, state: 'Tamil Nadu', prodCapacity: 80000, prodCostPerMt: 315, initialInventory: 11000, safetyStock: 3000, maxInventory: 28000, demand: [11000, 12500, 10500] },
  { id: 'iu07', code: 'IU07', name: 'Karnataka IU – Gulbarga', type: 'IU', latitude: 17.3297, longitude: 76.8200, state: 'Karnataka', prodCapacity: 60000, prodCostPerMt: 300, initialInventory: 7000, safetyStock: 1800, maxInventory: 18000, demand: [8000, 9000, 7500] },
  { id: 'iu08', code: 'IU08', name: 'Himachal Pradesh IU – Bilaspur', type: 'IU', latitude: 31.3400, longitude: 76.7600, state: 'Himachal Pradesh', prodCapacity: 55000, prodCostPerMt: 330, initialInventory: 6000, safetyStock: 1500, maxInventory: 16000, demand: [6500, 7500, 6000] },
  { id: 'iu09', code: 'IU09', name: 'Uttarakhand IU – Roorkee', type: 'IU', latitude: 29.8543, longitude: 77.8880, state: 'Uttarakhand', prodCapacity: 50000, prodCostPerMt: 325, initialInventory: 5500, safetyStock: 1500, maxInventory: 15000, demand: [6000, 7000, 5500] },
  { id: 'iu10', code: 'IU10', name: 'Chhattisgarh IU – Raipur', type: 'IU', latitude: 21.2514, longitude: 81.6296, state: 'Chhattisgarh', prodCapacity: 95000, prodCostPerMt: 265, initialInventory: 16000, safetyStock: 4500, maxInventory: 38000, demand: [15000, 17000, 14000] },
  { id: 'iu11', code: 'IU11', name: 'Odisha IU – Jharsuguda', type: 'IU', latitude: 21.8553, longitude: 84.0075, state: 'Odisha', prodCapacity: 72000, prodCostPerMt: 290, initialInventory: 9500, safetyStock: 2500, maxInventory: 24000, demand: [10500, 12000, 10000] },
  { id: 'iu12', code: 'IU12', name: 'West Bengal IU – Durgapur', type: 'IU', latitude: 23.4800, longitude: 87.3200, state: 'West Bengal', prodCapacity: 68000, prodCostPerMt: 285, initialInventory: 8500, safetyStock: 2200, maxInventory: 21000, demand: [9500, 10500, 9000] },
  { id: 'iu13', code: 'IU13', name: 'Punjab IU – Ropar', type: 'IU', latitude: 30.9700, longitude: 76.5300, state: 'Punjab', prodCapacity: 58000, prodCostPerMt: 320, initialInventory: 7000, safetyStock: 1800, maxInventory: 17000, demand: [7500, 8500, 7000] },
  { id: 'iu14', code: 'IU14', name: 'Jharkhand IU – Bokaro', type: 'IU', latitude: 23.6693, longitude: 86.1511, state: 'Jharkhand', prodCapacity: 62000, prodCostPerMt: 295, initialInventory: 8000, safetyStock: 2000, maxInventory: 20000, demand: [8500, 9500, 8000] },
  { id: 'iu15', code: 'IU15', name: 'Maharashtra IU – Chandrapur', type: 'IU', latitude: 19.9615, longitude: 79.2961, state: 'Maharashtra', prodCapacity: 78000, prodCostPerMt: 285, initialInventory: 10000, safetyStock: 2800, maxInventory: 26000, demand: [10500, 12000, 10000] },
];

// ─── 15 Grinding Units (GUs) ───────────────────────────────
export const GU_LOCATIONS: Location[] = [
  { id: 'gu01', code: 'GU01', name: 'Delhi NCR GU – Ballabhgarh', type: 'GU', latitude: 28.3411, longitude: 77.3212, state: 'Haryana', initialInventory: 4000, safetyStock: 1500, maxInventory: 14000, demand: [18000, 20000, 17000] },
  { id: 'gu02', code: 'GU02', name: 'Mumbai GU – Navi Mumbai', type: 'GU', latitude: 19.0330, longitude: 73.0297, state: 'Maharashtra', initialInventory: 3500, safetyStock: 1200, maxInventory: 12000, demand: [16000, 18000, 15500] },
  { id: 'gu03', code: 'GU03', name: 'Bengaluru GU – Hoskote', type: 'GU', latitude: 13.0700, longitude: 77.7900, state: 'Karnataka', initialInventory: 3000, safetyStock: 1000, maxInventory: 11000, demand: [15000, 17000, 14500] },
  { id: 'gu04', code: 'GU04', name: 'Hyderabad GU – Sangareddy', type: 'GU', latitude: 17.6200, longitude: 78.0900, state: 'Telangana', initialInventory: 3200, safetyStock: 1100, maxInventory: 12000, demand: [14000, 16000, 13500] },
  { id: 'gu05', code: 'GU05', name: 'Chennai GU – Kancheepuram', type: 'GU', latitude: 12.8300, longitude: 79.7000, state: 'Tamil Nadu', initialInventory: 2800, safetyStock: 1000, maxInventory: 10000, demand: [13000, 15000, 12500] },
  { id: 'gu06', code: 'GU06', name: 'Kolkata GU – Howrah', type: 'GU', latitude: 22.5958, longitude: 88.2636, state: 'West Bengal', initialInventory: 2500, safetyStock: 900, maxInventory: 9000, demand: [12000, 14000, 11500] },
  { id: 'gu07', code: 'GU07', name: 'Ahmedabad GU – Sanand', type: 'GU', latitude: 22.9900, longitude: 72.3800, state: 'Gujarat', initialInventory: 3000, safetyStock: 1000, maxInventory: 11000, demand: [14000, 16000, 13000] },
  { id: 'gu08', code: 'GU08', name: 'Pune GU – Talegaon', type: 'GU', latitude: 18.7400, longitude: 73.6800, state: 'Maharashtra', initialInventory: 2800, safetyStock: 950, maxInventory: 10000, demand: [13000, 15000, 12500] },
  { id: 'gu09', code: 'GU09', name: 'Lucknow GU – Unnao', type: 'GU', latitude: 26.5500, longitude: 80.4900, state: 'Uttar Pradesh', initialInventory: 2200, safetyStock: 800, maxInventory: 8500, demand: [11000, 12500, 10500] },
  { id: 'gu10', code: 'GU10', name: 'Jaipur GU – Kotputli', type: 'GU', latitude: 27.7000, longitude: 76.2000, state: 'Rajasthan', initialInventory: 2000, safetyStock: 750, maxInventory: 8000, demand: [10000, 11500, 9500] },
  { id: 'gu11', code: 'GU11', name: 'Bhopal GU – Mandideep', type: 'GU', latitude: 23.0900, longitude: 77.5300, state: 'Madhya Pradesh', initialInventory: 2400, safetyStock: 850, maxInventory: 9000, demand: [11500, 13000, 11000] },
  { id: 'gu12', code: 'GU12', name: 'Visakhapatnam GU', type: 'GU', latitude: 17.6868, longitude: 83.2185, state: 'Andhra Pradesh', initialInventory: 2600, safetyStock: 900, maxInventory: 9500, demand: [12000, 13500, 11500] },
  { id: 'gu13', code: 'GU13', name: 'Patna GU – Hajipur', type: 'GU', latitude: 25.6900, longitude: 85.2300, state: 'Bihar', initialInventory: 1800, safetyStock: 650, maxInventory: 7500, demand: [9000, 10500, 8500] },
  { id: 'gu14', code: 'GU14', name: 'Nagpur GU – Butibori', type: 'GU', latitude: 20.8600, longitude: 79.1500, state: 'Maharashtra', initialInventory: 2300, safetyStock: 800, maxInventory: 9000, demand: [11000, 12500, 10500] },
  { id: 'gu15', code: 'GU15', name: 'Indore GU – Pithampur', type: 'GU', latitude: 22.6200, longitude: 75.6900, state: 'Madhya Pradesh', initialInventory: 2100, safetyStock: 750, maxInventory: 8500, demand: [10500, 12000, 10000] },
];

// ─── All Locations ─────────────────────────────────────────
export const ALL_LOCATIONS: Location[] = [...IU_LOCATIONS, ...GU_LOCATIONS];

// ─── Transport Modes ───────────────────────────────────────
export const TRANSPORT_MODES: TransportMode[] = [
  { id: 'road', code: 'ROAD', name: 'Road Truck', costPerMtKm: 1.5, capacityMtTrip: 30, sbqTrips: 1, description: 'Standard road transport via trucks' },
  { id: 'rail', code: 'RAIL', name: 'Railway Rake', costPerMtKm: 0.8, capacityMtTrip: 700, sbqTrips: 1, description: 'Bulk rail transport via railway rakes' },
  { id: 'bulk', code: 'BULK', name: 'Bulk Carrier', costPerMtKm: 1.1, capacityMtTrip: 350, sbqTrips: 1, description: 'Intermediate bulk carrier transport' },
];

// ─── Distance Matrix (Haversine) ───────────────────────────
export function computeDistanceMatrix(locations: Location[]): number[][] {
  const n = locations.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = haversineDistance(
          locations[i].latitude, locations[i].longitude,
          locations[j].latitude, locations[j].longitude
        );
      }
    }
  }
  return matrix;
}

// Pre-computed distance matrix for all 30 locations
export const DISTANCE_MATRIX = computeDistanceMatrix(ALL_LOCATIONS);
