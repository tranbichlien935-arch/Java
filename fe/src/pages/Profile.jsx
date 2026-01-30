import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import userService from '@services/userService';
import Layout from '@components/layout/Layout';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await userService.updateProfile(formData);
            updateUser(updated);
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);
        try {
            await userService.changePassword(passwordData.oldPassword, passwordData.newPassword);
            toast.success('Đổi mật khẩu thành công!');
            setIsChangingPassword(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="page-header">
                    <h1 className="page-title">Thông Tin Cá Nhân</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Avatar Section */}
                    <div className="card text-center">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                {user?.fullName?.split(' ').slice(0, 2).map(word => word[0]).join('')}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                                <FaCamera className="text-primary" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold mt-4">{user?.fullName}</h3>
                        <p className="text-gray-600 text-sm">@{user?.username}</p>
                        <div className="mt-4">
                            <span className="badge badge-primary">{user?.role?.replace('ROLE_', '')}</span>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="card md:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Thông tin chi tiết</h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-primary"
                                >
                                    <FaEdit /> Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="form-label">Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
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
                                <div className="flex gap-3">
                                    <button type="submit" disabled={loading} className="btn btn-success">
                                        <FaSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-secondary"
                                    >
                                        <FaTimes /> Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                    <FaUser className="text-primary text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-600">Tên đăng nhập</p>
                                        <p className="font-medium">{user?.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                    <FaEnvelope className="text-primary text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{user?.email || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                    <FaPhone className="text-primary text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-600">Số điện thoại</p>
                                        <p className="font-medium">{user?.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="card mt-6">
                    <h2 className="text-2xl font-bold mb-4">Đổi mật khẩu</h2>

                    {!isChangingPassword ? (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="btn btn-warning"
                        >
                            <FaLock /> Thay đổi mật khẩu
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="form-label">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="form-label">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    <FaSave /> {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(false)}
                                    className="btn btn-secondary"
                                >
                                    <FaTimes /> Hủy
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
