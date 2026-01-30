import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaClipboardList, FaTrophy, FaCalendar } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import dashboardService from '@services/dashboardService';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Get teacherId from userId (similar to CourseDetail fix)
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/teachers/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch teacher info');
            }

            const teacherData = await response.json();
            const teacherId = teacherData.id;

            // Now fetch stats with teacherId
            const data = await dashboardService.getTeacherStats(teacherId);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Dashboard Giáo Viên</h1>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card border-l-primary">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Lớp đang dạy</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.totalClasses || 0}
                            </h3>
                        </div>
                        <div className="bg-primary-light rounded-full p-3">
                            <FaBook className="text-2xl text-primary-dark" />
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-success">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Tổng học viên</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.totalStudents || 0}
                            </h3>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <FaClipboardList className="text-2xl text-green-700" />
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-warning">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Buổi học tuần này</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.sessionsThisWeek || 0}
                            </h3>
                        </div>
                        <div className="bg-yellow-100 rounded-full p-3">
                            <FaCalendar className="text-2xl text-yellow-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">Lịch hôm nay</h2>
                <div className="space-y-3">
                    {stats?.todaySchedule?.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-md border-l-4 border-primary">
                            <div>
                                <p className="font-medium text-lg">{session.className}</p>
                                <p className="text-sm text-gray-600">{session.courseName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-primary">{session.time}</p>
                                <p className="text-xs text-gray-500">{session.room}</p>
                            </div>
                        </div>
                    )) || <p className="text-gray-500 text-center py-4">Không có lịch dạy hôm nay</p>}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
                <Link to="/teacher/classes" className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-light rounded-full p-4">
                            <FaBook className="text-2xl text-primary-dark" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Lớp Học</h3>
                            <p className="text-gray-600 text-sm">Xem các lớp đang dạy</p>
                        </div>
                    </div>
                </Link>

                <Link to="/teacher/attendance" className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 rounded-full p-4">
                            <FaClipboardList className="text-2xl text-green-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Điểm Danh</h3>
                            <p className="text-gray-600 text-sm">Điểm danh học viên</p>
                        </div>
                    </div>
                </Link>

                <Link to="/teacher/grading" className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 rounded-full p-4">
                            <FaTrophy className="text-2xl text-yellow-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Nhập Điểm</h3>
                            <p className="text-gray-600 text-sm">Nhập điểm học viên</p>
                        </div>
                    </div>
                </Link>
            </div>
        </Layout>
    );
};

export default TeacherDashboard;
