import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

export const seedInglesData = async (userId: string) => {
  const careerId = 'ingles';
  const subjectsRef = collection(db, `users/${userId}/careers/${careerId}/subjects`);
  
  // Clear existing subjects for a clean sync
  const snap = await getDocs(subjectsRef);
  const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  const data = [
    // Trimestre 1
    { name: 'Fundamentos Del Inglés Escrito', period: 1, modality: 'presencial', grades: [19, 17, 17, 15, 16, 16, 19], finalGrade: 17, status: 'aprobada' },
    { name: 'Preparación Física Y Deportiva', period: 1, modality: 'presencial', grades: [16, 16, 20, 19, 20], finalGrade: 18, status: 'aprobada' },
    { name: 'Gramática Española I', period: 1, modality: 'presencial', grades: [14, 20, 20, 14, 10, 14], finalGrade: 15, status: 'aprobada' },
    { name: 'Destreza De la Habilidad Verbal', period: 1, modality: 'presencial', grades: [17, 19, 18, 16, 18, 20], finalGrade: 18, status: 'aprobada' },
    { name: 'Compresión Auditiva Y Lectora', period: 1, modality: 'virtual', grades: [20, 20, 20, 19, 20], finalGrade: 20, status: 'aprobada' },
    
    // Trimestre 2
    { name: 'Cultura Inglesa y Norteamericana', period: 2, modality: 'virtual', grades: [20, 20, 20, 20, 20], status: 'en curso' },
    { name: 'Fonética y Fonología I', period: 2, modality: 'presencial', grades: [19, 18, 18, 19], status: 'en curso' },
    { name: 'Gramática Española II', period: 2, modality: 'presencial', grades: [18, 20, 20], status: 'en curso' },
    { name: 'Inglés I', period: 2, modality: 'presencial', grades: [18.5, 17.5], status: 'en curso' },
    { name: 'Traducción I', period: 2, modality: 'presencial', grades: [20, 16, 20], status: 'en curso' },
    
    // Trimestre 3
    { name: 'Fonética y Fonología II', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Inglés II', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Lingüística I', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Literatura Norteamericana Contemporánea', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Traducción II', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    
    // Trimestre 4
    { name: 'Fonética y Fonología III', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Inglés III', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Literatura Inglesa Contemporánea', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Lingüística II', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Traducción III', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    
    // Trimestre 5
    { name: 'Comunicación Interpersonal', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Destreza de la Habilidad Escrita', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Fonética y Fonología IV', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Inglés IV', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Traducción IV', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    
    // Trimestre 6
    { name: 'Comunicación Avanzada', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Composición y Estilo', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Inglés V', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Oratoria', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Servicio Comunitario', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    
    // Trimestre 7
    { name: 'Comunicación en el Campo Profesional', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Inglés en las TIC', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Seminario Desarrollo y Emprendimiento', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Seminario de Pasantía Ocupacional', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Teoría y Práctica del Discurso', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    
    // Trimestre 8
    { name: 'Pasantía Ocupacional', period: 8, modality: 'presencial', grades: [], status: 'por ver' }
  ];

  for (const subject of data) {
    await addDoc(subjectsRef, subject);
  }
};

export const seedMedicinaData = async (userId: string) => {
  const careerId = 'medicina';
  const subjectsRef = collection(db, `users/${userId}/careers/${careerId}/subjects`);
  
  const snap = await getDocs(subjectsRef);
  const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  const data = [
    // Semestre 1
    { name: 'Extra Académica', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Lab. Biología I', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Biología I', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Comprensión y Expresión Lingüística', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Matemáticas', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Des. Dest. Para el Aprendizaje', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Química General', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Extra Académica Deportiva', period: 1, modality: 'presencial', grades: [], status: 'por ver' },
    
    // Semestre 2
    { name: 'Lab. Biología II', period: 2, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Biología II', period: 2, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Física Médica', period: 2, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Inglés Inst. Agrobiológica', period: 2, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Estadística General', period: 2, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Química Orgánica', period: 2, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Sociología de la Salud', period: 2, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 3
    { name: 'Ciencias Sociales', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'ITPP I', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Anatomía', period: 3, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Embriología', period: 3, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 4
    { name: 'ITPP II', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Anatomía II', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Psicología Evolutiva', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Bioquímica', period: 4, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Informática', period: 4, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 5
    { name: 'Estadística', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Histología', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Fisiología', period: 5, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'ITPP III', period: 5, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 6
    { name: 'Epid. Gen. y Saneamiento Ambiental', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Psicología Médica', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'ITPP IV', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Microbiología e Inmun. Clínica', period: 6, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Parasitología', period: 6, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 7
    { name: 'Fisiopatología', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Semiología (Medicina I)', period: 7, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Anatomía Patológica', period: 7, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 8
    { name: 'Farmacología I', period: 8, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Cirugía I', period: 8, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Genética', period: 8, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Ginecología y Obstetricia I', period: 8, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Puericultura', period: 8, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 9
    { name: 'Psicopatología', period: 9, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Farmacología II', period: 9, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Medicina II', period: 9, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Pediatría I', period: 9, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 10
    { name: 'Epidemiología Especial', period: 10, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Cirugía II', period: 10, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Medicina III', period: 10, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Ginecología y Obstetricia II', period: 10, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Deontología Médica', period: 10, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 11
    { name: 'Administración Médica', period: 11, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Medicina IV', period: 11, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Medicina Legal', period: 11, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Pediatría II', period: 11, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Imagenología', period: 11, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 12
    { name: 'Medicina del Trabajo', period: 12, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Psiquiatría Clínica', period: 12, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Cirugía III', period: 12, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Medicina V', period: 12, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Historia de la Medicina', period: 12, modality: 'presencial', grades: [], status: 'por ver' },

    // Semestre 13 y 14
    { name: 'Trabajo de Grado', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Pasantía Rural', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Higiene Mental y Psicoterapia', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Cirugía IV', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Medicina VI', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Ginecología y Obstetricia III', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
    { name: 'Pediatría III', period: 13, modality: 'presencial', grades: [], status: 'por ver' },
  ];

  for (const subject of data) {
    await addDoc(subjectsRef, subject);
  }
};

export const seedInglesActivities = async (userId: string) => {
  const careerId = 'ingles';
  const activitiesRef = collection(db, `users/${userId}/careers/${careerId}/activities`);
  const subjectsRef = collection(db, `users/${userId}/careers/${careerId}/subjects`);
  
  // Clear existing activities
  const snap = await getDocs(activitiesRef);
  const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Get subjects to link by name
  const subjectSnap = await getDocs(subjectsRef);
  const subjectMap: Record<string, string> = {};
  subjectSnap.docs.forEach(doc => {
    subjectMap[doc.data().name] = doc.id;
  });

  const activities = [
    // Fonética y Fonología I (PDF says Fonética I)
    { subjectName: 'Fonética y Fonología I', title: 'Quiz: Unit I (Phonetics)', dueDate: '2026-02-12T08:00', isExam: false, completed: true, details: 'Conceptos iniciales.' },
    { subjectName: 'Fonética y Fonología I', title: 'Written Test: Classification', dueDate: '2026-02-14T08:00', isExam: true, completed: true, details: 'Órganos del habla.' },
    { subjectName: 'Fonética y Fonología I', title: 'Vowel Memory (Unit II)', dueDate: '2026-02-28T08:00', isExam: false, completed: true, details: 'Práctica de fonemas.' },
    { subjectName: 'Fonética y Fonología I', title: 'Interview (Unit II)', dueDate: '2026-03-07T08:00', isExam: true, completed: true, details: 'Diagrama de vocales.' },
    { subjectName: 'Fonética y Fonología I', title: 'Workshop: Vowel Chart', dueDate: '2026-03-21T08:00', isExam: false, completed: true, details: 'Cuadro fonético.' },
    { subjectName: 'Fonética y Fonología I', title: 'Tríptico + Diccionario MVP', dueDate: '2026-04-18T08:00', isExam: false, completed: false, details: 'Minimal Vowel Pairs - Lista 1.' },
    { subjectName: 'Fonética y Fonología I', title: 'Bingo / Oral Performance', dueDate: '2026-05-02T08:00', isExam: true, completed: false, details: 'Dinamica con Lista 2 de MVP.' },

    // Inglés I
    { subjectName: 'Inglés I', title: 'Role-play: Greetings', dueDate: '2026-02-14T08:00', isExam: false, completed: true, details: 'Presentaciones básicas.' },
    { subjectName: 'Inglés I', title: 'Written Test: There is/are', dueDate: '2026-02-28T08:00', isExam: true, completed: true, details: 'Gramática de unidad.' },
    { subjectName: 'Inglés I', title: 'Workshop: Simple Tense', dueDate: '2026-03-21T08:00', isExam: false, completed: true, details: 'Tiempos verbales.' },
    { subjectName: 'Inglés I', title: 'Oral Evaluation: Pronouns', dueDate: '2026-04-11T08:00', isExam: true, completed: false, details: 'Uso correcto de pronombres.' },
    { subjectName: 'Inglés I', title: 'Oral Evaluation: Adjectives', dueDate: '2026-04-25T08:00', isExam: true, completed: false, details: 'Descripción y adjetivos.' },

    // Gramática Española II (PDF says Gramática II)
    { subjectName: 'Gramática Española II', title: 'Diario de Sistematización', dueDate: '2026-01-31T08:00', isExam: false, completed: true, details: 'Apuntes de clase.' },
    { subjectName: 'Gramática Española II', title: 'Prueba Escrita: Unidad I', dueDate: '2026-02-14T08:00', isExam: true, completed: true, details: 'Evaluación teórica.' },
    { subjectName: 'Gramática Española II', title: 'Prueba Escrita: Ejercicios II', dueDate: '2026-02-28T08:00', isExam: true, completed: true, details: 'Práctica gramatical.' },
    { subjectName: 'Gramática Española II', title: 'Prueba Escrita: Ejercicios III', dueDate: '2026-03-21T08:00', isExam: true, completed: true, details: 'Sintaxis y morfología.' },
    { subjectName: 'Gramática Española II', title: 'Prueba Escrita: Ejercicios IV', dueDate: '2026-04-18T08:00', isExam: true, completed: false, details: 'Última prueba escrita.' },
    { subjectName: 'Gramática Española II', title: 'Entrevistas / Dramatizaciones', dueDate: '2026-05-02T08:00', isExam: false, completed: false, details: 'Nota: Recordar guion y vestuario.' },

    // Traducción I
    { subjectName: 'Traducción I', title: 'Taller Grupal: Conceptos', dueDate: '2026-02-14T08:00', isExam: false, completed: true, details: 'Fundamentos de traducción.' },
    { subjectName: 'Traducción I', title: 'Examen Escrito: Elementos', dueDate: '2026-02-28T08:00', isExam: true, completed: true, details: 'Fases del proceso.' },
    { subjectName: 'Traducción I', title: 'Taller: Significado', dueDate: '2026-03-14T08:00', isExam: false, completed: true, details: 'Diagramas semánticos.' },
    { subjectName: 'Traducción I', title: 'Video: Texto Mal Traducido', dueDate: '2026-03-28T08:00', isExam: false, completed: false, details: 'Análisis de errores.' },
    { subjectName: 'Traducción I', title: 'Exposición: Técnicas', dueDate: '2026-04-18T08:00', isExam: true, completed: false, details: 'Nota: Préstamos y calcos.' },
    { subjectName: 'Traducción I', title: 'Evaluación Final: Análisis', dueDate: '2026-05-02T08:00', isExam: true, completed: false, details: 'Video análisis final.' },

    // Cultura Inglesa y Norteamericana (PDF says Cultura Inglesa)
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Cuestionario: Lo Cultural USA', dueDate: '2026-02-12T08:00', isExam: true, completed: true, details: '' },
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Cafetería Virtual: Lo Cultural', dueDate: '2026-02-19T08:00', isExam: false, completed: true, details: '' },
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Archivo: Canadá y su gente', dueDate: '2026-02-26T08:00', isExam: false, completed: true, details: '' },
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Archivo: Los Australianos', dueDate: '2026-03-17T08:00', isExam: false, completed: true, details: '' },
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Foro: Playa, sol y arena', dueDate: '2026-03-24T08:00', isExam: false, completed: true, details: '' },
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Wiki: Tradición Británica', dueDate: '2026-04-21T08:00', isExam: false, completed: false, details: '' },
    { subjectName: 'Cultura Inglesa y Norteamericana', title: 'Foro: Tradiciones ceremoniales', dueDate: '2026-04-28T08:00', isExam: false, completed: false, details: '' },
  ];

  for (const act of activities) {
    const subjectId = subjectMap[act.subjectName];
    if (subjectId) {
      await addDoc(activitiesRef, {
        title: act.title,
        dueDate: act.dueDate,
        isExam: act.isExam,
        completed: act.completed,
        details: act.details,
        subjectId: subjectId,
        userId: userId,
        careerId: careerId
      });
    }
  }
};
