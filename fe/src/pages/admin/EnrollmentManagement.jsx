import { useEffect, useState } from 'react';
import { FaSearch, FaTrash, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import enrollmentService from '@services/enrollmentService';
import { toast } from 'react-toastify';

const EnrollmentManagement = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    useEffect(() => {
        filterEnrollments();
    }, [searchTerm, statusFilter, enrollments]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const data = await enrollmentService.getAllEnrollments();
            setEnrollments(data);
            setFilteredEnrollments(data);
        } catch (error) {
            toast.error('Không thể tải danh sách đăng ký');
        } finally {
            setLoading(false);
        }
    };

    const filterEnrollments = () => {
        let filtered = enrollments;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(enrollment =>
                enrollment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'All') {
            filtered = filtered.filter(enrollment => enrollment.status === statusFilter);
        }

        setFilteredEnrollments(filtered);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await enrollmentService.updateEnrollmentStatus(id, newStatus);
            toast.success('Cập nhật trạng thái thành công!');
            fetchEnrollments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
            try {
                await enrollmentService.deleteEnrollment(id);
                toast.success('Xóa đăng ký thành công!');
                fetchEnrollments();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Xóa thất bại!');
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return <span className="badge badge-success"><FaCheckCircle /> Đã xác nhận</span>;
            case 'PENDING':
                return <span className="badge badge-warning"><FaClock /> Chờ xác nhận</span>;
            case 'CANCELLED':
                return <span className="badge badge-danger"><FaTimesCircle /> Đã hủy</span>;
            default:
                return <span className="badge badge-secondary">{status}</span>;
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Quản Lý Đăng Ký Lớp Học</h1>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã học viên, lớp học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-input"
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="card bg-warning-light">
                    <h3 className="text-lg font-semibold mb-2">Chờ xác nhận</h3>
                    <p className="text-3xl font-bold text-warning">
                        {enrollments.filter(e => e.status === 'PENDING').length}
                    </p>
                </div>
                <div className="card bg-success-light">
                    <h3 className="text-lg font-semibold mb-2">Đã xác nhận</h3>
                    <p className="text-3xl font-bold text-success">
                        {enrollments.filter(e => e.status === 'CONFIRMED').length}
                    </p>
                </div>
                <div className="card bg-danger-light">
                    <h3 className="text-lg font-semibold mb-2">Đã hủy</h3>
                    <p className="text-3xl font-bold text-danger">
                        {enrollments.filter(e => e.status === 'CANCELLED').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mã HV</th>
                            <th>Học viên</th>
                            <th>Lớp học</th>
                            <th>Khóa học</th>
                            <th>Ngày đăng ký</th>
                            <th>Trạng thái</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.length > 0 ? (
                            filteredEnrollments.map(enrollment => (
                                <tr key={enrollment.id}>
                                    <td className="font-mono">{enrollment.studentCode}</td>
                                    <td>{enrollment.studentName}</td>
                                    <td>{enrollment.className}</td>
                                    <td>{enrollment.courseName}</td>
                                    <td>{new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN')}</td>
                                    <td>{getStatusBadge(enrollment.status)}</td>
                                    <td>
                                        <div className="flex justify-center gap-2">
                                            {enrollment.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(enrollment.id, 'CONFIRMED')}
                                                    className="btn btn-sm btn-success"
                                                    title="Xác nhận"
                                                >
                                                    <FaCheckCircle />
                                                </button>
                                            )}
                                            {enrollment.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(enrollment.id, 'CANCELLED')}
                                                    className="btn btn-sm btn-warning"
                                                    title="Hủy"
                                                >
                                                    <FaTimesCircle />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(enrollment.id)}
                                                className="btn btn-sm btn-danger"
                                                title="Xóa"
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
                                    Không tìm thấy đăng ký nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default EnrollmentManagement;
