import { useEffect, useState } from 'react';
import { FaCalendar, FaBook, FaChalkboardTeacher, FaClock } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import enrollmentService from '@services/enrollmentService';
import { toast } from 'react-toastify';

const Schedule = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            // Sử dụng studentId thay vì user.id
            const studentId = user.studentId || user.id;
            const data = await enrollmentService.getStudentSchedule(studentId);
            setSchedule(data);
        } catch (error) {
            toast.error('Không thể tải lịch học');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEnrollment = async (enrollmentId) => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đăng ký?')) {
            try {
                await enrollmentService.deleteEnrollment(enrollmentId);
                toast.success('Đã hủy đăng ký thành công!');
                fetchSchedule();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Hủy đăng ký thất bại!');
            }
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Thời Khóa Biểu</h1>
            </div>

            {schedule.length > 0 ? (
                <div className="space-y-4">
                    {schedule.map(item => (
                        <div key={item.id} className="card">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">{item.className}</h3>
                                        <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                            {item.status === 'Active' ? 'Đang học' : 'Chưa bắt đầu'}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaBook className="text-primary" />
                                            <div>
                                                <p className="text-sm text-gray-500">Khóa học</p>
                                                <p className="font-medium">{item.courseName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaChalkboardTeacher className="text-primary" />
                                            <div>
                                                <p className="text-sm text-gray-500">Giáo viên</p>
                                                <p className="font-medium">{item.teacherName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaClock className="text-primary" />
                                            <div>
                                                <p className="text-sm text-gray-500">Lịch học</p>
                                                <p className="font-medium">{item.schedule || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {item.startDate && item.endDate && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                            <FaCalendar className="text-primary" />
                                            <span>
                                                Từ {new Date(item.startDate).toLocaleDateString('vi-VN')} đến {new Date(item.endDate).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {item.canCancel && (
                                    <button
                                        onClick={() => handleCancelEnrollment(item.enrollmentId)}
                                        className="btn btn-danger btn-sm ml-4"
                                    >
                                        Hủy đăng ký
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Bạn chưa đăng ký lớp nào</p>
                    <a href="/student/courses" className="text-primary hover:underline">
                        Tìm kiếm khóa học →
                    </a>
                </div>
            )}
        </Layout>
    );
};

export default Schedule;
