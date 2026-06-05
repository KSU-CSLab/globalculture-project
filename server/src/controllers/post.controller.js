/**
 * controllers/post.controller.js
 * 커뮤니티 게시글 CRUD + 댓글/좋아요
 */
const Post = require('../models/Post');

// GET /api/posts
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const filter = { isHidden: false };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name avatar role')
        .select('-content -comments') // 목록에서 무거운 필드 제외
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ isPinned: -1, createdAt: -1 }),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar role')
      .populate('comments.author', 'name avatar');
    if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map((f) => `/uploads/images/${f.filename}`) : [];
    const post = await Post.create({ ...req.body, images, author: req.user._id });
    res.status(201).json({ success: true, message: '게시글이 작성되었습니다.', data: post });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
    }

    Object.assign(post, req.body);
    await post.save();
    res.json({ success: true, message: '게시글이 수정되었습니다.', data: post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
    }

    await post.deleteOne();
    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like (토글)
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ success: true, likeCount: post.likes.length, liked: idx === -1 });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });

    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'name avatar');

    res.status(201).json({ success: true, message: '댓글이 작성되었습니다.', data: post.comments });
  } catch (err) {
    next(err);
  }
};
