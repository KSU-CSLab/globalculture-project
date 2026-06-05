/**
 * controllers/event.controller.js
 * 이벤트 CRUD + 신청
 */
const Event = require('../models/Event');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { tags: new RegExp(search, 'i') }];

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('createdBy', 'name avatar')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ startDate: 1 }),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('applicants.user', 'name avatar');
    if (!event) return res.status(404).json({ success: false, message: '이벤트를 찾을 수 없습니다.' });
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// POST /api/events  (Admin)
exports.createEvent = async (req, res, next) => {
  try {
    const thumbnail = req.file ? `/uploads/images/${req.file.filename}` : undefined;
    const event = await Event.create({ ...req.body, thumbnail, createdBy: req.user._id });
    res.status(201).json({ success: true, message: '이벤트가 생성되었습니다.', data: event });
  } catch (err) {
    next(err);
  }
};

// PUT /api/events/:id  (Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const thumbnail = req.file ? `/uploads/images/${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (thumbnail) updateData.thumbnail = thumbnail;

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: '이벤트를 찾을 수 없습니다.' });
    res.json({ success: true, message: '이벤트가 수정되었습니다.', data: event });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id  (Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: '이벤트를 찾을 수 없습니다.' });
    res.json({ success: true, message: '이벤트가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/apply
exports.applyEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: '이벤트를 찾을 수 없습니다.' });

    const alreadyApplied = event.applicants.some((a) => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) {
      return res.status(409).json({ success: false, message: '이미 신청한 이벤트입니다.' });
    }

    if (event.applicants.length >= event.capacity) {
      return res.status(400).json({ success: false, message: '정원이 마감되었습니다.' });
    }

    event.applicants.push({ user: req.user._id });
    await event.save();

    res.json({ success: true, message: '이벤트 신청이 완료되었습니다.', data: event });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id/apply  (신청 취소)
exports.cancelApply = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: '이벤트를 찾을 수 없습니다.' });

    event.applicants = event.applicants.filter((a) => a.user.toString() !== req.user._id.toString());
    await event.save();

    res.json({ success: true, message: '이벤트 신청이 취소되었습니다.' });
  } catch (err) {
    next(err);
  }
};
