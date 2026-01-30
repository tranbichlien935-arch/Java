import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSearch } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import Modal from '@components/common/Modal';
import classService from '@services/classService';
import courseService from '@services/courseService';
import api from '@services/api';
import { toast } from 'react-toastify';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        courseId: '',
        teacherId: '',
        maxStudents: 30,
        room: '',
        schedule: '',
        startDate: '',
        endDate: '',
        status: 'OPEN',
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterClasses();
    }, [searchTerm, classes]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesData, coursesData, teachersData] = await Promise.all([
                classService.getAllClasses(),
                courseService.getAllCourses(),
                api.get('/teachers'), // Get teachers, not users
            ]);
            setClasses(classesData);
            setFilteredClasses(classesData);
            setCourses(coursesData);
            setTeachers(teachersData.data);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const filterClasses = () => {
        if (!searchTerm.trim()) {
            setFilteredClasses(classes);
            return;
        }
        const filtered = classes.filter(classItem =>
            classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredClasses(filtered);
    };

    const handleOpenModal = (classItem = null) => {
        if (classItem) {
            setEditingClass(classItem);
            setFormData(classItem);
        } else {
            setEditingClass(null);
            setFormData({
                code: '',
                name: '',
                courseId: '',
                teacherId: '',
                maxStudents: 30,
                room: '',
                schedule: '',
                startDate: '',
                endDate: '',
                status: 'OPEN',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClass(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                await classService.updateClass(editingClass.id, formData);
                toast.success('Cập nhật lớp học thành công!');
            } else {
                await classService.createClass(formData);
                toast.success('Thêm lớp học thành công!');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
            try {
                await classService.deleteClass(id);
                toast.success('Xóa lớp học thành công!');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Xóa thất bại!');
            }
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Quản Lý Lớp Học</h1>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">
                    <FaPlus /> Thêm Lớp Học
                </button>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên lớp hoặc khóa học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Tên Lớp</th>
                            <th>Khóa Học</th>
                            <th>Giáo Viên</th>
                            <th>Sỉ Số</th>
                            <th>Lịch Học</th>
                            <th>Trạng Thái</th>
                            <th className="text-center">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.length > 0 ? (
                            filteredClasses.map(classItem => (
                                <tr key={classItem.id}>
                                    <td className="font-medium">{classItem.name}</td>
                                    <td>{classItem.courseName}</td>
                                    <td>{classItem.teacherName}</td>
                                    <td>
                                        <span className="font-mono text-sm">
                                            {classItem.currentStudents || 0}/{classItem.maxStudents}
                                        </span>
                                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                            <div
                                                className="bg-primary h-1 rounded-full"
                                                style={{ width: `${((classItem.currentStudents || 0) / classItem.maxStudents) * 100}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="text-sm">{classItem.schedule}</td>
                                    <td>
                                        <span className={`badge ${classItem.status === 'OPEN' ? 'badge-success' :
                                                classItem.status === 'IN_PROGRESS' ? 'badge-primary' :
                                                    classItem.status === 'COMPLETED' ? 'badge-secondary' :
                                                        'badge-danger'
                                            }`}>
                                            {classItem.status === 'OPEN' ? 'Đang mở' :
                                                classItem.status === 'IN_PROGRESS' ? 'Đang học' :
                                                    classItem.status === 'COMPLETED' ? 'Đã kết thúc' :
                                                        classItem.status === 'CANCELLED' ? 'Đã hủy' : classItem.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(classItem)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(classItem.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                    Không tìm thấy lớp học nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingClass ? 'Chỉnh Sửa Lớp Học' : 'Thêm Lớp Học Mới'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Mã lớp <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="VD: JAVA-CB01"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Tên lớp <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="VD: Lớp Java Cơ Bản 01"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Khóa học <span className="text-danger">*</span></label>
                            <select
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                className="form-input"
                                required
                            >
                                <option value="">-- Chọn khóa học --</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Giáo viên</label>
                            <select
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="">-- Chọn giáo viên (tùy chọn) --</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Sỉ số tối đa <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                name="maxStudents"
                                value={formData.maxStudents}
                                onChange={handleChange}
                                className="form-input"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Phòng học</label>
                            <input
                                type="text"
                                name="room"
                                value={formData.room}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="VD: P101, A201"
                            />
                        </div>
                        <div>
                            <label className="form-label">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="OPEN">Đang mở</option>
                                <option value="IN_PROGRESS">Đang học</option>
                                <option value="COMPLETED">Đã kết thúc</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Lịch học</label>
                        <input
                            type="text"
                            name="schedule"
                            value={formData.schedule}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="VD: Thứ 2, 4, 6 - 18:00-20:00"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Ngày bắt đầu</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Ngày kết thúc</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingClass ? 'Cập Nhật' : 'Thêm Mới'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Classes;
