
import React, { useEffect, useState, useRef } from 'react';
import { Student, User, UserRole, CLASSES, SUBJECTS, LearningObjective } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2, Search, Save, X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, FileText, Eye } from 'lucide-react';

const Students = ({ user }: { user: User }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal Tambah Siswa Manual
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Modal Import Excel
    
    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    
    // Manual Add Form State
    const [newStudent, setNewStudent] = useState<Partial<Student>>({
        gender: 'L',
        fase: 'A',
        classLevel: user.className || CLASSES[0]
    });

    // Import Form State
    const [importType, setImportType] = useState<'student' | 'tp'>('student');
    const [importClass, setImportClass] = useState(user.className || CLASSES[0]);
    const [importStatus, setImportStatus] = useState<{type: 'success'|'error'|'idle', msg: string}>({type: 'idle', msg: ''});
    
    // New State for File Editing
    const [tempCsvContent, setTempCsvContent] = useState<string | null>(null);
    const [editableFileName, setEditableFileName] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadStudents();
    }, [user]);

    const loadStudents = () => {
        const all = storageService.getStudents();
        const filtered = user.role === UserRole.ADMIN 
            ? all 
            : all.filter(s => s.classLevel === user.className);
        setStudents(filtered);
    };

    // --- LOGIKA IMPORT & TEMPLATE ---

    const handleDownloadTemplate = () => {
        let headers: string[] = [];
        let exampleRow: string[] = [];
        let filename = "";

        if (importType === 'student') {
            // Format Baru Sesuai Permintaan: Menggunakan titik koma (;)
            headers = [
                "Nama Peserta Didik", 
                "NISN", 
                "NIPD", 
                "JK", 
                "Tempat Lahir",
                "Tanggal Lahir", 
                "Agama", 
                "Pendidikan Sebelumnya", 
                "Alamat",
                "Nama Ayah",
                "Nama Ibu",
                "Pekerjaan Ayah",
                "Pekerjaan Ibu",
                "Alamat Orang Tua",
                "Nama Wali",
                "Pekerjaan Wali",
                "Alamat Wali"
            ];
            
            exampleRow = [
                "SABRINA APRILIA ALMAHIRA", 
                "3164333162", 
                "1088", 
                "P", 
                "LINGKIS",
                "11 April 2016", 
                "Islam", 
                "TK ABA 12", 
                "DUSUN 4",
                "NURSADAD",
                "IRMA",
                "Petani",
                "Petani",
                "DUSUN 4",
                "-", 
                "-",
                "-"
            ];
            filename = `Format_Data_Siswa_${importClass.replace(/\s/g, '')}.csv`;
        } else {
            headers = ["Mata Pelajaran", "Kode TP", "Deskripsi Tujuan Pembelajaran"];
            exampleRow = ["Matematika", "TP.1", "Peserta didik mampu melakukan penjumlahan 1-10"];
            filename = `Template_TP_${importClass.replace(/\s/g, '')}.csv`;
        }
        
        // Gunakan titik koma (;) sebagai pemisah agar sesuai format Excel Indonesia/Eropa
        const separator = ";";
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + headers.join(separator) + "\n" 
            + exampleRow.join(separator);

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi ekstensi sederhana
        if (!file.name.endsWith('.csv')) {
            setImportStatus({ type: 'error', msg: 'Mohon upload file dengan format .csv' });
            return;
        }

        setEditableFileName(file.name);
        setImportStatus({ type: 'idle', msg: '' });

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            setTempCsvContent(text); // Simpan konten sementara, jangan proses dulu
        };
        reader.readAsText(file);
    };

    const executeImport = () => {
        if (!tempCsvContent) return;
        processImportData(tempCsvContent);
        setTempCsvContent(null); // Reset setelah proses
        setEditableFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processImportData = (csvText: string) => {
        // Split baris, filter baris kosong
        const rows = csvText.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        
        // Hapus header (baris pertama)
        if (rows.length > 0) rows.shift();

        if (rows.length === 0) {
            setImportStatus({ type: 'error', msg: 'File CSV kosong atau format salah.' });
            return;
        }

        let successCount = 0;

        try {
            if (importType === 'student') {
                rows.forEach(row => {
                    // Deteksi delimiter: Cek apakah baris menggunakan ; atau ,
                    const separator = row.includes(';') ? ';' : ',';
                    const cols = row.split(separator); 
                    
                    // Validasi minimal kolom Nama dan NISN ada
                    if (cols.length >= 2) {
                        const nama = cols[0]?.trim();
                        const nisn = cols[1]?.trim();
                        
                        if (nama && nisn) {
                            // Tentukan Fase berdasarkan Kelas yang dipilih di dropdown
                            let fase: 'A'|'B'|'C' = 'A';
                            if (['Kelas 3', 'Kelas 4'].includes(importClass)) fase = 'B';
                            if (['Kelas 5', 'Kelas 6'].includes(importClass)) fase = 'C';

                            // Mapping kolom sesuai header baru (17 Kolom)
                            const student: Student = {
                                id: Date.now().toString() + Math.random().toString().substr(2, 5),
                                classLevel: importClass, // Menggunakan kelas dari Dropdown
                                fase: fase,
                                
                                name: nama,
                                nisn: nisn,
                                nipd: cols[2]?.trim() || '-',
                                gender: (cols[3]?.trim().toUpperCase() as 'L'|'P') || 'L',
                                birthPlace: cols[4]?.trim() || '',
                                birthDate: cols[5]?.trim() || '',
                                religion: cols[6]?.trim() || 'Islam',
                                previousEducation: cols[7]?.trim() || '',
                                address: cols[8]?.trim() || '',
                                
                                fatherName: cols[9]?.trim() || '',
                                motherName: cols[10]?.trim() || '',
                                fatherJob: cols[11]?.trim() || '',
                                motherJob: cols[12]?.trim() || '',
                                
                                parentAddressStreet: cols[13]?.trim() || '',
                                
                                guardianName: cols[14]?.trim() || '',
                                guardianJob: cols[15]?.trim() || '',
                                guardianAddress: cols[16]?.trim() || ''
                            };
                            storageService.saveStudent(student);
                            successCount++;
                        }
                    }
                });
                loadStudents();
                setImportStatus({ type: 'success', msg: `Berhasil mengimpor ${successCount} data siswa ke ${importClass}.` });

            } else if (importType === 'tp') {
                rows.forEach(row => {
                    const separator = row.includes(';') ? ';' : ',';
                    const cols = row.split(separator);
                    if (cols.length >= 3) {
                        const tp: LearningObjective = {
                            id: Date.now().toString() + Math.random().toString().substr(2, 5),
                            classLevel: importClass,
                            subject: cols[0]?.trim() || 'Umum',
                            code: cols[1]?.trim() || 'TP.X',
                            description: cols[2]?.trim() || ''
                        };
                        storageService.saveTP(tp);
                        successCount++;
                    }
                });
                setImportStatus({ type: 'success', msg: `Berhasil mengimpor ${successCount} Tujuan Pembelajaran dari file "${editableFileName}".` });
            }
        } catch (err) {
            console.error(err);
            setImportStatus({ type: 'error', msg: 'Gagal memproses file. Pastikan format CSV benar.' });
        }
    };

    // --- LOGIKA MANUAL ---

    const handleSubmitManual = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.name || !newStudent.nisn) return;

        const student: Student = {
            id: Date.now().toString(),
            name: newStudent.name || '',
            nisn: newStudent.nisn || '',
            nipd: newStudent.nipd || '-',
            gender: (newStudent.gender as 'L' | 'P') || 'L',
            classLevel: newStudent.classLevel as string,
            fase: newStudent.fase as 'A'|'B'|'C',
            birthPlace: newStudent.birthPlace || '',
            birthDate: newStudent.birthDate || '',
            religion: newStudent.religion || 'Islam',
            address: newStudent.address || ''
        };

        storageService.saveStudent(student);
        setIsModalOpen(false);
        setNewStudent({ gender: 'L', fase: 'A', classLevel: user.className || CLASSES[0] });
        loadStudents();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Yakin ingin menghapus siswa ini? Data nilai juga akan hilang.')) {
            storageService.deleteStudent(id);
            loadStudents();
        }
    };

    const handleViewDetail = (student: Student) => {
        setSelectedStudent(student);
        setIsDetailModalOpen(true);
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.nisn.includes(searchTerm)
    );

    const resetImportModal = () => {
        setIsImportModalOpen(false);
        setTempCsvContent(null);
        setEditableFileName('');
        setImportStatus({type: 'idle', msg: ''});
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Data Siswa & TP</h1>
                    <p className="text-slate-500">Kelola data peserta didik dan tujuan pembelajaran.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    
                    {/* Tombol Download Template (New) */}
                    <button 
                        onClick={() => {
                            setImportType('student');
                            handleDownloadTemplate();
                        }}
                        className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Download size={20} />
                        <span className="hidden md:inline">Unduh Format Excel</span>
                    </button>

                    {/* Tombol Import Khusus Admin/Guru */}
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <FileSpreadsheet size={20} />
                        <span className="hidden md:inline">Import Data (CSV)</span>
                    </button>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus size={20} />
                        <span className="hidden md:inline">Tambah Siswa Manual</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <Search size={20} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau NISN..." 
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">L/P</th>
                                <th className="px-6 py-4">Kelas</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        Tidak ada data siswa ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-6 py-4">{student.nisn}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                {student.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{student.classLevel}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewDetail(student)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(student.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Data"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === MODAL DETAIL SISWA === */}
            {isDetailModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Detail Siswa</h2>
                                <p className="text-sm text-slate-500">{selectedStudent.name} ({selectedStudent.nisn})</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-8">
                            
                            {/* 1. Data Pribadi */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Data Pribadi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Nama Lengkap</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">NISN / NIPD</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.nisn} / {selectedStudent.nipd}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Tempat, Tanggal Lahir</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.birthPlace || '-'}, {selectedStudent.birthDate || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Jenis Kelamin</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Agama</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.religion || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Pendidikan Sebelumnya</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.previousEducation || '-'}</p>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <span className="block text-slate-400 text-xs">Alamat Peserta Didik</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.address || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Data Orang Tua */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Data Orang Tua</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Nama Ayah</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.fatherName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Pekerjaan Ayah</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.fatherJob || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Nama Ibu</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.motherName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Pekerjaan Ibu</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.motherJob || '-'}</p>
                                    </div>
                                    
                                    <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                                        <span className="block text-slate-400 text-xs">Alamat Orang Tua</span>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-slate-800">{selectedStudent.parentAddressStreet || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Data Wali */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Data Wali</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Nama Wali</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.guardianName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-slate-400 text-xs">Pekerjaan Wali</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.guardianJob || '-'}</p>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <span className="block text-slate-400 text-xs">Alamat Wali</span>
                                        <p className="font-medium text-slate-800">{selectedStudent.guardianAddress || '-'}</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium">
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL IMPORT EXCEL/CSV (VERSI KECIL/COMPACT) === */}
            {isImportModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-green-50">
                            <div className="flex items-center gap-2 text-green-800">
                                <FileSpreadsheet size={20} />
                                <h2 className="text-base font-bold">Import Data CSV</h2>
                            </div>
                            <button onClick={resetImportModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
                            {/* 1. Pilih Tipe Import */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">1. Pilih Jenis Data</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => { setImportType('student'); setTempCsvContent(null); }}
                                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${importType === 'student' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        Data Siswa
                                    </button>
                                    <button 
                                        onClick={() => { setImportType('tp'); setTempCsvContent(null); }}
                                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${importType === 'tp' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        Tujuan Pembelajaran (TP)
                                    </button>
                                </div>
                            </div>

                            {/* 2. Pilih Kelas */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">2. Pilih Kelas Tujuan</label>
                                <select 
                                    className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={importClass}
                                    onChange={(e) => setImportClass(e.target.value)}
                                >
                                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100 text-[10px] text-blue-800 leading-tight">
                                    Data akan diimpor ke <strong>{importClass}</strong>. Pastikan kelas benar.
                                </div>
                            </div>

                            {/* 3. Download Template */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">3. Unduh Format</label>
                                <button 
                                    onClick={handleDownloadTemplate}
                                    className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <Download size={14} />
                                    Format {importType === 'student' ? 'Siswa' : 'TP'} (CSV)
                                </button>
                            </div>

                            {/* 4. Upload File & Edit Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">4. Upload File CSV</label>
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="block w-full text-xs text-slate-500
                                        file:mr-3 file:py-2 file:px-3
                                        file:rounded-md file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-green-600 file:text-white
                                        hover:file:bg-green-700 cursor-pointer"
                                />

                                {/* Area Edit Nama File & Proses Import */}
                                {tempCsvContent && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-green-200 animate-fade-in">
                                        <div className="flex items-center gap-1.5 mb-2 text-green-700 font-semibold text-xs">
                                            <FileText size={14} />
                                            <span>File siap diproses</span>
                                        </div>
                                        
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-slate-300 rounded mb-3 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                            value={editableFileName}
                                            onChange={(e) => setEditableFileName(e.target.value)}
                                        />

                                        <button 
                                            onClick={executeImport}
                                            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex justify-center items-center gap-2 text-xs"
                                        >
                                            <Upload size={14} />
                                            Proses Import
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Status Message */}
                            {importStatus.type !== 'idle' && (
                                <div className={`p-3 rounded-lg flex items-start gap-2 ${importStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {importStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    <p className="text-xs">{importStatus.msg}</p>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            )}

            {/* === MODAL MANUAL TAMBAH SISWA === */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Tambah Siswa Baru (Manual)</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitManual} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                    <input required type="text" className="w-full p-2.5 border rounded-lg" value={newStudent.name || ''} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">NISN</label>
                                    <input required type="text" className="w-full p-2.5 border rounded-lg" value={newStudent.nisn || ''} onChange={e => setNewStudent({...newStudent, nisn: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">NIPD</label>
                                    <input type="text" className="w-full p-2.5 border rounded-lg" value={newStudent.nipd || ''} onChange={e => setNewStudent({...newStudent, nipd: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                                    <select className="w-full p-2.5 border rounded-lg" value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value as 'L'|'P'})}>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                {user.role === UserRole.ADMIN && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                                        <select className="w-full p-2.5 border rounded-lg" value={newStudent.classLevel} onChange={e => setNewStudent({...newStudent, classLevel: e.target.value})}>
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
                                    <input type="text" className="w-full p-2.5 border rounded-lg" value={newStudent.birthPlace || ''} onChange={e => setNewStudent({...newStudent, birthPlace: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                                    <input type="date" className="w-full p-2.5 border rounded-lg" value={newStudent.birthDate || ''} onChange={e => setNewStudent({...newStudent, birthDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Agama</label>
                                    <input type="text" className="w-full p-2.5 border rounded-lg" value={newStudent.religion || ''} onChange={e => setNewStudent({...newStudent, religion: e.target.value})} />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                                    <Save size={18} />
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
