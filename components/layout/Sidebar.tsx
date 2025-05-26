
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, AppName } from '../../constants';
import { ShieldCheck, Activity, LayoutDashboard, FileText, ListChecks, Camera, Users, FileWarning, MailWarning } from 'lucide-react'; // Example icons

const ICONS_MAP: { [key: string]: React.ElementType } = {
  'Dashboard': LayoutDashboard,
  '1. Analyze Rules': FileText,
  '2. Prepare Checklist': ListChecks,
  '3. Risk Detection': Camera,
  '4. Review Plan': Users,
  '5. Create Report': FileWarning,
  '6. Draft Email': MailWarning,
};


const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-slate-800 text-white flex flex-col">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
        <ShieldCheck size={36} className="text-sky-400" />
        <h1 className="text-xl font-bold">{AppName}</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const IconComponent = ICONS_MAP[item.name] || Activity;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out hover:bg-slate-700 ${
                  isActive ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              <IconComponent size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Oil & Gas Corp.</p>
      </div>
    </div>
  );
};

export default Sidebar;
