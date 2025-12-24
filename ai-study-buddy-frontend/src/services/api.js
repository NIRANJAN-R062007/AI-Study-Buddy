import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-ID': 'user-123'
  }
});

export const studyBuddyAPI = {
  async getUserProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateUserProfile(profileData) {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  async getStudySessions() {
    const response = await api.get('/sessions');
    return response.data;
  },

  async createStudySession(sessionData) {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  async endStudySession(sessionId, confidenceLevel) {
    const response = await api.put(`/sessions/${sessionId}/end`, { confidenceLevel });
    return response.data;
  },

  async addSessionQuestion(sessionId) {
    const response = await api.post(`/sessions/${sessionId}/question`);
    return response.data;
  },

  async generateQuiz(topic, difficulty, numQuestions = 5) {
    const response = await api.get('/quiz/generate', {
      params: { topic, difficulty, numQuestions }
    });
    return response.data;
  },

  async submitQuizAnswers(questions, answers) {
    const response = await api.post('/quiz/submit', { questions, answers });
    return response.data;
  },

  async getMotivationalMessage() {
    const response = await api.get('/motivation');
    return response.data;
  },

  async askQuestion(question) {
    const response = await api.post('/ask-question', { question });
    return response.data;
  },

  async generateFlashcards(topic, count = 5) {
    const response = await api.post('/generate-flashcards', { topic, count });
    return response.data;
  },

  async createStudyPlan(planData) {
    const response = await api.post('/study-plans', planData);
    return response.data;
  },

  async getStudyPlans() {
    const response = await api.get('/study-plans');
    return response.data;
  },

  async deleteStudyPlan(planId) {
    const response = await api.delete(`/study-plans/${planId}`);
    return response.data;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.error || 'Network error occurred');
  }
);