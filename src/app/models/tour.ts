import { FileContainer } from "./fileContainer";
import { Lifestation } from "./lifestation";
import { StolpersteinLocation, StolpersteinLocationTransfer } from "./stolpersteinLocation";
import { StolpersteinRelation } from "./stolpersteinRelation";
import { TextBox } from "./textbox";

export interface Tour {
    id: number,
    name: string,
    locations?: StolpersteinLocation[]
}