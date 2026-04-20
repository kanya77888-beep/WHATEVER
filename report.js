// ===== Report Page Logic =====
document.addEventListener('DOMContentLoaded', () => {
    const rawData = localStorage.getItem('paperLensReport');
    if (!rawData) {
        document.getElementById('reportSubtitle').innerHTML = 'No data found. Please run a review from the main page first.';
        return;
    }

    const data = JSON.parse(rawData);
    document.getElementById('reportSubtitle').innerHTML = `Overall Verdict: <strong>${data.verdict}</strong> (Score: ${data.overall}/5.0)`;

    const criteriaConfig = [
        { name: 'Clarity & Writing Quality', emoji: '📝', key: 'clarity' },
        { name: 'Novelty / Originality', emoji: '💡', key: 'novelty' },
        { name: 'Technical Soundness', emoji: '⚙️', key: 'technical' },
        { name: 'Methodology & Rigor', emoji: '🔬', key: 'methodology' },
        { name: 'Significance / Impact', emoji: '⚡', key: 'significance' },
        { name: 'Structure & Organization', emoji: '📋', key: 'structure' },
        { name: 'Literature & References', emoji: '📚', key: 'literature' },
    ];

    const contentDiv = document.getElementById('reportContent');
    contentDiv.innerHTML = '';

    // Overall Summary Card
    contentDiv.innerHTML += `
        <div class="report-card" style="border-top: 4px solid var(--accent-blue);">
            <h2>Executive Summary</h2>
            <p style="margin-top: 1rem; color: var(--text-secondary);">${data.verdictDesc}</p>
        </div>
    `;

    // Detailed Breakdown
    criteriaConfig.forEach(criterion => {
        const score = data.scores[criterion.key];
        const reason = data.reasons[criterion.key];
        const suggestion = data.suggestions[criterion.key];
        
        // Mock problematic quotes based on the heuristic logic
        let quote = "";
        if (score < 4 && criterion.key === 'clarity') quote = '"Results indicate a 10% improvement in task completion speed, though accuracy varies by domain. Future work will aim to expand the dataset and fine-tune the model parameters." (Sentences feel run-on or lack transition)';
        else if (score < 4 && criterion.key === 'literature') quote = '(No formalized inline citations found in the submitted text block)';
        else if (score < 4 && criterion.key === 'methodology') quote = '"...our system automates the processing phase. The dataset utilized for this study contains 50 samples..." (Missing hyperparameter and setup details)';
        
        const quoteHtml = quote ? `
            <h4 style="margin-top: 1.5rem; font-size: 0.9rem;">Problematic Passage / Missing Context:</h4>
            <div class="quote-box">${quote}</div>
        ` : '';

        contentDiv.innerHTML += `
            <div class="report-card">
                <div class="score-row">
                    <h2 style="display:flex; align-items:center; gap: 0.5rem;">
                        <span>${criterion.emoji}</span> ${criterion.name}
                    </h2>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-indigo);">${score}/5.0</div>
                </div>
                
                <h4 style="margin-top: 1rem; font-size: 0.9rem;">Assessment:</h4>
                <p style="color: var(--text-secondary);">${reason}</p>
                
                ${quoteHtml}

                <h4 style="margin-top: 1.5rem; font-size: 0.9rem;">Actionable Improvements:</h4>
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem; color: var(--text-secondary);">
                    <li>${suggestion}</li>
                    ${score < 3 ? '<li>Re-evaluate this section entirely against standard formatting guidelines.</li>' : ''}
                </ul>
            </div>
        `;
    });
});
