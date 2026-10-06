'use server';

import prisma from '../lib/prisma';
import { cookies } from 'next/headers';

export async function verifyLogin(nis: string, password: string, token: string) {
  try {
    // 1. Cek apakah Token Ruangan valid dan aktif
    const session = await prisma.examSession.findUnique({
      where: { token: token },
    });

    if (!session) {
      return { success: false, message: "Token Ruangan tidak ditemukan." };
    }
    if (!session.isActive) {
      return { success: false, message: "Sesi ujian untuk Token ini sudah ditutup." };
    }

    // 2. Cek apakah Siswa (NIS & Password) cocok
    const student = await prisma.student.findUnique({
      where: { nis: nis },
    });

    if (!student) {
      return { success: false, message: "NIS tidak terdaftar." };
    }
    if (student.password !== password) {
      return { success: false, message: "Password salah!" };
    }

    // Lolos semua pengecekan, set cookie
    const cookieStore = await cookies();
    const sessionData = { studentId: student.id, sessionId: session.id, examBankId: session.examBankId };
    cookieStore.set('student_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2 // 2 hours
    });

    return { success: true, message: `Berhasil login! Selamat mengerjakan, ${student.name}.` };
    
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, message: "Terjadi kesalahan sistem saat login." };
  }
}

export async function getExamData() {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('student_session')?.value;
    if (!sessionStr) return { success: false, message: 'Sesi tidak valid.' };

    const sessionData = JSON.parse(sessionStr);

    const student = await prisma.student.findUnique({ where: { id: sessionData.studentId } });
    const examSession = await prisma.examSession.findUnique({
      where: { id: sessionData.sessionId },
      include: {
        examBank: {
          include: {
            subject: true,
            questions: {
              select: {
                id: true,
                text: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                optionE: true,
                // Kami TIDAK MENGIRIMKAN correctAnswer ke client demi keamanan!
              }
            }
          }
        }
      }
    });

    if (!student || !examSession) return { success: false, message: 'Data tidak ditemukan.' };

    return {
      success: true,
      data: {
        studentName: student.name,
        studentNis: student.nis,
        subjectName: examSession.examBank.subject.name,
        targetKelas: examSession.examBank.targetKelas,
        questions: examSession.examBank.questions
      }
    };
  } catch (error) {
    console.error("Get exam data error:", error);
    return { success: false, message: "Gagal mengambil soal." };
  }
}
