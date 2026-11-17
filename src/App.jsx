import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, Camera, Check, ChevronDown, CloudSun, Compass, Leaf, MapPin, Menu, Mic, Pause, Play, Plus, Search, Send, ShieldCheck, ShoppingBag, Sparkles, Sprout, Store, Sun, Upload, Volume2, Wheat, X } from 'lucide-react';
import { analyzeLeaf, askGemini, getLeafAnalysisError } from './utils/gemini';

const tabs = [
  { id: 'krishi', label: 'KrishiSahayak', short: 'Krishi', icon: Leaf },
  { id: 'kala', label: 'KalaShilp', short: 'Kala', icon: ShoppingBag },
  { id: 'roots', label: 'TribalRoots', short: 'Roots', icon: Compass },
  { id: 'guru', label: 'GuruShilp', short: 'Guru', icon: BookOpen }
];
const crops = [
  { name: 'Rice blast', crop: 'Rice', severity: 'High', symptoms: 'Diamond-shaped brown lesions, often with grey centres.', remedy: 'Remove infected plant debris, use clean seed and ask a local extension worker about resistant varieties. Neem is a supportive measure, not a cure.', odia: 'ପତ୍ରରେ ଧୂସର କେନ୍ଦ୍ର ଥିବା ହୀରା ଆକୃତିର ଦାଗ ଦେଖାଯାଏ। ସଂକ୍ରମିତ ଅବଶେଷ ହଟାନ୍ତୁ ଏବଂ ସ୍ଥାନୀୟ କୃଷି କର୍ମୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।' },
  { name: 'Bacterial leaf blight', crop: 'Rice', severity: 'High', symptoms: 'Yellowing along leaf edges that spreads down the leaf.', remedy: 'Keep field drainage healthy, avoid excess nitrogen, and use clean seed. Seek local diagnosis before treatment.', odia: 'ପତ୍ରର ଧାର ହଳଦିଆ ହୋଇ ଧୀରେ ଧୀରେ ତଳକୁ ବ୍ୟାପେ।' },
  { name: 'Early blight', crop: 'Tomato', severity: 'Medium', symptoms: 'Dark spots with concentric rings, usually on older leaves.', remedy: 'Remove affected lower leaves, water at soil level, rotate crops, and avoid handling wet plants.', odia: 'ପୁରୁଣା ପତ୍ରରେ ଗୋଲାକାର ଗାଢ଼ ଦାଗ ଦେଖାଯାଏ।' },
  { name: 'Powdery mildew', crop: 'Cucumber', severity: 'Medium', symptoms: 'White powdery patches on leaf surfaces.', remedy: 'Improve airflow, avoid overhead watering, and remove heavily affected leaves.', odia: 'ପତ୍ର ଉପରେ ଧଳା ଗୁଣ୍ଡ ଭଳି ଆବରଣ ଦେଖାଯାଏ।' },
  { name: 'Leaf curl', crop: 'Chilli', severity: 'Medium', symptoms: 'Leaves curl and become smaller; several causes are possible.', remedy: 'Check the underside for pests, remove severely affected plants, and consult an agricultural officer before spraying.', odia: 'ପତ୍ର ମୋଡ଼ିଯାଏ ଓ ଛୋଟ ହୋଇଯାଏ।' }
];
const mandi = [{ crop: 'Rice', price: '₹2,180', unit: '/ q', trend: '+4.2%' }, { crop: 'Turmeric', price: '₹9,400', unit: '/ q', trend: '+2.8%' }, { crop: 'Millet', price: '₹3,750', unit: '/ q', trend: '+3.4%' }];
const products = [
  { id: 1, title: 'Pattachitra — Tree of Life', artisan: 'Mira Munda', region: 'Raghurajpur, Odisha', price: '₹2,400', tag: 'Pattachitra', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=85' },
  { id: 2, title: 'Dhokra Brass Bell', artisan: 'Kedar Nayak', region: 'Bastar, Chhattisgarh', price: '₹1,850', tag: 'Dhokra', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85' },
  { id: 3, title: 'Sambalpuri Ikat Stole', artisan: 'Sanjukta Sahu', region: 'Sambalpur, Odisha', price: '₹3,600', tag: 'Ikat', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85' },
  { id: 4, title: 'Warli story panel', artisan: 'Rupa Pawara', region: 'Maharashtra', price: '₹1,200', tag: 'Warli', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=85' }
];
const tribes = [
  { name: 'Kondh (Kui)', region: 'Odisha', status: 'Scheduled Tribe · PVTG communities include Dongria Kondh', story: 'Farming communities of the Eastern Ghats with rich knowledge of millets, forests and local seed diversity.' },
  { name: 'Saora (Savar)', region: 'Odisha', status: 'Scheduled Tribe · PVTG', story: 'Known for distinctive wall paintings and deep relationships with the hills and forest landscape.' },
  { name: 'Gond', region: 'Madhya Pradesh', status: 'Scheduled Tribe', story: 'A diverse group with celebrated visual arts, oral histories and agricultural traditions.' },
  { name: 'Bhil', region: 'Rajasthan', status: 'Scheduled Tribe', story: 'Communities across western and central India with living traditions of music, painting and farming.' },
  { name: 'Munda', region: 'Jharkhand', status: 'Scheduled Tribe', story: 'Adivasi communities with strong traditions of community life, land stewardship and the Sarhul festival.' },
  { name: 'Toda', region: 'Tamil Nadu', status: 'Scheduled Tribe · PVTG', story: 'Pastoral community of the Nilgiri hills, known for distinctive embroidery and dairying traditions.' },
  { name: 'Santal', region: 'West Bengal', status: 'Scheduled Tribe', story: 'One of India’s largest Adivasi communities, with a vibrant language, music and agrarian calendar.' },
  { name: 'Chenchu', region: 'Telangana', status: 'Scheduled Tribe · PVTG', story: 'A community of the Nallamala forests with extensive knowledge of forest ecology.' }
];
const modules = [
  { title: 'Rice cultivation, the local way', region: 'Odisha · Farming', duration: '12 min', description: 'Seed selection, field preparation and transplanting, guided by seasonal knowledge.', script: 'Welcome to rice cultivation. Begin by selecting healthy local seed suited to your rainfall and soil. Prepare the field with care, transplant at the right spacing, and observe water levels regularly. Local agricultural officers can advise on varieties and changing weather.' },
  { title: 'Natural dyes from the forest', region: 'Central India · Craft', duration: '8 min', description: 'An introduction to plant-based colour, safe preparation and responsible sourcing.', script: 'Natural colour begins with respectful sourcing. Marigold and turmeric create warm yellows, while other plants offer varied shades. Use only cultivated or responsibly gathered material, test a small sample, and keep dye water away from drinking water.' },
  { title: 'Dhokra: the lost-wax tradition', region: 'Bastar · Metal craft', duration: '15 min', description: 'Learn the basics of a celebrated metal-casting practice and how to care for a piece.', script: 'Dhokra is a family of metal-casting traditions using the lost-wax process. Each handmade piece carries the maker’s decisions in its surface and shape. Keep your piece dry, wipe with a soft cloth, and ask its artisan about its specific materials.' },
  { title: 'Sambalpuri Ikat: pattern and patience', region: 'Sambalpur · Weaving', duration: '10 min', description: 'Discover the tie-dye-resist process that creates patterns before the cloth is woven.', script: 'In Ikat weaving, threads are tied and dyed before they meet on the loom. The artisan plans the pattern in advance, and slight variations are part of the handmade character. Wash gently in cool water and dry in shade.' }
];

const defaultChat = [{ role: 'assistant', content: 'Namaskar! Ask me about tribal heritage, culture, farming, crafts—or any general question. I’ll do my best to help.' }];
function App() {
  const [activeTab, setActiveTab] = useState('krishi');
  const [cropSearch, setCropSearch] = useState('');
  const [cropImage, setCropImage] = useState('');
  const [leafReport, setLeafReport] = useState(null);
  const [leafError, setLeafError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState(defaultChat);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [tribeSearch, setTribeSearch] = useState('');
  const [region, setRegion] = useState('All regions');
  const [productSearch, setProductSearch] = useState('');
  const [sellOpen, setSellOpen] = useState(false);
  const [sellForm, setSellForm] = useState({ artisan: '', item: '', region: '', price: '', photo: '' });
  const [certificate, setCertificate] = useState(null);
  const [notice, setNotice] = useState('');
  const [playing, setPlaying] = useState(null);
  const leafInput = useRef(null);
  const productInput = useRef(null);
  const chatEnd = useRef(null);

  const filteredCrops = useMemo(() => crops.filter((item) => `${item.name} ${item.crop} ${item.symptoms} ${item.remedy} ${item.odia}`.toLowerCase().includes(cropSearch.toLowerCase())), [cropSearch]);
  const filteredTribes = useMemo(() => tribes.filter((tribe) => (region === 'All regions' || tribe.region === region) && `${tribe.name} ${tribe.region} ${tribe.status} ${tribe.story}`.toLowerCase().includes(tribeSearch.toLowerCase())), [region, tribeSearch]);
  const filteredProducts = useMemo(() => products.filter((p) => `${p.title} ${p.artisan} ${p.region} ${p.tag}`.toLowerCase().includes(productSearch.toLowerCase())), [productSearch]);

  const handleLeafUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setLeafError('Please choose an image file.'); return; }
    if (file.size > 8 * 1024 * 1024) { setLeafError('Choose an image under 8 MB for a faster scan.'); return; }
    const imageUrl = URL.createObjectURL(file);
    setCropImage(imageUrl); setLeafReport(null); setLeafError(''); setIsAnalyzing(true);
    try {
      const result = await analyzeLeaf({ cropName: 'the crop shown in the photo', leafImage: file, notes: 'Identify visible symptoms conservatively. If the photo is unclear, say so.' });
      setLeafReport(result);
    } catch (error) { setLeafError(getLeafAnalysisError(error)); }
    finally { setIsAnalyzing(false); }
  };

  const handleAskAI = async (event) => {
    event?.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || chatLoading) return;
    setChatInput(''); setChatMessages((list) => [...list, { role: 'user', content: prompt }]); setChatLoading(true);
    try {
      const answer = await askGemini(`You are TribalRoots, a respectful and helpful educational guide. Answer the user's open-ended question clearly and accurately. For cultural topics, avoid stereotypes, acknowledge diversity, and distinguish verified facts from uncertainty. User question: ${prompt}`);
      setChatMessages((list) => [...list, { role: 'assistant', content: answer }]);
    } catch (error) {
      setChatMessages((list) => [...list, { role: 'assistant', content: error?.message || 'I could not connect right now. Please try again later.' }]);
    } finally { setChatLoading(false); setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50); }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) { setNotice('Choose an image file under 8 MB.'); return; }
    const reader = new FileReader(); reader.onload = () => setSellForm((f) => ({ ...f, photo: String(reader.result) })); reader.onerror = () => setNotice('The photo could not be read. Please try again.'); reader.readAsDataURL(file);
  };

  const generateCertificate = async (event) => {
    event.preventDefault();
    const payload = { artisan: sellForm.artisan.trim(), item: sellForm.item.trim(), region: sellForm.region.trim(), price: sellForm.price.trim(), issuedAt: new Date().toISOString() };
    if (!payload.artisan || !payload.item || !payload.region) { setNotice('Add the artisan, item and region to create a certificate preview.'); return; }
    try {
      const canonical = JSON.stringify(payload);
      const hash = globalThis.crypto?.subtle ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical)))).map((byte) => byte.toString(16).padStart(2, '0')).join('') : Array.from(new TextEncoder().encode(canonical)).map((b) => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0').slice(0, 64);
      setCertificate({ ...payload, hash, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`TribalShilp demo certificate | ${payload.item} | ${hash}`)}` });
      setNotice('Demo certificate created. The hash and QR preview are not an official certification.');
    } catch { setNotice('Certificate preview could not be created on this device.'); }
  };

  const toggleAudio = (module) => {
    if (playing === module.title) { window.speechSynthesis?.cancel(); setPlaying(null); return; }
    if (!('speechSynthesis' in window)) { setNotice('Audio playback is not supported in this browser.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(module.script); utterance.rate = 0.92; utterance.onend = () => setPlaying(null); utterance.onerror = () => setPlaying(null);
    window.speechSynthesis.speak(utterance); setPlaying(module.title);
  };

  const header = (eyebrow, title, icon) => <div className="section-hero"><div className="hero-copy"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><span className="hero-icon">{icon}</span></div>;

  const renderKrishi = () => <section className="page-stack">
    {header('GROW WITH LOCAL KNOWLEDGE', 'KrishiSahayak', <Leaf size={24} />)}
    <div className="weather-strip"><div className="weather-main"><span className="weather-icon"><CloudSun size={21}/></span><div><span className="eyebrow">TODAY · KORAPUT</span><strong>29° <small>Partly cloudy</small></strong></div></div><div className="weather-note"><Sun size={15}/> Light rain possible · Good time to mulch</div></div>
    <div className="section-heading"><div><span className="eyebrow">PHOTO DIAGNOSIS</span><h3>What’s happening to your crop?</h3></div><span className="mini-icon"><Sparkles size={18}/></span></div>
    <div className="card scan-card"><button className="upload-zone" onClick={() => leafInput.current?.click()}><span className="upload-icon"><Camera size={22}/></span><strong>{cropImage ? 'Choose another leaf photo' : 'Take or upload a leaf photo'}</strong><span>Clear, close-up photos work best · up to 8 MB</span><span className="button-outline"><Upload size={15}/> Select photo</span></button><input ref={leafInput} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={handleLeafUpload}/>
      {cropImage && <img className="leaf-preview" src={cropImage} alt="Uploaded crop leaf"/>}
      {isAnalyzing && <div className="inline-status"><span className="spinner"/> Checking visible leaf symptoms…</div>}
      {leafError && <div className="alert alert-error" role="alert">{leafError}</div>}
      {leafReport && <div className="diagnosis"><div className="diagnosis-title"><div><span className="eyebrow">AI-ASSISTED OBSERVATION</span><h3>{leafReport.disease}</h3></div><BadgeCheck size={25}/></div><div className="confidence"><span>Estimated confidence</span><b>{leafReport.confidence}%</b></div><p className="disclaimer">A photo-based suggestion, not a definitive diagnosis. Confirm with a local agriculture expert before treatment.</p><div className="remedy"><b>English · Suggested care</b><p>{leafReport.remedy}</p></div><div className="remedy odia"><b>ଓଡ଼ିଆ · ପରାମର୍ଶ</b><p>{leafReport.odia}</p></div></div>}
      <p className="privacy-note">Your image is sent to Gemini for analysis when an API key is configured.</p>
    </div>
    <div className="section-heading"><div><span className="eyebrow">FIELD NOTES</span><h3>Crop health library</h3></div></div>
    <div className="card"><label className="search-box"><Search size={17}/><input value={cropSearch} onChange={(e) => setCropSearch(e.target.value)} placeholder="Search disease, crop or remedy" aria-label="Search crop diseases"/><button type="button" className="clear-search" onClick={() => setCropSearch('')} aria-label="Clear search"><X size={15}/></button></label>
      <div className="list-stack">{filteredCrops.length ? filteredCrops.map((item) => <article className="crop-row" key={item.name}><div className="row-top"><div><h4>{item.name}</h4><span className="muted">{item.crop}</span></div><span className={`severity ${item.severity.toLowerCase()}`}>{item.severity} watch</span></div><p>{item.symptoms}</p><p className="remedy-line"><b>Care:</b> {item.remedy}</p><p className="odia-line">ଓଡ଼ିଆ: {item.odia}</p></article>) : <p className="empty-state">No crop notes match that search.</p>}</div>
    </div>
    <div className="section-heading"><div><span className="eyebrow">LOCAL ADVISORY</span><h3>Market watch</h3></div><span className="location-label"><MapPin size={14}/> Koraput</span></div>
    <div className="market-grid">{mandi.map((row) => <div className="market-card" key={row.crop}><span>{row.crop}</span><strong>{row.price}<small>{row.unit}</small></strong><em>↗ {row.trend}</em></div>)}</div><p className="small-note">Illustrative mandi prices only—not live market quotes. Check your nearest market for current rates.</p>
  </section>;

  const renderKala = () => <section className="page-stack">
    {header('MADE BY HAND, ROOTED IN PLACE', 'KalaShilp', <Store size={23}/>)}
    <div className="market-intro"><span className="eyebrow">A CLOSER LOOK AT CRAFT</span><h3>Every piece carries a story.</h3><p>Explore work from artisan traditions across India. Support makers and their communities.</p></div>
    <label className="search-box card"><Search size={17}/><input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Find a craft or tradition" aria-label="Search crafts"/><button className="clear-search" onClick={() => setProductSearch('')} aria-label="Clear search"><X size={15}/></button></label>
    <div className="product-grid">{filteredProducts.map((item) => <article className="product-card" key={item.id}><div className="product-image-wrap"><img src={item.image} alt={item.title} loading="lazy"/><span className="craft-tag">{item.tag}</span></div><div className="product-info"><h3>{item.title}</h3><p className="maker">{item.artisan}</p><p className="muted"><MapPin size={13}/>{item.region}</p><div className="product-bottom"><strong>{item.price}</strong><button className="text-button" onClick={() => setNotice(`Thanks for supporting ${item.artisan}! This exhibition demo does not process orders.`)}>Discover <ArrowRight size={14}/></button></div></div></article>)}{filteredProducts.length === 0 && <p className="empty-state">No crafts found. Try another search.</p>}</div>
    <div className="sell-banner"><div><span className="eyebrow">FOR ARTISANS</span><h3>Share your craft with the world.</h3><p>Create a listing and a demo authenticity certificate.</p></div><button className="button-light" onClick={() => setSellOpen(!sellOpen)}><Plus size={16}/>{sellOpen ? 'Close form' : 'Sell item'}</button></div>
    {sellOpen && <form className="card sell-form" onSubmit={generateCertificate}><div className="section-heading compact"><div><span className="eyebrow">ARTISAN LISTING</span><h3>Tell us about your piece</h3></div></div><label>Artisan name<input required value={sellForm.artisan} onChange={(e) => setSellForm({...sellForm, artisan: e.target.value})} placeholder="Your name"/></label><label>Item name<input required value={sellForm.item} onChange={(e) => setSellForm({...sellForm, item: e.target.value})} placeholder="e.g. Handwoven Ikat stole"/></label><div className="form-two"><label>Region<input required value={sellForm.region} onChange={(e) => setSellForm({...sellForm, region: e.target.value})} placeholder="Village, state"/></label><label>Price (₹)<input inputMode="numeric" value={sellForm.price} onChange={(e) => setSellForm({...sellForm, price: e.target.value})} placeholder="Optional"/></label></div><button type="button" className="photo-picker" onClick={() => productInput.current?.click()}><Camera size={17}/>{sellForm.photo ? 'Change item photo' : 'Upload item photo'}</button><input ref={productInput} type="file" className="visually-hidden" accept="image/*" onChange={handlePhotoUpload}/>{sellForm.photo && <img className="sell-preview" src={sellForm.photo} alt="Your craft preview"/>}<button type="submit" className="button-primary"><ShieldCheck size={17}/> Generate certificate preview</button><p className="small-note">Demo only: this certificate is not an official certification or proof of provenance.</p></form>}
    {certificate && <div className="card certificate"><div className="certificate-head"><div><span className="eyebrow">TRIBALSHILP · DEMO</span><h3>Maker’s certificate</h3></div><ShieldCheck size={24}/></div><div className="certificate-body"><div><p><b>Maker</b>{certificate.artisan}</p><p><b>Piece</b>{certificate.item}</p><p><b>Place</b>{certificate.region}</p><p className="hash"><b>SHA-256 fingerprint</b>{certificate.hash}</p></div><img src={certificate.qrUrl} alt="QR code preview for demo certificate"/></div></div>}
  </section>;

  const renderRoots = () => <section className="page-stack">
    {header('LIVING CULTURES, MANY VOICES', 'TribalRoots', <Compass size={23}/>)}
    <div className="roots-note"><Sparkles size={17}/><p>India’s Adivasi communities are diverse and contemporary. Learn with respect; no single story can represent everyone.</p></div>
    <div className="section-heading"><div><span className="eyebrow">COMMUNITY DIRECTORY</span><h3>Explore communities</h3></div></div>
    <div className="card directory-tools"><label className="search-box"><Search size={17}/><input value={tribeSearch} onChange={(e) => setTribeSearch(e.target.value)} placeholder="Search community or state" aria-label="Search communities"/></label><label className="region-select"><MapPin size={15}/><select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Filter communities by region"><option>All regions</option>{[...new Set(tribes.map((t) => t.region))].sort().map((r) => <option key={r}>{r}</option>)}</select><ChevronDown size={15}/></label><div className="list-stack">{filteredTribes.map((tribe) => <article className="tribe-row" key={tribe.name}><div className="tribe-heading"><div className="tribe-mark">{tribe.name.charAt(0)}</div><div><h4>{tribe.name}</h4><span className="muted"><MapPin size={12}/>{tribe.region}</span></div></div><span className="tribe-status">{tribe.status}</span><p>{tribe.story}</p></article>)}{!filteredTribes.length && <p className="empty-state">No communities match those filters.</p>}</div><p className="small-note">Directory examples for learning, not an exhaustive official list. PVTG status and state distribution can vary in official sources.</p></div>
    <div className="section-heading"><div><span className="eyebrow">OPEN AI GUIDE</span><h3>Ask TribalRoots</h3></div><span className="mini-icon"><Sparkles size={17}/></span></div>
    <div className="card chat-card"><div className="chat-head"><div className="chat-avatar"><Sparkles size={18}/></div><div><b>Heritage Guide</b><span>Ask about culture, history, or anything</span></div><span className="online-dot" title="Ready"/></div><div className="chat-messages" aria-live="polite">{chatMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>{message.content}</div>)}{chatLoading && <div className="chat-bubble assistant loading-dots">Thinking…</div>}<div ref={chatEnd}/></div><form className="chat-form" onSubmit={handleAskAI}><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask anything…" aria-label="Ask TribalRoots" disabled={chatLoading}/><button type="submit" disabled={chatLoading || !chatInput.trim()} aria-label="Send question"><Send size={17}/></button></form><p className="small-note">AI answers can be incomplete. For cultural knowledge, listen to community voices and verify important facts.</p></div>
  </section>;

  const renderGuru = () => <section className="page-stack">
    {header('LEARN FROM LIVING TRADITIONS', 'GuruShilp', <BookOpen size={23}/>)}
    <div className="academy-intro"><div className="academy-mark"><Volume2 size={22}/></div><div><span className="eyebrow">LISTEN & LEARN</span><h3>Knowledge, shared by voice.</h3><p>Audio-first learning modules and regional guides. Tap play to listen with your device’s speech support.</p></div></div>
    <div className="module-list">{modules.map((module, index) => <article className="module-card" key={module.title}><div className="module-top"><span className="module-number">0{index + 1}</span><span className="module-region">{module.region}</span></div><h3>{module.title}</h3><p>{module.description}</p><div className="module-footer"><span><Mic size={14}/>{module.duration} · Audio guide</span><button className={`play-button ${playing === module.title ? 'is-playing' : ''}`} onClick={() => toggleAudio(module)} aria-label={`${playing === module.title ? 'Stop' : 'Play'} ${module.title}`}>{playing === module.title ? <Pause size={17}/> : <Play size={17} fill="currentColor"/>}<span>{playing === module.title ? 'Stop' : 'Listen'}</span></button></div><div className="module-transcript"><b>Guide preview</b><p>{module.script}</p></div></article>)}</div>
    <div className="roots-note"><Sprout size={18}/><p>Learning materials are educational starting points. Craft and farming practices differ by community and place.</p></div>
  </section>;

  return <div className="app-shell"><header className="topbar"><div className="brand-mark"><Sprout size={20}/></div><div className="brand-copy"><span>SCIENCE EXHIBITION · INDIA</span><h1>TribalShilp</h1></div><button className="topbar-action" onClick={() => setNotice('Welcome to TribalShilp — explore, learn, and celebrate living traditions.')} aria-label="About TribalShilp"><Sparkles size={19}/></button></header>
    <main className="main-content">{activeTab === 'krishi' && renderKrishi()}{activeTab === 'kala' && renderKala()}{activeTab === 'roots' && renderRoots()}{activeTab === 'guru' && renderGuru()}</main>
    <nav className="bottom-nav" aria-label="Main navigation">{tabs.map(({ id, label, short, icon: Icon }) => <button key={id} onClick={() => {setActiveTab(id); window.scrollTo({top: 0, behavior: 'smooth'});}} className={`nav-item ${activeTab === id ? 'active' : ''}`} aria-current={activeTab === id ? 'page' : undefined}><span className="nav-icon"><Icon size={20}/></span><span className="nav-label"><span className="nav-long">{label}</span><span className="nav-short">{short}</span></span></button>)}</nav>
    {notice && <div className="toast" role="status"><Check size={17}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
  </div>;
}
export default App;
