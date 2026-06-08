import { LicenseType } from '../types/provider';
import type { Provider } from '../types/provider';
import type { RawProvider } from './childcareApi';

const FACILITY_TYPE_MAP: Record<string, LicenseType> = {
  'Center': LicenseType.Center,
  'Group Home (7-12)': LicenseType.GroupHome,
  'Family Home (1-6)': LicenseType.FamilyHome,
};

export function transformProvider(raw: RawProvider): Provider | null {
  const licenseType = FACILITY_TYPE_MAP[raw.FacilityType];

  if (licenseType === undefined) {
    console.warn(`Unknown FacilityType: "${raw.FacilityType}" — record dropped`);
    return null;
  }

  return {
    id: raw.LicenseNumber,
    name: raw.FacilityName,
    licenseType,
    capacity: raw.Capacity,
    lat: raw.Latitude,
    lng: raw.Longitude,
    address: raw.StreetAddress,
    city: raw.City,
    county: raw.CountyCode,
    zipCode: raw.ZIPCode,
    rating: null,
  };
}
