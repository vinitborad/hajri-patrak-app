//TODO: later put proper prefixes like get or post or update or delete , etc

export const BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT as string;

export const authEndpoints = {
  STUDENT_SIGNIN: `${BASE_URL}/auth/student-signin`,
  FACULTY_SIGNIN: `${BASE_URL}/auth/faculty-signin`,
};

export const profileENdpoints = {
  STUDENT_PROFILE: `${BASE_URL}/profile/student`,
};

export const studentEndpoints = {
  STUDENT_SUBJECTS_LIST: `${BASE_URL}/subject/student-subjects`,
  STUDENT_SUBJECT_DETAILS: `${BASE_URL}/subject/student-subject-details`,
};

export const facultyEndpoints = {
  GET_SUBJECTS_STRUCTURE: `${BASE_URL}/data/faculty/subjects-structure`,
}