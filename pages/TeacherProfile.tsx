
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Save, Upload, Trash2, Key, UserCircle, Camera } from 'lucide-react';

const TeacherProfile = ({ user }: { user: User }) => {
    // Profile State
    const [name, setName] = useState('');
    const [nip, setNip] = useState('');
    const [signature, setSignature] = useState('');
    const [photo, setPhoto] = useState('');
    
    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user.className) {
            const settings = storageService.getSettings();
            const teacher = settings.teachers?.[user.className];
            if (teacher) {
                setName(teacher.name || '');
                setNip(teacher.nip || '');
                setSignature(teacher.signatureUrl || '');
                setPhoto(teacher.photoUrl || '');
            }
        }
    }, [user]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'signature' | 'photo') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                setMsg({ type: 'error', text: 'Ukuran file terlalu besar! Maksimal 500KB.' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'signature') setSignature(reader.result as string);
                else setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        if (!user.className) return;
        
        try {
            storageService.updateTeacherProfile(user.className, name, nip, signature, photo);
            setMsg({ type: 'success', text: 'Profil berhasil diperbarui! Foto, Nama, dan TTD telah disimpan.' });
            // Trigger reload to update sidebar immediately (optional but good UX)
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            setMsg({ type: 'error', text: 'Gagal menyimpan profil.' });
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.className) return;

        if (newPassword !== confirmPassword) {
            setMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
            return;
        }

        if (newPassword.length < 4) {
            setMsg({ type: 'error', text: 'Password baru minimal 4 karakter.' });
            return;
        }

        const isValid = storageService.verifyTeacherLogin(user.className, currentPassword);
        if (!isValid) {
            setMsg({ type: 'error', text: 'Password saat ini salah.' });
            return;
        }

        storageService.updateTeacherPassword(user.className, newPassword);
        setMsg({ type: 'success', text: 'Password berhasil diubah! Silakan gunakan password baru saat login berikutnya.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 font-tech">Profil & Keamanan Akun</h1>
                <p className="text-slate-500">Kelola identitas wali kelas, foto profil, dan keamanan akun Anda.</p>
            </div>

            {msg && (
                <div className={`p-4 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BAGIAN KIRI: PROFIL */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <UserCircle className="text-blue-600" />
                        <h2 className="font-bold text-lg text-slate-700">Identitas Wali Kelas</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {/* FOTO PROFIL */}
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
                                {photo ? (
                                    <img src={photo} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-full h-full text-slate-400 p-1" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 flex items-center w-fit gap-2 transition-colors shadow-sm mb-1">
                                    <Camera size={14} /> Ganti Foto
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} />
                                </label>
                                <p className="text-[10px] text-slate-400">Tampil di pojok kiri atas aplikasi.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nama Lengkap & Gelar</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Contoh: Budi Santoso, S.Pd."
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">NIP</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Contoh: 198001..."
                                value={nip}
                                onChange={e => setNip(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Tanda Tangan Digital</label>
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-20 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                    {signature ? (
                                        <>
                                            <img src={signature} alt="TTD" className="w-full h-full object-contain" />
                                            <button 
                                                onClick={() => setSignature('')}
                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 text-center p-1">Belum ada TTD</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center w-fit gap-2 transition-colors shadow-sm">
                                        <Upload size={16} /> Upload TTD
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} />
                                    </label>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                                        Format PNG transparan untuk Rapor.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveProfile}
                            className="w-full mt-4 py-2.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Save size={18} />
                            Simpan Profil
                        </button>
                    </div>
                </div>

                {/* BAGIAN KANAN: SECURITY */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <Key className="text-orange-500" />
                        <h2 className="font-bold text-lg text-slate-700">Ubah Kata Sandi</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Kata Sandi Saat Ini</label>
                            <input 
                                type="password" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Masukan password lama..."
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Kata Sandi Baru</label>
                            <input 
                                type="password" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Minimal 4 karakter"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Konfirmasi Kata Sandi Baru</label>
                            <input 
                                type="password" 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Ulangi password baru"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full mt-4 py-2.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Save size={18} />
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
