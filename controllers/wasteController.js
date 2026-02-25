const WasteLog = require('../models/wasteLog');
const { analyzeWaste } = require("../services/aiService");
const { createNotification } = require("../controllers/notificationController");

const createWasteLog = async (req, res) => {
  try {
    const {
      wasteCategory,
      description,
      quantity,
      wasteCondition,
      pickupAddress,
      availableDate,
      availableTime,
      urgency,
      price,
      status,
      imagePath: bodyImagePath // ✅ allow JSON imagePath
    } = req.body;

    let imagePath = null;

    // Case 1: File upload via form-data
    if (req.files && req.files.image) {
      const image = req.files.image;
      imagePath = `uploads/${Date.now()}_${image.name}`;
      await image.mv(imagePath);
    }
    // Case 2: JSON body with imagePath
    else if (bodyImagePath) {
      imagePath = bodyImagePath;
    }
    else {
      return res.status(400).json({ message: "Image is required" });
    }

    // Create waste log
    const wasteLog = await WasteLog.create({
      createdBy: req.user.id,
      wasteCategory,
      description,
      quantity,
      wasteCondition,
      pickupAddress,
      availableDate,
      availableTime,
      urgency,
      price,
      status,
      imagePath
    });

    // Confirmation notification
    await createNotification(
      req.user._id,
      "LoggingReminder",
      "Waste Logged Successfully",
      "Your waste log has been successfully recorded.",
      wasteLog._id,
      "WasteLog"
    );

    // Run AI analysis
    const aiResult = await analyzeWaste(imagePath);
    wasteLog.aiAnalysis = aiResult;
    await wasteLog.save();

    // Contamination alert
    if (aiResult.contaminationRisk === "High") {
      await createNotification(
        req.user._id,
        "ContaminationAlert",
        "Contamination Detected",
        aiResult.contaminationReason || "Mixed waste materials detected.",
        wasteLog._id,
        "WasteLog"
      );
    }

    // Return confirmation
    res.status(201).json({
      wasteSummary: {
        wasteCategory,
        description,
        quantity,
        wasteCondition,
        pickupAddress,
        availableDate,
        availableTime,
        urgency,
        price,
        status,
        imagePath
      },
      aiAnalysis: aiResult
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating waste log' });
  }
};


const getMyWasteLogs = async (req, res) => {
  try {
    const logs = await WasteLog.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

const updateWasteLog = async (req, res) => {
  try {
    const wasteLog = await WasteLog.findById(req.params.id);

    if (!wasteLog) {
      return res.status(404).json({ message: 'Waste log not found' });
    }

    if (wasteLog.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (wasteLog.status !== 'Draft') {
      return res.status(400).json({ message: 'Cannot edit submitted log' });
    }

const allowedUpdates = [
  "wasteCategory",
  "description",
  "quantity",
  "wasteCondition",
  "pickupAddress",
  "availableDate",
  "availableTime",
  "urgency",
  "price",
  "status",
  "imagePath"
];

allowedUpdates.forEach(field => {
  if (req.body[field] !== undefined) {
    wasteLog[field] = req.body[field];
  }
});
await wasteLog.save();


    res.json(wasteLog);

  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: 'Error updating log' });
  }
};

module.exports = {
  createWasteLog,
  getMyWasteLogs,
  updateWasteLog
};
