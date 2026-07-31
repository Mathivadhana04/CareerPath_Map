import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchChoices = (role) =>
  api.get('/choices', { params: { role } }).then((r) => r.data);

export const fetchRoadmap = (role, choice) =>
  api.post('/roadmap', { role, choice }).then((r) => r.data);

export const fetchSyllabus = (role, choice, skill) =>
  api.post('/syllabus', { role, choice, skill }).then((r) => r.data);

export const checkHealth = () =>
  api.get('/health').then((r) => r.data);

export default api;
