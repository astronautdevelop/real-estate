import { useTranslation } from "react-i18next";
import type { Property } from "../../types/property";

// Lista di caratteristiche predefinite
const CARATTERISTICHE_DISPONIBILI = [
    "property.Doppi servizi",
    "property.Riscaldamento a pavimento",
    "property.Vista panoramica",
    "property.Zona tranquilla",
    "property.Vicino ai servizi",
    "property.Ristrutturato",
    "property.Impianto fotovoltaico",
    "property.Infissi in legno/alluminio",
    "property.Pavimento in legno",
    "property.Camino",
    "property.Esposizione doppia",
    "property.Esposizione tripla",
    "property.Cancello elettrico",
    "property.Porta blindata",
    "property.Fibra ottica",
    "property.Esposizione esterna",
];

interface Props {
    dati: Property;
    modifica: (campo: keyof Property, valore: any) => void;
}

export default function PropertyExtras({ dati, modifica }: Props) {
    const { t } = useTranslation();
    const altre = dati.altreCaratteristiche || [];

    const toggleCaratteristica = (car: string) => {
        const newList = altre.includes(car)
            ? altre.filter((c) => c !== car)
            : [...altre, car];
        modifica("altreCaratteristiche", newList);
    };

    return (
        <div className="space-y-3">
            <label className="text-sm text-red-500 block"></label>
            <div className="grid grid-cols-2 gap-2">
                {CARATTERISTICHE_DISPONIBILI.map((car) => (
                    <label
                        key={car}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                        <input
                            type="checkbox"
                            checked={altre.includes(car)}
                            onChange={() => toggleCaratteristica(car)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {t(car)}
                    </label>
                ))}
            </div>
            <div className="mt-2 text-xs text-gray-400">
                {t("property.seleziona_caratteristiche")}
            </div>
            {(() => {
                // Filtra solo le caratteristiche valide (che esistono nella lista)
                const valide = altre.filter((item) => CARATTERISTICHE_DISPONIBILI.includes(item));
                // Rimuovi duplicati
                const uniche = Array.from(new Set(valide));
                
                return uniche.length > 0 && (
                    <div className="text-xs text-green-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">{t("property.Selezionate")}:</span>{" "}
                        {uniche.map((item) => t(item)).join(", ")}
                    </div>
                );
            })()}
        </div>
    );
}