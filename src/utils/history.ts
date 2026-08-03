import { db } from "../database/db";


import {
    v4 as uuid
} from "uuid";


import type {
    Property
} from "../types/property";





export async function salvaStorico(

immobile:Property

){


await db.storico.add({


id:uuid(),


propertyId:immobile.id,


data:new Date().toISOString(),


immobile:{
    ...immobile
}



});



}