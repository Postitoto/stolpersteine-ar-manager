import { Coordinates } from "../models/coordinates";
import { StolpersteinLocation, StolpersteinLocationTransfer } from "../models/stolpersteinLocation";

export class AppUtils {

    public static coordinatesToString(coordinates: Coordinates): string {
        return coordinates.latitude + ',' + coordinates.longitude;
    }

    public static coordStringToCoordinates(coordString: string): Coordinates {
        const splittedCoords = coordString.split(',')
        return {latitude: splittedCoords[0], longitude: splittedCoords[1]} as Coordinates;
    }

    public static locTransferToLoc(locTransfer: StolpersteinLocationTransfer): StolpersteinLocation {
        return {
            id: locTransfer.id,
            coordinates: this.coordStringToCoordinates(locTransfer.coordinates),
            name: locTransfer.name
        } as StolpersteinLocation;
    }

    public static isCoordinatesEqual(coordinates1: Coordinates, coordinates2: Coordinates) {
        return coordinates1.latitude === coordinates2.latitude && coordinates1.longitude === coordinates2.longitude;
    }
}