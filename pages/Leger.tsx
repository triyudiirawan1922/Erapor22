
import React, { useEffect, useState, useRef } from 'react';
import { Student, User, SUBJECTS, Grade, SchoolSettings, CLASSES } from '../types';
import { storageService } from '../services/storageService';
import { Printer, ChevronDown, Award, Download, Loader2 } from 'lucide-react';

interface StudentStats {
    student: Student;
    grades: Record<string, { tp: number, final: number, avg: number }>;
    totalScore: number;
    avgScore: number;
    rank: number;
}

const Leger = ({ user }: { user: User }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [stats, setStats] = useState<StudentStats[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>(user.className || CLASSES[0]);
    const [settings, setSettings] = useState<SchoolSettings>(storageService.getSettings());
    const [isDownloading, setIsDownloading] = useState(false);
    
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSettings(storageService.getSettings());
        loadData();
    }, [selectedClass, user]);

    const loadData = () => {
        const allStudents = storageService.getStudents();
        const filteredStudents = allStudents.filter(s => s.classLevel === selectedClass);
        setStudents(filteredStudents);

        const allGrades = storageService.getGrades();

        const computedStats = filteredStudents.map(student => {
            const sGrades = allGrades.filter(g => g.studentId === student.id);
            const gradesData: Record<string, { tp: number, final: number, avg: number }> = {};
            let sumAvg = 0;
            
            SUBJECTS.forEach(sub => {
                const g = sGrades.find(x => x.subject === sub);
                const tp = g ? Number(g.tpScore) || 0 : 0;
                const final = g ? Number(g.finalScore) || 0 : 0;
                // Rumus Rata-rata: (TP + Akhir) / 2
                const avg = (tp > 0 || final > 0) ? (tp + final) / 2 : 0;
                
                gradesData[sub] = { tp, final, avg };
                sumAvg += avg;
            });

            const avgScore = SUBJECTS.length > 0 ? sumAvg / SUBJECTS.length : 0;

            return {
                student,
                grades: gradesData,
                totalScore: sumAvg,
                avgScore,
                rank: 0 // calculated later
            };
        });

        // Sort descending based on average score
        computedStats.sort((a, b) => b.avgScore - a.avgScore);

        // Assign Ranks
        const finalStats = computedStats.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        setStats(finalStats);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        if (!contentRef.current) return;
        setIsDownloading(true);
        
        const element = contentRef.current;
        const opt = {
            margin: [5, 5, 5, 5], // mm
            filename: `Leger_Nilai_${selectedClass.replace(/\s/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        // @ts-ignore
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Leger Nilai Siswa</h1>
                    <p className="text-slate-500">Rekapitulasi nilai dan peringkat kelas.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Dropdown Kelas (Hanya aktif untuk Admin) */}
                    <div className="relative">
                        <select 
                            className="p-2.5 bg-white border border-slate-300 rounded-lg shadow-sm font-medium text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                            value={selectedClass}
                            disabled={!!user.className} // Disable jika user adalah guru kelas tertentu
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                    >
                        {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Download PDF
                    </button>

                    <button 
                        onClick={handlePrint}
                        className="bg-slate-800 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2 shadow-md transition-colors"
                    >
                        <Printer size={18} />
                        Cetak Leger
                    </button>
                </div>
            </div>

            {/* TABLE PREVIEW / PRINT AREA */}
            <div ref={contentRef} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto p-6 print:shadow-none print:border-none print:p-0 print:w-full print:absolute print:top-0 print:left-0">
                
                {/* HEADER CETAK */}
                <div className="hidden print:block text-center mb-6 text-black">
                    <h2 className="text-xl font-bold uppercase">LEGER NILAI RAPOR</h2>
                    <h3 className="text-lg font-bold uppercase">{settings.schoolName}</h3>
                    <div className="flex justify-center gap-8 text-sm font-medium mt-2">
                        <p>Kelas: {selectedClass}</p>
                        <p>Semester: {settings.semester}</p>
                        <p>Tahun Ajaran: {settings.academicYear}</p>
                    </div>
                    <hr className="border-black my-4" />
                </div>

                {/* HEADER DOWNLOAD (VISIBLE ONLY FOR PDF GENERATION) */}
                {isDownloading && (
                    <div className="text-center mb-6 text-black">
                        <h2 className="text-xl font-bold uppercase">LEGER NILAI RAPOR</h2>
                        <h3 className="text-lg font-bold uppercase">{settings.schoolName}</h3>
                        <div className="flex justify-center gap-8 text-sm font-medium mt-2">
                            <p>Kelas: {selectedClass}</p>
                            <p>Semester: {settings.semester}</p>
                            <p>Tahun Ajaran: {settings.academicYear}</p>
                        </div>
                        <hr className="border-black my-4" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-[10px] md:text-xs print:text-[9px] text-slate-900 print:text-black">
                        <thead className="bg-slate-100 print:bg-gray-200 font-bold text-center">
                            <tr>
                                <th rowSpan={2} className="border border-slate-300 p-1 w-8 bg-slate-200 print:bg-slate-200">No</th>
                                <th rowSpan={2} className="border border-slate-300 p-2 min-w-[150px] bg-slate-200 print:bg-slate-200">Nama Siswa</th>
                                <th rowSpan={2} className="border border-slate-300 p-1 w-16 bg-slate-200 print:bg-slate-200">NISN</th>
                                {SUBJECTS.map(sub => (
                                    <th key={sub} colSpan={2} className="border border-slate-300 p-1 min-w-[60px] truncate max-w-[80px] bg-slate-100 print:bg-slate-100" title={sub}>
                                        {sub.substring(0, 10)}...
                                    </th>
                                ))}
                                <th rowSpan={2} className="border border-slate-300 p-1 w-12 bg-blue-100 print:bg-blue-100">Total</th>
                                <th rowSpan={2} className="border border-slate-300 p-1 w-12 bg-yellow-100 print:bg-yellow-100">Rata2</th>
                                <th rowSpan={2} className="border border-slate-300 p-1 w-10 bg-green-100 print:bg-green-100">Rank</th>
                            </tr>
                            <tr>
                                {SUBJECTS.map(sub => (
                                    <React.Fragment key={sub + '_cols'}>
                                        <th className="border border-slate-300 p-0.5 text-[9px]">TP</th>
                                        <th className="border border-slate-300 p-0.5 text-[9px]">Akh</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.length === 0 ? (
                                <tr>
                                    <td colSpan={3 + (SUBJECTS.length * 2) + 3} className="p-8 text-center text-slate-400 italic">
                                        Data siswa tidak ditemukan untuk kelas ini.
                                    </td>
                                </tr>
                            ) : (
                                stats.map((row, idx) => (
                                    <tr key={row.student.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                                        <td className="border border-slate-300 p-1 text-center">{idx + 1}</td>
                                        <td className="border border-slate-300 p-1 font-medium whitespace-nowrap">{row.student.name}</td>
                                        <td className="border border-slate-300 p-1 text-center">{row.student.nisn}</td>
                                        
                                        {SUBJECTS.map(sub => {
                                            const g = row.grades[sub];
                                            return (
                                                <React.Fragment key={sub + '_' + row.student.id}>
                                                    <td className="border border-slate-300 p-1 text-center text-slate-500 print:text-black">{g.tp > 0 ? g.tp : '-'}</td>
                                                    <td className="border border-slate-300 p-1 text-center font-medium">{g.final > 0 ? g.final : '-'}</td>
                                                </React.Fragment>
                                            );
                                        })}

                                        <td className="border border-slate-300 p-1 text-center font-bold bg-blue-50 print:bg-transparent">{row.totalScore.toFixed(0)}</td>
                                        <td className="border border-slate-300 p-1 text-center font-bold bg-yellow-50 print:bg-transparent">{row.avgScore.toFixed(1)}</td>
                                        <td className="border border-slate-300 p-1 text-center font-bold bg-green-50 print:bg-transparent">
                                            {row.rank <= 3 ? `🏆 ${row.rank}` : row.rank}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER TTD CETAK / DOWNLOAD */}
                <div className={`flex justify-end mt-8 px-8 text-black break-inside-avoid ${isDownloading ? 'flex' : 'hidden print:flex'}`}>
                    <div className="text-center w-64">
                        <p className="mb-1">{settings.city}, {new Date(settings.reportDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p>Wali Kelas,</p>
                        <div className="h-20 w-full flex items-center justify-center relative my-1">
                            {settings.teachers?.[selectedClass]?.signatureUrl && (
                                <img src={settings.teachers[selectedClass].signatureUrl} alt="TTD" className="h-full object-contain z-10 relative" />
                            )}
                        </div>
                        <p className="font-bold underline uppercase">{settings.teachers?.[selectedClass]?.name || '.........................'}</p>
                        <p>NIP. {settings.teachers?.[selectedClass]?.nip || '-'}</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    * { color: #000000 !important; border-color: #000000 !important; }
                    /* Force background colors for readability in print */
                    .bg-slate-100, .print\\:bg-gray-200 { background-color: #e2e8f0 !important; }
                    .bg-slate-200, .print\\:bg-slate-200 { background-color: #cbd5e1 !important; }
                    .bg-blue-100, .print\\:bg-blue-100 { background-color: #dbeafe !important; }
                    .bg-yellow-100, .print\\:bg-yellow-100 { background-color: #fef9c3 !important; }
                    .bg-green-100, .print\\:bg-green-100 { background-color: #dcfce7 !important; }
                }
            `}</style>
        </div>
    );
};

export default Leger;
