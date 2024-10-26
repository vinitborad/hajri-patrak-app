// offline atttendance
export const QUEUED_ATTENDANCES = 'queued-attendances';
export const archivedAttendancesKey = (subjectId: string) => `archived-attendances-${subjectId}`;


// FACULTY ASYNC STORE KEYS 
// data
export const ACTIVE_SUBJECTS_STRUCTURE = 'acitve-subjects-structure';
export const ACTIVE_SUBJECTS_STRUCTURE_KEY = 'active-subjects-structure-contentkey';
export const PREVIOUS_DIVISIONS_STRUCTURE = 'previous-divisions-structure';
// attendance
export const LIVE_ATTENDANCE = (subjectId: string) => `live-attendance-${subjectId}`;
export const DIVISION_STUDENTS_LIST = (divisionId: string) => `division-students-list-data-${divisionId}`;
export const DIVISION_STUDENTS_LIST_KEY = (divisionId: string) => `division-students-list-contentkey-${divisionId}`;
export const PREV_ATTENDANCES = (subjectId: string) => `previous-attendances-${subjectId}`;
// pinnig keys for active structure
export const PINNED_COLLEGES = 'pinned-colleges';
export const PINNED_DEPARTMENTS = (college: string) => `pinned-departments-${college}`;
export const PINNED_BRANCHES = (college: string, department: string) => `pinned-branches-${college}-${department}`;
export const PINNED_DIVISIONS = (college: string, department: string, branch: string) => `pinned-divisions-${college}-${department}-${branch}`;
export const PINNED_SEM_DIV = 'pinned-sem-div';
// pinning keys for previous sturcutre
export const PINNED_PREV_COLLEGES = 'pinned-prev-colleges';
export const PINNED_PREV_DEPARTMENTS = (college: string) => `pinned-prev-departments-${college}`;
export const PINNED_PREV_BRANCHES = (college: string, department: string) => `pinned-prev-branches-${college}-${department}`;
export const PINNED_PREV_DIVISIONS = (college: string, department: string, branch: string) => `pinned-prev-divisions-${college}-${department}-${branch}`;
export const PINNED_PREV_SEM_DIV = 'pinned-prev-sem-div';
// 
export const ANALYSIS = (subjectId: string) => `attendance-analysis-${subjectId}`;
export const ATTENDANCE_INFO = (attendanceId: string) => `attendance-info-${attendanceId}`;
export const FACULTY_PROFILE = 'faculty-profile';


// STUDENT ASYNC STORE KEYS
// DATA
// active subjects
export const STUDENT_SUBJECT_INFO = (subjectId: string) => `student-subject-info-${subjectId}`;
export const STUDENT_ACTIVE_SUBJECTS = 'student-active-subjects';
export const STUDENT_ACTIVE_SUBJECTS_KEY = 'student-active-subjects-contentkey';
// previous divisions
export const STUDENT_PREVIOUS_DIVISIONS = 'student-previous-divisions';
export const STUDENT_PREVIOUS_DIVISIONS_KEY = 'student-previous-divisions-contentkey';
// student profile
export const STUDENT_PROFILE = 'student-profile';


// ADMIN ASYNC STORE KEYS
// DATA
export const ADMIN_DATA_STRUCTURE = 'admin-data-structure';
export const ADMIN_DATA_STRUCTURE_KEY = 'admin-data-structure-contentkey';
export const ADMIN_DATA_STUDENTS_DATA_STRUCTURE = 'admin-data-students-data-structure';
export const ADMIN_DATA_STUDENTS_DATA_STRUCTURE_KEY = 'admin-data-students-data-structure-contentkey';
// PINNING KEYS
// pinning keys for subject and division structure
export const PINNED_COLLEGES_ADMIN = 'admin-data-pinned-colleges';
export const PINNED_DEPARTMENTS_ADMIN = (college: string) => `admin-data-pinned-departments-${college}`;
export const PINNED_BRANCHES_ADMIN = (college: string, department: string) => `admin-data-pinned-branches-${college}-${department}`;
export const PINNED_GRADUATION_LEVELS_ADMIN = (college: string, department: string, branch: string) => `admin-data-pinned-graduation-levels-${college}-${department}-${branch}`;
export const PINNED_PASSOUT_YEARS_ADMIN = (college: string, department: string, branch: string, graduationLevel: string) => `admin-data-pinned-passout-years-${college}-${department}-${branch}-${graduationLevel}`;
export const PINNED_SEMESTERS_ADMIN = (college: string, department: string, branch: string, graduationLevel: string, passoutYear: string) => `admin-data-pinned-semesters-${college}-${department}-${branch}-${graduationLevel}-${passoutYear}`;
export const PINNED_DIVISIONS_ADMIN = (college: string, department: string, branch: string, graduationLevel: string, passoutYear: string, semester: string) => `admin-data-pinned-divisions-${college}-${department}-${branch}-${graduationLevel}-${passoutYear}-${semester}`;
// pinning keys for students structure
export const PINNED_STUDENTS_STRUCTURE_COLLEGES_ADMIN = 'admin-data-pinned-students-structure-colleges';
export const PINNED_STUDENTS_STRUCTURE_DEPARTMENTS_ADMIN = (college: string) => `admin-data-pinned-students-structure-departments-${college}`;
export const PINNED_STUDENTS_STRUCTURE_BRANCHES_ADMIN = (college: string, department: string) => `admin-data-pinned-students-structure-branches-${college}-${department}`;
export const PINNED_STUDENTS_STRUCTURE_GRADUATION_LEVELS_ADMIN = (college: string, department: string, branch: string) => `admin-data-pinned-students-structure-graduation-levels-${college}-${department}-${branch}`;
export const PINNED_STUDENTS_STRUCTURE_PASSOUT_YEARS_ADMIN = (college: string, department: string, branch: string, graduationLevel: string) => `admin-data-pinned-students-structure-passout-years-${college}-${department}-${branch}-${graduationLevel}`;
// ATOM FACULTY KEYS
export const ATOM_FACULTY_ADD_SUBJECT_FORM_DATA = 'atom-faculty-add-subject-form-data';
// OWN's KEYS
export const ADMIN_PROFILE = 'admin-profile';
// creation keys
export const STUDENTS_SHEET_DATA = 'students-sheet-data';