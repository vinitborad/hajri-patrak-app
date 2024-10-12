
// offline atttendance
export const QUEUED_ATTENDANCES = 'queued-attendances';
export const archivedAttendancesKey = (subjectId: string) => `archived-attendances-${subjectId}`;

// faculty 
// data
export const ACTIVE_SUBJECTS_STRUCTURE = 'acitve-subjects-structure';
export const ACTIVE_SUBJECTS_STRUCTURE_KEY = 'active-subjects-structure-contentkey';
// attendance
export const LIVE_ATTENDANCE = (subjectId: string) => `live-attendance-${subjectId}`;
export const DIVISION_STUDENTS_LIST = (divisionId: string) => `division-students-list-data-${divisionId}`;
export const DIVISION_STUDENTS_LIST_KEY = (divisionId: string) => `division-students-list-contentkey-${divisionId}`;
export const PREV_ATTENDANCES = (subjectId: string) => `previous-attendances-${subjectId}`;
// pinnig keys
export const PINNED_COLLEGES = 'pinned-colleges';
export const PINNED_DEPARTMENTS = (college: string) => `pinned-departments-${college}`;
export const PINNED_BRANCHES = (college: string, department: string) => `pinned-branches-${college}-${department}`;
export const PINNED_DIVISIONS = (college: string, department: string, branch: string) => `pinned-divisions-${college}-${department}-${branch}`;
export const PINNED_SEM_DIV = 'pinned-sem-div';

export const ANALYSIS = (subjectId: string) => `attendance-analysis-${subjectId}`;
export const ATTENDANCE_INFO = (attendanceId: string) => `attendance-info-${attendanceId}`;
export const FACULTY_PROFILE = 'faculty-profile';

// student 
export const STUDENT_SUBJECTS_LIST = 'student-subjects-list';
export const STUDENT_SUBJECT_INFO = (subjectId: string) => `student-subject-info-${subjectId}`;
export const STUDENT_ACTIVE_SUBJECTS = 'student-active-subjects';
export const STUDENT_ACTIVE_SUBJECTS_KEY = 'student-active-subjects-contentkey';
// student profile
export const STUDENT_PROFILE = 'student-profile';