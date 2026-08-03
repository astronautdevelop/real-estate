import { Outlet, NavLink } from "react-router-dom";
import {
    Building2,
    Home,
    GitCompare,
    History,
    Settings,
    Menu,
    X,
    Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLogStore } from "../../store/logStore";
import { useTranslation } from "react-i18next";

export default function MainLayout() {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        return saved ? JSON.parse(saved) : false;
    });

    const { logs } = useLogStore();

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const toggleSidebar = () => setIsCollapsed((prev: boolean) => !prev);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <aside
                className={`
                    bg-white border-r border-gray-500 flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-[72px]" : "w-64"}
                    flex-shrink-0 sticky top-0 h-screen
                `}
            >
                {/* Intestazione */}
                <div
                    className={`
                        p-4 border-b border-gray-500 flex items-center
                        ${isCollapsed ? "justify-center" : "justify-between"}
                        transition-all duration-300
                    `}
                >
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Building2 size={28} className="flex-shrink-0" />
                            <div className="transition-opacity duration-300 whitespace-nowrap">
                                <h1 className="text-lg font-bold leading-tight">
                                    {t("app.title")}
                                </h1>
                                <p className="text-[10px] text-gray-500 -mt-0.5">
                                    {t("app.subtitle")}
                                </p>
                            </div>
                        </div>
                    )}
                    {isCollapsed && <Building2 size={28} className="flex-shrink-0" />}
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
                        aria-label={
                            isCollapsed
                                ? t("sidebar.espandi")
                                : t("sidebar.comprimi")
                        }
                    >
                        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>

                {/* Navigazione */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <NavItem
                        to="/"
                        icon={<Home size={20} />}
                        label={t("sidebar.immobili")}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        to="/compare"
                        icon={<GitCompare size={20} />}
                        label={t("sidebar.confronti")}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        to="/history"
                        icon={<History size={20} />}
                        label={t("sidebar.cronologia")}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        to="/settings"
                        icon={<Settings size={20} />}
                        label={t("sidebar.impostazioni")}
                        collapsed={isCollapsed}
                    />
                </nav>

                {/* SEZIONE LOG */}
                {!isCollapsed && (
                    <div className="border-t border-gray-500 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-dark-500 mb-2 bg-gray-200">
                            <Bell size={14} />
                            <span>{t("sidebar.attivita")}</span>
                        </div>
                        <div className="space-y-1 max-h-28 overflow-y-auto">
                            {logs.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">
                                    {t("sidebar.nessuna")}
                                </p>
                            ) : (
                                logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="text-xs bg-gray-50 rounded-lg px-2 py-1.5 text-gray-700 animate-in fade-in slide-in-from-top-1 duration-300"
                                    >
                                        {log.messaggio}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {!isCollapsed && (
                    <div className="p-4 text-[10px] text-gray-400 border-t border-gray-100">
                        {t("app.version")} 1.0
                    </div>
                )}
            </aside>

            <main className="flex-1 p-8 overflow-y-auto transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}

// NavItem (invariato)
function NavItem({
    to,
    icon,
    label,
    collapsed,
}: {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
}) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                        isActive
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100"
                    }
                    ${collapsed ? "justify-center" : "justify-start"}
                    relative group
                `
            }
        >
            <span className="flex-shrink-0">{icon}</span>
            <span
                className={`
                    transition-all duration-300 overflow-hidden whitespace-nowrap
                    ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
                `}
            >
                {label}
            </span>
            {collapsed && (
                <span
                    className="
                        absolute left-full ml-3 px-2 py-1
                        bg-gray-800 text-white text-xs rounded
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                        pointer-events-none whitespace-nowrap z-50
                    "
                >
                    {label}
                </span>
            )}
        </NavLink>
    );
}