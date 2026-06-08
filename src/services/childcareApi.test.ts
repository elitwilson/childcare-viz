import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllProviders } from './childcareApi';
import type { RawProvider } from './childcareApi';

function makeRaw(overrides: Partial<RawProvider> = {}): RawProvider {
  return {
    LicenseNumber: 'LIC-001',
    FacilityName: 'Test Center',
    FacilityType: 'Center',
    Capacity: 10,
    Latitude: 42.0,
    Longitude: -83.0,
    StreetAddress: '1 Main St',
    City: 'Lansing',
    CountyCode: '033',
    ZIPCode: '48901',
    ...overrides,
  };
}

function makePageResponse(records: RawProvider[]): Response {
  const body = JSON.stringify({ features: records.map((r) => ({ attributes: r })) });
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function makeFullPage(offset: number): RawProvider[] {
  return Array.from({ length: 1000 }, (_, i) =>
    makeRaw({ LicenseNumber: `LIC-${offset}-${i}` }),
  );
}

describe('fetchAllProviders', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('issues exactly 8 fetch calls', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(makePageResponse(makeFullPage(0))),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchAllProviders();

    expect(fetchMock).toHaveBeenCalledTimes(8);
  });

  it('includes the correct resultOffset in each request URL', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(makePageResponse(makeFullPage(0))),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchAllProviders();

    const urls: string[] = fetchMock.mock.calls.map((c: unknown[]) => c[0] as string);
    const offsets = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];
    for (const offset of offsets) {
      expect(urls.some((u) => u.includes(`resultOffset=${offset}`))).toBe(true);
    }
  });

  it('includes resultRecordCount=1000, returnGeometry=false, and f=json in each URL', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(makePageResponse(makeFullPage(0))),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchAllProviders();

    const urls: string[] = fetchMock.mock.calls.map((c: unknown[]) => c[0] as string);
    for (const url of urls) {
      expect(url).toContain('resultRecordCount=1000');
      expect(url).toContain('returnGeometry=false');
      expect(url).toContain('f=json');
    }
  });

  it('returns merged flat array of all records across 8 pages', async () => {
    const pages = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(makePageResponse(makeFullPage(0))),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchAllProviders();

    expect(result).toHaveLength(8000);
    expect(pages.length).toBe(8);
  });

  it('handles a short last page without error', async () => {
    const fullPage = makeFullPage(0);
    const shortPage = [makeRaw({ LicenseNumber: 'LIC-SHORT' })];

    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      const page = callCount < 8 ? fullPage : shortPage;
      return Promise.resolve(makePageResponse(page));
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchAllProviders();

    expect(result).toHaveLength(7 * 1000 + 1);
  });

  it('rejects if any page fetch rejects (network error)', async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 4) return Promise.reject(new Error('Network error'));
      return Promise.resolve(makePageResponse(makeFullPage(0)));
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchAllProviders()).rejects.toThrow('Network error');
  });

  it('rejects if any page returns a non-OK HTTP response', async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 3) {
        return Promise.resolve(new Response('Server Error', { status: 500 }));
      }
      return Promise.resolve(makePageResponse(makeFullPage(0)));
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchAllProviders()).rejects.toThrow();
  });

  it('initiates all 8 fetch calls before any resolves (parallel)', async () => {
    const resolvers: Array<() => void> = [];
    const fetchMock = vi.fn().mockImplementation(() =>
      new Promise<Response>((resolve) => {
        resolvers.push(() => resolve(makePageResponse(makeFullPage(0))));
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const allProvidersPromise = fetchAllProviders();

    // All 8 calls should be registered synchronously before any resolves
    expect(fetchMock).toHaveBeenCalledTimes(8);

    resolvers.forEach((r) => r());
    await allProvidersPromise;
  });
});
