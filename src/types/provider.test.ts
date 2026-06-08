import { describe, it, expect } from 'vitest';
import { LicenseType } from './provider';
import type { Provider } from './provider';

describe('Provider interface', () => {
  it('accepts a fully typed provider object', () => {
    const p: Provider = {
      id: '123',
      name: 'Sunshine Daycare',
      licenseType: LicenseType.Center,
      capacity: 30,
      lat: 40.7128,
      lng: -74.006,
      address: '123 Main St',
      city: 'Portland',
      county: '82',
      zipCode: '97201',
      rating: null,
    };
    expect(p.id).toBe('123');
    expect(p.rating).toBeNull();
  });

  it('accepts a numeric rating', () => {
    const p: Provider = {
      id: '456',
      name: 'Happy Kids',
      licenseType: LicenseType.FamilyHome,
      capacity: 10,
      lat: 45.5,
      lng: -122.6,
      address: '456 Oak Ave',
      city: 'Salem',
      county: '24',
      zipCode: '97301',
      rating: 4,
    };
    expect(p.rating).toBe(4);
  });
});
