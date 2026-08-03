import { useTranslation } from "react-i18next";
import type { Property } from "../../types/property";

interface Props {
    dati: Property;
    modifica: (campo: keyof Property, valore: any) => void;
}

export default function PropertyRooms({ dati, modifica }: Props) {
    const { t } = useTranslation();

    return (
        <div className="space-y-1">
            <div>
                <label className="text-sm text-gray-500">{t("property.locali")}</label>
                <input
                    type="number"
                    min="0"
                    value={dati.locali}
                    onChange={(e) => modifica("locali", Number(e.target.value))}
                    className="w-full border rounded-lg p-2 bg-gray-200"
                />
            </div>
            <div>
                <label className="text-sm text-gray-500">{t("property.camere")}</label>
                <input
                    type="number"
                    min="0"
                    value={dati.camereDaLetto}
                    onChange={(e) => modifica("camereDaLetto", Number(e.target.value))}
                    className="w-full border rounded-lg p-2 bg-gray-200"
                />
            </div>
            <div>
                <label className="text-sm text-gray-500">{t("property.bagni")}</label>
                <input
                    type="number"
                    min="0"
                    value={dati.bagni}
                    onChange={(e) => modifica("bagni", Number(e.target.value))}
                    className="w-full border rounded-lg p-2 bg-gray-200"
                />
            </div>

            {/* NUOVI CAMPIONI */}
            <div className="border-t border-gray-200 pt-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-gray-500">{t("property.piano")}</label>
                        <input
                            type="number"
                            value={dati.piano}
                            onChange={(e) => modifica("piano", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-gray-200"
                        />
                        <label className="text-sm text-gray-500">{t("property.piani_edificio")}</label>
                        <input
                            type="number"
                            min="1"
                            value={dati.pianiEdificio}
                            onChange={(e) => modifica("pianiEdificio", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-gray-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}