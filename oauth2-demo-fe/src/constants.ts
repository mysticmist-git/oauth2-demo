// server
export const SERVER_ORIGIN = 'http://127.0.0.1:3000';
export const API_ROUTES = {
  OAUTH: '/oauth',
  MAILS: '/mails',
  USER: '/user',
} as const;

export const ENDPOINTS = {
  OAUTH: {
    AUTH: `${SERVER_ORIGIN}${API_ROUTES.OAUTH}`,
    REQUEST: `${SERVER_ORIGIN}${API_ROUTES.OAUTH}/request`,
    CHECK: `${SERVER_ORIGIN}${API_ROUTES.OAUTH}/check`,
    SIGN_OUT: `${SERVER_ORIGIN}${API_ROUTES.OAUTH}/signout`,
  },
  USER: {
    GET: `${SERVER_ORIGIN}${API_ROUTES.USER}`,
    UPDATE_INTRO: `${SERVER_ORIGIN}${API_ROUTES.USER}/update-intro`,
  },
  MAILS: `${SERVER_ORIGIN}${API_ROUTES.MAILS}`,
} as const;

// front-end
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signin',
} as const;
