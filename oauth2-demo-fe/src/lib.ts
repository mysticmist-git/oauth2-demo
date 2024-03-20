import axios from 'axios';
import { ENDPOINTS } from './constants';

export async function requestOAuth() {
  const {
    data: { url },
  } = await axios.get(ENDPOINTS.OAUTH.REQUEST);
  return url;
}

export async function checkSignIn() {
  const res = await axios.get(ENDPOINTS.OAUTH.CHECK, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.status === 200 && res.data.signin;
}
