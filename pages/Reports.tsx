
import React, { useEffect, useState, useRef } from 'react';
import { Student, User, SUBJECTS, Grade, SchoolSettings } from '../types';
import { storageService } from '../services/storageService';
import { generateTeacherComment } from '../services/geminiService';
import { Printer, Sparkles, Loader2, FileText, Download, X, Maximize2, ChevronDown } from 'lucide-react';

const Reports = ({ user }: { user: User }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [settings, setSettings] = useState<SchoolSettings>(storageService.getSettings());
    const [grades, setGrades] = useState<Grade[]>([]);
    const [attendance, setAttendance] = useState<any>(null);
    const [teacherNote, setTeacherNote] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    
    // New States
    const [viewMode, setViewMode] = useState<'report' | 'cover'>('report');
    const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState('');
    
    const printRef = useRef<HTMLDivElement>(null);
    const bulkPrintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSettings(storageService.getSettings());
        const all = storageService.getStudents();
        const filtered = user.className ? all.filter(s => s.classLevel === user.className) : all;
        setStudents(filtered);
        if (filtered.length > 0) handleSelectStudent(filtered[0]);
    }, [user]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setGrades(storageService.getGrades().filter(g => g.studentId === student.id));
        const att = storageService.getAttendance(student.id);
        setAttendance(att);
        setTeacherNote(att.teacherNote || '');
    };

    const handleSaveNote = (note: string) => {
        setTeacherNote(note);
        if (selectedStudent && attendance) {
            const updatedAtt = { ...attendance, teacherNote: note, studentId: selectedStudent.id };
            storageService.saveAttendance(updatedAtt);
            setAttendance(updatedAtt);
        }
    };

    const handleGenerateComment = async () => {
        if (!selectedStudent) return;
        if (grades.length === 0) {
            alert("Mohon input nilai siswa terlebih dahulu sebelum membuat catatan AI.");
            return;
        }
        setIsGeneratingAi(true);
        try {
            const comment = await generateTeacherComment(selectedStudent.name, grades);
            handleSaveNote(comment);
        } catch (error) {
            console.error(error);
            setTeacherNote("Maaf, gagal menghasilkan catatan otomatis saat ini.");
        }
        setIsGeneratingAi(false);
    };

    // --- PDF & PRINT LOGIC ---

    const handlePrintBrowser = () => {
        window.print();
    };

    const downloadSinglePDF = () => {
        if (!printRef.current || !selectedStudent) return;
        
        setIsDownloading(true);
        const element = printRef.current;
        const opt = {
            margin: [10, 10, 10, 10], // mm
            filename: `Rapor_${selectedStudent.name.replace(/\s/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: paperSize.toLowerCase(), orientation: 'portrait' }
        };

        // @ts-ignore
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        });
    };

    const downloadClassPDF = async () => {
        if (!bulkPrintRef.current || students.length === 0) return;
        
        if (!window.confirm(`Anda akan mengunduh ${students.length} rapor dalam satu file PDF. Proses ini mungkin memakan waktu beberapa detik. Lanjutkan?`)) {
            return;
        }

        setIsDownloading(true);
        setDownloadProgress('Menyiapkan data...');

        // Tunggu render bulk container
        await new Promise(resolve => setTimeout(resolve, 1000));

        const element = bulkPrintRef.current;
        const opt = {
            margin: [10, 10, 10, 10], // mm
            filename: `Rapor_Kelas_${user.className || 'Semua'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: paperSize.toLowerCase(), orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        setDownloadProgress('Memproses PDF...');
        // @ts-ignore
        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
            setDownloadProgress('');
        });
    };

    // --- COMPONENT RENDERERS ---

    const RenderReportSheet = ({ student, isBulk = false }: { student: Student, isBulk?: boolean }) => {
        // Fetch data specific for this student (useful for bulk map)
        const sGrades = isBulk ? storageService.getGrades().filter(g => g.studentId === student.id) : grades;
        const sAtt = isBulk ? storageService.getAttendance(student.id) : attendance;
        const sNote = isBulk ? (sAtt?.teacherNote || '') : teacherNote;

        const teacherInfo = settings.teachers?.[student.classLevel];
        const teacherName = teacherInfo?.name || user.name || "Wali Kelas";
        const teacherNip = teacherInfo?.nip || "-";
        const teacherSignature = teacherInfo?.signatureUrl;

        // STYLE HITAM PEKAT untuk CETAK (Dipaksa dengan inline style dan !important)
        const blackText = "text-black print:text-black !text-[#000000]";
        const blackBorder = "border-black print:border-black !border-[#000000]";
        
        const greenHeaderClass = `bg-[#d9ead3] font-bold text-center ${blackBorder} border py-1 print:bg-[#d9ead3] !print-color-adjust-exact ${blackText}`;
        const borderClass = `border ${blackBorder} p-1 ${blackText}`;
        
        // Helper Style untuk Teks Hitam Pekat
        const textStyle = { color: '#000000' };

        // Ukuran Kertas Style
        const paperStyle = paperSize === 'A4' ? 'w-[210mm] min-h-[297mm]' : 'w-[215mm] min-h-[330mm]';
        const containerClass = `bg-white ${paperStyle} p-[15mm] mx-auto font-sans text-[12px] leading-tight relative ${isBulk ? 'mb-0' : 'shadow-xl'} text-black`;

        if (viewMode === 'cover') {
            // --- MODE COVER (3 HALAMAN) ---
            return (
                <div className="text-black" style={textStyle}>
                    {/* HALAMAN 1: SAMPUL UTAMA */}
                    <div className={`${containerClass} flex flex-col items-center justify-center text-center page-break-after-always`}>
                        <div className="mb-12">
                            <img src="https://iili.io/fd1ypnV.png" alt="Logo" className="w-40 h-auto object-contain" />
                        </div>
                        
                        <h1 className="text-2xl font-bold uppercase tracking-widest mb-2" style={textStyle}>RAPOR</h1>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-2" style={textStyle}>PESERTA DIDIK</h2>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-12" style={textStyle}>SEKOLAH DASAR</h2>
                        
                        <h2 className="text-2xl font-bold uppercase mb-20" style={textStyle}>{settings.schoolName}</h2>

                        <p className="mb-2 font-medium" style={textStyle}>Nama Peserta Didik :</p>
                        <div className={`border-2 ${blackBorder} p-3 w-3/4 mb-4 bg-transparent font-bold uppercase text-lg`} style={{borderColor: '#000000'}}>
                            {student.name}
                        </div>

                        <p className="mb-2 font-medium" style={textStyle}>NISN</p>
                        <div className={`border-2 ${blackBorder} p-3 w-3/4 mb-20 bg-transparent font-bold text-lg`} style={{borderColor: '#000000'}}>
                            {student.nisn}
                        </div>

                        <div className="mt-auto font-bold text-lg uppercase" style={textStyle}>
                            <p>KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</p>
                            <p>REPUBLIK INDONESIA</p>
                        </div>
                    </div>

                    {/* HALAMAN 2: IDENTITAS SEKOLAH */}
                    <div className={`${containerClass} flex flex-col page-break-after-always`}>
                        <div className="text-center mb-16 mt-10">
                            <h1 className="text-xl font-bold uppercase tracking-wide mb-1" style={textStyle}>RAPOR</h1>
                            <h2 className="text-xl font-bold uppercase tracking-wide mb-1" style={textStyle}>PESERTA DIDIK</h2>
                            <h2 className="text-xl font-bold uppercase tracking-wide" style={textStyle}>SEKOLAH DASAR ( SD )</h2>
                        </div>

                        <div className="px-4">
                            <table className="w-full text-base font-medium border-separate border-spacing-y-4" style={textStyle}>
                                <tbody>
                                    <tr>
                                        <td className="w-48 align-top">Nama Sekolah</td>
                                        <td className="w-4 align-top">:</td>
                                        <td className="uppercase font-bold">{settings.schoolName}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">NPSN</td>
                                        <td className="align-top">:</td>
                                        <td>-</td> {/* Placeholder as currently not in settings */}
                                    </tr>
                                    <tr>
                                        <td className="align-top">Alamat Sekolah</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">{settings.schoolAddress}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Kode Pos</td>
                                        <td className="align-top">:</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Desa / Kelurahan</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">-</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Kecamatan</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">-</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Kabupaten / Kota</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">{settings.city}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Provinsi</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">SUMATERA SELATAN</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Website</td>
                                        <td className="align-top">:</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">E-mail</td>
                                        <td className="align-top">:</td>
                                        <td>-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* HALAMAN 3: IDENTITAS PESERTA DIDIK */}
                    <div className={`${containerClass} flex flex-col ${isBulk ? 'page-break-after-always' : ''}`}>
                        <h1 className="text-xl font-bold uppercase text-center mb-12 mt-4" style={textStyle}>IDENTITAS PESERTA DIDIK</h1>

                        <div className="w-full">
                            <table className="w-full text-sm font-medium border-separate border-spacing-y-2" style={textStyle}>
                                <tbody>
                                    <tr>
                                        <td className="w-[200px] align-top">Nama Peserta Didik</td>
                                        <td className="w-4 align-top">:</td>
                                        <td className="font-bold uppercase">{student.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">NIS / NISN</td>
                                        <td className="align-top">:</td>
                                        <td>{student.nipd} / {student.nisn}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Tempat, Tanggal Lahir</td>
                                        <td className="align-top">:</td>
                                        <td>{student.birthPlace}, {student.birthDate ? new Date(student.birthDate).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ''}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Jenis Kelamin</td>
                                        <td className="align-top">:</td>
                                        <td>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Agama</td>
                                        <td className="align-top">:</td>
                                        <td>{student.religion}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Pendidikan sebelumnya</td>
                                        <td className="align-top">:</td>
                                        <td>{student.previousEducation || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top">Alamat Peserta Didik</td>
                                        <td className="align-top">:</td>
                                        <td>{student.address}</td>
                                    </tr>
                                    
                                    {/* ORANG TUA */}
                                    <tr><td colSpan={3} className="pt-4 font-bold">Nama Orang Tua</td></tr>
                                    <tr>
                                        <td className="align-top pl-4">Ayah</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">{student.fatherName}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Ibu</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">{student.motherName}</td>
                                    </tr>

                                    <tr><td colSpan={3} className="pt-2 font-bold">Pekerjaan Orang Tua</td></tr>
                                    <tr>
                                        <td className="align-top pl-4">Ayah</td>
                                        <td className="align-top">:</td>
                                        <td>{student.fatherJob}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Ibu</td>
                                        <td className="align-top">:</td>
                                        <td>{student.motherJob}</td>
                                    </tr>

                                    <tr><td colSpan={3} className="pt-2 font-bold">Alamat Orang Tua</td></tr>
                                    <tr>
                                        <td className="align-top pl-4">Jalan</td>
                                        <td className="align-top">:</td>
                                        <td>{student.parentAddressStreet || student.address}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Kelurahan/Desa</td>
                                        <td className="align-top">:</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Kecamatan</td>
                                        <td className="align-top">:</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Kabupaten / Kota</td>
                                        <td className="align-top">:</td>
                                        <td>{settings.city}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Provinsi</td>
                                        <td className="align-top">:</td>
                                        <td>SUMATERA SELATAN</td>
                                    </tr>

                                    {/* WALI */}
                                    <tr><td colSpan={3} className="pt-4 font-bold">Wali Peserta Didik</td></tr>
                                    <tr>
                                        <td className="align-top pl-4">Nama</td>
                                        <td className="align-top">:</td>
                                        <td className="uppercase">{student.guardianName || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Pekerjaan</td>
                                        <td className="align-top">:</td>
                                        <td>{student.guardianJob || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top pl-4">Alamat</td>
                                        <td className="align-top">:</td>
                                        <td>{student.guardianAddress || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-auto flex justify-end">
                            <div className="text-center w-64">
                                <p className="mb-1">{settings.city}, {new Date(settings.reportDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                                <p>Kepala Sekolah,</p>
                                <div className="h-24 w-64 flex items-center justify-center relative my-1">
                                    {settings.principalSignatureUrl && <img src={settings.principalSignatureUrl} className="h-full w-full object-contain z-10 relative" alt="TTD" />}
                                    {settings.schoolStampUrl && <img src={settings.schoolStampUrl} className="absolute h-24 w-24 object-contain opacity-80 z-0 -ml-16 rotate-[-5deg]" alt="Cap" />}
                                </div>
                                <p className="font-bold underline uppercase">{settings.principalName}</p>
                                <p>NIP. {settings.principalNip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- MODE RAPOR NILAI (EXISTING) ---
        return (
            <div className={`${containerClass} ${isBulk ? 'page-break-after-always' : ''}`} style={{ color: '#000000', borderColor: '#000000' }}>
                <div className="text-center mb-6">
                    <h2 className="font-bold text-lg text-black" style={textStyle}>LAPORAN HASIL BELAJAR</h2>
                    <h2 className="font-bold text-lg text-black" style={textStyle}>(RAPOR)</h2>
                </div>

                <div className="flex justify-between mb-6 font-medium text-black" style={textStyle}>
                    <div className="w-[55%]">
                        <table className="w-full" style={textStyle}>
                            <tbody className="text-black">
                                <tr>
                                    <td className="w-32 py-0.5 text-black" style={textStyle}>Nama Peserta Didik</td>
                                    <td className="w-2 text-black" style={textStyle}>:</td>
                                    <td className="font-bold text-black" style={textStyle}>{student.name}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 text-black" style={textStyle}>NISN</td>
                                    <td className="text-black" style={textStyle}>:</td>
                                    <td className="text-black" style={textStyle}>{student.nisn}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 text-black" style={textStyle}>Sekolah</td>
                                    <td className="text-black" style={textStyle}>:</td>
                                    <td className="text-black" style={textStyle}>{settings.schoolName}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 align-top text-black" style={textStyle}>Alamat</td>
                                    <td className="align-top text-black" style={textStyle}>:</td>
                                    <td className="align-top text-black" style={textStyle}>{settings.schoolAddress}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-[40%]">
                        <table className="w-full" style={textStyle}>
                            <tbody className="text-black">
                                <tr>
                                    <td className="w-24 py-0.5 text-black" style={textStyle}>Kelas</td>
                                    <td className="w-2 text-black" style={textStyle}>:</td>
                                    <td className="text-black" style={textStyle}>{student.classLevel}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 text-black" style={textStyle}>Fase</td>
                                    <td className="text-black" style={textStyle}>:</td>
                                    <td className="text-black" style={textStyle}>{student.fase}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 text-black" style={textStyle}>Semester</td>
                                    <td className="text-black" style={textStyle}>:</td>
                                    <td className="text-black" style={textStyle}>{settings.semester}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 text-black" style={textStyle}>Tahun Pelajaran</td>
                                    <td className="text-black" style={textStyle}>:</td>
                                    <td className="text-black" style={textStyle}>{settings.academicYear}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <table className={`w-full border-collapse border ${blackBorder} mb-6 text-black`} style={{borderColor: '#000000'}}>
                    <thead>
                        <tr>
                            <th className={`${greenHeaderClass} w-10`}>No</th>
                            <th className={`${greenHeaderClass} w-[25%]`}>Mata Pelajaran</th>
                            <th className={`${greenHeaderClass} w-16`}>Nilai Akhir</th>
                            <th className={`${greenHeaderClass}`}>Capaian Kompetensi</th>
                        </tr>
                    </thead>
                    <tbody style={textStyle}>
                        {SUBJECTS.map((sub, idx) => {
                            const g = sGrades.find(gr => gr.subject === sub);
                            const avg = g ? Math.round((g.tpScore + g.finalScore) / 2) : '';
                            return (
                                <tr key={sub} className="h-14">
                                    <td className={`${borderClass} text-center align-middle`}>{idx + 1}</td>
                                    <td className={`${borderClass} align-middle`}>{sub}</td>
                                    <td className={`${borderClass} text-center align-middle font-bold`}>{avg}</td>
                                    <td className={`${borderClass} text-left align-middle px-2`}>{g?.notes || ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className={`${greenHeaderClass} border-b-0 text-black`}>Kokurikuler</div>
                <table className={`w-full border-collapse border ${blackBorder} mb-6 text-black`} style={{borderColor: '#000000'}}>
                    <thead>
                        <tr>
                            <th className={`${greenHeaderClass} w-10`}>No</th>
                            <th className={`${greenHeaderClass} w-[40%]`}>Ekstrakurikuler</th>
                            <th className={`${greenHeaderClass}`}>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody style={textStyle}>
                        {[1, 2, 3].map((num) => (
                            <tr key={num} className="h-8">
                                <td className={`${borderClass} text-center`}>{num}</td>
                                <td className={borderClass}>{num === 1 ? 'Pramuka' : '-'}</td>
                                <td className={borderClass}>-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex gap-6 mb-6 avoid-break text-black" style={textStyle}>
                    <div className="w-1/3">
                        <table className={`w-full border-collapse border ${blackBorder}`} style={{borderColor: '#000000'}}>
                            <thead>
                                <tr><th colSpan={3} className={greenHeaderClass}>Ketidakhadiran</th></tr>
                            </thead>
                            <tbody style={textStyle}>
                                <tr>
                                    <td className={`${borderClass} w-32`}>Sakit</td>
                                    <td className={`${borderClass} text-center`}>{sAtt?.sick || '-'}</td>
                                    <td className={`${borderClass} text-center w-12`}>hari</td>
                                </tr>
                                <tr>
                                    <td className={borderClass}>Izin</td>
                                    <td className={`${borderClass} text-center`}>{sAtt?.permission || '-'}</td>
                                    <td className={`${borderClass} text-center`}>hari</td>
                                </tr>
                                <tr>
                                    <td className={borderClass}>Tanpa Keterangan</td>
                                    <td className={`${borderClass} text-center`}>{sAtt?.alpha || '-'}</td>
                                    <td className={`${borderClass} text-center`}>hari</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-2/3 flex flex-col">
                        <div className={greenHeaderClass}>Catatan Wali Kelas</div>
                        <div 
                            className={`border ${blackBorder} flex-1 p-2 min-h-[100px] text-sm font-serif italic whitespace-pre-wrap text-black font-medium`}
                            style={{ color: '#000000', borderColor: '#000000' }}
                        >
                            {sNote}
                        </div>
                    </div>
                </div>

                <div className="mb-8 avoid-break text-black" style={textStyle}>
                    <div className={greenHeaderClass}>Tanggapan Orang Tua/ Wali Murid</div>
                    <div className={`border ${blackBorder} h-20`} style={{borderColor: '#000000'}}></div>
                </div>

                <div className="mt-6 font-medium text-[12px] leading-normal break-inside-avoid avoid-break text-black" style={textStyle}>
                    <div className="flex justify-between px-10 text-center">
                        <div className="flex flex-col items-center w-64">
                            <p>Mengetahui,<br/>Orang Tua/Wali,</p>
                            <div className="h-24 w-full"></div>
                            <div className={`border-b ${blackBorder} w-48`} style={{borderColor: '#000000'}}></div>
                        </div>
                        <div className="flex flex-col items-center w-64">
                            <p className="mb-1">{settings.city}, {new Date(settings.reportDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p>Wali Kelas,</p>
                            <div className="h-24 w-40 flex items-center justify-center relative my-1">
                                {teacherSignature && <img src={teacherSignature} className="h-full w-full object-contain" alt="TTD" />}
                            </div>
                            <p className="font-bold underline uppercase">{teacherName}</p>
                            <p>NIP. {teacherNip}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center mt-4 text-center relative">
                        <p>Mengetahui,<br/>Kepala Sekolah</p>
                        <div className="h-24 w-64 flex items-center justify-center relative my-1">
                            {settings.principalSignatureUrl && <img src={settings.principalSignatureUrl} className="h-full w-full object-contain z-10 relative" alt="TTD" />}
                            {settings.schoolStampUrl && <img src={settings.schoolStampUrl} className="absolute h-24 w-24 object-contain opacity-80 z-0 -ml-16 rotate-[-5deg]" alt="Cap" />}
                        </div>
                        <p className="font-bold underline uppercase">{settings.principalName}</p>
                        <p>NIP. {settings.principalNip}</p>
                    </div>
                </div>
                
                <div className="absolute bottom-4 right-10 text-[10px] text-slate-400 border-t pt-1 print:hidden">
                    E-RAPOR 22 - Dicetak melalui Sistem Digital SDN 22 MP
                </div>
            </div>
        );
    };

    if (!selectedStudent) return <div>Loading...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* === SIDEBAR CONTROLS === */}
            <div className="w-full md:w-80 bg-cyan-50 p-5 rounded-xl shadow-md border border-cyan-100 h-fit no-print">
                <h2 className="font-bold text-lg mb-5 text-slate-800 flex items-center gap-2 border-b border-cyan-200 pb-3">
                    <FileText size={20} className="text-blue-600" />
                    Kontrol Laporan
                </h2>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Pilih Siswa</label>
                    <div className="relative">
                        <select 
                            className="w-full p-2.5 border-2 border-cyan-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-cyan-500 focus:ring-0 outline-none shadow-sm appearance-none"
                            value={selectedStudent.id}
                            onChange={(e) => {
                                const s = students.find(st => st.id === e.target.value);
                                if (s) handleSelectStudent(s);
                            }}
                        >
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Ukuran Kertas</label>
                     <div className="relative">
                        <select 
                            className="w-full p-2.5 border-2 border-cyan-200 bg-white rounded-lg text-slate-700 font-semibold focus:border-cyan-500 focus:ring-0 outline-none shadow-sm appearance-none"
                            value={paperSize}
                            onChange={(e) => setPaperSize(e.target.value as 'A4' | 'F4')}
                        >
                            <option value="A4">A4 (210 x 297 mm)</option>
                            <option value="F4">F4 / Folio (215 x 330 mm)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex gap-2 p-1 bg-white rounded-lg border border-cyan-100 shadow-sm">
                        <button 
                            onClick={() => setViewMode('report')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'report' ? 'bg-cyan-100 text-cyan-900 shadow-sm border border-cyan-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            Isi Rapor
                        </button>
                        <button 
                            onClick={() => setViewMode('cover')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'cover' ? 'bg-cyan-100 text-cyan-900 shadow-sm border border-cyan-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            Cover
                        </button>
                    </div>

                    {viewMode === 'report' && (
                        <button 
                            onClick={handleGenerateComment}
                            disabled={isGeneratingAi}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-purple-200 disabled:opacity-70"
                        >
                            {isGeneratingAi ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            {isGeneratingAi ? 'Sedang Berpikir...' : 'Buat Catatan Wali (AI)'}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => setIsPrintModalOpen(true)}
                        className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Maximize2 size={20} />
                        Preview & Cetak
                    </button>

                    <div className="border-t border-cyan-200 my-3"></div>
                    
                    <button 
                        onClick={downloadClassPDF}
                        disabled={isDownloading}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        {isDownloading ? 'Memproses...' : 'Unduh PDF (Satu Kelas)'}
                    </button>
                </div>

                {isDownloading && downloadProgress && (
                    <div className="bg-blue-100 text-blue-800 p-3 rounded-lg text-xs text-center animate-pulse border border-blue-200 font-medium">
                        {downloadProgress}
                    </div>
                )}
            </div>

            {/* === MAIN PREVIEW AREA (Screen Only) === */}
            <div className="flex-1 bg-slate-100/50 p-4 md:p-8 overflow-y-auto rounded-xl print:hidden border border-slate-200/50 shadow-inner">
                <div className="scale-[0.8] origin-top">
                    <RenderReportSheet student={selectedStudent} />
                </div>
            </div>

            {/* === PRINT PREVIEW POPUP MODAL === */}
            {isPrintModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-4">
                                <h2 className="font-bold text-lg text-slate-800">Preview Cetak</h2>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">{paperSize}</span>
                                <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold border border-slate-300">{viewMode === 'report' ? 'Isi Rapor' : 'Cover'}</span>
                            </div>
                            <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center">
                            <div ref={printRef} className="shadow-2xl print:shadow-none transition-transform hover:scale-[1.01] duration-300">
                                <RenderReportSheet student={selectedStudent} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <button 
                                onClick={() => setIsPrintModalOpen(false)} 
                                className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                            >
                                Tutup
                            </button>
                            <button 
                                onClick={downloadSinglePDF}
                                disabled={isDownloading}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                            >
                                {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                Unduh PDF
                            </button>
                            <button 
                                onClick={handlePrintBrowser}
                                className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                <Printer size={18} />
                                Cetak Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === HIDDEN CONTAINER FOR BULK PRINTING === */}
            <div className="fixed top-0 left-0 w-[1px] h-[1px] overflow-hidden opacity-0 pointer-events-none">
                <div ref={bulkPrintRef}>
                    {isDownloading && students.map((s) => (
                        <div key={s.id} className="page-break-after-always">
                             <RenderReportSheet student={s} isBulk={true} />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: ${paperSize === 'A4' ? '210mm 297mm' : '215mm 330mm'}; margin: 0; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    * { color: #000000 !important; border-color: #000000 !important; }
                    td, th, p, span, div, h2 { color: #000000 !important; }
                    .text-black { color: #000000 !important; }
                    .border-black { border-color: #000000 !important; }
                    .page-break-after-always { page-break-after: always; }
                    .avoid-break { page-break-inside: avoid; }
                    .bg-\[\#d9ead3\] { background-color: #d9ead3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                .html2pdf__page-break { page-break-before: always; }
            `}</style>
        </div>
    );
};

export default Reports;
