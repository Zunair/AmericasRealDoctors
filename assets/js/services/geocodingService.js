export class GeocodingService {
  /**
   * @param {{ geocode(address:string): Promise<{latitude:number, longitude:number, timezone:string}> }} provider
   */
  constructor(provider) {
    this.provider = provider;
  }

  async geocodeOfficeAddress(address) {
    return this.provider.geocode(address);
  }
}

export const mockGeocodingProvider = {
  async geocode() {
    return { latitude: 39.9526, longitude: -75.1652, timezone: 'America/New_York' };
  }
};
