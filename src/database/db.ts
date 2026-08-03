import Dexie from "dexie";
import type { EntityTable } from "dexie";
import type { Property } from "../types/property";
import type { PropertyHistory } from "../types/history";

export class ImmobiliDatabase extends Dexie {
    immobili!: EntityTable<Property, "id">;
    storico!: EntityTable<PropertyHistory, "id">;

    constructor() {
        super("ConfrontoImmobili");

        this.version(4).stores({
            immobili: "id, nome, dataAcquisizione, ordine, annoCostruzione, speseCondominiali",
            storico: "id, propertyId, data",
        });
    }
}

export const db = new ImmobiliDatabase();