
import React, { useEffect, useState } from 'react';
import { Student, User, SUBJECTS, Grade, Attendance } from '../types';
import { storageService } from '../services/storageService';
import { Save, AlertCircle, Trophy, TrendingUp, Book, Star, MessageSquare } from 'lucide-react';

const Grades = ({ user }: { user: User }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [grades, setGrades] = useState<Record<string, Grade>>({}); // key: subject
    const [attendance, setAttendance] = useState<Attendance>({ studentId: '', sick: 0, permission: 0, alpha: 0, teacherNote: '' });
    const [savedMsg, setSavedMsg] = useState('');
    
    // Ranking State
    const [rankings, setRankings] = useState<{ student: Student, avg: number, rank: number }[]>([]);

    useEffect(() => {
        const all = storageService.getStudents();
        const filtered = user.className ? all.filter(s => s.classLevel === user.className) : all;
        setStudents(filtered);
        if (filtered.length > 0) setSelectedStudentId(filtered[0].id);
    }, [user]);

    useEffect(() => {
        if (selectedStudentId) {
            loadStudentData();
        }
    }, [selectedStudentId]);

    // Recalculate rankings whenever students change or data is saved
    useEffect(() => {
        if (students.length > 0) {
            calculateRankings();
        }
    }, [students, savedMsg]);

    const loadStudentData = () => {
        const storedGrades = storageService.getGrades().filter(g => g.studentId === selectedStudentId);
        const gradesMap: Record<string, Grade> = {};
        
        SUBJECTS.forEach(sub => {
            const exist = storedGrades.find(g => g.subject === sub);
            gradesMap[sub] = exist || { 
                studentId: selectedStudentId, 
                subject: sub, 
                tpScore: 0, 
                finalScore: 0, 
                knowledgeScore: 0,
                skillScore: 0,
                notes: '' 
            };
        });
        setGrades(gradesMap);
        
        const att = storageService.getAttendance(selectedStudentId);
        setAttendance(att);
    };

    const calculateRankings = () => {
        const allGrades = storageService.getGrades();
        
        const classStats = students.map(s => {
            const sGrades = allGrades.filter(g => g.studentId === s.id);
            let totalScore = 0;
            
            SUBJECTS.forEach(sub => {
                const g = sGrades.find(x => x.subject === sub);
                // Menggunakan rumus rata-rata yang sama dengan tampilan kartu: (TP + Akhir) / 2
                const tp = Number(g?.tpScore) || 0;
                const final = Number(g?.finalScore) || 0;
                totalScore += (tp + final) / 2;
            });

            const avg = totalScore / SUBJECTS.length;
            return { student: s, avg };
        });

        // Sort descending (Highest first)
        classStats.sort((a, b) => b.avg - a.avg);

        // Assign ranks
        const rankedData = classStats.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        setRankings(rankedData);
    };

    const handleGradeChange = (subject: string, field: keyof Grade, value: any) => {
        setGrades(prev => ({
            ...prev,
            [subject]: { ...prev[subject], [field]: value }
        }));
    };

    const saveAll = () => {
        Object.values(grades).forEach(g => {
            storageService.saveGrade({ ...g, studentId: selectedStudentId });
        });
        storageService.saveAttendance({ ...attendance, studentId: selectedStudentId });
        
        setSavedMsg('Data berhasil disimpan!');
        setTimeout(() => setSavedMsg(''), 3000);
    };

    if (students.length === 0) return <div className="p-8 text-center text-slate-500">Belum ada siswa di kelas ini.</div>;

    return (
        <div className="space-y-8 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Input Nilai & Catatan</h1>
                    <p className="text-slate-500">Masukkan nilai sumatif, capaian kompetensi, dan catatan wali kelas.</p>
                </div>
                <div className="w-full md:w-64">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Pilih Siswa</label>
                    <select 
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg shadow-sm font-medium text-slate-900"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Layout Kiri: Absensi & Catatan Wali (1 Kolom) */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Attendance Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Ketidakhadiran
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-600">Sakit</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" className="w-20 p-2 border rounded-md text-center text-slate-900" 
                                        value={attendance.sick} onChange={e => setAttendance({...attendance, sick: parseInt(e.target.value)||0})} />
                                    <span className="text-xs text-slate-400">Hari</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-600">Izin</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" className="w-20 p-2 border rounded-md text-center text-slate-900" 
                                        value={attendance.permission} onChange={e => setAttendance({...attendance, permission: parseInt(e.target.value)||0})} />
                                    <span className="text-xs text-slate-400">Hari</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-slate-600">Tanpa Keterangan</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" className="w-20 p-2 border rounded-md text-center text-slate-900" 
                                        value={attendance.alpha} onChange={e => setAttendance({...attendance, alpha: parseInt(e.target.value)||0})} />
                                    <span className="text-xs text-slate-400">Hari</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Wali Kelas Section (NEW) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <MessageSquare size={80} />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            Catatan Wali Kelas
                        </h3>
                        <textarea 
                            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-40 resize-none bg-purple-50/20 text-slate-900 font-medium"
                            placeholder="Tuliskan catatan motivasi untuk siswa di sini..."
                            value={attendance.teacherNote || ''}
                            onChange={(e) => setAttendance({...attendance, teacherNote: e.target.value})}
                        />
                        <p className="text-xs text-slate-400 mt-2 italic">Catatan ini akan muncul di halaman belakang rapor.</p>
                    </div>
                </div>

                {/* Layout Kanan: Input Nilai (2 Kolom) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SUBJECTS.map(subject => {
                        const grade = grades[subject] || { tpScore: 0, finalScore: 0, knowledgeScore: 0, skillScore: 0, notes: '' };
                        const avgSumatif = ((Number(grade.tpScore) + Number(grade.finalScore))/2).toFixed(0);

                        return (
                            <div key={subject} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-slate-700 mt-1">{subject}</h4>
                                    <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">
                                        Rata-rata: <strong>{avgSumatif}</strong>
                                    </div>
                                </div>
                                
                                {/* Grade Inputs */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Sumatif TP</label>
                                        <input 
                                            type="number" min="0" max="100"
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-900"
                                            value={grade.tpScore || ''}
                                            placeholder="0"
                                            onChange={(e) => handleGradeChange(subject, 'tpScore', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Sumatif Akhir</label>
                                        <input 
                                            type="number" min="0" max="100"
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-900"
                                            value={grade.finalScore || ''}
                                            placeholder="0"
                                            onChange={(e) => handleGradeChange(subject, 'finalScore', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Deskripsi Capaian Kompetensi</label>
                                    <textarea 
                                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-slate-900"
                                        placeholder={`Deskripsi capaian ${subject}...`}
                                        value={grade.notes}
                                        onChange={(e) => handleGradeChange(subject, 'notes', e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20} />
                    <h3 className="font-bold text-slate-700">Peringkat Kelas Sementara (Berdasarkan Rata-rata Rapor)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 w-20 text-center">Rank</th>
                                <th className="px-6 py-3">Nama Siswa</th>
                                <th className="px-6 py-3 text-center">Rata-rata Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rankings.map((r) => (
                                <tr 
                                    key={r.student.id} 
                                    className={`
                                        transition-colors 
                                        ${r.student.id === selectedStudentId ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : 'hover:bg-slate-50'}
                                    `}
                                >
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                                        {r.rank === 1 ? '🥇 1' : r.rank === 2 ? '🥈 2' : r.rank === 3 ? '🥉 3' : r.rank}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {r.student.name}
                                        {r.student.id === selectedStudentId && <span className="ml-2 text-xs text-yellow-600 font-normal">(Dipilih)</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-slate-600">
                                        {r.avg.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 bg-slate-50 text-xs text-slate-400 border-t border-slate-100 text-center">
                    * Peringkat dihitung dari rata-rata nilai (Sumatif TP + Akhir) / 2 untuk semua mata pelajaran.
                </div>
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6 z-40 flex items-center gap-4">
                {savedMsg && (
                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
                        <AlertCircle size={18} />
                        {savedMsg}
                    </div>
                )}
                <button 
                    onClick={saveAll}
                    className="bg-red-600 text-white px-6 py-4 rounded-full shadow-xl hover:bg-red-700 hover:scale-105 transition-all font-bold flex items-center gap-2"
                >
                    <Save size={24} />
                    Simpan Semua
                </button>
            </div>
        </div>
    );
};

export default Grades;
