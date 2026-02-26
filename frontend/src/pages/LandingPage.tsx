import { useNavigate } from "react-router-dom";
import { InfoTip } from "../components/InfoTip";

const LandingPage = ({
  setSessionStarted,
}: {
  setSessionStarted: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#0e7490,_#0f172a_45%,_#020617)] text-white px-4 md:px-6 py-8 md:py-12 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
        <section className="rounded-3xl border border-cyan-300/30 bg-slate-900/70 backdrop-blur p-6 md:p-10 shadow-2xl animate-[fadeIn_.7s_ease-out]">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-cyan-300">
            Zero-Persistence Architecture
          </span>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
            Privacy-Preserving Intelligent Scheduler
          </h1>
          <p className="mt-5 text-slate-200 max-w-2xl">
            Secure room discovery with in-memory NLP and heuristic ranking. No
            personal queries are stored in persistent databases.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
              <p className="text-cyan-300 text-xs">
                <span className="uppercase">Storage Engine</span>
                <InfoTip text="All session data is stored in volatile RAM and is wiped immediately when the browser tab is closed or refreshed." />
              </p>
              <p className="mt-1 font-semibold inline-flex items-center">
                Active Database: None
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
              <p className="text-cyan-300 text-xs">
                <span className="uppercase">Data Retention</span>
                <InfoTip text="All session data is stored in volatile RAM and is wiped immediately when the browser tab is closed or refreshed." />
              </p>
              <p className="mt-1 font-semibold inline-flex items-center">
                Stored Records: 0
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
              <p className="text-cyan-300 text-xs  inline-flex items-center">
                <span className="uppercase">Security</span>
                <InfoTip text="Communication between the client and server is secured via HTTPS/TLS 1.3 to prevent man-in-the-middle attacks." />
              </p>
              <br />
              <p className="mt-1 font-semibold inline-flex items-center">
                Encryption: Active
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/60">
              <p className="text-cyan-300 text-xs  inline-flex items-center">
                <span className="uppercase">Intelligence</span>
                <InfoTip text="This score represents how well a room fits your specific constraints (capacity, time, and features) using a weighted algorithm." />
              </p>
              <p className="mt-1 font-semibold">Score-based Room Ranking</p>
            </div>
          </div>

          <button
            onClick={() => {
              setSessionStarted(true);
              navigate("/home");
            }}
            className="mt-8 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/30"
          >
            Start Private Session
          </button>
        </section>

        <section className="grid sm:grid-cols-2 gap-4 content-start">
          <article className="rounded-2xl border border-sky-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_.9s_ease-out]">
            <h3 className="font-semibold text-sky-200 inline-flex items-center">
              Natural Language Parsing
              <InfoTip text="The parser extracts capacity, time, and features from free-text user queries before matching starts." />
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Understands phrases like six peeps, afternoon, and
              feature-specific requests.
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_1.1s_ease-out]">
            <h3 className="font-semibold text-emerald-200 inline-flex items-center">
              Strict Accessibility Match
              <InfoTip text="If accessibility features are requested, non-compliant rooms are excluded from ranking." />
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Required features such as wheelchair access are treated as
              high-priority constraints.
            </p>
          </article>
          <article className="rounded-2xl border border-indigo-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_1.3s_ease-out]">
            <h3 className="font-semibold text-indigo-200 inline-flex items-center">
              Heuristic Scoring
              <InfoTip text="This score represents how well a room fits your specific constraints (capacity, time, and features) using a weighted algorithm." />
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Capacity, time proximity, and feature compliance are scored to
              surface best-fit rooms.
            </p>
          </article>
          <article className="rounded-2xl border border-amber-300/30 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[fadeIn_1.5s_ease-out]">
            <h3 className="font-semibold text-amber-200 inline-flex items-center">
              Transparent Recommendations
              <InfoTip text="Each recommendation includes score, slot, and alternatives so users can compare options clearly." />
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Every suggestion includes score, slot, and alternatives for clear
              decision support.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default LandingPage;
