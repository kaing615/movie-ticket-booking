import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";
import {
  DashboardOutlined,
  UserOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Tooltip, Avatar, Breadcrumb, Input, Tag, Badge } from "antd";

// ===== Menu config =====
const MENU_ITEMS = [
  { path: "/manager/dashboard", label: "Dashboard", icon: <DashboardOutlined className="text-xl" /> },
  { path: "/manager/rooms", label: "Rooms", icon: <UserOutlined className="text-xl" /> },
  { path: "/manager/theater-dashboard", label: "Theaters", icon: <VideoCameraOutlined className="text-xl" /> },
  { path: "/manager/movies", label: "Movies", icon: <PlayCircleOutlined className="text-xl" /> },
];

const ManagerLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth) || {};
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem("mgr_sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const searchRef = React.useRef(null);

  React.useEffect(() => {
    localStorage.setItem("mgr_sidebar_collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Focus search with '/'
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus({ cursor: "end" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // active nếu path hiện tại bắt đầu bằng item.path (hữu ích với nested routes)
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  // Breadcrumb từ location + menu map
  const crumbs = React.useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const acc = [];
    let built = "";
    parts.forEach((p) => {
      built += `/${p}`;
      const match = MENU_ITEMS.find((it) => built.startsWith(it.path));
      acc.push({ path: built, label: match?.label || p });
    });
    return acc;
  }, [location.pathname]);

  const currentLabel = React.useMemo(
    () => MENU_ITEMS.find((it) => isActive(it.path))?.label || "Dashboard",
    [location.pathname]
  );

  return (
    <div className="flex h-screen bg-[#0B0F19] text-white relative">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 bg-gradient-to-br from-orange-500/30 to-amber-400/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl rounded-full" />
      </div>

      {/* SIDEBAR */}
      <aside
        className={`relative z-10 h-full bg-white/10 backdrop-blur-lg border-r border-white/10 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 grid place-items-center shadow-xl shadow-orange-500/25 ring-1 ring-orange-300/40">
              <VideoCameraOutlined className="text-white" />
            </div>
            {!collapsed && (
              <h1 className="text-xl font-bold tracking-wide">
                Cinema <span className="text-orange-300">Gate</span>
              </h1>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.path);
            const base =
              "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200";
            const activeCls =
              "text-white";
            const idle = "text-gray-300 hover:text-white";

            return (
              <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right">
                <NavLink to={item.path} className={`${base} ${active ? activeCls : idle}`}>
                  {/* Active glow background */}
                  <span
                    className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-orange-500/90 to-amber-500/90 shadow-lg shadow-orange-500/30"
                        : "group-hover:bg-white/10"
                    }`}
                  />

                  {/* left accent bar */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all ${
                      active ? "bg-white/90" : "opacity-0 group-hover:opacity-60 bg-white/60"
                    }`}
                  />

                  {/* content */}
                  <span className="relative grid place-items-center w-7 h-7 rounded-lg bg-white/10 ring-1 ring-white/10">
                    {item.icon}
                  </span>
                  {!collapsed && <span className="relative font-medium">{item.label}</span>}

                  {collapsed && active && (
                    <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </NavLink>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-2">
              <Avatar size={36} style={{ backgroundColor: "#f59e0b" }}>
                {user?.fullName?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium truncate">{user?.fullName || "Manager"}</div>
                <Tag color="gold" className="mt-0.5">Manager</Tag>
              </div>
            </div>
          )}
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogoutOutlined className="text-lg" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative z-10 flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-16 bg-white/10 backdrop-blur-md border-b border-white/10">
          <div className="h-full px-4 md:px-6 flex items-center gap-3">
            <button
              onClick={() => setCollapsed((s) => !s)}
              className="text-gray-200 hover:text-white transition-colors"
              aria-label="Toggle sidebar"
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            <Breadcrumb
              items={[
                { title: <span className="text-gray-300">Manager</span> },
                ...crumbs.slice(1).map((c) => ({
                  title: <span className="text-white">{c.label}</span>,
                })),
              ]}
            />

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:block">
                <div className="relative">
                  <Input
                    ref={searchRef}
                    allowClear
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Tìm nhanh…  (ấn '/')"
                    className="w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                  <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/20 text-[10px] text-gray-200/80">
                    /
                  </kbd>
                </div>
              </div>
              <Badge dot color="orange">
                <button className="relative text-gray-200 hover:text-white transition-colors">
                  <BellOutlined className="!text-white"/>
                </button>
              </Badge>
            </div>
          </div>
        </div>

        {/* Header title under top bar */}
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-400 to-amber-400 rounded-full" />
            <h2 className="text-xl font-semibold">{currentLabel}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
