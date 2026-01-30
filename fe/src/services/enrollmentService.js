import api from './api';

const ENROLLMENT_ENDPOINT = '/enrollments';

export const enrollmentService = {
    // Get all enrollments
    getAllEnrollments: async () => {
        const response = await api.get(ENROLLMENT_ENDPOINT);
        return response.data;
    },

    // Get enrollment by ID
    getEnrollmentById: async (id) => {
        const response = await api.get(`${ENROLLMENT_ENDPOINT}/${id}`);
        return response.data;
    },

    // Enroll student in class
    createEnrollment: async (enrollmentData) => {
        const response = await api.post(ENROLLMENT_ENDPOINT, enrollmentData);
        return response.data;
    },

    // Update enrollment
    updateEnrollment: async (id, enrollmentData) => {
        const response = await api.put(`${ENROLLMENT_ENDPOINT}/${id}`, enrollmentData);
        return response.data;
    },

    // Cancel enrollment
    deleteEnrollment: async (id) => {
        const response = await api.delete(`${ENROLLMENT_ENDPOINT}/${id}`);
        return response.data;
    },

    // Update enrollment status
    updateEnrollmentStatus: async (id, status) => {
        const response = await api.patch(`${ENROLLMENT_ENDPOINT}/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    },

    // Get enrollments by student
    getEnrollmentsByStudent: async (studentId) => {
        const response = await api.get(`${ENROLLMENT_ENDPOINT}/student/${studentId}`);
        return response.data;
    },

    // Get enrollments by class
    getEnrollmentsByClass: async (classId) => {
        const response = await api.get(`${ENROLLMENT_ENDPOINT}/class/${classId}`);
        return response.data;
    },

    // Check if student enrolled in class
    isEnrolled: async (studentId, classId) => {
        const response = await api.get(`${ENROLLMENT_ENDPOINT}/check`, {
            params: { studentId, classId },
        });
        return response.data;
    },

    // Get student's schedule
    getStudentSchedule: async (studentId) => {
        const response = await api.get(`${ENROLLMENT_ENDPOINT}/student/${studentId}`);
        return response.data;
    },
};

export default enrollmentService;
