import type { ReactNode } from "react";

interface ComparisonAnalysisProps {
    explanation: string;
}

export function ComparisonAnalysis({ explanation }: ComparisonAnalysisProps) {
    if (!explanation) return null;

    const lines = explanation.split("\n").filter((line) => line.trim() !== "");

    const renderLine = (line: string): ReactNode => {
        // Rimuovi spazi iniziali
        const trimmed = line.trim();

        // --- Sezione Vincitore (🏆) ---
        if (trimmed.startsWith("🏆")) {
            const content = trimmed.replace("🏆 **", "").replace("**", "").replace(":", "");
            return (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                            <span className="font-bold text-amber-800 text-lg">{content}</span>
                            <span className="text-amber-600 text-sm ml-2">Vincitore</span>
                        </div>
                    </div>
                </div>
            );
        }

        // --- Sezione Confronto (📊) ---
        if (trimmed.startsWith("📊")) {
            const content = trimmed.replace("📊 **", "").replace("**", "");
            return (
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <h4 className="font-semibold text-gray-700 text-md flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        {content}
                    </h4>
                </div>
            );
        }

        // --- Linee di contenuto con formattazione ---
        let content = trimmed;

        // Sostituisci **testo** con <strong>testo</strong>
        content = content.replace(/\*\*(.*?)\*\*/g, (_, match) => `<strong>${match}</strong>`);

        // Gestisci le diverse icone e colori
        let bgColor = "";
        let icon = "";
        let textColor = "";

        if (content.includes("✅")) {
            bgColor = "bg-green-50";
            textColor = "text-green-800";
            icon = "✅";
        } else if (content.includes("❌")) {
            bgColor = "bg-red-50";
            textColor = "text-red-800";
            icon = "❌";
        } else if (content.includes("💡")) {
            bgColor = "bg-blue-50";
            textColor = "text-blue-800";
            icon = "💡";
        } else if (content.includes("🔥")) {
            bgColor = "bg-orange-50";
            textColor = "text-orange-800";
            icon = "🔥";
        } else if (content.includes("⚠️")) {
            bgColor = "bg-yellow-50";
            textColor = "text-yellow-800";
            icon = "⚠️";
        } else if (content.includes("👍")) {
            bgColor = "bg-green-50";
            textColor = "text-green-800";
            icon = "👍";
        } else if (content.includes("🟡")) {
            bgColor = "bg-gray-50";
            textColor = "text-gray-700";
            icon = "🟡";
        }

        // Se è una linea con icona, renderizza con lo stile appropriato
        if (icon) {
            // Rimuovi l'icona dal contenuto per la visualizzazione
            const cleanContent = content.replace(/✅|❌|💡|🔥|⚠️|👍|🟡/, "").trim();
            return (
                <div className={`${bgColor} rounded-lg px-3 py-2 my-1 border ${textColor} border-opacity-20`}>
                    <span className="mr-2">{icon}</span>
                    <span dangerouslySetInnerHTML={{ __html: cleanContent }} />
                </div>
            );
        }

        // Linea con solo prezzo (es. "Prezzo: 219.000 € · 100 m²")
        if (content.includes("Prezzo:") || content.includes("Price:")) {
            return (
                <div className="text-sm text-gray-600 my-1 px-2">
                    <span dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            );
        }

        // Linea standard (fallback)
        if (content.includes("<strong>") || content.includes("<em>")) {
            return (
                <div className="text-sm text-gray-700 my-1 px-2">
                    <span dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            );
        }

        return (
            <div className="text-sm text-gray-700 my-1 px-2">
                {content}
            </div>
        );
    };

    // Raggruppa le sezioni per aggiungere spaziatura
    const sections: ReactNode[] = [];
    let currentSection: ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Se è un vincitore o un nuovo confronto, chiudi la sezione precedente
        if (trimmed.startsWith("📊") || trimmed.startsWith("🏆")) {
            if (currentSection.length > 0) {
                sections.push(
                    <div key={`section-${sections.length}`} className="space-y-1">
                        {currentSection}
                    </div>
                );
                currentSection = [];
            }
        }

        currentSection.push(renderLine(line));

        // Se è un vincitore, chiudi immediatamente
        if (trimmed.startsWith("🏆")) {
            if (currentSection.length > 0) {
                sections.push(
                    <div key={`section-${sections.length}`} className="space-y-1">
                        {currentSection}
                    </div>
                );
                currentSection = [];
            }
        }
    }

    // Aggiungi l'ultima sezione
    if (currentSection.length > 0) {
        sections.push(
            <div key={`section-${sections.length}`} className="space-y-1">
                {currentSection}
            </div>
        );
    }

    return (
        <div className="comparison-analysis space-y-2 font-sans">
            {sections}
        </div>
    );
}