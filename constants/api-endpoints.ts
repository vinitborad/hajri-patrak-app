//TODO: later put proper prefixes like get or post or update or delete , etc

export const BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT as string;

export const authEndpoints = {
  STUDENT_SIGNIN: `${BASE_URL}/auth/student-signin`,
  FACULTY_SIGNIN: `${BASE_URL}/auth/faculty-signin`,
};

export const profileENdpoints = {
  STUDENT_PROFILE: `${BASE_URL}/profile/student`,
  FACULTY_PROFILE: `${BASE_URL}/profile/faculty`,
};

export const studentEndpoints = {
  STUDENT_SUBJECTS_LIST: `${BASE_URL}/subject/student-subjects`,
  STUDENT_SUBJECT_DETAILS: `${BASE_URL}/subject/student-subject-details`,
  QR_MARK_ATTENDANCE: `${BASE_URL}/code-pairs/mark-attendance`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/student/change-password`,
};

export const facultyEndpoints = {
  GET_SUBJECTS_STRUCTURE: `${BASE_URL}/data/faculty/subjects-structure`,
  GET_PREVIOUS_ATTENDANCES: `${BASE_URL}/attendance/get-previous-attendances`,
  GET_ANALYSE_ATTENDANCE: `${BASE_URL}/attendance/analyse`,
  CREATE_ATTENDANCE: `${BASE_URL}/attendance/create`,
  GET_ATTENDANCE_INFO: `${BASE_URL}/attendance/get-detailed-attendance-info`,
  GET_LIVE_ATTENDANCE_INFO: `${BASE_URL}/attendance/live-info`,
  MANUAL_MARK_ATTENDANCE: `${BASE_URL}/attendance/manual-mark`,
  CLOSE_ATTENDANCE: `${BASE_URL}/attendance/close-live`,
  GET_DIVISION_STUDENTS_LIST: `${BASE_URL}/data/division-students-list`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/faculty/change-password`,
  GET_QR_CODE: `${BASE_URL}/code-pairs/create`,
}

export const adminEndpoints = {
  SIGN_IN: `${BASE_URL}/admin/auth/signin`,

  // atom student endpoints
  GET_ATOM_STUDENT_PROFILE: `${BASE_URL}/admin/student/get-profile`,
  UPDATE_ATOM_STUDENT_PROFILE: `${BASE_URL}/admin/student/update-profile`,
}

export const generalEndpoints = {
  GET_SYNC_TIME: `${BASE_URL}/time`,
}