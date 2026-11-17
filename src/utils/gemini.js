
  return response.text;
}

export async function analyzeLeaf({ cropName = 'the crop shown', leafImage, notes = '' } = {}) {
  if (!leafImage) throw new Error('Please upload a leaf photo to scan.');
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  let imagePart;
  if (typeof leafImage === 'string') {
    const match = leafImage.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    if (!match) throw new Error('The leaf image could not be prepared. Please choose another photo.');
    imagePart = { inlineData: { mimeType: match[1], data: match[2] } };
  } else {
    if (!image.type?.startsWith('image/')) throw new Error('Please select a valid image file.');
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('The image could not be read. Please try another photo.'));
      reader.readAsDataURL(leafImage);
    });
    imagePart = { inlineData: { mimeType: leafImage.type, data: base64Data } };
  }

  const prompt = `You are a careful agricultural information assistant. Assess only visible symptoms in the attached crop-leaf photo; do not claim certainty and do not invent facts. Crop, if known: ${cropName}. Context: ${notes}. Reply as valid JSON only, in this schema: {"disease":"likely issue or unclear/healthy appearance","confidence":0,"remedy":"practical, low-risk English guidance and when to consult a local agricultural extension worker","odia":"ଓଡ଼ିଆରେ ସହଜ, ସୁରକ୍ଷିତ ପରାମର୍ଶ"}. Confidence must be a number from 0 to 100 and reflect image certainty. If diagnosis is unclear, say so and recommend an expert. Do not prescribe chemical pesticide use.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [prompt, imagePart],
  });

  const output = response.text || '';
  const jsonText = output.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error('Gemini could not provide a structured diagnosis. Try a clearer, well-lit photo.');
  let parsed;
  try { parsed = JSON.parse(jsonText); } catch { throw new Error('Gemini returned an unreadable diagnosis. Please try again.'); }
  const confidence = Number(parsed.confidence);
  return {
    disease: String(parsed.disease || 'Unable to identify a specific issue'),
    confidence: Number.isFinite(confidence) ? Math.min(100, Math.max(0, confidence)) : 0,
    remedy: String(parsed.remedy || 'Please consult a local agricultural extension worker for advice.'),
    odia: String(parsed.odia || 'ଅଧିକ ପରାମର୍ଶ ପାଇଁ ସ୍ଥାନୀୟ କୃଷି କର୍ମୀଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ।')
  };
}

export function getLeafAnalysisError(error) {
  return error?.message || 'Leaf scan could not complete. Please check your connection and try a clearer photo.';

