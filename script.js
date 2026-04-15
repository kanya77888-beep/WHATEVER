/* ========================================
   PaperLens — Script
   ======================================== */

// --- Sample paper text ---
const SAMPLE_PAPER = `This paper introduces a novel method for AI paper evaluation using large language models. The structure of our framework leverages a zero-shot learning approach. While previous methodologies relied heavily on human annotations, our system automates the processing phase. The dataset utilized for this study contains 50 samples of abstract texts. Results indicate a 10% improvement in task completion speed, though accuracy varies by domain. Future work will aim to expand the dataset and fine-tune the model parameters.`;

// --- Review criteria config ---
const CRITERIA = [
    { name: 'Clarity & Writing Quality', emoji: '📝', key: 'clarity' },
    { name: 'Novelty / Originality', emoji: '💡', key: 'novelty' },
    { name: 'Technical Soundness', emoji: '⚙️', key: 'technical' },
    { name: 'Methodology & Rigor', emoji: '🔬', key: 'methodology' },
    { name: 'Significance / Impact', emoji: '⚡', key: 'significance' },
    { name: 'Structure & Organization', emoji: '📋', key: 'structure' },
    { name: 'Literature & References', emoji: '📚', key: 'literature' },
];

// ===== DOM Elements =====
const paperInput = document.getElementById('paperInput');
const charCount = document.getElementById('charCount');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const clearBtn = document.getElementById('clearBtn');
const reviewBtn = document.getElementById('reviewBtn');
const outputEmpty = document.getElementById('outputEmpty');
const outputLoading = document.getElementById('outputLoading');
const outputResults = document.getElementById('outputResults');
const resultsSummary = document.getElementById('resultsSummary');
const resultsCriteria = document.getElementById('resultsCriteria');
const copyResultBtn = document.getElementById('copyResultBtn');
const navbar = document.getElementById('navbar');

// ===== Background Particles =====
function createParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#818cf8', '#c084fc', '#f472b6', '#34d399', '#38bdf8'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(particle);
    }
}

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Stat Counter Animation =====
function animateCounters() {
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    statValues.forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 50);
    });
}

// ===== Intersection Observer for Animations =====
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .step-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${el.dataset.delay || 0}ms, transform 0.6s ease ${el.dataset.delay || 0}ms`;
        observer.observe(el);
    });
}

// ===== Character Counter =====
paperInput.addEventListener('input', () => {
    const len = paperInput.value.length;
    charCount.textContent = `${len.toLocaleString()} character${len !== 1 ? 's' : ''}`;
});

// ===== Load Sample =====
loadSampleBtn.addEventListener('click', () => {
    paperInput.value = SAMPLE_PAPER;
    paperInput.dispatchEvent(new Event('input'));
    showToast('✅ Sample paper loaded!');
});

// ===== Clear =====
clearBtn.addEventListener('click', () => {
    paperInput.value = '';
    paperInput.dispatchEvent(new Event('input'));
    outputEmpty.style.display = 'flex';
    outputLoading.style.display = 'none';
    outputResults.style.display = 'none';
    copyResultBtn.style.display = 'none';
});

// ===== Review Button =====
reviewBtn.addEventListener('click', () => {
    const text = paperInput.value.trim();
    if (!text) {
        showToast('⚠️ Please paste your paper first!', true);
        paperInput.focus();
        return;
    }
    if (text.length < 50) {
        showToast('⚠️ Please provide at least 50 characters for a meaningful review.', true);
        return;
    }
    runReview(text);
});

// ===== Simulated Review Engine =====
// (In production, this would call the Gemini API via a backend)
function runReview(text) {
    // Show loading
    outputEmpty.style.display = 'none';
    outputLoading.style.display = 'flex';
    outputResults.style.display = 'none';
    copyResultBtn.style.display = 'none';

    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
    ];

    // Reset steps
    steps.forEach(s => { s.className = 'loading-step'; });
    steps[0].classList.add('active');

    // Animate steps
    setTimeout(() => { steps[0].classList.replace('active', 'done'); steps[1].classList.add('active'); }, 800);
    setTimeout(() => { steps[1].classList.replace('active', 'done'); steps[2].classList.add('active'); }, 1800);
    setTimeout(() => { steps[2].classList.replace('active', 'done'); }, 2500);

    // Generate results after "analysis"
    setTimeout(() => {
        const results = generateReview(text);
        displayResults(results);
    }, 3000);
}

function generateReview(text) {
    // Smart heuristic-based review (simulating AI output)
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgSentenceLen = wordCount / Math.max(sentenceCount, 1);
    const hasAbstract = /abstract/i.test(text);
    const hasConclusion = /conclusion|future work/i.test(text);
    const hasMethodology = /method|approach|framework|algorithm/i.test(text);
    const hasResults = /result|finding|performance|accuracy|improvement/i.test(text);
    const hasReferences = /reference|\[\d+\]|et al\./i.test(text);
    const hasNovelty = /novel|new|propose|introduce|first|innovative/i.test(text);
    const hasData = /dataset|data|sample|experiment/i.test(text);
    const uniqueWords = new Set(text.toLowerCase().match(/\b[a-z]+\b/g) || []).size;
    const lexicalDiversity = uniqueWords / Math.max(wordCount, 1);

    const scores = {};
    const reasons = {};
    const suggestions = {};

    // Clarity
    let clarity = 3;
    if (avgSentenceLen < 20) clarity += 0.5;
    if (avgSentenceLen > 30) clarity -= 0.5;
    if (lexicalDiversity > 0.6) clarity += 0.5;
    if (wordCount > 200) clarity += 0.3;
    scores.clarity = Math.max(1, Math.min(5, Math.round(clarity * 10) / 10));
    reasons.clarity = avgSentenceLen < 25
        ? 'Writing is generally clear with manageable sentence lengths. The text flows reasonably well.'
        : 'Some sentences are overly long and complex, which may reduce readability for a broad audience.';
    suggestions.clarity = 'Consider varying sentence structure more and adding transition phrases between key ideas.';

    // Novelty
    let novelty = 2.5;
    if (hasNovelty) novelty += 1;
    if (hasMethodology) novelty += 0.5;
    scores.novelty = Math.max(1, Math.min(5, Math.round(novelty * 10) / 10));
    reasons.novelty = hasNovelty
        ? 'The paper claims a novel contribution, though the degree of novelty could be better substantiated with comparisons.'
        : 'The paper does not clearly articulate what is new or different about the proposed approach.';
    suggestions.novelty = 'Explicitly state what distinguishes this work from prior art. A comparison table would strengthen claims of novelty.';

    // Technical
    let technical = 3;
    if (hasResults) technical += 0.5;
    if (hasData) technical += 0.5;
    if (hasMethodology) technical += 0.3;
    scores.technical = Math.max(1, Math.min(5, Math.round(technical * 10) / 10));
    reasons.technical = hasResults
        ? 'Results are mentioned but lack detailed statistical analysis. Claims could be more rigorously supported.'
        : 'The paper lacks quantitative results to support its claims, weakening the technical foundation.';
    suggestions.technical = 'Include confidence intervals, significance tests, or ablation studies to strengthen technical claims.';

    // Methodology
    let methodology = 2.5;
    if (hasMethodology) methodology += 0.8;
    if (hasData) methodology += 0.5;
    if (wordCount > 300) methodology += 0.3;
    scores.methodology = Math.max(1, Math.min(5, Math.round(methodology * 10) / 10));
    reasons.methodology = hasMethodology
        ? 'A methodology is described but lacks depth. Key details about experimental setup may be missing.'
        : 'The methodology section is insufficient — no clear research design or experimental protocol is described.';
    suggestions.methodology = 'Provide detailed steps of your methodology, including hyperparameters, evaluation metrics, and reproducibility details.';

    // Significance
    let significance = 2.5;
    if (hasResults) significance += 0.5;
    if (hasNovelty) significance += 0.5;
    if (/impact|important|significant|advance/i.test(text)) significance += 0.5;
    scores.significance = Math.max(1, Math.min(5, Math.round(significance * 10) / 10));
    reasons.significance = 'The potential impact is moderate. The work addresses a relevant topic but broader implications are not clearly discussed.';
    suggestions.significance = 'Discuss the broader implications of your findings and how they could influence future research or applications.';

    // Structure
    let structure = 3;
    if (hasAbstract) structure += 0.5;
    if (hasConclusion) structure += 0.5;
    if (sentenceCount > 5) structure += 0.3;
    scores.structure = Math.max(1, Math.min(5, Math.round(structure * 10) / 10));
    reasons.structure = hasConclusion
        ? 'The paper follows a reasonable structure with identifiable sections, though transitions could be smoother.'
        : 'The paper structure is basic. Key sections like a detailed conclusion or discussion appear to be missing.';
    suggestions.structure = 'Follow the standard IMRaD format (Introduction, Methods, Results, Discussion) for better organization.';

    // Literature
    let literature = 2;
    if (hasReferences) literature += 1.5;
    if (/previous|prior|existing|literature/i.test(text)) literature += 0.5;
    scores.literature = Math.max(1, Math.min(5, Math.round(literature * 10) / 10));
    reasons.literature = hasReferences
        ? 'Some references are included but the literature review could be more comprehensive.'
        : 'No formal references or citations are present. The work lacks grounding in existing literature.';
    suggestions.literature = 'Add a thorough literature review section citing at least 15-20 relevant, recent papers in the field.';

    return { scores, reasons, suggestions };
}

function displayResults(results) {
    const { scores, reasons, suggestions } = results;

    // Calculate overall
    const allScores = Object.values(scores);
    const overall = (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1);

    // Summary
    let verdict = 'Needs Improvement';
    let verdictDesc = 'The paper requires significant revisions across multiple criteria before it can be considered for publication.';
    if (overall >= 4) {
        verdict = 'Strong Paper';
        verdictDesc = 'This paper demonstrates strong quality across most criteria. Minor revisions recommended.';
    } else if (overall >= 3) {
        verdict = 'Moderate Quality';
        verdictDesc = 'The paper has a solid foundation but needs improvements in several areas. Consider a major revision.';
    }

    resultsSummary.innerHTML = `
        <div class="overall-score">
            <div class="score-circle">${overall}</div>
            <span class="score-label">Overall</span>
        </div>
        <div class="summary-text">
            <h3>${verdict}</h3>
            <p>${verdictDesc}</p>
        </div>
    `;

    // Criteria cards
    resultsCriteria.innerHTML = '';
    CRITERIA.forEach((criterion, index) => {
        const score = scores[criterion.key];
        const reason = reasons[criterion.key];
        const suggestion = suggestions[criterion.key];
        const scoreClass = score >= 4 ? 'score-high' : score >= 3 ? 'score-mid' : 'score-low';
        const barWidth = (score / 5) * 100;

        const card = document.createElement('div');
        card.className = 'criteria-card';
        card.style.animationDelay = `${index * 100}ms`;
        card.innerHTML = `
            <div class="criteria-header">
                <div class="criteria-name">
                    <span class="criteria-emoji">${criterion.emoji}</span>
                    ${criterion.name}
                </div>
                <span class="criteria-score-badge ${scoreClass}">${score}/5</span>
            </div>
            <div class="criteria-bar">
                <div class="criteria-bar-fill" style="width: 0%;" data-width="${barWidth}"></div>
            </div>
            <div class="criteria-feedback">
                <div class="feedback-section">
                    <div class="feedback-label">Assessment</div>
                    <p>${reason}</p>
                </div>
                <div class="feedback-section">
                    <div class="feedback-label">Suggestion</div>
                    <p>${suggestion}</p>
                </div>
            </div>
        `;
        resultsCriteria.appendChild(card);
    });

    // Show results
    outputLoading.style.display = 'none';
    outputResults.style.display = 'block';
    copyResultBtn.style.display = 'flex';

    // Animate bars
    requestAnimationFrame(() => {
        document.querySelectorAll('.criteria-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    });
}

// ===== Copy Results =====
copyResultBtn.addEventListener('click', () => {
    const text = outputResults.innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Results copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy.', true);
    });
});

// ===== Toast =====
function showToast(message, isError = false) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    animateCounters();
    setupScrollAnimations();
});
