
import React, { useState } from 'react';
import { User, UserRole, CLASSES } from '../types';
import { storageService } from '../services/storageService';
import { ShieldCheck, UserCircle, Cpu, Lock, Key, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
    onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<'teacher' | 'admin'>('teacher');
    
    // Teacher Form State
    const [teacherClass, setTeacherClass] = useState(CLASSES[0]);
    const [teacherPassword, setTeacherPassword] = useState('');
    const [showTeacherPass, setShowTeacherPass] = useState(false);
    
    // Admin Form State
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminPass, setShowAdminPass] = useState(false);
    
    const [error, setError] = useState('');

    const handleTabChange = (tab: 'teacher' | 'admin') => {
        setActiveTab(tab);
        setError('');
        if (tab === 'teacher') {
            setAdminUsername('');
            setAdminPassword('');
            setShowAdminPass(false);
        } else {
            setTeacherPassword('');
            setShowTeacherPass(false);
        }
    };

    const handleTeacherLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Gunakan storageService untuk verifikasi (mendukung ubah password)
        const isValid = storageService.verifyTeacherLogin(teacherClass, teacherPassword);

        if (isValid) {
            // Ambil nama guru dari settings jika ada
            const settings = storageService.getSettings();
            const teacherInfo = settings.teachers?.[teacherClass];
            const displayName = teacherInfo?.name ? teacherInfo.name : `Guru ${teacherClass}`;

            onLogin({
                username: teacherClass.replace(/\s+/g, '').toLowerCase(),
                role: UserRole.TEACHER,
                className: teacherClass,
                name: displayName
            });
        } else {
            setError('Akses Ditolak. Kode Otorisasi Salah.');
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const inputUser = adminUsername.trim().toLowerCase();
        const inputPass = adminPassword.trim();

        if (inputUser === 'admin' && inputPass === 'admin') {
            const adminUser: User = {
                username: 'admin',
                role: UserRole.ADMIN,
                name: 'Administrator Utama',
                className: 'System Admin'
            };
            onLogin(adminUser);
        } else {
            setError('Kredensial Admin Tidak Valid. (Coba: admin / admin)');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-slate-900/80 to-slate-950/90 mix-blend-multiply"></div>
            </div>

            <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 relative z-10 backdrop-blur-xl p-1">
                <div className="bg-slate-900/70 rounded-xl p-8">
                    
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex flex-col items-center justify-center">
                            <img src="https://iili.io/fdE9dcF.png" alt="LOGO BANYUASIN" className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity filter drop-shadow-lg" />
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <img src="https://iili.io/fd1ypnV.png" alt="LOGO SDN 22 MP" className="relative h-24 w-auto transform scale-110 z-10 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <img src="https://iili.io/fd1ybZQ.png" alt="logo tutwuri" className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity filter drop-shadow-lg" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-1 tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>E-RAPOR <span className="text-cyan-400">22</span></h1>
                        <p className="text-cyan-200/70 text-sm uppercase tracking-widest">Sistem Penilaian Digital Cerdas</p>
                    </div>

                    <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6 border border-white/10">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'teacher' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                            onClick={() => handleTabChange('teacher')}
                        >
                            <UserCircle size={18} />
                            GURU
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'admin' ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                            onClick={() => handleTabChange('admin')}
                        >
                            <ShieldCheck size={18} />
                            ADMIN
                        </button>
                    </div>

                    <div className="transition-all duration-500">
                        {activeTab === 'teacher' ? (
                            <form onSubmit={handleTeacherLogin} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider ml-1">Kelas</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <Cpu size={18} />
                                        </div>
                                        <select 
                                            name="teacherClass"
                                            className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
                                            value={teacherClass}
                                            onChange={(e) => { setTeacherClass(e.target.value); setError(''); }}
                                        >
                                            {CLASSES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider ml-1">Kata Sandi</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input 
                                            type={showTeacherPass ? "text" : "password"}
                                            className="block w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                            placeholder="••••••"
                                            value={teacherPassword}
                                            onChange={(e) => { setTeacherPassword(e.target.value); setError(''); }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowTeacherPass(!showTeacherPass)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-cyan-400 focus:outline-none"
                                        >
                                            {showTeacherPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {error && (
                                    <div className="p-3 bg-red-900/40 text-red-300 text-xs rounded border border-red-500/30 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:from-cyan-500 hover:to-cyan-400 transform hover:scale-[1.02] transition-all shadow-lg shadow-cyan-900/50 uppercase tracking-wide">
                                    Masuk
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleAdminLogin} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-violet-400 uppercase tracking-wider ml-1">Admin ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                                            <UserCircle size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            autoComplete="username"
                                            className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                            placeholder="admin"
                                            value={adminUsername}
                                            onChange={(e) => { setAdminUsername(e.target.value); setError(''); }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-violet-400 uppercase tracking-wider ml-1">Secure Key</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input 
                                            type={showAdminPass ? "text" : "password"}
                                            autoComplete="current-password"
                                            className="block w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                            placeholder="••••••"
                                            value={adminPassword}
                                            onChange={(e) => { setAdminPassword(e.target.value); setError(''); }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowAdminPass(!showAdminPass)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-violet-400 focus:outline-none"
                                        >
                                            {showAdminPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-900/40 text-red-300 text-xs rounded border border-red-500/30 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold py-3 rounded-lg hover:from-violet-500 hover:to-violet-400 transform hover:scale-[1.02] transition-all shadow-lg shadow-violet-900/50 uppercase tracking-wide">
                                    Masuk
                                </button>
                            </form>
                        )}
                    </div>
                    
                    <div className="mt-8 flex justify-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>SYSTEM.V.2.5.0</span>
                        <span>•</span>
                        <span>SECURE.CONNECTION</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
