import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search, X, Filter, Home as HomeIcon, Euro, Ruler, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { usePropertyStore } from "../store/propertyStore";
import PropertyCard from "../components/property/PropertyCard";
import type { EnergyClass } from "../types/property";
import { formatPrice } from "../utils/formatters";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const ENERGY_CLASSES: EnergyClass[] = ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"];

type SortOption =
    | "nome-asc"
    | "nome-desc"
    | "prezzo-asc"
    | "prezzo-desc"
    | "metri-asc"
    | "metri-desc"
    | "data-desc"
    | "data-asc";

// Colori per i grafici
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

// Elementi per pagina
const ITEMS_PER_PAGE = 12;

export default function Home() {
    const { t } = useTranslation();
    const { immobili, caricaImmobili, aggiungiImmobile } = usePropertyStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const highlightId = searchParams.get("id");
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Stato filtri (invariato)
    const [searchTerm, setSearchTerm] = useState("");
    const [prezzoMin, setPrezzoMin] = useState<number>(0);
    const [prezzoMax, setPrezzoMax] = useState<number>(Infinity);
    const [metriMin, setMetriMin] = useState<number>(0);
    const [metriMax, setMetriMax] = useState<number>(Infinity);
    const [classiEnergetiche, setClassiEnergetiche] = useState<EnergyClass[]>([]);
    const [soloAscensore, setSoloAscensore] = useState(false);
    const [soloArredato, setSoloArredato] = useState(false);
    const [soloGiardino, setSoloGiardino] = useState(false);
    const [soloTerrazzo, setSoloTerrazzo] = useState(false);
    const [soloCantina, setSoloCantina] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("data-desc");
    const [filtriAperti, setFiltriAperti] = useState(false);
    const [mostraGrafici, setMostraGrafici] = useState(true);
    const [paginaCorrente, setPaginaCorrente] = useState(1);

    useEffect(() => {
        caricaImmobili();
    }, []);

    useEffect(() => {
        if (highlightId && cardRefs.current[highlightId]) {
            cardRefs.current[highlightId]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [highlightId, immobili]);

    // Reset pagina quando cambiano i filtri
    useEffect(() => {
        setPaginaCorrente(1);
    }, [searchTerm, prezzoMin, prezzoMax, metriMin, metriMax, classiEnergetiche, soloAscensore, soloArredato, soloGiardino, soloTerrazzo, soloCantina, sortBy]);

    const creaNuovoImmobile = async () => {
        const nuovo = {
            nome: t("home.nuovo_immobile_default"),
            url: "",
            immagine: "",
            prezzo: 0,
            metriQuadri: 0,
            tipologia: "Monolocale" as any,
            locali: 1,
            camereDaLetto: 0,
            bagni: 0,
            boxAuto: 0,
            balconi: 0,
            terrazzi: false,
            cantina: false,
            giardino: "Nessuno" as any,
            classeEnergetica: "G" as EnergyClass,
            piano: 0,
            pianiEdificio: 0,
            ascensore: false,
            arredato: false,
            riscaldamento: [],
            climatizzazione: [],
            altreCaratteristiche: [],
            note: "",
            dataAcquisizione: new Date().toISOString(),
            storicoCreato: false,
        };
        const id = await aggiungiImmobile(nuovo);
        navigate(`/?id=${id}`);
    };

    // Dati per la dashboard
    const dashboardData = useMemo(() => {
        if (immobili.length === 0) return null;

        const total = immobili.length;
        const prezzi = immobili.map((p) => p.prezzo);
        const metri = immobili.map((p) => p.metriQuadri);
        const prezzoMedio = prezzi.reduce((a, b) => a + b, 0) / total;
        const metroMedio = metri.reduce((a, b) => a + b, 0) / total;
        const prezzoMqMedio = prezzi.reduce((sum, p, i) => sum + p / metri[i], 0) / total;

        const maxPrezzo = Math.max(...prezzi);
        const minPrezzo = Math.min(...prezzi);
        const immobileMax = immobili.find((p) => p.prezzo === maxPrezzo);
        const immobileMin = immobili.find((p) => p.prezzo === minPrezzo);

        // Distribuzione tipologie
        const tipologieMap: Record<string, number> = {};
        immobili.forEach((p) => {
            tipologieMap[p.tipologia] = (tipologieMap[p.tipologia] || 0) + 1;
        });
        const tipologieData = Object.entries(tipologieMap).map(([nome, conteggio]) => ({
            nome,
            conteggio,
        }));

        // Distribuzione classi energetiche
        const classiMap: Record<string, number> = {};
        immobili.forEach((p) => {
            classiMap[p.classeEnergetica] = (classiMap[p.classeEnergetica] || 0) + 1;
        });
        const classiData = ENERGY_CLASSES.map((classe) => ({
            classe,
            conteggio: classiMap[classe] || 0,
        })).filter((d) => d.conteggio > 0);

        return {
            total,
            prezzoMedio,
            metroMedio,
            prezzoMqMedio,
            maxPrezzo,
            minPrezzo,
            immobileMax,
            immobileMin,
            tipologieData,
            classiData,
        };
    }, [immobili]);

    // Filtraggio e ordinamento (invariato)
    const immobiliFiltrati = useMemo(() => {
        let filtered = [...immobili];

        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.nome.toLowerCase().includes(term) ||
                    p.tipologia.toLowerCase().includes(term) ||
                    p.note.toLowerCase().includes(term)
            );
        }

        filtered = filtered.filter(
            (p) => p.prezzo >= prezzoMin && p.prezzo <= prezzoMax
        );
        filtered = filtered.filter(
            (p) => p.metriQuadri >= metriMin && p.metriQuadri <= metriMax
        );

        if (classiEnergetiche.length > 0) {
            filtered = filtered.filter((p) =>
                classiEnergetiche.includes(p.classeEnergetica)
            );
        }

        if (soloAscensore) filtered = filtered.filter((p) => p.ascensore);
        if (soloArredato) filtered = filtered.filter((p) => p.arredato);
        if (soloGiardino) filtered = filtered.filter((p) => p.giardino !== "Nessuno");
        if (soloTerrazzo) filtered = filtered.filter((p) => p.terrazzi);
        if (soloCantina) filtered = filtered.filter((p) => p.cantina);

        switch (sortBy) {
            case "nome-asc":
                filtered.sort((a, b) => a.nome.localeCompare(b.nome));
                break;
            case "nome-desc":
                filtered.sort((a, b) => b.nome.localeCompare(a.nome));
                break;
            case "prezzo-asc":
                filtered.sort((a, b) => a.prezzo - b.prezzo);
                break;
            case "prezzo-desc":
                filtered.sort((a, b) => b.prezzo - a.prezzo);
                break;
            case "metri-asc":
                filtered.sort((a, b) => a.metriQuadri - b.metriQuadri);
                break;
            case "metri-desc":
                filtered.sort((a, b) => b.metriQuadri - a.metriQuadri);
                break;
            case "data-asc":
                filtered.sort(
                    (a, b) =>
                        new Date(a.dataAcquisizione).getTime() -
                        new Date(b.dataAcquisizione).getTime()
                );
                break;
            case "data-desc":
            default:
                filtered.sort(
                    (a, b) =>
                        new Date(b.dataAcquisizione).getTime() -
                        new Date(a.dataAcquisizione).getTime()
                );
                break;
        }

        return filtered;
    }, [
        immobili,
        searchTerm,
        prezzoMin,
        prezzoMax,
        metriMin,
        metriMax,
        classiEnergetiche,
        soloAscensore,
        soloArredato,
        soloGiardino,
        soloTerrazzo,
        soloCantina,
        sortBy,
    ]);

    // Calcola la pagina corrente
    const totalPages = Math.ceil(immobiliFiltrati.length / ITEMS_PER_PAGE);
    const startIndex = (paginaCorrente - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const immobiliPagina = immobiliFiltrati.slice(startIndex, endIndex);

    const resetFiltri = () => {
        setSearchTerm("");
        setPrezzoMin(0);
        setPrezzoMax(Infinity);
        setMetriMin(0);
        setMetriMax(Infinity);
        setClassiEnergetiche([]);
        setSoloAscensore(false);
        setSoloArredato(false);
        setSoloGiardino(false);
        setSoloTerrazzo(false);
        setSoloCantina(false);
        setSortBy("data-desc");
        setPaginaCorrente(1);
    };

    const maxPrezzo = useMemo(
        () => Math.max(...immobili.map((p) => p.prezzo), 0),
        [immobili]
    );
    const maxMetri = useMemo(
        () => Math.max(...immobili.map((p) => p.metriQuadri), 0),
        [immobili]
    );
        return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">{t("home.title")}</h1>
                <button
                    onClick={creaNuovoImmobile}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    {t("home.nuovo")}
                </button>
            </div>

            {/* Dashboard */}
            {dashboardData && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold bg-gray-300">{t("home.panoramica")}</h2>

                    {/* Statistiche rapide (sempre visibili) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-blue-600">
                                <HomeIcon size={18} />
                                <span className="text-sm font-medium">{t("home.totale")}</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{dashboardData.total}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-green-600">
                                <Euro size={18} />
                                <span className="text-sm font-medium">{t("home.prezzo_medio")}</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">
                                {formatPrice(dashboardData.prezzoMedio)} €
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-purple-600">
                                <Ruler size={18} />
                                <span className="text-sm font-medium">{t("home.metratura_media")}</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">
                                {Math.round(dashboardData.metroMedio)} m²
                            </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-orange-600">
                                <TrendingUp size={18} />
                                <span className="text-sm font-medium">{t("home.euro_mq_medio")}</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">
                                {Math.round(dashboardData.prezzoMqMedio)} €
                            </p>
                        </div>
                    </div>

                    {/* Estremi (sempre visibili) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <span className="font-medium text-red-700">{t("home.piu_costoso")}:</span>{" "}
                            {dashboardData.immobileMax?.nome} –{" "}
                            {formatPrice(dashboardData.maxPrezzo)} €
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="font-medium text-green-700">{t("home.piu_economico")}:</span>{" "}
                            {dashboardData.immobileMin?.nome} –{" "}
                            {formatPrice(dashboardData.minPrezzo)} €
                        </div>
                    </div>

                    {/* ACCORDION GRAFICI CON BARRE + TORTE */}
                    <div className="border-t border-gray-200 pt-4">
                        <button
                            onClick={() => setMostraGrafici(!mostraGrafici)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                        >
                            {mostraGrafici ? "▼" : "▶"} {t("home.grafici")}
                        </button>
                        {mostraGrafici && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 bg-gray-200">


{/* Tipologie */}
{dashboardData.tipologieData.length > 0 && (
    <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">
            {t("home.distribuzione_tipologie")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dashboardData.tipologieData}>
                    <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="conteggio" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={dashboardData.tipologieData}
                        dataKey="conteggio"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                    >
                        {dashboardData.tipologieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
)}

                                {/* Classi energetiche */}
                                {dashboardData.classiData.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-700">
                                            {t("home.distribuzione_energetica")}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart data={dashboardData.classiData}>
                                                    <XAxis dataKey="classe" tick={{ fontSize: 10 }} />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="conteggio" fill="#10B981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie
                                                        data={dashboardData.classiData}
                                                        dataKey="conteggio"
                                                        nameKey="classe"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={60}
                                                        label
                                                    >
                                                        {dashboardData.classiData.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Barra di ricerca e filtri (invariata) */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={t("home.ricerca")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
<button
    onClick={() => setFiltriAperti(!filtriAperti)}
    className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition ${
        filtriAperti
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
>
    <Filter size={18} />
    {t("home.filtri")}
    {Object.values({
        prezzoMin,
        prezzoMax,
        metriMin,
        metriMax,
        classiEnergetiche,
        soloAscensore,
        soloArredato,
        soloGiardino,
        soloTerrazzo,
        soloCantina,
    }).some((v) => {
        if (typeof v === 'number') {
            return v !== 0 && v !== Infinity;
        }
        if (typeof v === 'boolean') {
            return v === true;
        }
        if (Array.isArray(v)) {
            return v.length > 0;
        }
        return false;
    }) && (
        <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
            •
        </span>
    )}
</button>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="data-desc">⬇️ {t("home.ordina_data_desc")}</option>
                    <option value="data-asc">⬆️ {t("home.ordina_data_asc")}</option>
                    <option value="prezzo-desc">⬇️ {t("home.ordina_prezzo_desc")}</option>
                    <option value="prezzo-asc">⬆️ {t("home.ordina_prezzo_asc")}</option>
                    <option value="metri-desc">⬇️ {t("home.ordina_metri_desc")}</option>
                    <option value="metri-asc">⬆️ {t("home.ordina_metri_asc")}</option>
                    <option value="nome-asc">{t("home.ordina_nome_asc")}</option>
                    <option value="nome-desc">{t("home.ordina_nome_desc")}</option>
                </select>
                {(searchTerm ||
                    prezzoMin > 0 ||
                    prezzoMax < maxPrezzo ||
                    metriMin > 0 ||
                    metriMax < maxMetri ||
                    classiEnergetiche.length > 0 ||
                    soloAscensore ||
                    soloArredato ||
                    soloGiardino ||
                    soloTerrazzo ||
                    soloCantina) && (
                    <button
                        onClick={resetFiltri}
                        className="text-sm text-red-500 hover:text-red-700 underline"
                    >
                        {t("home.reset")}
                    </button>
                )}
            </div>

            {/* Pannello filtri (invariato) */}
            {filtriAperti && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("home.filtro_prezzo")}
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        value={prezzoMin || ""}
                                        onChange={(e) =>
                                            setPrezzoMin(
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value)
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                                        placeholder={t("home.min")}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        value={prezzoMax === Infinity ? "" : prezzoMax}
                                        onChange={(e) =>
                                            setPrezzoMax(
                                                e.target.value === ""
                                                    ? Infinity
                                                    : Number(e.target.value)
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                                        placeholder={t("home.max")}
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={maxPrezzo || 1000}
                                value={prezzoMax === Infinity ? maxPrezzo : prezzoMax}
                                onChange={(e) =>
                                    setPrezzoMax(Number(e.target.value))
                                }
                                className="w-full mt-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>0 €</span>
                                <span>{formatPrice(maxPrezzo)} €</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("home.filtro_metri")}
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        value={metriMin || ""}
                                        onChange={(e) =>
                                            setMetriMin(
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value)
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                                        placeholder={t("home.min")}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        value={metriMax === Infinity ? "" : metriMax}
                                        onChange={(e) =>
                                            setMetriMax(
                                                e.target.value === ""
                                                    ? Infinity
                                                    : Number(e.target.value)
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5"
                                        placeholder={t("home.max")}
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={maxMetri || 100}
                                value={metriMax === Infinity ? maxMetri : metriMax}
                                onChange={(e) =>
                                    setMetriMax(Number(e.target.value))
                                }
                                className="w-full mt-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>0 m²</span>
                                <span>{maxMetri} m²</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("home.filtro_classe")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ENERGY_CLASSES.map((classe) => (
                                <button
                                    key={classe}
                                    onClick={() =>
                                        setClassiEnergetiche((prev) =>
                                            prev.includes(classe)
                                                ? prev.filter((c) => c !== classe)
                                                : [...prev, classe]
                                        )
                                    }
                                    className={`px-3 py-1 rounded-full border text-sm transition ${
                                        classiEnergetiche.includes(classe)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {classe}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={soloAscensore}
                                onChange={(e) =>
                                    setSoloAscensore(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {t("home.ascensore")}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={soloArredato}
                                onChange={(e) =>
                                    setSoloArredato(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {t("home.arredato")}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={soloGiardino}
                                onChange={(e) =>
                                    setSoloGiardino(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {t("home.giardino")}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={soloTerrazzo}
                                onChange={(e) =>
                                    setSoloTerrazzo(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {t("home.terrazzo")}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={soloCantina}
                                onChange={(e) =>
                                    setSoloCantina(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {t("home.cantina")}
                        </label>
                    </div>
                </div>
            )}

            {/* RISULTATI CON PAGINAZIONE */}
            {immobiliFiltrati.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {immobili.length === 0
                            ? t("home.nessuno")
                            : t("home.nessuno_filtri")}
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-gray-500">
                            {immobiliFiltrati.length} {t("home.trovati")}
                            {totalPages > 1 && ` · ${t("home.pagina")} ${paginaCorrente} ${t("home.di")} ${totalPages}`}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPaginaCorrente((p) => Math.max(1, p - 1))}
                                    disabled={paginaCorrente === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    {t("home.precedente")}
                                </button>
                                <span className="text-sm text-gray-600">
                                    {paginaCorrente} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPaginaCorrente((p) => Math.min(totalPages, p + 1))}
                                    disabled={paginaCorrente === totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t("home.successivo")}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {immobiliPagina.map((immobile) => (
                            <div
                                key={immobile.id}
                                ref={(el) => {cardRefs.current[immobile.id] = el;
                                }}
                                className={`transition-all duration-300 ${
                                    highlightId === immobile.id
                                        ? "ring-4 ring-blue-500 ring-offset-4 rounded-2xl"
                                        : ""
                                }`}
                            >
                                <PropertyCard immobile={immobile} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}