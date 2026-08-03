export function formatPrice(
    value:number
):string {


    return value.toLocaleString(
        "it-IT"
    );


}



export function parsePrice(
    value:string
):number {


    return Number(
        value.replace(
            /\./g,
            ""
        )
    );


}