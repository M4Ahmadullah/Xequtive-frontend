import {
  FareResponse,
  ApiResponse,
} from "../../components/booking/common/types";
import { Location } from "../../components/map/MapComponent";

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface FareRequest {
  locations: {
    pickup: LocationData;
    dropoff: LocationData;
    additionalStops?: LocationData[];
  };
  datetime: {
    date: Date | string;
    time: string;
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    mediumLuggage: number;
    handLuggage: number;
    babySeat: number;
    childSeat: number;
    boosterSeat: number;
    wheelchair: number;
  };
}

type EnhancedFareResponse = ApiResponse<{
  fare: FareResponse;
}>;

export declare const locationToLocationData: (
  location: Location
) => LocationData;
export declare const getFareEstimate: (
  initialRequest: FareRequest | Location
) => Promise<EnhancedFareResponse>;
export { type Location, type LocationData, type FareRequest };
