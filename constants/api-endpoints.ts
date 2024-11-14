//TODO: later put proper prefixes like get or post or update or delete , etc

export const BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT as string;

export const authEndpoints = {
  STUDENT_SIGNIN: `${BASE_URL}/auth/student-signin`,
  FACULTY_SIGNIN: `${BASE_URL}/auth/faculty-signin`,
};

export const studentEndpoints = {
  // DATA ENDPOINTS
  // active subjects endpoints
  STUDENT_ACTIVE_SUBJECTS: `${BASE_URL}/student/data/get-active-subjects`,
  STUDENT_SUBJECT_INFO: `${BASE_URL}/student/data/subject-info`,
  STUDENT_SUBJECTS_LIST: `${BASE_URL}/subject/student-subjects`,
  // previous divisions endpoints
  STUDENT_PREVIOUS_DIVISIONS: `${BASE_URL}/student/data/previous-divisions`,
  STUDENT_PREVIOUS_DIVISION_SUBJECTS: `${BASE_URL}/student/data/division-subjects`,

  // attendance endpoints
  QR_MARK_ATTENDANCE: `${BASE_URL}/code-pairs/mark-attendance`,

  // profile endpoints
  GET_PROFILE: `${BASE_URL}/student/data/profile`,
  UPDATE_PHOTO: `${BASE_URL}/student/profile/photo`,
  CHANGE_PASSWORD: `${BASE_URL}/student/auth/change-password`,
};

export const facultyEndpoints = {
  // data endpoints
  // structure enpoints
  GET_ACTIVE_SUBJECTS_STRUCTURE: `${BASE_URL}/faculty/data/active-structure`,
  GET_PREVIOUS_DIVISIONS_STRUCTURE: `${BASE_URL}/faculty/data/previous-structure`,

  // attendance endpoints
  GET_PREVIOUS_ATTENDANCES: `${BASE_URL}/faculty/attendance/previous-attendances`,
  GET_ATTENDANCE_INFO: `${BASE_URL}/faculty/attendance/detailed-info`,
  // attendance handling endpoints
  CREATE_ATTENDANCE: `${BASE_URL}/faculty/attendance/create`,
  GET_LIVE_ATTENDANCE_INFO: `${BASE_URL}/faculty/attendance/live-info`,
  MANUAL_MARK_ATTENDANCE: `${BASE_URL}/faculty/attendance/manual-mark`,
  CLOSE_ATTENDANCE: `${BASE_URL}/faculty/attendance/close-live`,
  // qr code endpoints
  GET_QR_CODE: `${BASE_URL}/code-pairs/create`,
  // edit attendance endpoints
  CHANGE_STUDENT_STATUS: `${BASE_URL}/faculty/attendance/student/change-status`,
  DELETE_ATTENDANCE: `${BASE_URL}/faculty/attendance`,

  // profile endpoints
  GET_PROFILE: `${BASE_URL}/faculty/data/profile`,
  UPDATE_PHOTO: `${BASE_URL}/faculty/profile/photo`,
  CHANGE_PASSWORD: `${BASE_URL}/faculty/auth/change-password`,
}

export const adminEndpoints = {
  SIGN_IN: `${BASE_URL}/admin/auth/signin`,

  // DATA ENDPOINTS
  // subjects & divsions structure endpoints
  GET_STRUCTURE: `${BASE_URL}/admin/data/get-structure`,
  // data updation endpoints
  RENAME_SUBJECT: `${BASE_URL}/admin/data/update/subject/rename`,
  GET_DIVISION_ACTIVE_STATUS: `${BASE_URL}/admin/data/division/active-status`,
  MARK_DIVISION_ACTIVE: `${BASE_URL}/admin/data/update/division/activate`,
  MARK_DIVISION_INACTIVE: `${BASE_URL}/admin/data/update/division/inactivate`,
  // subject screen endpoints
  GET_ACCESSED_FACULTIES_LIST: `${BASE_URL}/admin/data/subject/faculty-access-list`,
  GET_SUBJECT_PREVIOUS_ATTENDANCES: `${BASE_URL}/admin/data/subject/previous-attendances`,
  GET_PREVIOUS_ATTENDANCE_STUDENTS_LIST: `${BASE_URL}/admin/data/subject/previous-attendance/student-list`,
  // inter-division endpoints
  GET_DIVISION_STUDENTS_LIST: `${BASE_URL}/admin/data/division/get-students-list`,

  // STUDENTS STRUCTURE DATA ENDPOINTS
  GET_STUDENTS_DATA_STRUCTURE: `${BASE_URL}/admin/data/student-structure`,
  GET_STUDENTS_STRUCTURE_STUDENT_LIST: `${BASE_URL}/admin/data/student-structure/students-list`,

  // atom student endpoints
  STUDENT_SIGNIN: `${BASE_URL}/admin/student/signin`,
  GET_ATOM_STUDENT_PROFILE: `${BASE_URL}/admin/student/get-profile`,
  UPDATE_ATOM_STUDENT_PROFILE: `${BASE_URL}/admin/student/update-profile`,
  GET_ATOM_STUDENT_DIVISIONS_LIST: `${BASE_URL}/admin/student/divisions-list`,
  REMOVE_STUDENT_FROM_DIVISION: `${BASE_URL}/admin/student/remove-division`,
  ADD_STUDENT_TO_DIVISION: `${BASE_URL}/admin/student/add-division`,

  // atom faculty endpoints
  GET_ATOM_FACULTY_PROFILE: `${BASE_URL}/admin/faculty/profile`,
  UPDATE_ATOM_FACULTY_PROFILE: `${BASE_URL}/admin/faculty/update-profile`,
  GET_ATOM_FACULTY_SUBJECT_ACCESS_LIST: `${BASE_URL}/admin/faculty/subject-access-list`,
  ADD_SUBJECT_TO_FACULTY_ACCESS_LIST: `${BASE_URL}/admin/faculty/subject-access-list/add-subject`,
  REMOVE_SUBJECT_FROM_FACULTY_ACCESS_LIST: `${BASE_URL}/admin/faculty/subject-access-list/remove-subject`,

  // creation endpoints
  CREATE_FACULTY: `${BASE_URL}/admin/create/faculty`,
  CREATE_DIVISION: `${BASE_URL}/admin/create/division`,
  CREATE_SUBJECT: `${BASE_URL}/admin/create/subject`,
  CREATE_STUDENT: `${BASE_URL}/admin/create/student`,
  // student sheet creation endpoints
  GET_STUDENT_SHEET_DATA: `${BASE_URL}/admin/create/student/sheet-data`,
  CREATE_STUDENTS_FROM_SHEET: `${BASE_URL}/admin/create/students/sheet`,

  // DELETION or REMOVAL endpoints
  DELETE_STUDENT: `${BASE_URL}/admin/delete/student`,
  DELETE_FACULTY: `${BASE_URL}/admin/delete/faculty`,
  DELETE_SUBJECT: `${BASE_URL}/admin/delete/subject`,
  DELTE_INTER_DIVISION: `${BASE_URL}/admin/delete/inter-division`,

  // OWN's ENDPOINTS
  GET_PROFILE: `${BASE_URL}/admin/owns/profile`,
  UPDATE_PHOTO: `${BASE_URL}/admin/owns/profile/photo`,
  CHANGE_PASSWORD: `${BASE_URL}/admin/auth/change-password`,

  // MANAGEMENTS ENDPOINTS
  UPGRADE_DIVISIONS: `${BASE_URL}/admin/management/upgrade-divisions`,
}

export const commonEndpoints = {
  // ATTENDANCE ENDPOINTS
  // subject info endpoints
  GET_ANALYSE_ATTENDANCE: `${BASE_URL}/common/data/attendance/analyse`,
  GET_ANALYSE_ATTENDANCE_SHEET_LINK: `${BASE_URL}/common/data/attendance/analyse/sheet-link`,
  GET_DIVISION_STUDENTS_LIST: `${BASE_URL}/common/data/division-students-list`,

  // STUDENT ENDPOINTS
  GET_STUDENT_PROFILE: `${BASE_URL}/common/student/profile`,
  // subject endpoints
  GET_STUDENT_SUBJECT_PREVIOUS_ATTENDANCES: `${BASE_URL}/common/student/subject/previous-attendances`,
}

export const generalEndpoints = {
  GET_SYNC_TIME: `${BASE_URL}/time`,
}