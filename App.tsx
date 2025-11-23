
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { storageService } from './services/storageService';
import { 
    LayoutDashboard, Users, FileSpreadsheet, 
    Printer, Settings, LogOut, Menu, X,
    Cpu, Sparkles, ChevronLeft, PanelLeftOpen,
    Table, UserCog
} from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Reports from './pages/Reports';
import Leger from './pages/Leger';
import AppSettings from './pages/AppSettings';
import TeacherProfile from './pages/TeacherProfile'; // Import Profile Page

const PrivateRoute = ({ children, user }: { children: React.ReactNode, user: User | null }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('erapor_session');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('erapor_session');
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (u: User) => {
        setUser(u);
        localStorage.setItem('erapor_session', JSON.stringify(u));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('erapor_session');
    };

    if (loading) return null;

    return (
        <HashRouter>
            <div className="min-h-screen font-sans text-slate-200 bg-slate-900 relative">
                <div className="fixed inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-slate-900/80 to-slate-950/90 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>
                </div>

                <div className="relative z-10">
                    <Routes>
                        <Route 
                            path="/login" 
                            element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
                        />
                        <Route path="/*" element={
                            <PrivateRoute user={user}>
                                <MainLayout user={user!} onLogout={handleLogout} />
                            </PrivateRoute>
                        } />
                    </Routes>
                </div>
            </div>
        </HashRouter>
    );
}

const MainLayout = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname]);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Users, label: "Data Siswa", path: "/students" },
        { icon: FileSpreadsheet, label: "Input Nilai", path: "/grades" },
        { icon: Table, label: "Leger Nilai", path: "/leger" },
        { icon: Printer, label: "Cetak Rapor", path: "/reports" },
    ];

    // Menu Khusus Admin
    if (user.role === UserRole.ADMIN) {
        menuItems.push({ icon: Settings, label: "Pengaturan", path: "/settings" });
    }

    // Menu Khusus Guru (Profil Saya)
    if (user.role === UserRole.TEACHER) {
        menuItems.push({ icon: UserCog, label: "Profil Saya", path: "/profile" });
    }

    // --- Dynamic Branding Logic ---
    const settings = storageService.getSettings();
    const isTeacher = user.role === UserRole.TEACHER;
    const teacherInfo = isTeacher && user.className ? settings.teachers?.[user.className] : null;
    
    // 1. Logo Logic: Use uploaded Photo if available, otherwise fallback to default
    const brandLogo = (isTeacher && teacherInfo?.photoUrl) 
        ? teacherInfo.photoUrl 
        : "https://iili.io/fd1ypnV.png";
    
    // 2. Title Logic: "Nama Wali Kelas" OR "Administrator"
    const brandTitle = isTeacher 
        ? (teacherInfo?.name || user.name || "Wali Kelas") 
        : "Administrator";
    
    // 3. Subtitle Logic: "Kelas XX" OR "System Admin"
    const brandSubtitle = isTeacher 
        ? (user.className || "SDN 22 MP") 
        : "System Admin";

    return (
        <div className="flex h-screen overflow-hidden relative">
            <aside className={`
                fixed md:relative inset-y-0 left-0 z-50 h-full glass-panel border-r border-white/10 
                transition-all duration-300 ease-in-out flex flex-col
                ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden'}
            `}>
                <div className="h-full flex flex-col bg-slate-900/70 w-64 backdrop-blur-md">
                    {/* SIDEBAR HEADER */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                             <div className="relative flex-shrink-0">
                                <div className={`absolute inset-0 ${isTeacher ? 'bg-white/20' : 'bg-cyan-500'} blur opacity-50 rounded-full`}></div>
                                <img 
                                    src={brandLogo} 
                                    alt="Logo" 
                                    className={`relative w-10 h-10 ${isTeacher && teacherInfo?.photoUrl ? 'object-cover rounded-full border-2 border-white/30' : 'object-contain'} z-10`} 
                                />
                            </div>
                            <div className="min-w-0">
                                <h1 className={`font-bold leading-tight text-white font-tech tracking-wide ${isTeacher ? 'text-xs uppercase truncate' : 'text-lg'}`}>
                                    {brandTitle}
                                </h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wider truncate">{brandSubtitle}</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded">
                            {isMobile ? <X size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu size={12} className="text-violet-400" />
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">User Active</p>
                            </div>
                            <p className="font-semibold text-white truncate">{user.name || user.username}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${user.role === UserRole.ADMIN ? 'bg-violet-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`}></div>
                                <p className="text-xs text-slate-300 font-medium">
                                    {user.role === UserRole.ADMIN ? 'System Admin' : user.className}
                                </p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium relative overflow-hidden group
                                            ${isActive 
                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }
                                        `}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                                        <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : ''} />
                                        <span className="tracking-wide">{item.label}</span>
                                        {isActive && <Sparkles size={14} className="ml-auto text-cyan-400 animate-pulse" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-white/10">
                        <button 
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-red-900/40 hover:text-red-400 transition-colors font-medium border border-transparent hover:border-red-900/30"
                        >
                            <LogOut size={20} />
                            <span>Disconnect</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-full w-full relative z-10 scroll-smooth transition-all duration-300">
                <div className={`p-4 sticky top-0 z-40 flex items-center justify-between transition-colors ${isMobile ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10' : ''}`}>
                    <div className="flex items-center gap-4">
                        {(!sidebarOpen || isMobile) && (
                            <button 
                                onClick={() => setSidebarOpen(true)} 
                                className="p-2 text-cyan-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 rounded-md shadow-sm transition-all"
                                title="Buka Menu"
                            >
                                {isMobile ? <Menu size={24} /> : <PanelLeftOpen size={24} />}
                            </button>
                        )}
                        {isMobile && (
                            <div className="font-bold text-lg font-tech text-white truncate max-w-[200px]">
                                {brandTitle}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4 md:px-8 pb-24 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard user={user} />} />
                        <Route path="/students" element={<Students user={user} />} />
                        <Route path="/grades" element={<Grades user={user} />} />
                        <Route path="/leger" element={<Leger user={user} />} />
                        <Route path="/reports" element={<Reports user={user} />} />
                        <Route path="/settings" element={<AppSettings />} />
                        <Route path="/profile" element={<TeacherProfile user={user} />} />
                    </Routes>
                </div>
            </main>

            {sidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default App;
