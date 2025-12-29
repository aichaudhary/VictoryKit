const Control = require("../models/Control");
const Risk = require("../models/Risk");

// Create control
exports.create = async (req, res, next) => {
  try {
    const control = new Control(req.body);
    await control.save();
    res.status(201).json(control);
  } catch (error) {
    next(error);
  }
};

// Get all controls
exports.getAll = async (req, res, next) => {
  try {
    const { type, framework, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (framework) filter["framework.name"] = framework;
    if (status) filter["implementation.status"] = status;

    const skip = (page - 1) * limit;
    const [controls, total] = await Promise.all([
      Control.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Control.countDocuments(filter),
    ]);

    res.json({
      data: controls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get control by ID
exports.getById = async (req, res, next) => {
  try {
    const control = await Control.findById(req.params.id).populate(
      "coverage.risks"
    );

    if (!control) {
      return res.status(404).json({ error: "Control not found" });
    }
    res.json(control);
  } catch (error) {
    next(error);
  }
};

// Update control
exports.update = async (req, res, next) => {
  try {
    const control = await Control.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!control) {
      return res.status(404).json({ error: "Control not found" });
    }
    res.json(control);
  } catch (error) {
    next(error);
  }
};

// Delete control
exports.delete = async (req, res, next) => {
  try {
    const control = await Control.findByIdAndDelete(req.params.id);

    if (!control) {
      return res.status(404).json({ error: "Control not found" });
    }

    // Remove control from linked risks
    await Risk.updateMany(
      { "controls.controlId": req.params.id },
      { $pull: { controls: { controlId: req.params.id } } }
    );

    res.json({ message: "Control deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Test control effectiveness
exports.testEffectiveness = async (req, res, next) => {
  try {
    const control = await Control.findById(req.params.id);

    if (!control) {
      return res.status(404).json({ error: "Control not found" });
    }

    const { testMethod, testResults, findings, rating } = req.body;

    // Update effectiveness
    control.effectiveness.rating = rating || control.effectiveness.rating;
    control.effectiveness.lastTested = new Date();
    control.effectiveness.testMethod =
      testMethod || control.effectiveness.testMethod;
    control.effectiveness.testResults =
      testResults || control.effectiveness.testResults;

    // Add to test history
    control.testing.testHistory.push({
      date: new Date(),
      result: rating,
      tester: req.body.tester || "system",
      findings: findings,
    });
    control.testing.lastTest = new Date();

    await control.save();

    // Update linked risks' residual risk
    if (control.coverage?.risks?.length > 0) {
      for (const riskId of control.coverage.risks) {
        const risk = await Risk.findById(riskId);
        if (risk) {
          const controlIndex = risk.controls.findIndex(
            (c) => c.controlId.toString() === control._id.toString()
          );
          if (controlIndex >= 0) {
            risk.controls[controlIndex].effectiveness =
              control.effectiveness.score;
            await risk.save();
          }
        }
      }
    }

    res.json({
      control,
      testResult: {
        rating: control.effectiveness.rating,
        score: control.effectiveness.score,
        testedAt: control.effectiveness.lastTested,
      },
    });
  } catch (error) {
    next(error);
  }
};
