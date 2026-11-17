import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CloudRain,
  Compass,
  Flower2,
  Leaf,
  MapPin,
  MessageCircle,
  Mic,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Store,
  SunMedium,
  Upload,
  Users,
  Wand2,
  Wheat
} from 'lucide-react';
import { askGemini, analyzeLeaf, getLeafAnalysisError } from './utils/gemini';

const tabs = [
  { id: 'krishi', label: 'KrishiSahayak', icon: Leaf },
  { id: 'kala', label: 'KalaShilp', icon: ShoppingBag },
  { id: 'roots', label: 'TribalRoots', icon: Compass },
  { id: 'guru', label: 'GuruShilp', icon: Mic }
];

const cropData = [
  {
    name: 'Rice Blast',
    crop: 'Rice',
    severity: 'High',
    symptoms: 'Brown lesions on leaves, stunted growth.',
    remedy: 'Use resistant seed, remove infected straw, and spray neem decoction.',
    odia: 'ମଧ୍ୟମ ଚିତ୍ର, ପତ୍ରରେ ଚାକୁଆ କ୍ଷତ, ଚାଲେ ଗଛ ଦୁର୍ବଳ।'
  },
  {
    name: 'Leaf Spot',
    crop: 'Tomato',
    severity: 'Medium',
    symptoms: 'Round spots, yellow halos.',
    remedy: 'Prune infected leaves and apply copper fungicide.',
    odia: 'ପତ୍ରରେ ଗୋଲାକାର କ୍ଷତ, ପିଟା ଚିତ୍ର।'
  },
  {
    name: 'Powdery Mildew',
    crop: 'Cucumber',
    severity: 'Medium',
    symptoms: 'White powder on surfaces.',
    remedy: 'Improve airflow and spray milk + water mixture.',
    odia: 'ଧଳା ଗୁଣ୍ଡା, ଆଖୁରେ ନିରାଶା।'
  },
  {
    name: 'Bacterial Wilt',
    crop: 'Banana',
    severity: 'High',
    symptoms: 'Wilting and yellowing of leaves.',
    remedy: 'Rotate crops, destroy infected plants, sanitize tools.',
    odia: 'ପତ୍ରଗୁଡ଼ିକ ଶ୍ୟାମଳ ହୋଇ ହଳିଯାଏ।'
  }
];

const weatherData = {
  city: 'Koraput',
  temp: '29°C',
  humidity: '64%',
  rain: 'Light rain risk',
  advisory: 'Ideal time for soybean sowing and turmeric mulching.'
};

const mandiData = [
  { crop: 'Rice', price: '₹2,180/q', trend: '+4.2%' },
  { crop: 'Turmeric', price: '₹9,400/q', trend: '+2.8%' },
  { crop: 'Mustard', price: '₹5,120/q', trend: '+1.5%' },
  { crop: 'Millet', price: '₹3,750/q', trend: '+3.4%' }
];

const artisanItems = [
  {
    id: 1,
    title: 'Pattachitra Painting',
    artisan: 'Mira Munda',
    region: 'Puri',
    price: '₹2,400',
    tag: 'Handcrafted',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    title: 'Dhokra Bell',
    artisan: 'Kedar Nayak',
    region: 'Bargarh',
    price: '₹1,850',
    tag: 'Bronze Craft',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    title: 'Sambalpuri Ikat Shawl',
    artisan: 'Sanjukta Sahu',
    region: 'Sambalpur',
    price: '₹3,600',
    tag: 'Traditional Weave',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
  }
];

const tribes = [
  { name: 'Khond', region: 'Odisha', community: 'Primitive Tribal Group', notes: 'Agriculture, rituals, hill ecosystems' },
  { name: 'Gondi', region: 'Odisha', community: 'Scheduled Tribe', notes: 'Forest dependence, oral traditions' },
  { name: 'Munda', region: 'Jharkhand', community: 'Scheduled Tribe', notes: 'Community governance and land stewardship' },
  { name: 'Bhil', region: 'Madhya Pradesh', community: 'Scheduled Tribe', notes: 'Forest produce and indigenous medicine' },
  { name: 'Santal', region: 'West Bengal', community: 'Scheduled Tribe', notes: 'Festivals and agrarian wisdom' },
  { name: 'Toda', region: 'Tamil Nadu', community: 'PVTG', notes: 'Mountain pastoral herding and weaving' }
];

const academyModules = [
  {
    title: 'Rice Cultivation Basics',
    region: 'Odisha',
    duration: '12 min',
    description: 'Understanding seed selection, field preparation, and transplanting.',
    guide: 'Learn how indigenous farmers optimize paddy health using local water and seed wisdom.'
  },
  {
    title: 'Natural Dyeing Process',
    region: 'Bastar',
    duration: '8 min',
    description: 'Explore ayurvedic and herbal dye extraction techniques.',
    guide: 'From marigold to turmeric and lac, seasonal color systems are explained.'
  },
  {
    title: 'Dhokra Craft Care',
    region: 'Tribal Odisha',
    duration: '15 min',
    description: 'Metalwork finishing and safe maintenance practices.',
    guide: 'Preserve form, finish, and design authenticity with climate-aware care.'
  }
];

const defaultChat = [
  {
    role: 'assistant',
    content: 'Namaskar! I can help with tribal heritage, crop care, artisan stories, and general knowledge.'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('krishi');
  const [searchTerm, setSearchTerm] = useState('');
  const [cropImage, setCropImage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leafReport, setLeafReport] = useState(null);
  const [leafError, setLeafError] = useState('');
  const [chatMessages, setChatMessages] = useState(defaultChat);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [tribeFilter, setTribeFilter] = useState('All');
  const [sellForm, setSellForm] = useState({
    name: '',
    item: '',
    artisan: '',
    region: '',
    price: '',
    photo: ''
  });
  const [certificate, setCertificate] = useState(null);
  const fileInputRef = useRef(null);
  const photoRef = useRef(null);

  const filteredCrops = useMemo(() => {
    if (!searchTerm.trim()) return cropData;
    return cropData.filter((item) =>
      `${item.name} ${item.crop} ${item.symptoms} ${item.remedy}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredTribes = useMemo(() => {
    if (tribeFilter === 'All') return tribes;
    return tribes.filter((tribe) => tribe.region === tribeFilter || tribe.community === tribeFilter);
  }, [tribeFilter]);

  const handleLeafUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropImage(imageUrl);

    try {
      setIsAnalyzing(true);
      setLeafError('');
      const result = await analyzeLeaf({
        cropName: 'Rice',
        leafImage: imageUrl,
        notes: 'User uploaded crop leaf image for analysis.'
      });
      setLeafReport(result);
    } catch (error) {
      const message = getLeafAnalysisError(error);
      setLeafError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskAI = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', content: trimmed };
    setChatMessages((current) => [...current, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const answer = await askGemini(trimmed);
      setChatMessages((current) => [...current, { role: 'assistant', content: answer }]);
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        { role: 'assistant', content: error.message || 'I am unable to answer right now. Please check your Gemini API key.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSellForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSellForm((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const generateCertificate = async () => {
    const payload = {
      artisan: sellForm.artisan || 'Unknown Artisan',
      item: sellForm.item || 'Untitled Craft',
      region: sellForm.region || 'Tribal Region',
      price: sellForm.price || 'Price not provided',
      timestamp: new Date().toISOString()
    };

    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(payload)));
    const hashHex = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      `TribalShilp Certificate\n${payload.artisan}\n${payload.item}\nHash: ${hashHex}`
    )}`;

    setCertificate({
      ...payload,
      hash: hashHex,
      qrUrl
    });
  };

  const speakGuide = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const renderKrishi = () => (
    <div className="space-y-5 p-3 pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-forest via-moss to-emerald-800 p-5 text-white shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Crop & Leaf Scanner</p>
            <h2 className="mt-2 text-2xl font-bold">KrishiSahayak</h2>
          </div>
          <div className="rounded-full bg-white/10 p-3"><Leaf className="h-6 w-6" /></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-emerald-100">Weather</p>
            <p className="mt-1 text-xl font-semibold">{weatherData.temp}</p>
            <p className="text-xs text-emerald-100">{weatherData.rain}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-emerald-100">Mandi</p>
            <p className="mt-1 text-xl font-semibold">₹2,180/q</p>
            <p className="text-xs text-emerald-100">Rice, rising</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-forest/30 bg-emerald-50 p-4 text-sm font-medium text-forest">
          <Upload className="h-4 w-4" />
          Upload crop leaf photo
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLeafUpload} />
        </label>

        {cropImage && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-forest/10">
            <img src={cropImage} alt="Crop leaf preview" className="h-48 w-full object-cover" />
          </div>
        )}

        {isAnalyzing && <p className="mt-3 text-sm text-forest">Analyzing leaf and health pattern...</p>}
        {leafError && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{leafError}</p>}

        {leafReport && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-forest/70">Diagnosis</p>
                <h3 className="mt-1 text-xl font-bold text-forest">{leafReport.disease}</h3>
              </div>
              <BadgeCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-3">
              <span className="text-sm text-forest/70">Confidence</span>
              <span className="text-lg font-bold text-forest">{leafReport.confidence}%</span>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs uppercase text-forest/60">English</p>
                <p className="mt-1 text-sm text-forest">{leafReport.remedy}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-forest/60">ଓଡ଼ିଆ</p>
                <p className="mt-1 text-sm text-forest">{leafReport.odia}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-forest" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search disease or remedy"
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-3">
          {filteredCrops.map((item) => (
            <div key={item.name} className="rounded-2xl border border-forest/10 bg-clay p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-forest">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.crop}</p>
                </div>
                <span className="rounded-full bg-ochre/15 px-2 py-1 text-[10px] font-bold text-ochre">{item.severity}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{item.symptoms}</p>
              <p className="mt-2 text-xs text-forest">Remedy: {item.remedy}</p>
              <p className="mt-1 text-[11px] text-forest/70">ଓଡ଼ିଆ: {item.odia}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-amber-50 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-ochre"><CloudRain className="h-5 w-5" /> Weather</div>
          <p className="mt-3 text-2xl font-bold text-forest">{weatherData.temp}</p>
          <p className="text-sm text-slate-600">{weatherData.city}</p>
          <p className="mt-2 text-xs text-slate-600">{weatherData.advisory}</p>
        </div>
        <div className="rounded-3xl bg-terracotta/10 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-terracotta"><Wheat className="h-5 w-5" /> Mandi</div>
          <div className="mt-4 space-y-2">
            {mandiData.slice(0, 2).map((row) => (
              <div key={row.crop} className="flex justify-between text-xs">
                <span className="text-slate-600">{row.crop}</span>
                <span className="font-bold text-forest">{row.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKala = () => (
    <div className="space-y-5 p-3 pb-24">
      <div className="rounded-3xl bg-gradient-to-r from-ochre to-amber-300 p-5 text-forest shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em]">Marketplace</p>
            <h2 className="mt-2 text-2xl font-bold">KalaShilp</h2>
          </div>
          <div className="rounded-full bg-white/60 p-3"><Store className="h-6 w-6" /></div>
        </div>
      </div>

      <div className="space-y-3">
        {artisanItems.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
            <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-forest">{item.title}</h3>
                <span className="rounded-full bg-forest/5 px-2 py-1 text-[10px] font-semibold text-forest">{item.tag}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>{item.artisan}</span>
                <span>{item.region}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-bold text-terracotta">{item.price}</span>
                <button className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white">Buy now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-forest" />
          <h3 className="text-lg font-bold text-forest">+ Sell Item</h3>
        </div>

        <div className="mt-4 space-y-3">
          <input name="artisan" value={sellForm.artisan} onChange={handleFormChange} placeholder="Artisan name" className="w-full rounded-2xl border border-forest/20 bg-clay p-3 text-sm outline-none" />
          <input name="item" value={sellForm.item} onChange={handleFormChange} placeholder="Item name" className="w-full rounded-2xl border border-forest/20 bg-clay p-3 text-sm outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input name="region" value={sellForm.region} onChange={handleFormChange} placeholder="Region" className="w-full rounded-2xl border border-forest/20 bg-clay p-3 text-sm outline-none" />
            <input name="price" value={sellForm.price} onChange={handleFormChange} placeholder="Price" className="w-full rounded-2xl border border-forest/20 bg-clay p-3 text-sm outline-none" />
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-forest/20 bg-amber-50 p-3 text-sm text-forest">
            <Camera className="h-4 w-4" /> Upload craft photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>

          {sellForm.photo && (
            <div className="overflow-hidden rounded-2xl border border-forest/10">
              <img src={sellForm.photo} alt="Selected craft" className="h-32 w-full object-cover" />
            </div>
          )}

          <button onClick={generateCertificate} className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-white">
            Generate certificate
          </button>
        </div>

        {certificate && (
          <div className="mt-4 rounded-3xl border border-forest/10 bg-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-forest/60">Authenticity</p>
                <h4 className="mt-1 text-lg font-bold text-forest">Certificate</h4>
              </div>
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
              <div className="space-y-2 text-sm text-forest">
                <p><strong>Artisan:</strong> {certificate.artisan}</p>
                <p><strong>Item:</strong> {certificate.item}</p>
                <p><strong>Region:</strong> {certificate.region}</p>
                <p><strong>Price:</strong> {certificate.price}</p>
                <p><strong>Hash:</strong> {certificate.hash.slice(0, 16)}...</p>
              </div>
              <img src={certificate.qrUrl} alt="Certificate QR" className="h-24 w-24 rounded-xl bg-white p-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoots = () => (
    <div className="space-y-5 p-3 pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-forest to-moss p-5 text-white shadow-soft">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">Heritage & Guide</p>
        <h2 className="mt-2 text-2xl font-bold">TribalRoots</h2>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-clay px-3 py-2">
          <Search className="h-4 w-4 text-forest" />
          <select
            value={tribeFilter}
            onChange={(e) => setTribeFilter(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value="All">All regions</option>
            <option value="Odisha">Odisha</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredTribes.map((tribe) => (
            <div key={tribe.name} className="rounded-2xl border border-forest/10 bg-clay p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-forest">{tribe.name}</p>
                  <p className="text-xs text-slate-500">{tribe.community}</p>
                </div>
                <MapPin className="h-4 w-4 text-terracotta" />
              </div>
              <p className="mt-2 text-xs text-slate-600">{tribe.region}</p>
              <p className="mt-1 text-xs text-slate-600">{tribe.notes}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-forest" />
          <h3 className="text-lg font-bold text-forest">Ask AI</h3>
        </div>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-clay p-3">
          {chatMessages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-[85%] rounded-2xl p-3 text-sm ${message.role === 'user' ? 'ml-auto bg-forest text-white' : 'bg-white text-slate-700'}`}>
              {message.content}
            </div>
          ))}
          {chatLoading && <div className="text-xs text-slate-500">Thinking...</div>}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Ask about tribal history, culture, farming, or anything..."
            className="flex-1 rounded-2xl border border-forest/20 bg-clay p-3 text-sm outline-none"
          />
          <button onClick={handleAskAI} className="rounded-2xl bg-forest p-3 text-white">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderGuru = () => (
    <div className="space-y-5 p-3 pb-24">
      <div className="rounded-3xl bg-gradient-to-r from-terracotta to-amber-400 p-5 text-white shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-100">Artisan Academy</p>
            <h2 className="mt-2 text-2xl font-bold">GuruShilp</h2>
          </div>
          <div className="rounded-full bg-white/50 p-3"><Mic className="h-6 w-6" /></div>
        </div>
      </div>

      <div className="space-y-3">
        {academyModules.map((module) => (
          <div key={module.title} className="rounded-3xl bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-terracotta">{module.region}</p>
                <h3 className="mt-2 text-lg font-bold text-forest">{module.title}</h3>
              </div>
              <button onClick={() => speakGuide(`${module.title}. ${module.guide}`)} className="rounded-full bg-amber-100 p-2 text-terracotta">
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{module.duration}</span>
              <span>Regional guide</span>
            </div>
            <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-forest">{module.guide}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto min-h-screen max-w-md bg-clay text-slate-800">
      <div className="bg-[#f8f4ec] min-h-screen">
        <header className="bg-gradient-to-r from-forest via-moss to-emerald-800 px-5 py-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-100">Science Exhibition</p>
              <h1 className="text-2xl font-black">TribalShilp</h1>
            </div>
            <div className="rounded-full bg-white/10 p-2"><Sparkles className="h-5 w-5" /></div>
          </div>
        </header>

        <main className="pt-2 pb-24">
          {activeTab === 'krishi' && renderKrishi()}
          {activeTab === 'kala' && renderKala()}
          {activeTab === 'roots' && renderRoots()}
          {activeTab === 'guru' && renderGuru()}
        </main>

        <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center justify-between border-t border-forest/10 bg-[#fffdf9] px-3 py-2 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${active ? 'bg-forest text-white' : 'text-slate-600'}`}
              >
                <Icon className="mb-1 h-5 w-5" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default App;
