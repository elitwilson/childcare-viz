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
  'https://utility.arcgis.com/usrsvcs/servers/a79c3b0caedf412599085941e2af91d4/rest/services/CSS/CSS_LARA/MapServer/5/query';

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

  const data = (await response.json()) as PageResponse & { error?: { code: number; message: string } };
  if (data.error) {
    throw new Error(`ArcGIS error (offset ${offset}): ${data.error.message}`);
  }
  return data.features.map((f) => f.attributes);
}

export async function fetchAllProviders(): Promise<RawProvider[]> {
  const pages = await Promise.all(OFFSETS.map((offset) => fetchPage(offset)));
  return pages.flat();
}
