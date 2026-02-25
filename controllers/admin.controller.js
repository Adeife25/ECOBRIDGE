const WasteLog = require("../models/wasteLog");
const PickupRequest = require("../models/PickupRequest");

exports.getAdminDashboard = async (req, res) => {
  try {
    const { type = "All" } = req.query; // filter option

    // --- Overview metrics (same as before) ---
    const totalGeneratedResult = await WasteLog.aggregate([
      { $group: { _id: null, totalKg: { $sum: "$quantity" } } }
    ]);
    const totalGenerated = totalGeneratedResult[0]?.totalKg || 0;

    const totalSegregatedResult = await WasteLog.aggregate([
      { $match: { pickupStatus: "Completed" } },
      { $group: { _id: null, totalKg: { $sum: "$quantity" } } }
    ]);
    const totalSegregated = totalSegregatedResult[0]?.totalKg || 0;

    const efficiency =
      totalGenerated > 0
        ? ((totalSegregated / totalGenerated) * 100).toFixed(2)
        : 0;

    const activeRequests = await WasteLog.countDocuments({
      pickupStatus: { $in: ["Requested", "Accepted"] }
    });

    const completedRequests = await WasteLog.countDocuments({
      pickupStatus: "Completed"
    });

    const wasteTrends = await WasteLog.aggregate([
      { $group: { _id: "$wasteCategory", count: { $sum: 1 } } }
    ]);

    const monthlyTrends = await WasteLog.aggregate([
      { $match: { pickupStatus: "Completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalKg: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const totalLogs = await WasteLog.countDocuments();
    const lowRiskLogs = await WasteLog.countDocuments({
      "aiAnalysis.contaminationRisk": "Low"
    });
    const segregationAccuracy =
      totalLogs > 0 ? ((lowRiskLogs / totalLogs) * 100).toFixed(2) : 0;

    const contaminationBreakdown = await WasteLog.aggregate([
      { $group: { _id: "$aiAnalysis.contaminationRisk", count: { $sum: 1 } } }
    ]);

    const co2Saved = (totalSegregated * 1.2).toFixed(2);

    // --- Activities ---
    const recentSMEActivities = await WasteLog.find()
      .populate("createdBy", "businessName email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentPartnerActivities = await PickupRequest.find()
      .populate("createdBy", "organizationName email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Normalize SME activities
    const smeActivities = recentSMEActivities.map(log => ({
      user: log.createdBy,
      activity: "Waste Log Submitted",
      status: log.status || log.pickupStatus,
      category: log.wasteCategory,
      quantity: log.quantity,
      date: log.createdAt,
      type: "SME"
    }));

    // Normalize Partner activities
    const partnerActivities = recentPartnerActivities.map(req => ({
      user: req.createdBy,
      activity: "Pickup Request",
      status: req.status,
      category: req.wasteCategory,
      quantity: req.quantity,
      date: req.createdAt,
      type: "Partner"
    }));

    // Merge + filter
    let unifiedActivities = [...smeActivities, ...partnerActivities];
    if (type === "SME") unifiedActivities = smeActivities;
    if (type === "Partner") unifiedActivities = partnerActivities;

    unifiedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      overview: {
        totalWasteGeneratedKg: totalGenerated,
        totalWasteSegregatedKg: totalSegregated,
        segregationEfficiencyPercent: efficiency,
        activeRequests,
        completedRequests
      },
      wasteTrends,
      monthlyTrends,
      segregationAnalytics: {
        segregationAccuracyPercent: segregationAccuracy,
        contaminationBreakdown
      },
      environmentalImpact: {
        totalKgDiverted: totalSegregated,
        co2SavedKg: co2Saved,
        sdgAligned: [
          "SDG 12 - Responsible Consumption",
          "SDG 13 - Climate Action"
        ]
      },
      unifiedActivities
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
