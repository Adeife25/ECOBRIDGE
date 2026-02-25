const ort = require("onnxruntime-node");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const labels = JSON.parse(fs.readFileSync("model/labels.json", "utf8"));

async function classifyWasteImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error("Invalid image source: file not found");
  }

  const session = await ort.InferenceSession.create("model/model.onnx");

  const img = await loadImage(imagePath);
  const canvas = createCanvas(224, 224);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 224, 224);

  const imageData = ctx.getImageData(0, 0, 224, 224);
  const data = Float32Array.from(imageData.data).filter((_, i) => i % 4 !== 3);
  const normalized = data.map(v => v / 255.0);

  const inputTensor = new ort.Tensor("float32", normalized, [1, 224, 224, 3]);
  const inputName = session.inputNames[0];
  const results = await session.run({ [inputName]: inputTensor });

  const probs = results[session.outputNames[0]].cpuData;
  const maxIdx = probs.indexOf(Math.max(...probs));

  return { label: labels[maxIdx], confidence: probs[maxIdx] };
}



async function analyzeWaste(imagePath) {
  try {
    const prediction = await classifyWasteImage(imagePath);

    const contaminationRisk = prediction.confidence < 0.6 ? "Medium" : "Low";
    const contaminationReason =
      contaminationRisk === "Medium"
        ? "Confidence below threshold, possible contamination"
        : "No contamination detected";

    return {
      classification: prediction.label,
      confidence: prediction.confidence,
      contaminationRisk,
      contaminationReason,
      recommendation: `Route to recycling/processing based on classification: ${prediction.label}`
    };
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return {
      classification: "Unknown",
      confidence: 0,
      contaminationRisk: "Unknown",
      contaminationReason: "AI analysis failed",
      recommendation: "Manual review required"
    };
  }
}

module.exports = { classifyWasteImage, analyzeWaste };
