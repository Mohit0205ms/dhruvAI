export interface PlanetData {
  current_sign: number;
  fullDegree: number;
  normDegree: number;
  isRetro: string;
  degrees: number;
  minutes: number;
  seconds: number;
  house_number: number;
  localized_name: string;
  zodiac_sign_name: string;
  zodiac_sign_lord: string;
  nakshatra_number: number;
  nakshatra_name: string;
  nakshatra_pada: number;
  nakshatra_vimsottari_lord: string;
}

export interface KundaliData {
  _id: string;
  statusCode: number;
  output: Record<string, PlanetData>;
  createdAt: Date;
  userId?: string;
}

export const KundaliSchema = {
  name: "Kundali",
  primaryKey: "_id",
  properties: {
    _id: "string",
    statusCode: "int",
    output: "string", // Store as JSON string for complex nested data
    createdAt: "date",
    userId: "string?"
  }
};
