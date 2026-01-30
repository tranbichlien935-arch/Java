import { useEffect, useState } from 'react';
import { FaTrophy, FaClipboardList, FaBook } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import gradeService from '@services/gradeService';
import attendanceService from '@services/attendanceService';
import { toast } from 'react-toastify';

const Grades = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            // Sử dụng studentId thay vì user.id
            const studentId = user.studentId || user.id;
            const data = await gradeService.getGradesByStudent(studentId);
            setGrades(data);
        } catch (error) {
            toast.error('Không thể tải kết quả học tập');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        if (grade >= 8) return 'text-success';
        if (grade >= 6.5) return 'text-primary';
        if (grade >= 5) return 'text-warning';
        return 'text-danger';
    };

    const getGradeLabel = (grade) => {
        if (grade >= 8) return 'Giỏi';
        if (grade >= 6.5) return 'Khá';
        if (grade >= 5) return 'Trung bình';
        return 'Yếu';
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Kết Quả Học Tập</h1>
            </div>

            {grades.length > 0 ? (
                <div className="space-y-6">
                    {grades.map(record => (
                        <div key={record.id} className="card">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{record.className}</h3>
                                    <p className="text-gray-600">{record.courseName}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-3xl font-bold ${getGradeColor(record.total)}`}>
                                        {record.total?.toFixed(2) || 'N/A'}
                                    </p>
                                    <p className={`text-sm font-medium ${getGradeColor(record.total)}`}>
                                        {getGradeLabel(record.total)}
                                    </p>
                                </div>
                            </div>

                            {/* Grade Details */}
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaBook className="text-primary" />
                                        <span className="text-sm text-gray-600">Điểm giữa kỳ (30%)</span>
                                    </div>
                                    <p className="text-2xl font-bold text-primary">
                                        {record.midterm?.toFixed(1) || 'N/A'}
                                    </p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaTrophy className="text-success" />
                                        <span className="text-sm text-gray-600">Điểm cuối kỳ (50%)</span>
                                    </div>
                                    <p className="text-2xl font-bold text-success">
                                        {record.final?.toFixed(1) || 'N/A'}
                                    </p>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaClipboardList className="text-warning" />
                                        <span className="text-sm text-gray-600">Chuyên cần (20%)</span>
                                    </div>
                                    <p className="text-2xl font-bold text-warning">
                                        {record.attendance?.toFixed(1) || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Teacher Comments */}
                            {record.comments && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Nhận xét từ giáo viên:</p>
                                    <p className="text-gray-800 italic">"{record.comments}"</p>
                                </div>
                            )}

                            {/* Attendance Summary */}
                            {record.attendanceSummary && (
                                <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t">
                                    <div>
                                        <span className="font-medium">Tổng buổi học:</span> {record.attendanceSummary.total || 0}
                                    </div>
                                    <div>
                                        <span className="font-medium text-success">Có mặt:</span> {record.attendanceSummary.present || 0}
                                    </div>
                                    <div>
                                        <span className="font-medium text-danger">Vắng:</span> {record.attendanceSummary.absent || 0}
                                    </div>
                                    <div>
                                        <span className="font-medium text-warning">Có phép:</span> {record.attendanceSummary.excused || 0}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Chưa có kết quả học tập</p>
                    <a href="/student/courses" className="text-primary hover:underline">
                        Đăng ký khóa học →
                    </a>
                </div>
            )}
        </Layout>
    );
};

export default Grades;
