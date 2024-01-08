import { FileContainer } from "./fileContainer";
import { Lifestation } from "./lifestation";
import { StolpersteinLocation, StolpersteinLocationTransfer } from "./stolpersteinLocation";
import { StolpersteinRelation } from "./stolpersteinRelation";
import { TextBox } from "./textbox";

export interface Tour {
    id: number,
    name: string,
    description: string,
    locations?: number[]
}

export interface TourLocation {
    id: number,
    order: number,
    tour_id: number,
    location_id: number,
    audioFile: File | undefined,
    is_active: boolean,
}

// I use this interface because I don't want to modify the original Location interface
export interface TourLocationAudio {
    location_id: number | null,
    audioName: string | undefined,
    audioFile: File | undefined
}