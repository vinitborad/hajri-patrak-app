
// offline atttendance
export const LIVE_ATTENDANCE = (subjectId: string) => `live-attendance-${subjectId}`;
export const QUEUED_ATTENDANCES = 'queued-attendances';
export const archivedAttendancesKey = (subjectId: string) => `archived-attendances-${subjectId}`;

// defualt data structures
export const SUBJECT_STRUCTURE = 'subjects-structure';
export const SUBJECT_STRUCTURE_KEY = 'subjects-structure-contentKey';
export const DIVISION_STUDENTS_LIST = (divisionId: string) => `division-students-list-data-${divisionId}`;
export const DIVISION_STUDENTS_LIST_KEY = (divisionId: string) => `division-students-list-contentKey-${divisionId}`;

// faculty data
export const PREV_ATTENDANCES = (subjectId: string) => `subject-attendance-${subjectId}`;
export const ANALYSIS = (subjectId: string) => `attendance-analysis-${subjectId}`;
export const ATTENDANCE_INFO = (attendanceId: string) => `attendance-info-${attendanceId}`;
export const FACULTY_PROFILE = 'faculty-profile';

// student 
export const STUDENT_SUBJECTS_LIST = 'student-subjects-list';
export const STUDENT_PROFILE = 'student-profile';
export const STUDENT_SUBJECT_INFO = (subjectId: string) => `student-subject-info-${subjectId}`;