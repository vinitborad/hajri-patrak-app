//TODO: later put proper prefixes like get or post or update or delete , etc

export const BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT as string;

export const authEndpoints = {
  STUDENT_SIGNIN: `${BASE_URL}/auth/student-signin`,
  FACULTY_SIGNIN: `${BASE_URL}/auth/faculty-signin`,
};

export const studentEndpoints = {
  // data endpoints
  STUDENT_ACTIVE_SUBJECTS: `${BASE_URL}/student/data/get-active-subjects`,
  STUDENT_SUBJECT_INFO: `${BASE_URL}/student/data/subject-info`,
  STUDENT_SUBJECTS_LIST: `${BASE_URL}/subject/student-subjects`,
  QR_MARK_ATTENDANCE: `${BASE_URL}/code-pairs/mark-attendance`,
  
  // profile endpoints
  GET_PROFILE: `${BASE_URL}/student/data/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/student/auth/change-password`,
};

export const facultyEndpoints = {
  // data endpoints
  // structure enpoints
  GET_ACTIVE_SUBJECTS_STRUCTURE: `${BASE_URL}/faculty/data/get-active-structure`,
  // subject view page endpoints
  GET_ANALYSE_ATTENDANCE: `${BASE_URL}/faculty/attendance/analyse`,
  GET_DIVISION_STUDENTS_LIST: `${BASE_URL}/data/division-students-list`,

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

  // profile endpoints
  GET_PROFILE: `${BASE_URL}/faculty/data/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/faculty/auth/change-password`,
}

export const adminEndpoints = {
  SIGN_IN: `${BASE_URL}/admin/auth/signin`,

  // atom student endpoints
  GET_ATOM_STUDENT_PROFILE: `${BASE_URL}/admin/student/get-profile`,
  UPDATE_ATOM_STUDENT_PROFILE: `${BASE_URL}/admin/student/update-profile`,

  // atom faculty endpoints
  GET_ATOM_FACULTY_PROFILE: `${BASE_URL}/admin/faculty/get-profile`,
  UPDATE_ATOM_FACULTY_PROFILE: `${BASE_URL}/admin/faculty/update-profile`,

  // creation endpoints
  CREATE_FACULTY: `${BASE_URL}/admin/create/faculty`,
  CREATE_DIVISION: `${BASE_URL}/admin/create/division`,
  CREATE_SUBJECT: `${BASE_URL}/admin/create/subject`,
  CREATE_STUDENT: `${BASE_URL}/admin/create/student`,
  // student sheet creation endpoints
  GET_STUDENT_SHEET_DATA: `${BASE_URL}/admin/create/student/sheet`,
}

export const generalEndpoints = {
  GET_SYNC_TIME: `${BASE_URL}/time`,
}