import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";
import { LogOut, LayoutDashboard, Users, Building2, Film, CalendarClock } from "lucide-react"; // icon đẹp

const navLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18}/> },
  { to: "/admin/users", label: "Users", icon: <Users size={18}/> },
  { to: "/admin/theaters", label: "Theaters", icon: <Building2 size={18}/> },
  { to: "/admin/movies", label: "Movies", icon: <Film size={18}/> },
  { to: "/admin/shows", label: "Shows", icon: <CalendarClock size={18}/> },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="py-6 px-6 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-indigo-600 tracking-wide">Admin</span>
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-4 rounded-lg transition 
                    ${isActive ? "bg-indigo-100 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
                  }
                  end
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto">
          <button
            onClick={() => dispatch(logout())}
            className="w-full flex items-center gap-2 justify-center py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition cursor-pointer"
          >
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
