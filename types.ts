
declare var html2pdf: any;

export enum UserRole {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER'
}

export interface User {
    username: string;
    role: UserRole;
    className?: string; // For teachers (e.g., "Kelas 1")
    name?: string;
}

export interface Student {
    id: string;
    name: string;
    nisn: string;
    nipd: string;
    gender: 'L' | 'P';
    classLevel: string; // "Kelas 1", "Kelas 2", etc.
    fase: 'A' | 'B' | 'C';
    
    // Data Pribadi Detail
    birthPlace?: string;
    birthDate?: string;
    religion?: string;
    previousEducation?: string;
    address?: string;
    
    // Data Orang Tua
    fatherName?: string;
    motherName?: string;
    fatherJob?: string;
    motherJob?: string;
    
    // Alamat Orang Tua Detail
    parentAddressStreet?: string;
    parentAddressVillage?: string; // Kelurahan/Desa
    parentAddressDistrict?: string; // Kecamatan
    parentAddressCity?: string; // Kab/Kota
    parentAddressProvince?: string;

    // Data Wali
    guardianName?: string;
    guardianJob?: string;
    guardianAddress?: string;
}

export interface LearningObjective {
    id: string;
    classLevel: string;
    subject: string;
    code: string; // e.g. "TP.1"
    description: string;
}

export interface Grade {
    studentId: string;
    subject: string;
    tpScore: number; // Sumatif TP
    finalScore: number; // Sumatif Akhir
    knowledgeScore?: number; // Pengetahuan (Legacy/Optional)
    skillScore?: number; // Keterampilan (Legacy/Optional)
    notes: string; // Capaian Kompetensi per Mapel
}

export interface Attendance {
    studentId: string;
    sick: number;
    permission: number;
    alpha: number;
    teacherNote?: string; // Catatan Wali Kelas (General)
}

export interface TeacherInfo {
    name: string;
    nip: string;
    signatureUrl: string; // Base64 for Report
    photoUrl?: string; // Base64 for Profile/Sidebar
}

export interface SchoolSettings {
    schoolName: string;
    schoolAddress: string;
    academicYear: string;
    semester: 'I' | 'II';
    principalName: string;
    principalNip: string;
    city: string;
    reportDate: string;
    principalSignatureUrl?: string; // Base64
    schoolStampUrl?: string; // Base64 (Cap Sekolah)
    teachers: Record<string, TeacherInfo>; // Map "Kelas 1" -> TeacherInfo
}

export const SUBJECTS = [
    "Pendidikan Agama",
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Matematika",
    "IPAS",
    "Seni Budaya",
    "PJOK",
    "Bahasa Inggris",
    "Potensi daerah",
    "BTA"
];

export const CLASSES = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
