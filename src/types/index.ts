export type UserRole = "admin" | "instrutor" | "monitor" | "responsavel";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  beltName?: string;
  beltDegree?: number;
  specialties?: string;
  status?: string;
  avatar?: string;
}

export interface Belt {
  name: string;
  label: string;
  color: string;
  degrees: { quantity: number; bg: string; color: string };
}

export interface Student {
  id: string;
  name: string;
  cpf: string;
  matricula: string;
  birthDate?: string;
  beltName?: string;
  beltDegree?: number;
  status?: string;
  gender?: string;
  email?: string;
  phone?: string;
  rg?: string;
  profession?: string;
  startDate?: string;
  contributes?: boolean;
  contributionAmount?: string;
}

export interface Guardian {
  id: string;
  name: string;
  cpf: string;
  relationshipType: string;
  phone: string;
  email?: string;
  profession?: string;
  isPrimary: boolean;
}

export interface SchoolInfo {
  id: string;
  schoolId: string;
  isStudent: boolean;
  schoolLevel?: string;
  schoolYear?: string;
  schoolShift?: string;
}

export interface HealthProfile {
  id: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
  bloodType?: string;
  observations?: string;
  // emergency_contact and emergency_phone REMOVED
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationshipType: string;
}

export interface BeltPromotion {
  id: string;
  previousBelt: string;
  previousDegree: number;
  newBelt: string;
  newDegree: number;
  promotedBy: string;
  date: string;
  notes?: string;
}

export interface InstructorFeedback {
  id: string;
  authorId: string;
  text: string;
  date: string;
}

export interface StudentContribution {
  id: string;
  reference: string;
  amount: string;
  date: string;
  method: string;
  receiptUrl?: string;
  status: string;
}

export interface StudentDocument {
  id: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface StudentDetail extends Student {
  address?: Record<string, string>;
  guardians: Guardian[];
  schoolInfo?: SchoolInfo;
  healthProfile?: HealthProfile;
  emergencyContacts: EmergencyContact[];
  promotions: BeltPromotion[];
  contributions: StudentContribution[];
  documents: StudentDocument[];
}

export interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  description?: string;
  instructorId: string;
  instructorName?: string;
  schedules?: ClassSchedule[];
  location?: string;
  capacity: number;
  enrolledCount?: number;
  status: "ativa" | "inativa";
  ageRange?: string;
  beltRange?: string;
  lessonsCount?: number;
}

export interface Lesson {
  id: string;
  classGroupId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  instructorName: string;
  status: string;
  topic?: string;
}

export interface LessonDetail extends Lesson {
  classGroup: ClassGroup;
  attendance: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  present: boolean;
  checkedInAt?: string;
}

export interface FinancialTransaction {
  id: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  amount: string;
  date: string;
  status: string;
  paidBy?: string;
  recurrence: string;
  installments?: number;
  currentInstallment?: number;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  type: string;
  document: string;
  address?: string;
  notes?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  amount: string;
  date: string;
  method: string;
  description: string;
  transactionId: string;
}

export interface DonorDetail extends Donor {
  donations: Donation[];
  totalDonated: string;
}

export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  totalClassGroups: number;
  activeClassGroups: number;
  totalLessonsMonth: number;
  monthlyRevenue: string;
  monthlyExpenses: string;
  totalDonors: number;
}

export interface QuickCreateAction {
  id: string;
  label: string;
  icon: string;
  route?: string;
}
