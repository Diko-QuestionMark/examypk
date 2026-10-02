'use server';

import prisma from '../lib/prisma';

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

    // Lolos semua pengecekan
    return { success: true, message: `Berhasil login! Selamat mengerjakan, ${student.name}.` };
    
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, message: "Terjadi kesalahan sistem saat login." };
  }
}
