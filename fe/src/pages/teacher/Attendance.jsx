import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSave, FaCheck, FaTimes } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import classService from '@services/classService';
import attendanceService from '@services/attendanceService';
import { toast } from 'react-toastify';

const Attendance = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchStudentsAndAttendance();
        }
    }, [selectedClass, selectedDate]);

    const fetchClasses = async () => {
        try {
            // Load chỉ classes của teacher hiện tại
            const teacherId = user.teacherId || user.id;
            const data = await classService.getClassesByTeacher(teacherId);
            setClasses(data);
        } catch (error) {
            toast.error('Không thể tải danh sách lớp học');
        }
    };

    const fetchStudentsAndAttendance = async () => {
        try {
            setLoading(true);
            const studentsData = await classService.getStudentsInClass(selectedClass);
            setStudents(studentsData);

            // Try to load existing attendance for this date
            try {
                const existingAttendance = await attendanceService.getAttendanceByDate(selectedClass, selectedDate);
                const attendanceMap = {};
                existingAttendance.forEach(record => {
                    attendanceMap[record.studentId] = {
                        status: record.status,
                        notes: record.notes || '',
                    };
                });
                setAttendanceData(attendanceMap);
            } catch (error) {
                // No existing attendance, initialize empty
                const initialData = {};
                studentsData.forEach(student => {
                    initialData[student.id] = { status: 'Present', notes: '' };
                });
                setAttendanceData(initialData);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách học viên');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status },
        }));
    };

    const handleNotesChange = (studentId, notes) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes },
        }));
    };

    const handleSave = async () => {
        if (!selectedClass || !selectedDate) {
            toast.error('Vui lòng chọn lớp và ngày');
            return;
        }

        setSaving(true);
        try {
            const attendanceRecords = students.map(student => ({
                classId: selectedClass,
                studentId: student.id,
                date: selectedDate,
                status: attendanceData[student.id]?.status || 'Present',
                notes: attendanceData[student.id]?.notes || '',
            }));

            await attendanceService.takeAttendance({ records: attendanceRecords });
            toast.success('Lưu điểm danh thành công!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu điểm danh thất bại!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Điểm Danh</h1>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Chọn lớp</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="form-input"
                        >
                            <option value="">-- Chọn lớp --</option>
                            {classes.map(classItem => (
                                <option key={classItem.id} value={classItem.id}>
                                    {classItem.name} - {classItem.courseName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Chọn ngày</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            {selectedClass && selectedDate && (
                <>
                    {loading ? (
                        <Loading />
                    ) : students.length > 0 ? (
                        <div className="card">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">STT</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ Tên</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Có mặt</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Vắng</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Có phép</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {student.firstName} {student.lastName}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${student.id}`}
                                                        checked={attendanceData[student.id]?.status === 'Present'}
                                                        onChange={() => handleStatusChange(student.id, 'Present')}
                                                        className="w-5 h-5 text-success cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${student.id}`}
                                                        checked={attendanceData[student.id]?.status === 'Absent'}
                                                        onChange={() => handleStatusChange(student.id, 'Absent')}
                                                        className="w-5 h-5 text-danger cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${student.id}`}
                                                        checked={attendanceData[student.id]?.status === 'Excused'}
                                                        onChange={() => handleStatusChange(student.id, 'Excused')}
                                                        className="w-5 h-5 text-warning cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={attendanceData[student.id]?.notes || ''}
                                                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                        className="form-input text-sm"
                                                        placeholder="Ghi chú..."
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary"
                                >
                                    <FaSave /> {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">Lớp chưa có học viên</p>
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
};

export default Attendance;
