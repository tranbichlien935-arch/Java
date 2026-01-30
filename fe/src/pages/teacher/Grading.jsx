import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSave } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import { useAuth } from '@context/AuthContext';
import classService from '@services/classService';
import gradeService from '@services/gradeService';
import { toast } from 'react-toastify';

const Grading = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudentsAndGrades();
        }
    }, [selectedClass]);

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

    const fetchStudentsAndGrades = async () => {
        try {
            setLoading(true);
            const studentsData = await classService.getStudentsInClass(selectedClass);
            setStudents(studentsData);

            // Load existing grades
            try {
                const gradesData = await gradeService.getGradesByClass(selectedClass);
                const gradesMap = {};
                gradesData.forEach(grade => {
                    gradesMap[grade.studentId] = {
                        midterm: grade.midtermScore || '',
                        final: grade.finalScore || '',
                        attendance: grade.attendanceScore || '',
                        total: grade.totalScore || '',
                        comments: grade.comment || '',
                    };
                });
                setGrades(gradesMap);
            } catch (error) {
                // No existing grades, initialize empty
                const initialGrades = {};
                studentsData.forEach(student => {
                    initialGrades[student.id] = {
                        midterm: '',
                        final: '',
                        attendance: '',
                        total: '',
                        comments: '',
                    };
                });
                setGrades(initialGrades);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách học viên');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId, field, value) => {
        setGrades(prev => {
            const studentGrades = { ...prev[studentId], [field]: value };

            // Auto-calculate total if midterm, final, or attendance changes
            if (['midterm', 'final', 'attendance'].includes(field)) {
                const midterm = parseFloat(studentGrades.midterm) || 0;
                const final = parseFloat(studentGrades.final) || 0;
                const attendance = parseFloat(studentGrades.attendance) || 0;

                // Formula: Total = (Attendance * 0.2) + (Midterm * 0.3) + (Final * 0.5)
                studentGrades.total = (attendance * 0.2 + midterm * 0.3 + final * 0.5).toFixed(2);
            }

            return {
                ...prev,
                [studentId]: studentGrades
            };
        });
    };

    const handleSave = async () => {
        if (!selectedClass) {
            toast.error('Vui lòng chọn lớp');
            return;
        }

        setSaving(true);
        try {
            // Send each grade individually
            for (const student of students) {
                const gradeData = {
                    enrollmentId: student.enrollmentId,
                    midtermScore: parseFloat(grades[student.id]?.midterm) || null,
                    finalScore: parseFloat(grades[student.id]?.final) || null,
                    attendanceScore: parseFloat(grades[student.id]?.attendance) || null,
                    comment: grades[student.id]?.comments || null,
                };
                await gradeService.saveGrade(gradeData);
            }

            toast.success('Lưu điểm thành công!');
            // Refresh data to ensure sync with server
            fetchStudentsAndGrades();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu điểm thất bại!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Nhập Điểm</h1>
            </div>

            {/* Class Selection */}
            <div className="card mb-6">
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

            {/* Grading Table */}
            {selectedClass && (
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
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                                Giữa kỳ<br /><span className="text-xs font-normal">(30%)</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                                Cuối kỳ<br /><span className="text-xs font-normal">(50%)</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                                Chuyên cần<br /><span className="text-xs font-normal">(20%)</span>
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                                Tổng kết
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Nhận xét</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {student.firstName} {student.lastName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={grades[student.id]?.midterm || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                                                        className="form-input text-center w-20"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={grades[student.id]?.final || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                                                        className="form-input text-center w-20"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={grades[student.id]?.attendance || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'attendance', e.target.value)}
                                                        className="form-input text-center w-20"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-bold text-lg text-primary">
                                                        {grades[student.id]?.total || '0.00'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={grades[student.id]?.comments || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'comments', e.target.value)}
                                                        className="form-input text-sm"
                                                        placeholder="Nhận xét..."
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
                                    className="btn btn-success"
                                >
                                    <FaSave /> {saving ? 'Đang lưu...' : 'Lưu điểm'}
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

export default Grading;
