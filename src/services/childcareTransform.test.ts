import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformProvider } from './childcareTransform';
import { LicenseType } from '../types/provider';
import type { RawProvider } from './childcareApi';

const baseRaw: RawProvider = {
  LicenseNumber: 'LIC-001',
  FacilityName: 'Sunshine Center',
  FacilityType: 'Center',
  Capacity: 30,
  Latitude: 42.5,
  Longitude: -83.2,
  StreetAddress: '123 Main St',
  City: 'Detroit',
  CountyCode: '163',
  ZIPCode: '48201',
};

describe('transformProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps FacilityType "Center" to LicenseType.Center', () => {
    const result = transformProvider({ ...baseRaw, FacilityType: 'Center' });
    expect(result).not.toBeNull();
    expect(result!.licenseType).toBe(LicenseType.Center);
  });

  it('maps FacilityType "Group Home (7-12)" to LicenseType.GroupHome', () => {
    const result = transformProvider({ ...baseRaw, FacilityType: 'Group Home (7-12)' });
    expect(result).not.toBeNull();
    expect(result!.licenseType).toBe(LicenseType.GroupHome);
  });

  it('maps FacilityType "Family Home (1-6)" to LicenseType.FamilyHome', () => {
    const result = transformProvider({ ...baseRaw, FacilityType: 'Family Home (1-6)' });
    expect(result).not.toBeNull();
    expect(result!.licenseType).toBe(LicenseType.FamilyHome);
  });

  it('copies all Provider fields from the correct raw fields', () => {
    const result = transformProvider(baseRaw);
    expect(result).toEqual({
      id: 'LIC-001',
      name: 'Sunshine Center',
      licenseType: LicenseType.Center,
      capacity: 30,
      lat: 42.5,
      lng: -83.2,
      address: '123 Main St',
      city: 'Detroit',
      county: '163',
      zipCode: '48201',
      rating: null,
    });
  });

  it('always sets rating to null', () => {
    const result = transformProvider(baseRaw);
    expect(result!.rating).toBeNull();
  });

  it('returns null for an unknown FacilityType', () => {
    const result = transformProvider({ ...baseRaw, FacilityType: 'Unknown Type' });
    expect(result).toBeNull();
  });

  it('calls console.warn with the unknown type for an unknown FacilityType', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    transformProvider({ ...baseRaw, FacilityType: 'UnknownXYZ' });
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('UnknownXYZ');
  });

  it('does not call console.warn for known types', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    transformProvider({ ...baseRaw, FacilityType: 'Center' });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
