
export const BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT;

export const authEndpoints = {
  STUDENT_SIGNIN: `${BASE_URL}/auth/student-signin`,
  FACULTY_SIGNIN: `${BASE_URL}/auth/faculty-signin`,
};

export const profileENdpoints = {
  STUDENT_PROFILE: `${BASE_URL}/profile/student`,
};