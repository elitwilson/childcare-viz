export interface RawProvider {
  LicenseNumber: string;
  FacilityName: string;
  FacilityType: string;
  Capacity: number;
  Latitude: number;
  Longitude: number;
  StreetAddress: string;
  City: string;
  CountyCode: string;
  ZIPCode: string;
}

interface PageResponse {
  features: Array<{ attributes: RawProvider }>;
}

const BASE_URL =
  'https://services1.arcgis.com/vq5LBRIGrOructue/arcgis/rest/services/MichiganChildCareProviders/FeatureServer/0/query';

const OFFSETS = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];

async function fetchPage(offset: number): Promise<RawProvider[]> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: 'LicenseNumber,FacilityName,FacilityType,Capacity,Latitude,Longitude,StreetAddress,City,CountyCode,ZIPCode',
    returnGeometry: 'false',
    resultOffset: String(offset),
    resultRecordCount: '1000',
    f: 'json',
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Fetch failed for offset ${offset}: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as PageResponse;
  return data.features.map((f) => f.attributes);
}

export async function fetchAllProviders(): Promise<RawProvider[]> {
  const pages = await Promise.all(OFFSETS.map((offset) => fetchPage(offset)));
  return pages.flat();
}
