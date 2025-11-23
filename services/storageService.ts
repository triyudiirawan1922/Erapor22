
import { Student, Grade, Attendance, SchoolSettings, LearningObjective, CLASSES } from '../types';

const KEYS = {
    STUDENTS: 'erapor_students',
    GRADES: 'erapor_grades',
    ATTENDANCE: 'erapor_attendance',
    SETTINGS: 'erapor_settings',
    TPS: 'erapor_tps',
    TEACHER_AUTH: 'erapor_teacher_auth' // New key for passwords
};

// --- SEED DATA (DATA PEMULIHAN) ---
const SEED_STUDENTS: Student[] = [
    { name: "SABRINA APRILIA ALMAHIRA", nisn: "3164333162", nipd: "1088", gender: "P", birthPlace: "LINGKIS", birthDate: "2016-04-11", religion: "Islam", previousEducation: "", address: "DUSUN 4", fatherName: "NURSADAD", motherName: "IRMA", fatherJob: "Petani", motherJob: "Petani", parentAddressStreet: "DUSUN 4" },
    { name: "RADIT", nisn: "121763220", nipd: "1016", gender: "L", birthPlace: "BANYUASIN", birthDate: "2012-02-11", religion: "Islam", previousEducation: "TK ABA 12", address: "Jln. Dusun 4", fatherName: "RUDI HARTONO", motherName: "DALIMA", fatherJob: "Petani", motherJob: "Lainnya", parentAddressStreet: "Jln. Dusun 4" },
    { name: "NUR FAIS SAMAD", nisn: "3159705565", nipd: "1069", gender: "L", birthPlace: "Banyuasin", birthDate: "2015-04-16", religion: "Islam", previousEducation: "", address: "Jalur 31", fatherName: "", motherName: "Hermawati", fatherJob: "Petani", motherJob: "Tidak bekerja", parentAddressStreet: "Jalur 31" },
    { name: "FAHMI HABIBI", nisn: "3162750131", nipd: "1057", gender: "L", birthPlace: "Banyuasin", birthDate: "2016-01-05", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "Dusun 4", fatherName: "YUSUF", motherName: "FARIDA", fatherJob: "Petani", motherJob: "Lainnya", parentAddressStreet: "Dusun 4" },
    { name: "MUHAMMAD FADLI SARWANDI", nisn: "3152874317", nipd: "1062", gender: "L", birthPlace: "Banyuasin", birthDate: "2015-12-01", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "Dusun 4", fatherName: "SARWANDI", motherName: "FADILAH", fatherJob: "Petani", motherJob: "Lainnya", parentAddressStreet: "Dusun 4" },
    { name: "RIDHO", nisn: "3157189951", nipd: "1046", gender: "L", birthPlace: "Banyuasin", birthDate: "2015-06-16", religion: "Islam", previousEducation: "", address: "Dusun 4", fatherName: "RAMLAN", motherName: "RUSIANA", fatherJob: "Petani", motherJob: "Lainnya", parentAddressStreet: "Dusun 4" },
    { name: "ARUMI NASYAH ARSITA", nisn: "3167866889", nipd: "1056", gender: "P", birthPlace: "Palembang", birthDate: "2016-02-12", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "Dusun 4", fatherName: "HENDRA", motherName: "SURYANTI", fatherJob: "Petani", motherJob: "Tidak bekerja", parentAddressStreet: "Dusun 4" },
    { name: "SUSANTI", nisn: "3167101854", nipd: "1064", gender: "P", birthPlace: "BANYUASIN", birthDate: "2014-03-10", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "DUSUN 4", fatherName: "", motherName: "RUS", fatherJob: "Tidak bekerja", motherJob: "Tidak bekerja", parentAddressStreet: "DUSUN 4" },
    { name: "DELVINA LULUK ANUGRAINI", nisn: "157307210", nipd: "", gender: "P", birthPlace: "Banyuasin", birthDate: "2015-12-19", religion: "Islam", previousEducation: "", address: "A.Yani", fatherName: "NUGROHO KADARUSNO", motherName: "RENI SEPTIANINGSIH", fatherJob: "Petani", motherJob: "Petani", parentAddressStreet: "A.Yani" },
    { name: "ZERLINA AZZAHRA", nisn: "3169387123", nipd: "1065", gender: "P", birthPlace: "BANYUASIN", birthDate: "2016-02-09", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "DUSUN 4", fatherName: "MAHDARIANSYAH", motherName: "TATIK JUMIATI", fatherJob: "Wiraswasta", motherJob: "Lainnya", parentAddressStreet: "DUSUN 4" },
    { name: "AGUS PRASETYO", nisn: "3157598763", nipd: "1054", gender: "L", birthPlace: "Banyuasin", birthDate: "2015-08-29", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "Dusun 4", fatherName: "SUPARNO", motherName: "SITI MULYATI", fatherJob: "Petani", motherJob: "Lainnya", parentAddressStreet: "Dusun 4" },
    { name: "MARCEL", nisn: "3159588243", nipd: "1059", gender: "L", birthPlace: "PALEMBANG", birthDate: "2015-10-30", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "DUSUN 4", fatherName: "ADAM", motherName: "RUSMANA DEWI", fatherJob: "Buruh", motherJob: "Lainnya", parentAddressStreet: "DUSUN 4" },
    { name: "DEFRANDY RESWA PUTRA VANNA", nisn: "159475487", nipd: "", gender: "L", birthPlace: "NGANJUK", birthDate: "2015-12-06", religion: "Islam", previousEducation: "", address: "Dsn. Jenangan", fatherName: "NOVAN RUSDIANTONO", motherName: "TINA YULIANA", fatherJob: "Karyawan Swasta", motherJob: "Tidak bekerja", parentAddressStreet: "Dsn. Jenangan" },
    { name: "SILA", nisn: "123191285", nipd: "1067", gender: "P", birthPlace: "RIDING", birthDate: "2012-01-25", religion: "Islam", previousEducation: "", address: "SUNGAI RASAU", fatherName: "KANANG", motherName: "NELI", fatherJob: "Petani", motherJob: "Petani", parentAddressStreet: "SUNGAI RASAU" },
    { name: "MIRANI RAWANTI", nisn: "3166140185", nipd: "1061", gender: "P", birthPlace: "Banyuasin", birthDate: "2016-10-01", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "Dusun 4", fatherName: "ARUA", motherName: "OKTARINA", fatherJob: "Wiraswasta", motherJob: "Lainnya", parentAddressStreet: "Dusun 4" },
    { name: "MEYRA AULIA ARIIBAH DIRJA", nisn: "3167882874", nipd: "1060", gender: "P", birthPlace: "Banyuasin", birthDate: "2016-05-11", religion: "Islam", previousEducation: "TK ABA 12 MUARA PADANG", address: "Dusun 4", fatherName: "SUDARSONO", motherName: "DARTI", fatherJob: "Petani", motherJob: "Lainnya", parentAddressStreet: "Dusun 4" }
].map(s => ({
    ...s,
    id: "SEED_" + s.nisn,
    classLevel: "Kelas 4",
    fase: "B"
} as Student));

const SEED_TPS: LearningObjective[] = [
    { id: "TP_INDO_1", classLevel: "Kelas 4", subject: "Bahasa Indonesia", code: "TP.1", description: "Peserta didik mampu mengidentifikasi ide pokok dan gagasan pendukung dalam teks." },
    { id: "TP_MTK_1", classLevel: "Kelas 4", subject: "Matematika", code: "TP.1", description: "Peserta didik mampu melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai 1.000." },
    { id: "TP_IPAS_1", classLevel: "Kelas 4", subject: "IPAS", code: "TP.1", description: "Peserta didik mampu mengidentifikasi bagian-bagian tubuh tumbuhan dan fungsinya." },
    { id: "TP_PKN_1", classLevel: "Kelas 4", subject: "Pendidikan Pancasila", code: "TP.1", description: "Peserta didik mampu menjelaskan makna sila-sila Pancasila dalam kehidupan sehari-hari." },
    { id: "TP_SENI_1", classLevel: "Kelas 4", subject: "Seni Budaya", code: "TP.1", description: "Peserta didik mampu mengenal dan membuat karya seni rupa dua dimensi (menggambar)." }
];

export const storageService = {
    // Students
    getStudents: (): Student[] => {
        const data = localStorage.getItem(KEYS.STUDENTS);
        if (data) {
            return JSON.parse(data);
        }
        storageService.saveStudentList(SEED_STUDENTS);
        return SEED_STUDENTS;
    },
    saveStudent: (student: Student) => {
        const students = storageService.getStudents();
        const index = students.findIndex(s => s.id === student.id);
        if (index >= 0) {
            students[index] = student;
        } else {
            students.push(student);
        }
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    },
    saveStudentList: (list: Student[]) => {
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(list));
    },
    deleteStudent: (id: string) => {
        const students = storageService.getStudents().filter(s => s.id !== id);
        localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    },

    // Learning Objectives (TP)
    getTPs: (): LearningObjective[] => {
        const data = localStorage.getItem(KEYS.TPS);
        if (data) {
            return JSON.parse(data);
        }
        localStorage.setItem(KEYS.TPS, JSON.stringify(SEED_TPS));
        return SEED_TPS;
    },
    saveTP: (tp: LearningObjective) => {
        const tps = storageService.getTPs();
        const index = tps.findIndex(t => t.classLevel === tp.classLevel && t.subject === tp.subject && t.code === tp.code);
        if (index >= 0) {
            tps[index] = tp;
        } else {
            tps.push(tp);
        }
        localStorage.setItem(KEYS.TPS, JSON.stringify(tps));
    },

    // Grades
    getGrades: (): Grade[] => {
        const data = localStorage.getItem(KEYS.GRADES);
        return data ? JSON.parse(data) : [];
    },
    saveGrade: (grade: Grade) => {
        const grades = storageService.getGrades();
        const index = grades.findIndex(g => g.studentId === grade.studentId && g.subject === grade.subject);
        if (index >= 0) {
            grades[index] = grade;
        } else {
            grades.push(grade);
        }
        localStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
    },

    // Attendance & General Notes
    getAttendance: (studentId: string): Attendance => {
        const all = localStorage.getItem(KEYS.ATTENDANCE);
        const list: Attendance[] = all ? JSON.parse(all) : [];
        return list.find(a => a.studentId === studentId) || { studentId, sick: 0, permission: 0, alpha: 0, teacherNote: '' };
    },
    saveAttendance: (att: Attendance) => {
        const all = localStorage.getItem(KEYS.ATTENDANCE);
        const list: Attendance[] = all ? JSON.parse(all) : [];
        const index = list.findIndex(a => a.studentId === att.studentId);
        if (index >= 0) list[index] = att;
        else list.push(att);
        localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(list));
    },

    // Settings
    getSettings: (): SchoolSettings => {
        const data = localStorage.getItem(KEYS.SETTINGS);
        if (data) {
            const parsed = JSON.parse(data);
            if (!parsed.teachers) {
                parsed.teachers = {};
                CLASSES.forEach(c => {
                    parsed.teachers[c] = { name: "", nip: "", signatureUrl: "", photoUrl: "" };
                });
            }
            return parsed;
        }
        
        const defaultTeachers: any = {};
        CLASSES.forEach(c => {
            defaultTeachers[c] = { name: "", nip: "", signatureUrl: "", photoUrl: "" };
        });

        const defaultSettings: SchoolSettings = {
            schoolName: "SDN 22 Muara Padang",
            schoolAddress: "Jl. Pendidikan No. 22",
            academicYear: "2025/2026",
            semester: "I",
            principalName: "Kepala Sekolah",
            principalNip: "-",
            city: "Muara Padang",
            reportDate: new Date().toISOString().split('T')[0],
            principalSignatureUrl: "",
            schoolStampUrl: "",
            teachers: defaultTeachers
        };
        
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
        return defaultSettings;
    },
    saveSettings: (settings: SchoolSettings) => {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    },

    // --- TEACHER AUTH & PROFILE ---
    
    // Verifikasi password guru (default: 123456)
    verifyTeacherLogin: (classLevel: string, passwordInput: string): boolean => {
        const allAuth = JSON.parse(localStorage.getItem(KEYS.TEACHER_AUTH) || '{}');
        const storedPass = allAuth[classLevel] || '123456'; // Default password
        return passwordInput.trim() === storedPass;
    },

    // Ubah password guru
    updateTeacherPassword: (classLevel: string, newPassword: string) => {
        const allAuth = JSON.parse(localStorage.getItem(KEYS.TEACHER_AUTH) || '{}');
        allAuth[classLevel] = newPassword;
        localStorage.setItem(KEYS.TEACHER_AUTH, JSON.stringify(allAuth));
    },

    // Update profil guru (Nama, NIP, TTD, Foto) ke Settings global
    updateTeacherProfile: (classLevel: string, name: string, nip: string, signatureUrl: string, photoUrl?: string) => {
        const settings = storageService.getSettings();
        if (!settings.teachers) settings.teachers = {};
        if (!settings.teachers[classLevel]) settings.teachers[classLevel] = { name: "", nip: "", signatureUrl: "", photoUrl: "" };

        settings.teachers[classLevel] = { 
            name, 
            nip, 
            signatureUrl,
            photoUrl: photoUrl !== undefined ? photoUrl : settings.teachers[classLevel].photoUrl 
        };
        storageService.saveSettings(settings);
    }
};
