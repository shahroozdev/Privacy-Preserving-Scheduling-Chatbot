import { InfoTip } from "../components/InfoTip";

export function PrivacyPage() {
  return (
    <div className="max-w-5xl space-y-5 mx-auto">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold">
          Privacy & Security Dashboard
        </h3>
        <p className="mt-2 text-sm md:text-base text-slate-600">
          This panel shows the active privacy posture of your scheduling
          session. Data is processed in-memory and discarded after response
          generation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <p className="text-xs tracking-wide text-slate-500">
            <span className="uppercase">Storage Engine</span>
            <InfoTip text="All session data is stored in volatile RAM and is wiped immediately when the browser tab is closed or refreshed." />
          </p>
          <p className="mt-2 text-lg font-semibold text-emerald-700 inline-flex items-center">
            Active Database: None
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Requests are not persisted to SQL/NoSQL stores.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <p className="text-xs  tracking-wide text-slate-500">
            <span className="uppercase">Data Retention</span>
            <InfoTip text="All session data is stored in volatile RAM and is wiped immediately when the browser tab is closed or refreshed." />
          </p>
          <p className="mt-2 text-lg font-semibold text-emerald-700 inline-flex items-center">
            Stored Records: 0
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Session messages are not written to logs or user history.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <p className="text-xs tracking-wide text-slate-500 inline-flex items-center">
            <span className="uppercase">Transport Security</span>
            <InfoTip text="Communication between the client and server is secured via HTTPS/TLS 1.3 to prevent man-in-the-middle attacks." />
          </p>
          <p className="mt-2 text-lg font-semibold text-emerald-700 inline-flex items-center">
            Encryption: Active
          </p>
          <p className="mt-2 text-sm text-slate-600">
            API communication is expected over HTTPS during deployment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 transition-all duration-300 hover:shadow-md">
          <h4 className="font-semibold text-cyan-900">
            Zero-Persistence Policy
          </h4>
          <p className="mt-2 text-sm text-cyan-900/90">
            The scheduler only keeps request context in runtime memory while
            computing a match score. After reply generation, the context is
            dropped.
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 transition-all duration-300 hover:shadow-md">
          <h4 className="font-semibold text-indigo-900 inline-flex items-center">
            Privacy-by-Design
            <InfoTip text="All session data is stored in volatile RAM and is wiped immediately when the browser tab is closed or refreshed." />
          </h4>
          <p className="mt-2 text-sm text-indigo-900/90">
            Matching is done on synthetic room inventory with strict feature
            filtering for accessibility requirements like wheelchair access and
            hearing loop.
          </p>
        </div>
      </div>
    </div>
  );
}
