import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../../redux/features/auth.slice.js";
import { LogOut, LayoutDashboard, Users, Building2, Film, CalendarClock, Menu } from "lucide-react"; // icon đẹp

const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
    { to: "/admin/theaters", label: "Theaters", icon: <Building2 size={18} /> },
    { to: "/admin/movies", label: "Movies", icon: <Film size={18} /> },
    { to: "/admin/shows", label: "Shows", icon: <CalendarClock size={18} /> },
];

const AdminSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();
    return (
        <aside className={`${isExpanded ? "w-64" : "w-17"} h-screen fixed bg-white border-r border-gray-200 shadow-sm flex flex-col z-10 transition-[width] duration-100`} onMouseEnter={() => setIsExpanded(true)} onMouseLeave={() => setIsExpanded(false)}>
            <div className="py-6 px-6 flex items-center justify-between">
                {isExpanded ? <span className="text-2xl font-extrabold text-indigo-600 tracking-wide">Admin</span> : <Menu size={18} className="h-[2rem]" />}
            </div>
            <nav className={`flex-1 ${isExpanded ? "px-4" : "px-2"}`}>
                <ul className="space-y-2">
                    {navLinks.map(link => (
                        <SidebarLink key={link.to} icon={link.icon} text={link.label} linkTo={link.to} isExpanded={isExpanded} />
                    ))}
                </ul>
            </nav>
            <div className="p-4 mt-auto">
                <button
                    onClick={() => dispatch(logout())}
                    className={`flex items-center gap-2 justify-center py-2 font-semibold rounded-lg cursor-pointer
                        ${isExpanded ? "w-full text-white bg-red-500 hover:bg-red-600" : "px-2 text-red-500"}`
                    }
                >
                    <LogOut size={isExpanded ? 18 : 21} className={`cursor-pointer h-[2rem] ${isExpanded ? "text-white" : ""}`} />
                    {isExpanded && <span className="text-white">Logout</span>}
                </button>
            </div>
        </aside >
    )
};

const SidebarLink = ({ icon, text, linkTo, isExpanded }) => {
    return (
        <li>
            <NavLink
                to={linkTo}
                className={({ isActive }) =>
                    `flex items-center gap-3 h-11 py-2 px-4 rounded-lg
                    ${isActive ? "bg-indigo-100 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
                }
                end
            >
                {icon}
                {isExpanded && <span>{text}</span>}
            </NavLink>
        </li>
    );
};

export default AdminSidebar