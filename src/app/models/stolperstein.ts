import { FileContainer } from "./fileContainer";
import { Lifestation } from "./lifestation";
import { StolpersteinLocation, StolpersteinLocationTransfer } from "./stolpersteinLocation";
import { StolpersteinRelation } from "./stolpersteinRelation";
import { TextBox } from "./textbox";

export interface Stolperstein {
    url?: string;
    id: number;
    name: string;
    location: StolpersteinLocation | StolpersteinLocationTransfer;
    files?: FileContainer;
    birthdate?: string;
    deathdate?: string;
    birthplace?: string;
    deathplace?: string;
    reason_for_persecution: string;
    info_text?: string;
    info_textboxes?: TextBox[];
    family_text?: string;
    stolperstein_relations?: StolpersteinRelation[];
    life_stations?: Lifestation[];
}