import {
    ChevronDown
} from "lucide-react";

import {
    useState
} from "react";

import type { ReactNode } from "react";


interface Props {

    titolo:string;

    icona?:ReactNode;

    colore:string;

    children:ReactNode;

    aperto?:boolean;

}



export default function AccordionSection({

    titolo,

    icona,

    colore,

    children,

    aperto=false

}:Props){


const [apertoStato,setApertoStato] =

useState(aperto);



return (


<div

className="
rounded-xl
overflow-hidden
border
border-gray-200
"

>


<button

onClick={

()=>setApertoStato(
!apertoStato
)

}

className="
w-full
flex
items-center
justify-between
px-4
py-3
font-semibold
transition
"

style={{

backgroundColor:colore

}}

>


<div

className="
flex
items-center
gap-2
"

>

{icona}

<span>

{titolo}

</span>


</div>



<ChevronDown

size={20}

className={

apertoStato
?
"rotate-180 transition"
:
"transition"

}

/>


</button>




{

apertoStato &&


<div

className="
p-4
bg-white
space-y-3
"

>


{children}


</div>


}



</div>


);


}