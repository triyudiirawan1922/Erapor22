import { GoogleGenAI } from "@google/genai";
import { Grade } from "../types";

// Initialize Gemini AI
// API Key must be obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTeacherComment = async (studentName: string, grades: Grade[]) => {
    // 1. Validasi API Key
    if (!process.env.API_KEY) {
        return "Konfigurasi API Key Google Gemini belum ditemukan. Harap hubungi administrator.";
    }

    // 2. Validasi Data Nilai Kosong
    if (!grades || grades.length === 0) {
        return "Data nilai tidak ditemukan. Silakan input nilai mata pelajaran terlebih dahulu di menu 'Input Nilai'.";
    }

    // 3. Validasi Kecukupan Data
    // Filter hanya nilai yang memiliki setidaknya satu komponen nilai
    const validGrades = grades.filter(g => 
        (g.tpScore > 0) || 
        (g.finalScore > 0) || 
        (g.knowledgeScore && g.knowledgeScore > 0) || 
        (g.skillScore && g.skillScore > 0)
    );

    if (validGrades.length === 0) {
        return "Data nilai belum cukup untuk dianalisis. Mohon lengkapi nilai (Pengetahuan, Keterampilan, atau Sumatif) agar AI dapat memberikan komentar.";
    }

    // 4. Persiapan Data untuk Prompt
    const gradeSummary = validGrades.map(g => {
        const details = [];
        
        // Hitung rata-rata sumatif jika ada
        if (g.tpScore > 0 || g.finalScore > 0) {
            const avg = Math.round((g.tpScore + g.finalScore) / 2);
            details.push(`Rata-rata Sumatif: ${avg}`);
        }
        
        // Tambahkan detail Pengetahuan/Keterampilan jika ada
        if (g.knowledgeScore && g.knowledgeScore > 0) details.push(`Pengetahuan: ${g.knowledgeScore}`);
        if (g.skillScore && g.skillScore > 0) details.push(`Keterampilan: ${g.skillScore}`);

        // Tambahkan catatan guru per mapel jika ada
        if (g.notes) details.push(`Catatan Mapel: "${g.notes}"`);

        return `- ${g.subject}: [${details.join(", ")}]`;
    }).join("\n");

    const systemInstruction = `Anda adalah seorang Wali Kelas Sekolah Dasar (SD) yang bijaksana, perhatian, dan memotivasi.
Tugas Anda adalah membuat "Catatan Wali Kelas" untuk rapor siswa.

Pedoman Penulisan:
1. Gunakan Bahasa Indonesia yang baku namun hangat dan personal.
2. Awali dengan apresiasi positif terhadap pencapaian siswa.
3. Berikan saran perbaikan yang membangun untuk area yang nilainya kurang, tanpa menggunakan kata-kata kasar.
4. Akhiri dengan kalimat motivasi singkat.
5. Panjang paragraf sekitar 3-4 kalimat saja (singkat dan padat).
6. Jangan menyebutkan angka nilai secara eksplisit (misal: "Nilai kamu 80"), tapi gunakan deskripsi kualitatif (misal: "Sangat baik", "Perlu ditingkatkan").
7. Fokus pada perkembangan karakter dan akademik secara seimbang.`;

    const prompt = `
Nama Siswa: ${studentName}
Data Nilai Mata Pelajaran:
${gradeSummary}

Berdasarkan data di atas, buatlah narasi Catatan Wali Kelas untuk rapor.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 300,
            }
        });

        return response.text || "Gagal menghasilkan komentar dari AI.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Terjadi kesalahan saat menghubungi layanan AI. Silakan coba lagi beberapa saat lagi.";
    }
};