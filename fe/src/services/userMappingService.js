import api from './api';

/**
 * Service để lấy studentId và teacherId từ userId
 */
const userMappingService = {
    /**
     * Lấy studentId từ userId hiện tại
     * @returns {Promise<number|null>} studentId hoặc null nếu không phải student
     */
    getStudentId: async () => {
        try {
            const response = await api.get('/students/me');
            return response.data.id;
        } catch (error) {
            console.error('Error fetching student ID:', error);
            return null;
        }
    },

    /**
     * Lấy teacherId từ userId hiện tại
     * @returns {Promise<number|null>} teacherId hoặc null nếu không phải teacher
     */
    getTeacherId: async () => {
        try {
            const response = await api.get('/teachers/me');
            return response.data.id;
        } catch (error) {
            console.error('Error fetching teacher ID:', error);
            return null;
        }
    },

    /**
     * Lấy studentId từ userId cụ thể
     * @param {number} userId 
     * @returns {Promise<number|null>}
     */
    getStudentIdByUserId: async (userId) => {
        try {
            const response = await api.get(`/students/user/${userId}`);
            return response.data.id;
        } catch (error) {
            console.error('Error fetching student ID by user ID:', error);
            return null;
        }
    },

    /**
     * Lấy teacherId từ userId cụ thể
     * @param {number} userId 
     * @returns {Promise<number|null>}
     */
    getTeacherIdByUserId: async (userId) => {
        try {
            const response = await api.get(`/teachers/user/${userId}`);
            return response.data.id;
        } catch (error) {
            console.error('Error fetching teacher ID by user ID:', error);
            return null;
        }
    }
};

export default userMappingService;
