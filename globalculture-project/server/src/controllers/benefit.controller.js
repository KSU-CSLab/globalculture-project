/**
 * controllers/benefit.controller.js
 * 혜택 목록, 상세, 수령
 */
const Benefit = require('../models/Benefit');
const User = require('../models/User');

// GET /api/benefits
exports.getBenefits = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true, targetRoles: req.user.role };
    if (type) filter.type = type;

    const [benefits, total] = await Promise.all([
      Benefit.find(filter)
        .populate('partner', 'name logo category')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Benefit.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: benefits,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/benefits/:id
exports.getBenefit = async (req, res, next) => {
  try {
    const benefit = await Benefit.findById(req.params.id).populate('partner', 'name logo category address website');
    if (!benefit) return res.status(404).json({ success: false, message: '혜택을 찾을 수 없습니다.' });
    res.json({ success: true, data: benefit });
  } catch (err) {
    next(err);
  }
};

// POST /api/benefits  (Admin)
exports.createBenefit = async (req, res, next) => {
  try {
    const thumbnail = req.file ? `/uploads/images/${req.file.filename}` : undefined;
    const benefit = await Benefit.create({ ...req.body, thumbnail, createdBy: req.user._id });
    res.status(201).json({ success: true, message: '혜택이 등록되었습니다.', data: benefit });
  } catch (err) {
    next(err);
  }
};

// POST /api/benefits/:id/claim
exports.claimBenefit = async (req, res, next) => {
  try {
    const benefit = await Benefit.findById(req.params.id);
    if (!benefit || !benefit.isActive) {
      return res.status(404).json({ success: false, message: '혜택을 찾을 수 없습니다.' });
    }

    // 역할 검증
    if (!benefit.targetRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '이 혜택은 대상 역할이 아닙니다.' });
    }

    // 만료일 검증
    if (benefit.expiresAt && new Date() > benefit.expiresAt) {
      return res.status(400).json({ success: false, message: '만료된 혜택입니다.' });
    }

    // 중복 수령 방지
    const alreadyClaimed = benefit.claimedBy.some((c) => c.user.toString() === req.user._id.toString());
    if (alreadyClaimed) {
      return res.status(409).json({ success: false, message: '이미 수령한 혜택입니다.' });
    }

    // 수량 제한
    if (benefit.maxClaims !== null && benefit.claimedBy.length >= benefit.maxClaims) {
      return res.status(400).json({ success: false, message: '수령 한도가 초과되었습니다.' });
    }

    benefit.claimedBy.push({ user: req.user._id });
    await benefit.save();

    // 사용자 claimedBenefits에도 기록
    await User.findByIdAndUpdate(req.user._id, {
      $push: { claimedBenefits: { benefit: benefit._id } },
    });

    res.json({ success: true, message: '혜택을 수령했습니다!', data: benefit });
  } catch (err) {
    next(err);
  }
};
