const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createCrudController(model, options = {}) {
  const searchFields = options.searchFields || ['name'];
  const populate = options.populate || '';
  const defaultSort = options.defaultSort || '-createdAt';

  return {
    createOne: asyncHandler(async (req, res) => {
      const doc = await model.create(req.body);
      res.status(201).json({
        success: true,
        data: doc,
      });
    }),

    getAll: asyncHandler(async (req, res) => {
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.max(1, Number(req.query.limit || 20));
      const q = req.query.q ? String(req.query.q).trim() : '';
      const filter = {};

      if (q) {
        const regex = new RegExp(escapeRegex(q), 'i');
        filter.$or = searchFields.map((field) => ({ [field]: regex }));
      }

      const [items, total] = await Promise.all([
        model
          .find(filter)
          .populate(populate)
          .sort(req.query.sort || defaultSort)
          .skip((page - 1) * limit)
          .limit(limit),
        model.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }),

    getOne: asyncHandler(async (req, res) => {
      const doc = await model.findById(req.params.id).populate(populate);
      if (!doc) {
        throw new ApiError(404, `${model.modelName} not found`);
      }

      res.json({
        success: true,
        data: doc,
      });
    }),

    updateOne: asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        throw new ApiError(404, `${model.modelName} not found`);
      }

      res.json({
        success: true,
        data: doc,
      });
    }),

    deleteOne: asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) {
        throw new ApiError(404, `${model.modelName} not found`);
      }

      res.status(200).json({
        success: true,
        message: `${model.modelName} deleted successfully`,
        data: null,
      });
    }),
  };
}

module.exports = createCrudController;
