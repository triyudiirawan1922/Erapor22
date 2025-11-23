
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Save, Upload, Trash2, ImageIcon, Users } from 'lucide-react';
import { CLASSES } from '../types';

const AppSettings = () => {
    const [settings, setSettings] = useState(storageService.getSettings());
    const [activeTab, setActiveTab] = useState<'school' | 'teachers'>('school');

    const handleChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    // Helper to convert file to Base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, isTeacher = false, teacherClass = '') => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file (max 500KB agar localStorage tidak penuh)
            if (file.size > 500 * 1024) {
                alert("Ukuran file terlalu besar! Maksimal 500KB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (isTeacher && teacherClass) {
                    setSettings(prev => ({
                        ...prev,
                        teachers: {
                            ...prev.teachers,
                            [teacherClass]: {
                                ...prev.teachers[teacherClass],
                                signatureUrl: base64String
                            }
                        }
                    }));
                } else {
                    setSettings(prev => ({ ...prev, [field]: base64String }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTeacherChange = (className: string, field: 'name' | 'nip', value: string) => {
        setSettings(prev => ({
            ...prev,
            teachers: {
                ...prev.teachers,
                [className]: {
                    ...prev.teachers[className],
                    [field]: value
                }
            }
        }));
    };

    const removeImage = (field: string, isTeacher = false, teacherClass = '') => {
        if (isTeacher && teacherClass) {
            setSettings(prev => ({
                ...prev,
                teachers: {
                    ...prev.teachers,
                    [teacherClass]: {
                        ...prev.teachers[teacherClass],
                        signatureUrl: ""
                    }
                }
            }));
        } else {
            setSettings(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSave = () => {
        try {
            storageService.saveSettings(settings);
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            alert('Gagal menyimpan! Kemungkinan ukuran gambar terlalu besar. Coba gunakan gambar yang lebih kecil.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
                <button 
                    className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'school' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    onClick={() => setActiveTab('school')}
                >
                    <ImageIcon size={18} />
                    Data Sekolah & Kepala Sekolah
                </button>
                <button 
                    className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'teachers' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    onClick={() => setActiveTab('teachers')}
                >
                    <Users size={18} />
                    Data Wali Kelas (Sinkronisasi)
                </button>
            </div>

            <div className="p-8">
                {activeTab === 'school' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Identitas Sekolah */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Identitas Sekolah</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah</label>
                                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.schoolName} onChange={e => handleChange('schoolName', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kota / Kabupaten</label>
                                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.city} onChange={e => handleChange('city', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Sekolah</label>
                                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.schoolAddress} onChange={e => handleChange('schoolAddress', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label>
                                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.academicYear} onChange={e => handleChange('academicYear', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                                    <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.semester} onChange={e => handleChange('semester', e.target.value as any)}>
                                        <option value="I">Semester I (Ganjil)</option>
                                        <option value="II">Semester II (Genap)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Rapor</label>
                                    <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.reportDate} onChange={e => handleChange('reportDate', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Data Kepala Sekolah & Cap */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Kepala Sekolah & Stempel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
                                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.principalName} onChange={e => handleChange('principalName', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
                                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.principalNip} onChange={e => handleChange('principalNip', e.target.value)} />
                                </div>
                                
                                {/* Upload TTD Kepsek */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanda Tangan Kepala Sekolah</label>
                                    <div className="flex items-center gap-4">
                                        {settings.principalSignatureUrl ? (
                                            <div className="relative w-32 h-20 bg-white border rounded p-1">
                                                <img src={settings.principalSignatureUrl} alt="TTD" className="w-full h-full object-contain" />
                                                <button onClick={() => removeImage('principalSignatureUrl')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-20 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">Kosong</div>
                                        )}
                                        <div className="flex-1">
                                            <label className="cursor-pointer bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 flex items-center w-fit gap-2">
                                                <Upload size={14} /> Upload Gambar
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'principalSignatureUrl')} />
                                            </label>
                                            <p className="text-[10px] text-slate-500 mt-1">Format: PNG/JPG (Background Transparan)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Cap Sekolah */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Cap / Stempel Sekolah</label>
                                    <div className="flex items-center gap-4">
                                        {settings.schoolStampUrl ? (
                                            <div className="relative w-20 h-20 bg-white border rounded p-1">
                                                <img src={settings.schoolStampUrl} alt="Cap" className="w-full h-full object-contain" />
                                                <button onClick={() => removeImage('schoolStampUrl')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">Kosong</div>
                                        )}
                                        <div className="flex-1">
                                            <label className="cursor-pointer bg-emerald-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-emerald-700 flex items-center w-fit gap-2">
                                                <Upload size={14} /> Upload Cap
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'schoolStampUrl')} />
                                            </label>
                                            <p className="text-[10px] text-slate-500 mt-1">Format: PNG/JPG (Background Transparan)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-6">
                            <p className="font-bold mb-1">ℹ️ Informasi Sinkronisasi Otomatis</p>
                            <p>Data yang diisi di sini akan <strong>otomatis muncul</strong> di Rapor siswa sesuai kelasnya masing-masing. Guru tidak perlu menginput nama/TTD mereka secara manual saat mencetak rapor.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {CLASSES.map((className) => {
                                const teacher = settings.teachers?.[className] || { name: "", nip: "", signatureUrl: "" };
                                return (
                                    <div key={className} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50/50">
                                        <h4 className="font-bold text-slate-800 border-b pb-2 mb-3 flex justify-between items-center">
                                            {className}
                                            <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 font-normal">Wali Kelas</span>
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Lengkap & Gelar</label>
                                                <input 
                                                    className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                                                    placeholder="Contoh: Budi Santoso, S.Pd."
                                                    value={teacher.name} 
                                                    onChange={(e) => handleTeacherChange(className, 'name', e.target.value)} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">NIP</label>
                                                <input 
                                                    className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                                                    placeholder="Contoh: 19800101..."
                                                    value={teacher.nip} 
                                                    onChange={(e) => handleTeacherChange(className, 'nip', e.target.value)} 
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                {teacher.signatureUrl ? (
                                                    <div className="relative w-24 h-16 bg-white border rounded p-1">
                                                        <img src={teacher.signatureUrl} alt="TTD" className="w-full h-full object-contain" />
                                                        <button 
                                                            onClick={() => removeImage('', true, className)} 
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-16 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 text-center px-1">
                                                        TTD Kosong
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 flex items-center w-fit gap-1 shadow-sm">
                                                        <Upload size={12} /> Upload TTD
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, '', true, className)} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="pt-8 mt-8 border-t border-slate-200 flex justify-end sticky bottom-0 bg-white pb-4">
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                    >
                        <Save size={20} />
                        SIMPAN SEMUA PENGATURAN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppSettings;
