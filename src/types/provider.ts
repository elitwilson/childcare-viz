export const LicenseType = {
  Center: 'center',
  GroupHome: 'group_home',
  FamilyHome: 'family_home',
} as const;

export type LicenseType = (typeof LicenseType)[keyof typeof LicenseType];

export interface Provider {
  id: string;
  name: string;
  licenseType: LicenseType;
  capacity: number;
  lat: number;
  lng: number;
  address: string;
  city: string;
  county: string;
  zipCode: string;
  rating: number | null;
}
