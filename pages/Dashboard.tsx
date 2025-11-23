import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Users, Award, BookOpen, Clock, Activity, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }: { user: User }) => {
    const [stats, setStats] = useState({ students: 0, graded: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const students = storageService.getStudents();
        const filteredStudents = user.className 
            ? students.filter(s => s.classLevel === user.className)
            : students;
        
        setStats({
            students: filteredStudents.length,
            graded: 0 
        });
    }, [user]);

    return (
        <div className="space-y-8">
            <header className="relative">
                <div className="absolute -left-4 top-1 w-1 h-12 bg-cyan-500 rounded-full shadow-[0_0_10px_cyan]"></div>
                <h1 className="text-3xl font-bold text-white font-tech tracking-wide">System Dashboard</h1>
                <p className="text-slate-400 mt-1">Selamat datang, <span className="text-cyan-400 font-semibold">{user.name}</span>. Sistem siap digunakan.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div 
                    onClick={() => navigate('/students')}
                    className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all group relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total Siswa</p>
                            <h3 className="text-4xl font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors font-tech">{stats.students}</h3>
                        </div>
                        <div className="p-3 bg-slate-700/50 text-cyan-400 rounded-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors shadow-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                        Terdaftar di {user.className || 'Semua Kelas'}
                    </div>
                </div>

                {/* Card 2 */}
                <div 
                    onClick={() => navigate('/grades')}
                    className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-all group relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Input Nilai</p>
                            <h3 className="text-4xl font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors font-tech">AKTIF</h3>
                        </div>
                        <div className="p-3 bg-slate-700/50 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors shadow-lg">
                            <BookOpen size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                         <Activity size={12} />
                         Portal nilai sumatif terbuka
                    </div>
                </div>

                {/* Card 3 - Highlight */}
                <div 
                     onClick={() => navigate('/reports')}
                    className="bg-gradient-to-br from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md p-6 rounded-xl border border-violet-500/30 cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] transition-all relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-violet-200 text-xs uppercase tracking-widest font-bold">Output AI</p>
                            <h3 className="text-3xl font-bold text-white mt-2 font-tech">CETAK RAPOR</h3>
                        </div>
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                            <Cpu size={24} className="text-violet-100" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-violet-200/70 flex items-center gap-2">
                        <Award size={12} />
                        Generate PDF & Komentar AI
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2 font-tech tracking-wide">
                    <Clock size={20} className="text-cyan-500" />
                    System Logs
                </h3>
                <div className="text-center py-12 text-slate-500 text-sm bg-slate-900/50 rounded-lg border border-dashed border-slate-700 flex flex-col items-center justify-center gap-3">
                    <Activity className="text-slate-600 animate-pulse" size={32} />
                    <p>Menunggu aktivitas input data...</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;