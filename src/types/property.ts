export type EnergyClass =
    | "G"
    | "F"
    | "E"
    | "D"
    | "C"
    | "B"
    | "A1"
    | "A2"
    | "A3"
    | "A4";


export type GardenType =
    | "Nessuno"
    | "Privato"
    | "Comune";


export type PropertyType =
    | "Monolocale"
    | "Bilocale"
    | "Trilocale"
    | "Quadrilocale"
    | "Villetta a schiera"
    | "Villa"
    | "Rustico";



export interface Property {


    id:string;


    nome:string;


    url:string;


    immagine:string;



    prezzo:number;


    metriQuadri:number;



    tipologia:PropertyType;



    locali:number;


    camereDaLetto:number;


    bagni:number;



    boxAuto:number;


    balconi:number;


    terrazzi:boolean;


    cantina:boolean;



    giardino:GardenType;



    classeEnergetica:EnergyClass;



    piano:number;


    pianiEdificio:number;



    ascensore:boolean;


    arredato:boolean;



    riscaldamento:string[];


    climatizzazione:string[];



    altreCaratteristiche:string[];



    note:string;



    createdAt:Date;


    updatedAt:Date;


    dataAcquisizione:string;

    
    storicoCreato:boolean;


    annoCostruzione?: number;


    speseCondominiali?: number;

    ordine?: number;
}