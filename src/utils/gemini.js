const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_MODEL = 'gemini-3.8-flash';

export function getGeminiApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || !key.trim()) throw new Error('Gemini is not configured yet. Add VITE_GEMINI_API_KEY to your .env file, then restart the app.');
  return key.trim();
}

async function requestGemini({ prompt, image }) {
  const apiKey = getGeminiApiKey();
  const parts = [{ text: prompt }];
  if (image) {
    let mimeType = image.type || 'image/jpeg';
    let data;
    if (typeof image === 'string') {
      const match = image.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
      if (!match) throw new Error('The leaf image could not be prepared. Please choose another photo.');
      mimeType = match[1]; data = match[2];
    } else {
      if (!image.type?.startsWith('image/')) throw new Error('Please select a valid image file.');
      data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('The image could not be read. Please try another photo.'));
        reader.readAsDataURL(image);
      });
    }
    parts.push({ inline_data: { mime_type: mimeType, data } });
  }
  let response;
  try {
    response = await fetch(`${API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.35, topP: 0.85, maxOutputTokens: 900 } })
    });
  } catch {
    throw new Error('Could not reach Gemini. Check your internet connection and try again.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message;
    if (response.status === 401 || response.status === 403) throw new Error('Gemini rejected the API key. Check that VITE_GEMINI_API_KEY is valid and enabled for the Generative Language API.');
    if (response.status === 404) throw new Error(`Gemini model “${GEMINI_MODEL}” is unavailable for this API key or endpoint. Check the model name in src/utils/gemini.js.`);
    if (response.status === 429) throw new Error('Gemini is receiving too many requests. Please wait a moment and try again.');
    throw new Error(message || `Gemini request failed (${response.status}). Please try again.`);
  }
  const answer = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!answer) throw new Error('Gemini returned no answer. Please try again with a clearer question or photo.');
  return answer;
}

export function askGemini(prompt) {
  if (!prompt || !prompt.trim()) return Promise.reject(new Error('Please enter a question first.'));
  return requestGemini({ prompt: prompt.trim() });
}

export async function analyzeLeaf({ cropName = 'the crop shown', leafImage, notes = '' } = {}) {
  if (!leafImage) throw new Error('Please upload a leaf photo to scan.');
  const prompt = `You are a careful agricultural information assistant. Assess only visible symptoms in the attached crop-leaf photo; do not claim certainty and do not invent facts. Crop, if known: ${cropName}. Context: ${notes}. Reply as valid JSON only, in this schema: {"disease":"likely issue or unclear/healthy appearance","confidence":0,"remedy":"practical, low-risk English guidance and when to consult a local agricultural extension worker","odia":"ଓଡ଼ିଆରେ ସହଜ, ସୁରକ୍ଷିତ ପରାମର୍ଶ"}. Confidence must be a number from 0 to 100 and reflect image certainty. If diagnosis is unclear, say so and recommend an expert. Do not prescribe chemical pesticide use.`;
  const output = await requestGemini({ prompt, image: leafImage });
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
}
