import { StolpersteinLocation } from "./stolpersteinLocation";

export interface Lifestation {
    id?: number;
    tempId?: string;
    coordinates: string;
    name: string;
    text: string;
    stolperstein?: number;
}