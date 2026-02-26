import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { AccessibilityPage } from "./pages/AccessibilityPage";
import { HarnessPage } from "./pages/HarnessPage";
import Sidebar from "./components/sidebar";
import LandingPage from "./pages/LandingComponent";

function App() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(100);

  const appStyle = useMemo(() => ({ fontSize: `${fontScale}%` }), [fontScale]);

  if (!sessionStarted) {
    return <LandingPage setSessionStarted={setSessionStarted} />;
  }

  return (
    <main
      style={appStyle}
      className={`min-h-screen ${
        highContrast
          ? "bg-black text-yellow-200"
          : "bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 text-slate-900"
      }`}
    >
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside
          className={`sticky top-0 z-20 md:h-screen md:w-64 p-3 md:p-5 border-b md:border-b-0 md:border-r ${
            highContrast
              ? "border-yellow-300 bg-black"
              : "border-slate-200 bg-white/90 backdrop-blur"
          }`}
        >
          <Sidebar />
        </aside>

        <section className="flex-1 p-3 md:p-8">
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route
              path="/accessibility"
              element={
                <AccessibilityPage
                  highContrast={highContrast}
                  setHighContrast={setHighContrast}
                  fontScale={fontScale}
                  setFontScale={setFontScale}
                />
              }
            />
            <Route path="/harness" element={<HarnessPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </section>
      </div>
    </main>
  );
}

export default App;
