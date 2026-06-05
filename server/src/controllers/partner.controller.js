/**
 * controllers/partner.controller.js
 * 글로컬 파트너사 CRUD
 */
const Partner = require('../models/Partner');

// GET /api/partners
exports.getPartners = async (req, res, next) => {
  try {
    const { category, country, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (country) filter.country = country;

    const [partners, total] = await Promise.all([
      Partner.find(filter)
        .populate('benefits', 'title type discountRate')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Partner.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: partners,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/partners/:id
exports.getPartner = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id).populate('benefits');
    if (!partner) return res.status(404).json({ success: false, message: '파트너사를 찾을 수 없습니다.' });
    res.json({ success: true, data: partner });
  } catch (err) {
    next(err);
  }
};

// POST /api/partners  (Admin)
exports.createPartner = async (req, res, next) => {
  try {
    const logo = req.file ? `/uploads/images/${req.file.filename}` : undefined;
    const partner = await Partner.create({ ...req.body, logo, createdBy: req.user._id });
    res.status(201).json({ success: true, message: '파트너사가 등록되었습니다.', data: partner });
  } catch (err) {
    next(err);
  }
};

// PUT /api/partners/:id  (Admin)
exports.updatePartner = async (req, res, next) => {
  try {
    const logo = req.file ? `/uploads/images/${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (logo) updateData.logo = logo;

    const partner = await Partner.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ success: false, message: '파트너사를 찾을 수 없습니다.' });
    res.json({ success: true, message: '파트너사 정보가 수정되었습니다.', data: partner });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/partners/:id  (Admin)
exports.deletePartner = async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: '파트너사를 찾을 수 없습니다.' });
    res.json({ success: true, message: '파트너사가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
};
