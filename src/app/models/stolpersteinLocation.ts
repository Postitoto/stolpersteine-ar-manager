import { Coordinates } from "./coordinates";

export interface StolpersteinLocationTransfer {
    id: number;
    coordinates: string;
    name: string;
}

export interface StolpersteinLocation {
    id: number;
    coordinates: Coordinates;
    name: string;
}