/* ========================================
   DecisionFlow — Core Application Logic
   ======================================== */

// --- Configuration ---
let GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || "";
const SUPABASE_URL = ""; // To be filled by user
const SUPABASE_KEY = ""; // To be filled by user

// --- State ---
let selectedFile = null;
let extractedText = "";
let chartInstance = null;

// --- DOM Elements ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const scopeInput = document.getElementById('scopeInput');
const processBtn = document.getElementById('processBtn');
const processingOverlay = document.getElementById('processingOverlay');
const dashboard = document.getElementById('dashboard');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('uploadProgress');
const progressText = document.getElementById('progressText');

const configOverlay = document.getElementById('configOverlay');
const geminiKeyInput = document.getElementById('geminiApiKey');
const saveConfigBtn = document.getElementById('saveConfigBtn');

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    checkConfig();
    setupEventListeners();
});

function checkConfig() {
    if (!GEMINI_API_KEY) {
        configOverlay.style.display = 'flex';
    }
}

function setupEventListeners() {
    // Config
    saveConfigBtn.addEventListener('click', () => {
        const key = geminiKeyInput.value.trim();
        if (key) {
            GEMINI_API_KEY = key;
            localStorage.setItem('gemini_api_key', key);
            configOverlay.style.display = 'none';
            showToast("✅ API Key Saved");
        }
    });

    // File Upload Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-indigo)';
        dropZone.style.background = 'rgba(15, 76, 129, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border-subtle)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // Process Button
    processBtn.addEventListener('click', startProcessing);
}

// ===== File Handling =====
async function handleFile(file) {
    selectedFile = file;
    dropZone.innerHTML = `
        <div class="upload-icon">📄</div>
        <h3>${file.name}</h3>
        <p>Size: ${(file.size / 1024).toFixed(1)} KB</p>
        <button class="btn btn-secondary" onclick="document.getElementById('fileInput').click()">Change File</button>
    `;

    // Reset progress
    progressContainer.style.display = 'block';
    updateProgress(0, "Ready to process");
}

function updateProgress(percent, text) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
}

async function startProcessing() {
    if (!selectedFile) {
        showToast("⚠️ Please upload a file first", true);
        return;
    }
    if (!GEMINI_API_KEY) {
        configOverlay.style.display = 'flex';
        return;
    }

    try {
        processingOverlay.style.display = 'flex';
        updateProgress(20, "Extracting text...");

        // 1. Extract Text
        extractedText = await extractTextFromFile(selectedFile);
        updateProgress(40, "Preparing AI analysis...");

        // 2. Call AI
        const scope = scopeInput.value.trim() || "General Data Analysis";
        const analysisResults = await callGeminiAI(extractedText, scope);
        updateProgress(80, "Visualizing insights...");

        // 3. Render Dashboard
        renderDashboard(analysisResults);
        
        updateProgress(100, "Analysis Complete");
        setTimeout(() => {
            processingOverlay.style.display = 'none';
            dashboard.style.display = 'block';
            dashboard.scrollIntoView({ behavior: 'smooth' });
        }, 500);

    } catch (error) {
        console.error(error);
        processingOverlay.style.display = 'none';
        showToast("❌ Error: " + error.message, true);
    }
}

async function extractTextFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(" ") + "\n";
                    }
                    resolve(fullText);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    } else if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(firstSheet);
                resolve(JSON.stringify(json, null, 2));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    throw new Error("Unsupported file format");
}

// ===== AI Integration =====
async function callGeminiAI(text, scope) {
    const prompt = `
        Analyze the following data within the scope of "${scope}".
        Provide a structured JSON response with the following fields:
        {
          "summary": "Short professional executive summary",
          "extractConfidence": 0.95,
          "costConfidence": 0.88,
          "riskConfidence": 0.76,
          "entities": [
            {"entity": "Entity Name", "category": "Category", "value": "Value", "confidence": 0.9}
          ],
          "riskData": [10, 20, 30, 40] 
        }
        IMPORTANT: Return ONLY the JSON object. No preamble, no postamble, no markdown markers.
        Data: ${text.substring(0, 10000)}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }
    
    const resData = await response.json();
    if (!resData.candidates || !resData.candidates[0]) throw new Error("AI returned an empty response.");
    
    const resultText = resData.candidates[0].content.parts[0].text;
    
    // Clean JSON from markdown if exists
    const cleanJson = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanJson);
    } catch (e) {
        console.log("Raw AI Response:", resultText);
        throw new Error("Failed to parse AI response. The data may be too complex or the AI reached a safety limit.");
    }
}

// ===== Dashboard Rendering =====
function renderDashboard(data) {
    // 1. Text Summary
    document.getElementById('summaryText').innerHTML = `<p>${data.summary}</p>`;
    document.getElementById('dashboardSubtitle').textContent = `Analysis conducted on ${new Date().toLocaleDateString()}`;

    // 2. Confidence Scores
    animateScore('extractConfidence', data.extractConfidence * 100);
    animateScore('costConfidence', data.costConfidence * 100);
    animateScore('riskConfidence', data.riskConfidence * 100);

    // 3. Entities Table
    const tbody = document.querySelector('#entitiesTable tbody');
    tbody.innerHTML = data.entities.map(e => `
        <tr>
            <td><strong>${e.entity}</strong></td>
            <td>${e.category}</td>
            <td>${e.value}</td>
            <td><span class="badge ${getConfidenceClass(e.confidence)}">${(e.confidence * 100).toFixed(0)}%</span></td>
        </tr>
    `).join('');

    // 4. Charts
    renderChart(data.riskData);
}

function renderChart(riskData) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Medium', 'High', 'Critical'],
            datasets: [{
                data: riskData,
                backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function animateScore(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const interval = setInterval(() => {
        if (current >= target) {
            el.textContent = `${target.toFixed(0)}%`;
            clearInterval(interval);
        } else {
            current += 2;
            el.textContent = `${current}%`;
        }
    }, 20);
}

function getConfidenceClass(conf) {
    if (conf >= 0.9) return 'score-high';
    if (conf >= 0.7) return 'score-mid';
    return 'score-low';
}

// ===== Toast =====
function showToast(message, isError = false) {
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
