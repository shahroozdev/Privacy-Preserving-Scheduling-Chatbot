import { NavLink } from "react-router-dom";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 md:w-full text-left px-3 py-2 rounded-lg whitespace-nowrap ${isActive ? "bg-cyan-700 text-white" : "bg-slate-200/70 hover:bg-slate-300/70"}`;

const Sidebar = () => {
  return (
    <>
      <h2 className="font-bold text-base md:text-lg">Scheduler Dashboard</h2>
      <nav className="mt-3 md:mt-6 flex flex-col gap-2 overflow-x-auto md:space-y-2">
        <NavLink to="/home" className={linkClass}>
          Home (Chat)
        </NavLink>
        <NavLink to="/privacy" className={linkClass}>
          Privacy Dashboard
        </NavLink>
        <NavLink to="/accessibility" className={linkClass}>
          Accessibility Settings
        </NavLink>
        <NavLink to="/harness" className={linkClass}>
          Harness Test
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
