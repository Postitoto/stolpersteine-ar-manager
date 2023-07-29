import { Stolperstein } from "./stolperstein";

export interface StolpersteinRelation {
    id?: number; // id of the relation object
    tempId?: string;
    stolperstein: number; // id of the selected stolperstein
    related_stolperstein: Stolperstein; // stolperstein this stolperstein is related to
    type: string;
    text: string;
}