import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBook, FaClock, FaDollarSign, FaUsers, FaChalkboardTeacher, FaCalendar } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import courseService from '@services/courseService';
import classService from '@services/classService';
import enrollmentService from '@services/enrollmentService';
import { toast } from 'react-toastify';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [studentId, setStudentId] = useState(null); // Student ID từ user.studentId

    useEffect(() => {
        fetchCourseAndClasses();
        // Lấy studentId từ user object
        if (user && user.role === 'ROLE_STUDENT') {
            // Sử dụng studentId từ login response
            setStudentId(user.studentId || user.id);
        }
    }, [id, user]);

    const fetchCourseAndClasses = async () => {
        try {
            setLoading(true);
            const [courseData, classesData] = await Promise.all([
                courseService.getCourseById(id),
                classService.getClassesByCourse(id),
            ]);
            setCourse(courseData);
            setClasses(classesData);
        } catch (error) {
            toast.error('Không thể tải thông tin khóa học');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (classId) => {
        console.log('=== DEBUG ENROLLMENT ===');
        console.log('User object:', user);
        console.log('Student ID:', studentId);
        console.log('Class ID:', classId);

        if (!studentId) {
            toast.error('Không thể lấy thông tin học viên. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            setEnrolling(classId);
            const enrollmentData = {
                studentId: studentId,
                classId,
            };
            console.log('Sending enrollment data:', enrollmentData);
            await enrollmentService.createEnrollment(enrollmentData);
            toast.success('Đăng ký thành công!');
            navigate('/student/schedule');
        } catch (error) {
            console.error('Enrollment error:', error.response?.data);
            toast.error(error.response?.data?.message || 'Đăng ký thất bại!');
        } finally {
            setEnrolling(null);
        }
    };

    if (loading) return <Layout><Loading /></Layout>;
    if (!course) return <Layout><div className="text-center py-12">Không tìm thấy khóa học</div></Layout>;

    return (
        <Layout>
            {/* Course Header */}
            <div className="card mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
                        <p className="text-gray-600">{course.description}</p>
                    </div>
                    <span className="badge badge-primary text-lg px-4 py-2">{course.level}</span>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-light rounded-full p-3">
                            <FaDollarSign className="text-xl text-primary-dark" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Học phí</p>
                            <p className="text-lg font-bold text-primary">{course.price?.toLocaleString()} VNĐ</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 rounded-full p-3">
                            <FaClock className="text-xl text-green-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Thời lượng</p>
                            <p className="text-lg font-bold">{course.duration} giờ</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 rounded-full p-3">
                            <FaBook className="text-xl text-yellow-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Mã khóa học</p>
                            <p className="text-lg font-bold font-mono">{course.code}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Classes */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-6">Lớp Đang Mở Đăng Ký</h2>

                <div className="space-y-4">
                    {classes.length > 0 ? (
                        classes.map(classItem => {
                            const isFull = classItem.currentStudents >= classItem.maxStudents;
                            const percentFull = (classItem.currentStudents / classItem.maxStudents) * 100;

                            return (
                                <div key={classItem.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{classItem.name}</h3>
                                            <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <FaChalkboardTeacher className="text-primary" />
                                                    <span>{classItem.teacherName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaCalendar className="text-primary" />
                                                    <span>{classItem.schedule || 'Chưa có lịch'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaUsers className="text-primary" />
                                                    <span>{classItem.currentStudents || 0} / {classItem.maxStudents} học viên</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleEnroll(classItem.id)}
                                            disabled={isFull || enrolling === classItem.id}
                                            className={`btn ${isFull ? 'btn-secondary' : 'btn-primary'} ml-4`}
                                        >
                                            {enrolling === classItem.id ? 'Đang đăng ký...' : isFull ? 'Đã đầy' : 'Đăng ký'}
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${percentFull >= 90 ? 'bg-danger' : percentFull >= 70 ? 'bg-warning' : 'bg-success'}`}
                                            style={{ width: `${percentFull}%` }}
                                        ></div>
                                    </div>
                                    {percentFull >= 90 && (
                                        <p className="text-xs text-danger mt-1">⚠️ Sắp hết chỗ!</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Hiện tại chưa có lớp nào mở đăng ký</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CourseDetail;
