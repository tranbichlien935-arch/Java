import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaTrophy } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import classService from '@services/classService';
import { toast } from 'react-toastify';

const TeacherClasses = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            // Sử dụng teacherId thay vì user.id
            const teacherId = user.teacherId || user.id;
            console.log('Fetching classes for teacherId:', teacherId); // DEBUG
            const data = await classService.getClassesByTeacher(teacherId);
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error); // DEBUG
            toast.error('Không thể tải danh sách lớp học');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Lớp Học Của Tôi</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.length > 0 ? (
                    classes.map(classItem => (
                        <div key={classItem.id} className="card">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{classItem.courseName}</p>
                                </div>
                                <span className={`badge ${classItem.status === 'OPEN' ? 'badge-success' :
                                        classItem.status === 'IN_PROGRESS' ? 'badge-primary' :
                                            classItem.status === 'COMPLETED' ? 'badge-secondary' :
                                                'badge-danger'
                                    }`}>
                                    {classItem.status === 'OPEN' ? 'Đang mở' :
                                        classItem.status === 'IN_PROGRESS' ? 'Đang học' :
                                            classItem.status === 'COMPLETED' ? 'Hoàn thành' :
                                                'Đã hủy'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaUsers />
                                    <span>{classItem.currentStudents || 0} / {classItem.maxStudents} học viên</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${((classItem.currentStudents || 0) / classItem.maxStudents) * 100}%` }}
                                    ></div>
                                </div>
                                {classItem.schedule && (
                                    <p className="text-sm text-gray-600 mt-2">📅 {classItem.schedule}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/teacher/attendance?classId=${classItem.id}`}
                                    className="btn btn-primary btn-sm flex-1"
                                >
                                    <FaClipboardList /> Điểm danh
                                </Link>
                                <Link
                                    to={`/teacher/grading?classId=${classItem.id}`}
                                    className="btn btn-success btn-sm flex-1"
                                >
                                    <FaTrophy /> Nhập điểm
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">Bạn chưa được gán lớp nào</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TeacherClasses;
