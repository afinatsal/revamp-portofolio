import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isReduced } from '../app/smooth.js'
import { revealEach, initStrokeDraws } from '../app/reveal.js'

gsap.registerPlugin(ScrollTrigger)

const ORDER = ['lentera', 'people-counting', 'visual-inspection', 'rag-chatbot', 'cognitive', 'fluenti', 'ailabs', 'thesis', 'chatbots', 'pneumonia']

function nextOf(slug) {
  const i = ORDER.indexOf(slug)
  return ORDER[(i + 1) % ORDER.length]
}

// Simple horizontal pipeline figure shared by the projects without photos.
function pipeFigure(label, steps) {
  const bw = 250
  const gap = 34
  const x0 = 44
  const y = 128
  const boxH = 150
  const midY = y + boxH / 2
  const n = steps.length
  let s = ''
  s += `<text class="cv-micro cv-dim" x="${x0}" y="56">${label}</text>`
  s += `<line class="cv-rule" x1="${x0}" y1="76" x2="${x0 + n * bw + (n - 1) * gap - 40}" y2="76" data-draw-len="${x0 + n * bw + (n - 1) * gap - 40 - x0}" style="stroke-dasharray:${x0 + n * bw + (n - 1) * gap - 40 - x0};stroke-dashoffset:${x0 + n * bw + (n - 1) * gap - 40 - x0};"></line>`
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (bw + gap)
    const hot = i === 1 || i === 2
    s += `<g><rect class="cv-node${hot ? ' cv-node-hot' : ''}" x="${x}" y="${y}" width="${bw}" height="${boxH}" rx="7"></rect>`
    s += `<text class="cv-micro${hot ? ' cv-accent' : ''}" x="${x + 22}" y="${y + 44}">${steps[i].t}</text>`
    const subY = y + 74
    steps[i].s.forEach((line, j) => {
      s += `<text class="cv-micro cv-dim" x="${x + 22}" y="${subY + j * 26}">${line}</text>`
    })
    s += `</g>`
    if (i < n - 1) {
      const a1 = x + bw
      const a2 = a1 + gap
      const len = gap - 4
      s += `<path class="cv-link-accent" d="M ${a1} ${midY} L ${a1 + len} ${midY}" data-draw-len="${len}" style="stroke-dasharray:${len};stroke-dashoffset:${len}"></path>`
      s += `<circle class="cv-dot" cx="${a1 + 2}" cy="${midY}" r="2.5"></circle>`
    }
  }
  const W = x0 + n * bw + (n - 1) * gap + 44
  return `<svg class="cv-svg" viewBox="0 0 ${W} 360" role="img" aria-label="${label}">
${s}</svg>`
}

const CASES = {
  'people-counting': {
    accent: '#40c8b8',
    label: 'People Counting System',
    title: 'People Counting System · Afin Atsal',
    desc: 'A real-time people counting system built with YOLOv12l and BoT-SORT tracking at X-Camp, PT XLSmart Telecom Sejahtera.',
    lines: ['People', 'Counting'],
    sr: 'Real-time people counting using YOLOv12l and BoT-SORT tracking.',
    summary: 'A real-time crowd analytics module for factory zones. Detect every person with YOLOv12l, track them across frames with BoT-SORT, and count who enters, stays and leaves each zone.',
    facts: {
      client: 'X-Camp, PT XLSmart Telecom Sejahtera',
      role: 'AI Engineer (MBKM)',
      with_: 'YOLOv12l, BoT-SORT, Python',
      year: 'Jan 2026',
    },
    visual: {
      type: 'svg',
      title: 'PEOPLE COUNTING · LIVE PIPELINE',
      caption: 'Detection gives every person, tracking gives every person an identity, zones turn crossings into counts.',
      steps: [
        { t: 'CAMERA STREAM', s: ['factory cameras', 'live video frames'] },
        { t: 'YOLOv12l', s: ['per-frame detection', 'bounding boxes'] },
        { t: 'BoT-SORT', s: ['stable identities', 'no double counting'] },
        { t: 'ZONE COUNT', s: ['crossing rules', 'crowd analytics'] },
      ],
    },
    context: [
      'Under X-Camp Open Lab I worked in a small team shipping AI and IoT demos in weekly Scrum sprints, with stakeholder demos at the end of every sprint. People counting was built so a zone manager could answer one question live: how many people are in this zone right now?',
      'Raw detection alone is not a count. If a person leaves a zone and comes back, the model must not count them twice. Tracking is what makes the number meaningful.',
    ],
    problem: [
      'Cameras already exist on the factory floor, but the footage was only watched after something went wrong. Nobody had a live number for how many people were in a zone, when they arrived, or how long they stayed.',
    ],
    quote: 'A camera that only records is a camera nobody watches.',
    built: [
      { t: 'Object detection', d: 'Localised every person in each frame with YOLOv12l, tuned against real footage rather than a clean benchmark.' },
      { t: 'Multi-object tracking', d: 'BoT-SORT kept stable identities across frames so a single person crossing a boundary is counted exactly once.' },
      { t: 'Zone-based logic', d: 'Worked with the team to define zone rules, then turned boundary crossings into per-zone counts and crowd analytics.' },
      { t: 'Monitoring integration', d: 'Wrapped detection and tracking into a reusable pipeline that feeds the zone-based monitoring flow.' },
    ],
    decisions: [
      { q: 'Why count zones instead of whole scenes?', a: 'People move between loading bays and workstations. A manager cares about one specific zone at one specific time, not a single site-wide number.' },
      { q: 'Why track before counting?', a: 'Without identities, someone who leaves and re-enters is counted twice. Tracking guarantees every count corresponds to a real person.' },
    ],
    results: {
      outcomes: [
        { v: 'YOLOv12l', l: 'detection model, tuned on real footage' },
        { v: 'BoT-SORT', l: 'multi-object tracking for stable counts' },
        { v: 'Scrum', l: 'weekly sprints with stakeholder demos' },
      ],
      closing: [
        'The output feeds a zone-based crowd analytics pipeline, so the number is ready for dashboards and alerts instead of a fresh video review.',
        'This was built as part of the X-Camp MBKM program at PT XLSmart Telecom Sejahtera, in a cross-functional team under Agile-Scrum.',
      ],
    },
  },

  'visual-inspection': {
    accent: '#ff5c28',
    label: 'Visual Inspection System',
    title: 'Visual Inspection System · Afin Atsal',
    desc: 'A production-line QC tool: a CNN flags defective parts from product photos and verdicts stream to a ThingsBoard dashboard in real time.',
    lines: ['Visual', 'Inspection'],
    sr: 'CNN-based visual inspection for production-line defect detection.',
    summary: 'A production-line quality-control tool built over the MBKM X-Camp program. A CNN flags defective parts from product photos, and the verdicts stream into a ThingsBoard dashboard so supervisors can watch the line in real time.',
    facts: {
      client: 'X-Camp, PT XLSmart Telecom Sejahtera',
      role: 'Machine Learning Engineer',
      with_: 'CNN, OpenCV, ThingsBoard',
      year: '2025',
    },
    visual: {
      type: 'img',
      images: [
        { src: '/work/visual-1.jpg', alt: 'Visual inspection screenshot' },
        { src: '/work/visual-2.jpg', alt: 'Visual inspection screenshot' },
        { src: '/work/visual-3.jpg', alt: 'Visual inspection screenshot' },
      ],
      caption: 'Screenshots from the Visual Inspection system.',
    },
    context: [
      'A CNN classifies production-line product photos as defective or not, and every verdict is streamed to a ThingsBoard dashboard. Supervisors read live production status from a screen instead of clipboard sheets.',
      'The same engagement produced an Object Removal Detection system using OpenCV template matching, so safety equipment that goes missing can be caught before a shift starts.',
    ],
    problem: [
      'Defects on a fast production line are easy to miss with the human eye, and a report written at the end of the day is too late to stop the bad batch.',
    ],
    quote: 'A defect caught before the shift ships is worth more than a report after.',
    built: [
      { t: 'Defect detection CNN', d: 'Trained a CNN to classify production-line product photos as defective or not, achieving 99.6% accuracy with 100% recall.' },
      { t: 'Real-time dashboard', d: 'Streamed model output into a ThingsBoard dashboard so supervisors watch the line live.' },
      { t: 'Object removal detection', d: 'Built with OpenCV multi-scale template matching (normalized cross-correlation) to spot missing safety equipment.' },
      { t: 'Status and alert logic', d: 'Wrote the Detected, Partially Blocked and Missing status logic with real-time alerting.' },
    ],
    decisions: [
      { q: 'Why stream verdicts to a dashboard?', a: 'The value is timing. A supervisor watching the line in real time can act on a defect while the line is still running.' },
      { q: 'Why template matching for safety equipment?', a: 'Safety items come from a fixed catalogue. Multi-scale normalized cross-correlation flags a missing item precisely and cheaply, with no training set required.' },
    ],
    results: {
      outcomes: [
        { v: '99.6%', l: 'accuracy with 100% recall on defect detection' },
        { v: '99.6%', l: 'mAP@50 for the detection model' },
        { v: 'Live', l: 'status on the ThingsBoard dashboard, not clipboards' },
      ],
      closing: [
        'Defect verdicts and safety-equipment status now reach the people who can act, in real time, instead of sitting in a review queue.',
        'Built inside the X-Camp MBKM program at PT XLSmart Telecom Sejahtera in weekly Scrum sprints.',
      ],
    },
  },

  'rag-chatbot': {
    accent: '#f5cc08',
    label: 'RAG Boat Ticket Chatbot',
    title: 'RAG Boat Ticket Chatbot · Afin Atsal',
    desc: 'An internal RAG chatbot for boat ticket booking at PT Amman Mineral, with FastAPI, pgvector and Flutter.',
    lines: ['Boat Ticket', 'Chatbot'],
    sr: 'RAG chatbot for boat ticket booking, built with FastAPI, pgvector and Flutter.',
    summary: 'An internal chatbot for the Kayangan to Benete ferry. Workers ask about schedules, free seats and booking steps in plain language, and the answer comes back from real trip data through semantic search.',
    facts: {
      client: 'PT Amman Mineral Internasional',
      role: 'Back-End & AI Engineer',
      with_: 'FastAPI, PGVector, Flutter',
      year: '2025',
    },
    visual: {
      type: 'img',
      images: [
        { src: '/work/rag-1.jpg', alt: 'RAG chatbot screenshot' },
        { src: '/work/rag-2.jpg', alt: 'RAG chatbot screenshot' },
        { src: '/work/rag-3.jpg', alt: 'RAG chatbot screenshot' },
        { src: '/work/rag-4.jpg', alt: 'RAG chatbot screenshot' },
      ],
      caption: 'Screenshots from the RAG chatbot and its Flutter client.',
    },
    context: [
      'A FastAPI backend embeds each question with BGE-M3, retrieves from pgvector, and lets an LLM answer from the retrieved context. The Flutter app turns the same backend into a chat that remembers each session and answers back in the asker\u2019s language.',
      'A second system in the same internship used the same retrieval backbone for different data, which is why the module structure stayed separated from any single feature.',
    ],
    problem: [
      'Ferry questions are full of relative time. Ask about seats for tomorrow, and a naive search matches nothing, because the schedule tables store absolute dates.',
      'An answer also has to sound natural and stay in the employee\u2019s language, Indonesian or English, across a multi-turn conversation.',
    ],
    quote: 'Retrieval only helps if the question finds the right row.',
    built: [
      { t: 'FastAPI RAG backend', d: 'Designed a modular microservices architecture: embed the query with BGE-M3, match it in pgvector, top-k.' },
      { t: 'Time-aware preprocessing', d: 'Added LLM query preprocessing that rewrites relative time references such as tomorrow into absolute dates before retrieval.' },
      { t: 'Session memory', d: 'Kept per-session chat history in PostgreSQL alongside the vector tables for trips and availability.' },
      { t: 'Flutter chat client', d: 'Built a markdown chat UI with animations and validated every endpoint through Postman.' },
    ],
    decisions: [
      { q: 'Why rewrite relative time before retrieval?', a: 'Tomorrow must become a concrete date before the vector search runs, otherwise the embedding never matches the schedule table. This fixes the classic RAG failure on relative time.' },
      { q: 'Why pgvector instead of a full search engine?', a: 'The data already lives in PostgreSQL, and pgvector keeps embeddings next to the trip rows they retrieve, one system to operate.' },
    ],
    results: {
      outcomes: [
        { v: '<2s', l: 'average API latency after initial embedding' },
        { v: 'ID / EN', l: 'bilingual multi-turn conversations' },
        { v: 'Top-k', l: 'semantic retrieval over real trip data' },
      ],
      closing: [
        'Schedule and seat-availability answers come straight from vector semantic search over real trip data, in the asker\u2019s language.',
        'Built during my internship at PT Amman Mineral Internasional and integrated with their internal SuperApps ecosystem.',
      ],
    },
  },

  cognitive: {
    accent: '#a78bfa',
    label: 'Cognitive Performance Prediction',
    title: 'Cognitive Performance Prediction · Afin Atsal',
    desc: 'Predicting exam scores from wearable biosignals (Empatica E4) with a tuned Random Forest, reaching an R² of 0.68.',
    lines: ['Cognitive', 'Performance'],
    sr: 'Predicting exam scores from wearable biosignal data.',
    summary: 'Exam scores are hard to predict, but physiology gives it away. Four biosignals recorded by an Empatica E4 during exams are cleaned, windowed and fed to a tuned Random Forest that lands at an R² of 0.68.',
    facts: {
      client: 'Capstone, FILKOM UB',
      role: 'Data Scientist',
      with_: 'Python, Scikit-learn, Pandas',
      year: '2025',
    },
    visual: {
      type: 'svg',
      title: 'COGNITIVE PERFORMANCE · SIGNAL TO SCORE',
      caption: 'Physiology captured during an exam predicts the score that follows it.',
      steps: [
        { t: 'E4 WEARABLE', s: ['HR · EDA · TEMP · ACC', 'biosignals during exams'] },
        { t: 'PREPROCESSING', s: ['denoise, window', 'segment, normalize'] },
        { t: 'RANDOM FOREST', s: ['tuned regressor', 'physiology to score'] },
        { t: 'PREDICTION', s: ['held-out test', 'R² 0.68'] },
      ],
    },
    context: [
      'Exam stress shows up in the body before it shows up in the grade. The pipeline takes four biosignals, heart rate, electrodermal activity, temperature and acceleration, recorded by an Empatica E4 while students sat an exam.',
      'Signals are denoised, sliced into windows and normalized into features, then a tuned Random Forest Regressor maps those features to the final score.',
    ],
    problem: [
      'Cognitive load and stress are hard to measure directly. A wearable gives a continuous physiological proxy, but raw sensor streams are noisy, high-frequency and not aligned to a meaningful unit.',
    ],
    quote: 'The body answers before the student marks the sheet.',
    built: [
      { t: 'Signal preprocessing', d: 'Denoised, windowed and normalized the raw biosignals into clean features ready for modelling.' },
      { t: 'Predictive model', d: 'Tuned a Random Forest Regressor that maps physiological features to academic performance.' },
      { t: 'Honest evaluation', d: 'Reported R² on a held-out test set rather than on the training data.' },
    ],
    decisions: [
      { q: 'Why predict from physiology instead of study habits?', a: 'A wearable captures the stress actually felt during the exam, which is closer to performance than self-reported habits.' },
      { q: 'Why a Random Forest baseline?', a: 'It is robust to mixed signal features and sets a repeatable baseline any later deep model has to beat.' },
    ],
    results: {
      outcomes: [
        { v: 'R² 0.68', l: 'on the held-out test set' },
        { v: '4', l: 'biosignal channels: HR, EDA, TEMP, ACC' },
        { v: 'E4', l: 'Empatica wearable sensor' },
      ],
      closing: [
        'An R² of 0.68 connects wearable stress signals to academic performance, and the preprocessing pipeline is reusable for the next experiment on the same sensor.',
        'Built as a capstone project with the Big Data Analytics group at FILKOM, Universitas Brawijaya.',
      ],
    },
  },

  fluenti: {
    accent: '#e03a2e',
    label: 'FLUENTI',
    title: 'FLUENTI · Afin Atsal',
    desc: 'An AI grammar checker that fine-tunes LLaMA 3 to reproduce human edits from the Grammarly CoEdit dataset.',
    lines: ['FLUENTI', 'AI grammar'],
    sr: 'FLUENTI, an AI grammar-checking model based on fine-tuned LLaMA 3.',
    summary: 'Grammar correction is an edit problem. FLUENTI fine-tunes LLaMA 3 to reproduce the edits in the Grammarly CoEdit dataset rather than just classifying errors, and scores the result with BLEU and edit distance.',
    facts: {
      client: 'Capstone, FILKOM UB',
      role: 'AI Engineer',
      with_: 'LLaMA 3, Hugging Face, Python',
      year: '2024-25',
    },
    visual: {
      type: 'svg',
      title: 'FLUENTI · GRAMMAR AS EDITS',
      caption: 'The model learns to make the edit a human editor would make, not to describe it.',
      steps: [
        { t: 'INPUT SENTENCE', s: ['raw grammar mistakes', 'noisy learner text'] },
        { t: 'LLaMA 3', s: ['fine-tuned backbone', 'CoEdit alignment'] },
        { t: 'EDIT OUTPUT', s: ['reproduces the fix', 'not a label'] },
        { t: 'EVALUATION', s: ['BLEU + edit distance', 'vs the human edit'] },
      ],
    },
    context: [
      'Grammar correction is usually framed as finding an error. FLUENTI treats it as producing an edit. The model is fine-tuned so its output matches the corrected sentence a human editor wrote in the Grammarly CoEdit dataset.',
      'After cleaning and tokenizing the domain dataset, LLaMA 3 is aligned toward the target edits and scored with BLEU and edit distance instead of gut feel.',
    ],
    problem: [
      'Classifying a sentence as wrong does not fix it. The user needs the corrected sentence, and generic instruction-tuned models are poor at precise phrasing fixes without adaptation.',
    ],
    quote: 'Telling someone their sentence is wrong is not the same as fixing it.',
    built: [
      { t: 'Dataset preparation', d: 'Cleaned and tokenized the Grammarly CoEdit dataset into aligned input and target edits.' },
      { t: 'Fine-tuning', d: 'Fine-tuned LLaMA 3 with an alignment objective toward the target edits.' },
      { t: 'Output scoring', d: 'Scored model outputs with BLEU and edit distance against the human fix.' },
    ],
    decisions: [
      { q: 'Why model the edit instead of the error class?', a: 'The user-facing output is a corrected sentence. Training toward that output makes the model useful directly, not as an intermediate classifier.' },
      { q: 'Why fine-tune a decoder instead of prompt-only?', a: 'Consistent phrasing fixes need weights adapted to the CoEdit distribution; prompt-only models drift on precise edits.' },
    ],
    results: {
      outcomes: [
        { v: 'LLaMA 3', l: 'fine-tuned base model' },
        { v: 'BLEU', l: 'and edit distance for output quality' },
        { v: 'CoEdit', l: 'domain dataset for alignment' },
      ],
      closing: [
        'Model outputs match the human edit, measured by BLEU and edit distance, and the domain fine-tune beats a generic instruction-tuned LLaMA for phrasing fixes.',
        'Built as a capstone project at FILKOM, Universitas Brawijaya, and a ready foundation for a larger grammar-checking product.',
      ],
    },
  },
  ailabs: {
    accent: '#a78bfa',
    label: 'AI Labs',
    title: 'AI Labs · Afin Atsal',
    desc: 'The official studio website for AfinLabs AI Solutions, built with React 19, Vite 8 and Framer Motion.',
    lines: ['AI', 'Labs'],
    sr: 'AI Labs, the official studio website of AfinLabs AI Solutions.',
    summary: 'The official AI Labs website: a studio that deploys AI for businesses, SMEs and individuals. Every system is built until it actually runs in a real environment.',
    facts: { client: 'AfinLabs AI Solutions', role: 'Founder · Developer', with_: 'React 19, Vite 8, Framer Motion', year: '2026' },
    visual: {
      type: 'img',
      images: [
        { src: '/work/ailabs-1.jpg', alt: 'AI Labs website screenshot' },
        { src: '/work/ailabs-2.jpg', alt: 'AI Labs website screenshot' },
        { src: '/work/ailabs-3.jpg', alt: 'AI Labs website screenshot' },
      ],
      caption: 'Screenshots from the AI Labs studio website.',
    },
    context: [
      'The site presents six services: company and SME chatbots, personal AI assistants, computer-vision CCTV detectors, machine-learning contract work and AI-agent setup classes.',
      'Editorial typography with Bricolage Grotesque and IBM Plex, an asymmetric bento layout for the services, and a project list with a draggable rotating carousel.',
    ],
    problem: [
      'AI services are abstract until they are shown working. The site had to make six different offerings feel concrete and trustworthy in one page.',
    ],
    quote: 'Show the work, not just the offer.',
    built: [
      { t: 'Hero reveal', d: 'A front image layer that peels away under the cursor on the opening section.' },
      { t: 'Services bento', d: 'Six services in an asymmetric bento grid with editorial typography.' },
      { t: 'Project carousel', d: 'An interactive project list with a draggable, rotating photo carousel.' },
      { t: 'Contact flow', d: 'Contact section with email, WhatsApp and social profiles for direct engagement.' },
    ],
    decisions: [
      { q: 'Why a studio site separate from this portfolio?', a: 'AfinLabs is the business facing clients; this portfolio is the personal story. Each needs its own voice.' },
      { q: 'Why an asymmetric bento layout?', a: 'Six equal cards feel like a catalogue. An asymmetric grid gives each service its own presence and hierarchy.' },
    ],
    results: {
      outcomes: [
        { v: '6', l: 'AI services presented on one page' },
        { v: 'ID / EN', l: 'bilingual content' },
        { v: 'Vercel', l: 'live at afinailabs.vercel.app' },
      ],
      closing: [
        'Built with React 19, Vite 8, Tailwind CSS 4 and Framer Motion, and auto-deployed by Vercel.',
        'Live at afinailabs.vercel.app.',
      ],
    },
  },

  thesis: {
    accent: '#4a7cff',
    label: 'Multi-Stage Waste Detection',
    title: 'Multi-Stage Waste Detection · Afin Atsal',
    desc: 'Bachelor thesis: a two-stage waste detection model using YOLOv12 and a hierarchical sequential classification network.',
    lines: ['Waste', 'Detection'],
    sr: 'Multi-stage waste detection based on YOLOv12 and hierarchical multi-label classification.',
    summary: 'My bachelor thesis. YOLOv12 localizes each waste object, then a hierarchical network assigns a three-level label across a waste hierarchy, trained on 2,116 curated images with 2,582 boxes.',
    facts: { client: 'Thesis · Universitas Brawijaya', role: 'Lead Researcher · ML Engineer', with_: 'PyTorch, YOLOv12, HSCN', year: '2026' },
    visual: {
      type: 'img',
      images: [
        { src: '/work/thesis-arch.jpg', alt: 'Pipeline architecture diagram' },
        { src: '/work/thesis-1.png', alt: 'Thesis system screenshot' },
        { src: '/work/thesis-2.png', alt: 'Thesis system screenshot' },
        { src: '/work/thesis-3.png', alt: 'Thesis system screenshot' },
        { src: '/work/thesis-4.jpg', alt: 'Thesis system screenshot' },
        { src: '/work/thesis-5.jpg', alt: 'Thesis system screenshot' },
        { src: '/work/thesis-6.jpg', alt: 'Thesis system screenshot' },
      ],
      caption: 'Pipeline architecture and results from the waste detection system.',
    },
    context: [
      'Municipal waste is hard for one model to detect and classify at once. The thesis splits the problem: YOLOv12 finds each object, then an HSCN network assigns a three-level label covering management status, material type and specific object.',
      'Trained on 2,116 images with 2,582 boxes gathered from TrashNet, Kaggle, TACO and RealWaste, with detection reaching an F1-score of 0.844 and classification 0.967 mAP.',
    ],
    problem: [
      'A single end-to-end classifier struggles with scale and clutter. Detecting first relieves the classifier of those problems, but the hierarchy must stay honest on images that are only partially annotated.',
    ],
    quote: 'Detect first, then decide.',
    built: [
      { t: 'Two-stage pipeline', d: 'Compared three YOLOv12 variants for detection, then benchmarked six HSCN backbones from ResNet to ConvNeXt and MobileNet.' },
      { t: 'Three-level hierarchy', d: 'Designed a hierarchy with a STOP class so partially annotated images never force a wrong label.' },
      { t: 'Inference app', d: 'Built a Flask inference app with a backbone-comparison mode for the thesis defense.' },
    ],
    decisions: [
      { q: 'Why two stages instead of one big classifier?', a: 'Detecting first removes scale and clutter, so the classifier only sees one clean object at a time.' },
      { q: 'Why a STOP class in the hierarchy?', a: 'Partially annotated images are common in waste data. The STOP class lets the model say I cannot know instead of guessing wrong.' },
    ],
    results: {
      outcomes: [
        { v: '0.844', l: 'F1-score on the detection stage' },
        { v: '0.967', l: 'mAP on hierarchical classification' },
        { v: '2,116', l: 'images · 2,582 annotated boxes' },
      ],
      closing: [
        'The two-stage design beat end-to-end classifiers, and the Flask demo app made the defense interactive: one click to compare backbones live.',
        'Code is available on GitHub at afinatsal/waste-detection-yolov12-hscn.',
      ],
    },
  },

  chatbots: {
    accent: '#e03a2e',
    label: 'Chatbots Platform',
    title: 'Chatbots Platform · Afin Atsal',
    desc: 'A collection of AI chatbots sharing one RAG engine, built by AfinLabs AI Solutions.',
    lines: ['Chatbot', 'Platform'],
    sr: 'Chatbots Platform, one RAG engine powering many bots.',
    summary: 'A collection of AI agents built by AfinLabs AI Solutions. Every bot shares a single RAG engine following a one engine, many projects pattern, with WhatsApp and Telegram as channels.',
    facts: { client: 'AfinLabs AI Solutions', role: 'Founder · System Architect', with_: 'FastAPI, Supabase, pgvector', year: '2026' },
    visual: {
      type: 'img',
      images: [
        { src: '/work/chatbots-1.png', alt: 'Chatbots platform screenshot' },
        { src: '/work/chatbots-2.png', alt: 'Chatbots platform screenshot' },
        { src: '/work/chatbots-3.png', alt: 'Chatbots platform screenshot' },
        { src: '/work/chatbots-4.png', alt: 'Chatbots platform screenshot' },
        { src: '/work/chatbots-5.png', alt: 'Chatbots platform screenshot' },
        { src: '/work/chatbots-6.png', alt: 'Chatbots platform screenshot' },
      ],
      caption: 'Screenshots from the Chatbots platform and its admin dashboard.',
    },
    context: [
      'A sales agent for AfinLabs, a campus website chatbot and a florist catalogue bot all run on the same engine. Adding a bot is a single project folder, auto-discovered by the registry, with no core changes.',
      'WhatsApp and Telegram act as channels on top of the same engine, with an admin dashboard for projects, data, conversations and analytics.',
    ],
    problem: [
      'Repeating the same RAG plumbing for every client bot does not scale. Each bot needs retrieval, memory, channels and an admin view, but the differences between bots are smaller than their similarities.',
    ],
    quote: 'One engine, many bots.',
    built: [
      { t: 'Shared engine', d: 'One RAG engine in shared/ powers every bot; each bot is just a project folder under projects/.' },
      { t: 'Hybrid retrieval', d: 'Supabase + pgvector with multilingual embeddings, plus a keyword fallback on titles for hard queries.' },
      { t: 'Channels', d: 'WhatsApp via webhook and Telegram via polling share the same engine.' },
      { t: 'Admin dashboard', d: 'Data ingestion, conversation takeover, analytics and server control from one dashboard.' },
    ],
    decisions: [
      { q: 'Why a shared engine per bot?', a: 'Bot behaviour differs by knowledge base and prompts, not by plumbing. A registry of projects keeps each client isolated without forking the core.' },
      { q: 'Why hybrid retrieval?', a: 'Semantic search misses exact titles and codes; a keyword fallback on titles catches the queries embeddings fail on.' },
    ],
    results: {
      outcomes: [
        { v: '3', l: 'bots on the same engine (and growing)' },
        { v: 'WA / Tg', l: 'WhatsApp and Telegram channels' },
        { v: 'v1', l: 'first version, still in active development' },
      ],
      closing: [
        'A new bot is another project folder, so the cost of onboarding a client drops to data and prompt work.',
        'Source is not published yet.',
      ],
    },
  },

  pneumonia: {
    accent: '#40c8b8',
    label: 'Pneumonia X-Ray Detection',
    title: 'Pneumonia X-Ray Detection · Afin Atsal',
    desc: 'A chest X-ray classifier for pneumonia built on an imbalanced public dataset with a custom CNN.',
    lines: ['Pneumonia', 'X-Ray'],
    sr: 'Pneumonia detection from chest X-ray images.',
    summary: 'A chest X-ray classifier for pneumonia. Instead of letting the model coast on the majority class, the CNN leans on dropout and batch normalization to stay above 92% validation accuracy.',
    facts: { client: 'Personal project', role: 'AI Engineer', with_: 'TensorFlow, Keras, OpenCV', year: '2024' },
    visual: {
      type: 'svg',
      title: 'PNEUMONIA · X-RAY TO DIAGNOSIS',
      caption: 'A custom CNN that has to stay honest on an imbalanced dataset.',
      steps: [
        { t: 'X-RAY INPUT', s: ['chest radiographs', 'public dataset'] },
        { t: 'PREPROCESS', s: ['normalize, augment', 'rebalance classes'] },
        { t: 'CNN · DROPOUT · BN', s: ['custom architecture', 'regularized training'] },
        { t: 'VERDICT', s: ['pneumonia / normal', '92%+ validation'] },
      ],
    },
    context: [
      'Medical datasets are rarely balanced. The pneumonia X-ray set is skewed toward the majority class, so a naive model learns to say no and still scores well.',
      'The CNN counteracts this with dropout and batch normalization, and training is tracked through learning curves and confusion matrices to see where the model actually makes mistakes.',
    ],
    problem: [
      'An imbalanced dataset rewards a lazy classifier. The model has to be judged on the minority, harder-to-see pneumonia cases, not on overall accuracy.',
    ],
    quote: 'On a skewed dataset, accuracy alone lies.',
    built: [
      { t: 'Data pipeline', d: 'Normalized, augmented and rebalanced the X-ray data before training.' },
      { t: 'Regularized CNN', d: 'Designed a custom CNN with dropout and batch normalization to fight overfitting.' },
      { t: 'Diagnostic tracking', d: 'Tracked learning curves and confusion matrices to find where mistakes concentrate.' },
    ],
    decisions: [
      { q: 'Why dropout and batch normalization?', a: 'A small CNN overfits fast on medical images. Regularization keeps validation accuracy honest on the minority class.' },
      { q: 'Why rebalance instead of weighting the loss?', a: 'Augmentation of the rare class gives the model more diverse examples of pneumonia instead of only upweighting the same few.' },
    ],
    results: {
      outcomes: [
        { v: '92%+', l: 'validation accuracy, stable on imbalanced data' },
        { v: 'CNN', l: 'custom architecture with dropout and batch norm' },
        { v: 'CM', l: 'confusion matrices guide error analysis' },
      ],
      closing: [
        'False positives concentrate on the tricky interstitial cases, which is exactly where a radiologist would hesitate too.',
        'Code is available on GitHub at afinatsal/pneumonia-xray-detection.',
      ],
    },
  },

}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildArticle(slug) {
  const c = CASES[slug]
  const accent = c.accent
  const next = nextOf(slug)

  const esc = escapeHtml

  const facts = [
    ['Client', c.facts.client],
    ['Role', c.facts.role],
    ['With', c.facts.with_],
    ['Year', c.facts.year],
  ]
    .map(
      ([k, v]) =>
        `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`,
    )
    .join('')

  let visual = ''
  if (c.visual.type === 'svg') {
    const fig = pipeFigure(c.visual.title, c.visual.steps)
    visual = `<figure class="cv">${fig}<figcaption class="cv-caption">${esc(c.visual.caption)}</figcaption></figure>`
  } else {
    const slides = c.visual.images
      .map(
        (im, i) =>
          `<figure class="c-slide" data-slide="${i}"><img src="${im.src}" alt="${esc(im.alt)}" loading="lazy" draggable="false" /></figure>`,
      )
      .join('')
    const dots = c.visual.images
      .map((_, i) => `<button type="button" class="c-dot${i === 0 ? ' is-active' : ''}" data-dot="${i}" aria-label="Go to slide ${i + 1}"></button>`)
      .join('')
    const arrow = (dir) =>
      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'}"/></svg>`
    visual = `
      <div class="c-carousel" data-carousel>
        <div class="c-viewport">
          <div class="c-track">${slides}</div>
        </div>
        <div class="c-ui">
          <button type="button" class="c-btn" data-prev aria-label="Previous">${arrow('prev')}</button>
          <div class="c-nav">
            <div class="c-dots">${dots}</div>
            <span class="c-count" aria-live="polite"></span>
          </div>
          <button type="button" class="c-btn" data-next aria-label="Next">${arrow('next')}</button>
        </div>
      </div>
      <figcaption class="cv-caption">${esc(c.visual.caption)}</figcaption>`
  }

  const block = (label, paras) =>
    `<section class="cs-block container"><h2 class="label cs-reveal">${esc(label)}</h2><div class="cs-prose">${paras
      .map((p) => `<p class="cs-reveal">${p}</p>`)
      .join('')}</div></section>`

  const quote = c.quote
    ? `<section class="cs-quote container cs-reveal"><blockquote>${esc(c.quote)}</blockquote></section>`
    : ''

  const built = `<section class="cs-block container"><h2 class="label cs-reveal">What I built</h2><ol class="cs-work">${c.built
    .map(
      (w, i) =>
        `<li class="cs-work-item cs-reveal"><span class="cs-work-index">${String(i + 1).padStart(2, '0')}</span><div><h3 class="cs-work-title">${esc(w.t)}</h3><p>${esc(w.d)}</p></div></li>`,
    )
    .join('')}</ol></section>`

  const decisions = c.decisions
    ? `<section class="cs-block container"><h2 class="label cs-reveal">Decisions</h2><dl class="cs-decisions">${c.decisions
        .map(
          (d) =>
            `<div class="cs-decision cs-reveal"><dt>${esc(d.q)}</dt><dd>${esc(d.a)}</dd></div>`,
        )
        .join('')}</dl></section>`
    : ''

  const results = `<section class="cs-results container"><h2 class="label cs-reveal">Results</h2><ul class="cs-outcomes">${c.results.outcomes
    .map(
      (o) =>
        `<li class="cs-outcome cs-reveal"><span class="cs-outcome-value">${esc(o.v)}</span><span class="cs-outcome-label">${esc(o.l)}</span></li>`,
    )
    .join('')}</ul><div class="cs-closing">${c.results.closing
    .map((p) => `<p class="cs-reveal">${p}</p>`)
    .join('')}</div></section>`

  const nextHtml = (() => {
    const nc = next === 'lentera' ? { label: 'Lentera', accent: '#4a7cff' } : CASES[next]
    if (!nc) return ''
    return `<nav class="cs-next container" aria-label="Next project"><a class="cs-next-link" href="/work/${next}" data-label="${esc(nc.label)}" data-accent="${accent}" ${next === 'lentera' ? '' : 'data-todo="1"'}><span class="label">Next</span><span class="cs-next-title">${esc(nc.label)}</span></a></nav>`
  })()

  return `<article class="cs" style="--accent: ${accent};">
  <header class="cs-head container">
    <a class="cs-back link" href="/" data-back>← Work</a>
    <h1 class="cs-title">
      <span class="sr-only">${esc(c.sr)}</span>
      <span aria-hidden="true">
        <span class="cs-title-line"><span class="cs-title-inner">${esc(c.lines[0])}</span></span>
        <span class="cs-title-line"><span class="cs-title-inner">${esc(c.lines[1])}</span></span>
      </span>
    </h1>
    <p class="cs-summary">${esc(c.summary)}</p>
    <dl class="cs-facts">${facts}</dl>
  </header>
  <div class="cs-visual cs-visual-bleed cs-reveal">${visual}</div>
  ${block('Context', c.context)}
  ${c.problem ? block('The problem', c.problem) : ''}
  ${quote}
  ${built}
  ${decisions}
  ${results}
  ${nextHtml}
</article>`
}

export function initCarousels(root) {
  const reduced = isReduced()
  const cleans = []

  root.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.c-track')
    const slides = carousel.querySelectorAll('.c-slide')
    const dots = carousel.querySelectorAll('.c-dot')
    const countEl = carousel.querySelector('.c-count')
    const prev = carousel.querySelector('[data-prev]')
    const next = carousel.querySelector('[data-next]')
    if (!track || !slides.length) return

    const total = slides.length
    let idx = 0
    let activeTween = null

    const pad = (n) => String(n + 1).padStart(2, '0')
    const paint = () => {
      if (activeTween) activeTween.kill()
      if (reduced) {
        track.style.transform = `translate3d(${-idx * 100}%, 0, 0)`
      } else {
        activeTween = gsap.to(track, { xPercent: -100 * idx, duration: 0.8, ease: 'expo.out' })
      }
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx))
      if (countEl) countEl.textContent = `${pad(idx)} / ${pad(total - 1)}`
    }

    const go = (to) => {
      idx = (to + total) % total
      paint()
    }

    const onPrev = () => go(idx - 1)
    const onNext = () => go(idx + 1)
    const onDot = (e) => {
      const b = e.target.closest('[data-dot]')
      if (b) go(Number(b.dataset.dot))
    }

    prev && prev.addEventListener('click', onPrev)
    next && next.addEventListener('click', onNext)
    dots && dots.forEach((d) => d.addEventListener('click', onDot))

    // light swipe support (mouse + touch)
    let dragging = false
    let startX = 0
    const onDown = (e) => {
      dragging = true
      startX = e.clientX
      carousel.classList.add('is-dragging')
    }
    const onUp = (e) => {
      if (!dragging) return
      dragging = false
      carousel.classList.remove('is-dragging')
      const dx = e.clientX - startX
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1))
    }
    track.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    paint()

    cleans.push(() => {
      if (activeTween) activeTween.kill()
      prev && prev.removeEventListener('click', onPrev)
      next && next.removeEventListener('click', onNext)
      dots && dots.forEach((d) => d.removeEventListener('click', onDot))
      track.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    })
  })

  return () => cleans.forEach((fn) => fn())
}

function mountCase(root) {
  const reduced = isReduced()
  const ctx = gsap.context(() => {}, root)
  const cleanupCarousels = initCarousels(root)

  const lines = root.querySelectorAll('.cs-title-line .cs-title-inner')
  if (!reduced && lines.length) {
    gsap.set(lines, { yPercent: 110 })
    ctx.add(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } }).to(lines, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.15)
    })
  }

  if (!reduced) {
    ctx.add(() => {
      revealEach(root, '.cs-reveal', 32, 'top 88%')
      initStrokeDraws(root)
    })
  } else {
    initStrokeDraws(root)
  }

  const refresh = () => ScrollTrigger.refresh()
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)

  return () => {
    ctx.revert()
    cleanupCarousels()
  }
}

export function caseModule(slug) {  const c = CASES[slug]
  if (!c) return null
  return {
    html: buildArticle(slug),
    label: c.label,
    accent: c.accent,
    title: c.title,
    desc: c.desc,
    mount: mountCase,
  }
}
