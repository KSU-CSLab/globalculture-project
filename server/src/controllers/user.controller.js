/**
 * controllers/user.controller.js
 * 내 프로필 조회/수정, 관리자용 사용자 목록
 */
const User = require('../models/User');

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, department, bio, nationality, studentId } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const updateData = { name, department, bio, nationality, studentId };
    if (avatar) updateData.avatar = avatar;

    // undefined 필드 제거
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: '프로필이 업데이트되었습니다.', data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users  (Admin 전용)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const [users, total] = await Promise.all([
      User.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/role  (Admin 전용)
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    res.json({ success: true, message: '역할이 변경되었습니다.', data: user });
  } catch (err) {
    next(err);
  }
};
