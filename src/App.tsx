import { Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom"; // <-- IMPORTANTE: HashRouter
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import ComparePage from "./pages/ComparePage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg">Caricamento...</div>}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="compare" element={<ComparePage />} />
                        <Route path="history" element={<HistoryPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </HashRouter>
        </Suspense>
    );
}

export default App;