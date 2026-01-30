import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaToggleOn, FaToggleOff, FaKey } from 'react-icons/fa';
import Layout from '@components/layout/Layout';
import Loading from '@components/common/Loading';
import Modal from '@components/common/Modal';
import userService from '@services/userService';
import { toast } from 'react-toastify';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roles: ['ROLE_STUDENT'],
        isActive: true,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, roleFilter, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(user =>
                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by role
        if (roleFilter !== 'All') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ ...user, password: '' }); // Don't show password
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
                phone: '',
                roles: ['ROLE_STUDENT'],
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await userService.updateUser(editingUser.id, updateData);
                toast.success('Cập nhật người dùng thành công!');
            } else {
                await userService.createUser(formData);
                toast.success('Thêm người dùng thành công!');
            }
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await userService.deleteUser(id);
                toast.success('Xóa người dùng thành công!');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Xóa thất bại!');
            }
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            if (user.isActive) {
                await userService.deactivateUser(user.id);
                toast.success('Đã vô hiệu hóa tài khoản!');
            } else {
                await userService.activateUser(user.id);
                toast.success('Đã kích hoạt tài khoản!');
            }
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại!');
        }
    };

    const handleResetPassword = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho người dùng này?')) {
            try {
                const result = await userService.resetPassword(id);
                toast.success(`Reset mật khẩu thành công! Mật khẩu mới: ${result.newPassword || 'Đã gửi qua email'}`);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Reset mật khẩu thất bại!');
            }
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Quản Lý Người Dùng</h1>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">
                    <FaPlus /> Thêm Người Dùng
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input pl-10"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="form-input"
                    >
                        <option value="All">Tất cả vai trò</option>
                        <option value="ROLE_ADMIN">Admin</option>
                        <option value="ROLE_TEACHER">Giáo viên</option>
                        <option value="ROLE_STUDENT">Học viên</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Họ Tên</th>
                            <th>Email</th>
                            <th>Vai Trò</th>
                            <th>Trạng Thái</th>
                            <th className="text-center">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="font-mono text-sm font-medium">{user.username}</td>
                                    <td>{user.fullName}</td>
                                    <td className="text-sm">{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.roles?.[0] === 'ROLE_ADMIN' ? 'badge-danger' :
                                            user.roles?.[0] === 'ROLE_TEACHER' ? 'badge-warning' :
                                                'badge-info'
                                            }`}>
                                            {user.roles?.[0]?.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {user.isActive ? 'Hoạt động' : 'Ngưng'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="btn btn-sm btn-primary"
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                                                title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            >
                                                {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                className="btn btn-sm btn-secondary"
                                                title="Reset mật khẩu"
                                            >
                                                <FaKey />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
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
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    Không tìm thấy người dùng nào
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
                title={editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Username <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                                required
                                disabled={!!editingUser}
                            />
                        </div>
                        <div>
                            <label className="form-label">
                                Mật khẩu {!editingUser && <span className="text-danger">*</span>}
                                {editingUser && <span className="text-sm text-gray-500">(để trống nếu không đổi)</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                required={!editingUser}
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Họ tên đầy đủ <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Vai trò <span className="text-danger">*</span></label>
                            <select
                                name="roles"
                                value={formData.roles?.[0] || 'ROLE_STUDENT'}
                                onChange={(e) => setFormData(prev => ({ ...prev, roles: [e.target.value] }))}
                                className="form-input"
                                required
                                disabled={!!editingUser}
                            >
                                <option value="ROLE_STUDENT">Học viên</option>
                                <option value="ROLE_TEACHER">Giáo viên</option>
                                <option value="ROLE_ADMIN">Admin</option>
                            </select>
                            {editingUser && (
                                <p className="text-sm text-warning mt-1">
                                    ⚠️ Không thể thay đổi vai trò sau khi tạo tài khoản
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Trạng thái</label>
                            <select
                                name="isActive"
                                value={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                className="form-input"
                            >
                                <option value="true">Hoạt động</option>
                                <option value="false">Ngưng hoạt động</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingUser ? 'Cập Nhật' : 'Thêm Mới'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Users;
