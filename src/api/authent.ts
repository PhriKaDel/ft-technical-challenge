import { LoginResponse, AuthenticationResponse } from '../types/authent';
import api from './api';

export const loginApi = async (login: string, password: string) => {
  const body = { login, password };
  return api.fetchJson<LoginResponse>(
    'https://doc.fluidtopics.com/api/authentication/login',
    'POST',
    JSON.stringify(body)
  );
};

export const getCurrentSessionApi = async () =>
  api.fetchJson<AuthenticationResponse>(
    'https://doc.fluidtopics.com/api/authentication/current-session',
    'GET'
  );
