'use server';

import prisma from '../../lib/prisma';

// ==================== DASHBOARD ====================
export async function getDashboardStats() {
  try {
    const totalStudents = await prisma.student.count();
    const totalSessions = await prisma.examSession.count();
    const activeSessions = await prisma.examSession.count({ where: { isActive: true } });

    const recentStudents = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentSessions = await prisma.examSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { examBank: true }
    });

    return {
      success: true,
      data: { totalStudents, totalSessions, activeSessions, recentStudents, recentSessions },
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    return { success: false, message: 'Gagal memuat data dashboard.' };
  }
}

// ==================== STUDENTS ====================
export async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: students };
  } catch (error) {
    console.error('Get students error:', error);
    return { success: false, message: 'Gagal memuat data siswa.' };
  }
}

export async function createStudent(data: { nis: string; password: string; name: string; kelas: string }) {
  try {
    const existing = await prisma.student.findUnique({ where: { nis: data.nis } });
    if (existing) {
      return { success: false, message: 'NIS sudah terdaftar!' };
    }

    const student = await prisma.student.create({ data });
    return { success: true, data: student, message: 'Siswa berhasil ditambahkan.' };
  } catch (error) {
    console.error('Create student error:', error);
    return { success: false, message: 'Gagal menambahkan siswa.' };
  }
}

export async function updateStudent(id: number, data: { nis: string; password: string; name: string; kelas: string }) {
  try {
    const existing = await prisma.student.findFirst({
      where: { nis: data.nis, NOT: { id } },
    });
    if (existing) {
      return { success: false, message: 'NIS sudah digunakan siswa lain!' };
    }

    const student = await prisma.student.update({ where: { id }, data });
    return { success: true, data: student, message: 'Data siswa berhasil diperbarui.' };
  } catch (error) {
    console.error('Update student error:', error);
    return { success: false, message: 'Gagal memperbarui data siswa.' };
  }
}

export async function deleteStudent(id: number) {
  try {
    await prisma.student.delete({ where: { id } });
    return { success: true, message: 'Siswa berhasil dihapus.' };
  } catch (error) {
    console.error('Delete student error:', error);
    return { success: false, message: 'Gagal menghapus siswa.' };
  }
}

// ==================== EXAM SESSIONS ====================
export async function getSessions() {
  try {
    const sessions = await prisma.examSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: { examBank: true }
    });
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Get sessions error:', error);
    return { success: false, message: 'Gagal memuat data sesi.' };
  }
}

export async function createSession(examBankId: number) {
  try {
    // Nonaktifkan semua sesi yang masih aktif
    await prisma.examSession.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Generate 6-char uppercase token
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    const session = await prisma.examSession.create({
      data: { token, examBankId },
    });
    return { success: true, data: session, message: `Sesi berhasil dibuat. Token: ${session.token}` };
  } catch (error) {
    console.error('Create session error:', error);
    return { success: false, message: 'Gagal membuat sesi ujian.' };
  }
}

export async function deleteSession(id: string) {
  try {
    await prisma.examSession.delete({ where: { id } });
    return { success: true, message: 'Sesi berhasil dihapus.' };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, message: 'Gagal menghapus sesi.' };
  }
}

// ==================== SUBJECTS (MATA PELAJARAN) ====================
export async function getSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: subjects };
  } catch (error) {
    console.error('Get subjects error:', error);
    return { success: false, message: 'Gagal memuat daftar mapel.' };
  }
}

export async function createSubject(name: string) {
  try {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) return { success: false, message: 'Mata pelajaran sudah ada.' };

    const subject = await prisma.subject.create({ data: { name } });
    return { success: true, data: subject, message: 'Mapel berhasil ditambahkan.' };
  } catch (error) {
    console.error('Create subject error:', error);
    return { success: false, message: 'Gagal menambahkan mapel.' };
  }
}

// ==================== EXAM BANKS (PAKET SOAL) ====================
export async function getExamBanks() {
  try {
    const examBanks = await prisma.examBank.findMany({
      orderBy: { createdAt: 'desc' },
      include: { subject: true, author: true, _count: { select: { questions: true } } }
    });
    return { success: true, data: examBanks };
  } catch (error) {
    console.error('Get exam banks error:', error);
    return { success: false, message: 'Gagal memuat paket soal.' };
  }
}

export async function createExamBank(data: { title: string; subjectId: number; targetKelas: string; authorId?: number }) {
  try {
    let authorId = data.authorId;
    // Otomatis membuat akun admin dummy pertama kali jika belum ada (karena tabel baru)
    if (!authorId) {
      let admin = await prisma.user.findFirst();
      if (!admin) {
        admin = await prisma.user.create({
          data: { username: 'admin_master', password: 'password', name: 'Administrator', role: 'ADMIN' }
        });
      }
      authorId = admin.id;
    }

    const examBank = await prisma.examBank.create({
      data: { title: data.title, subjectId: data.subjectId, targetKelas: data.targetKelas, authorId }
    });
    return { success: true, data: examBank, message: 'Paket soal berhasil dibuat.' };
  } catch (error) {
    console.error('Create exam bank error:', error);
    return { success: false, message: 'Gagal membuat paket soal.' };
  }
}

export async function deleteExamBank(id: number) {
  try {
    // Harus hapus pertanyaannya dulu karena relasi
    await prisma.question.deleteMany({ where: { examBankId: id } });
    await prisma.examBank.delete({ where: { id } });
    return { success: true, message: 'Paket soal beserta isinya berhasil dihapus.' };
  } catch (error) {
    console.error('Delete exam bank error:', error);
    return { success: false, message: 'Gagal menghapus paket soal.' };
  }
}

// ==================== QUESTIONS ====================
export async function getQuestions(examBankId?: number) {
  try {
    const where = examBankId ? { examBankId } : {};
    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { examBank: true }
    });
    return { success: true, data: questions };
  } catch (error) {
    console.error('Get questions error:', error);
    return { success: false, message: 'Gagal memuat data soal.' };
  }
}

export async function createQuestion(data: {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  examBankId: number;
}) {
  try {
    const question = await prisma.question.create({ data });
    return { success: true, data: question, message: 'Soal berhasil ditambahkan.' };
  } catch (error) {
    console.error('Create question error:', error);
    return { success: false, message: 'Gagal menambahkan soal.' };
  }
}

export async function updateQuestion(id: number, data: {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  examBankId: number;
}) {
  try {
    const question = await prisma.question.update({ where: { id }, data });
    return { success: true, data: question, message: 'Soal berhasil diperbarui.' };
  } catch (error) {
    console.error('Update question error:', error);
    return { success: false, message: 'Gagal memperbarui soal.' };
  }
}

export async function deleteQuestion(id: number) {
  try {
    await prisma.question.delete({ where: { id } });
    return { success: true, message: 'Soal berhasil dihapus.' };
  } catch (error) {
    console.error('Delete question error:', error);
    return { success: false, message: 'Gagal menghapus soal.' };
  }
}

