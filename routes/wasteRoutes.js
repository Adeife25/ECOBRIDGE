const express = require("express");
const router = express.Router();
const { createWasteLog, getMyWasteLogs, updateWasteLog } = require("../controllers/wasteController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { classifyWasteImage } = require("../services/aiService");

// ✅ Create waste log (file handled inside controller via express-fileupload)
router.post("/", protect, authorizeRoles(["SME"]), createWasteLog);

// ✅ Get my waste logs
router.get("/my-logs", protect, getMyWasteLogs);

// ✅ Update waste log
router.put("/:id", protect, authorizeRoles(["SME"]), updateWasteLog);

// ✅ Analyze waste (using ONNX model locally, still needs file upload)
router.post("/analyze", protect, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.json({
        classification: "Unknown",
        confidence: 0,
        contaminationRisk: "Unknown",
        contaminationReason: "No image provided",
        recommendation: "Manual review required"
      });
    }

    const image = req.files.image;
    const imagePath = `uploads/${Date.now()}_${image.name}`;
    await image.mv(imagePath);

    const prediction = await classifyWasteImage(imagePath);

    const contaminationRisk = prediction.confidence < 0.6 ? "Medium" : "Low";
    const contaminationReason =
      contaminationRisk === "Medium"
        ? "Confidence below threshold, possible contamination"
        : "No contamination detected";

    res.json({
      classification: prediction.label,
      confidence: prediction.confidence,
      contaminationRisk,
      contaminationReason,
      recommendation: `Route to recycling/processing based on classification: ${prediction.label}`
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.json({
      classification: "Unknown",
      confidence: 0,
      contaminationRisk: "Unknown",
      contaminationReason: "AI analysis failed",
      recommendation: "Manual review required"
    });
  }
});

module.exports = router;
