/**
 * RESQMESH AI - Decision Support Dashboard Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const headerFeatCount = document.getElementById('headerFeatCount');
    const headerModelVer = document.getElementById('headerModelVer');

    const form = document.getElementById('predictionForm');
    const predictBtn = document.getElementById('predictBtn');
    const loadSafeBtn = document.getElementById('loadSafeBtn');
    const loadHighRiskBtn = document.getElementById('loadHighRiskBtn');
    const clearBtn = document.getElementById('clearBtn');

    const alertBox = document.getElementById('alertBox');
    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const resultContent = document.getElementById('resultContent');

    const riskBadge = document.getElementById('riskBadge');
    const riskScoreDisplay = document.getElementById('riskScoreDisplay');
    const meterBar = document.getElementById('meterBar');
    const metaThreshold = document.getElementById('metaThreshold');
    const metaBinaryDecision = document.getElementById('metaBinaryDecision');
    const metaLatency = document.getElementById('metaLatency');
    const metaVersion = document.getElementById('metaVersion');
    const jsonOutput = document.getElementById('jsonOutput');

    let demoScenarios = null;

    // 1. Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 2. Check Backend Health
    async function checkHealth() {
        try {
            const res = await fetch('/api/ai/health');
            const data = await res.json();

            if (res.ok && data.status === 'UP' && data.modelLoaded) {
                statusIndicator.className = 'status-indicator ready';
                statusText.textContent = 'Model Loaded (XGBoost Active)';
                headerFeatCount.textContent = `${data.featureCount} Features`;
                headerModelVer.textContent = `Version: ${data.modelVersion}`;
            } else {
                statusIndicator.className = 'status-indicator error';
                statusText.textContent = 'Model Offline';
                showAlert(`AI Model Service Warning: ${data.message || 'Model failed to load'}`, 'error');
            }
        } catch (err) {
            statusIndicator.className = 'status-indicator error';
            statusText.textContent = 'Connection Error';
            showAlert('Cannot connect to Spring Boot AI backend. Ensure service is running on port 8086.', 'error');
        }
    }

    // 3. Fetch Demo Scenarios
    async function fetchDemoScenarios() {
        try {
            const res = await fetch('/api/ai/demo-scenarios');
            if (res.ok) {
                demoScenarios = await res.json();
            }
        } catch (err) {
            console.warn('Could not pre-load demo scenarios:', err);
        }
    }

    // 4. Populate Form with Data Object
    function populateForm(data) {
        if (!data) return;
        hideAlert();

        let count = 0;
        for (const [key, value] of Object.entries(data)) {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
                count++;
            }
        }
        console.log(`Populated ${count} features into form inputs.`);
    }

    // 5. Button Listeners for Demo Data
    loadSafeBtn.addEventListener('click', () => {
        if (demoScenarios && demoScenarios.safe) {
            populateForm(demoScenarios.safe);
            showAlert('Loaded Safe Weather Demo Scenario (dry conditions, low humidity, zero rainfall accumulation).', 'info');
        } else {
            showAlert('Demo scenarios still loading from server...', 'warning');
        }
    });

    loadHighRiskBtn.addEventListener('click', () => {
        if (demoScenarios && demoScenarios.highRisk) {
            populateForm(demoScenarios.highRisk);
            showAlert('Loaded High-Risk Demo Scenario (extreme torrential rainfall, 480mm/24h, high pressure drops, saturation).', 'info');
        } else {
            showAlert('Demo scenarios still loading from server...', 'warning');
        }
    });

    clearBtn.addEventListener('click', () => {
        form.reset();
        hideAlert();
        resultContent.classList.add('hidden');
        resultPlaceholder.classList.remove('hidden');
    });

    // 6. Handle Form Submission & Predict
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        // Extract all inputs
        const formData = new FormData(form);
        const features = {};
        const emptyFields = [];

        // Collect inputs from all tabs
        const inputs = form.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const val = input.value.trim();
            if (val === '') {
                emptyFields.push(input.name);
            } else {
                features[input.name] = parseFloat(val);
            }
        });

        if (emptyFields.length > 0) {
            showAlert(`Please fill all 52 features. Missing ${emptyFields.length} field(s): ${emptyFields.slice(0, 5).join(', ')}${emptyFields.length > 5 ? '...' : ''}`, 'error');
            return;
        }

        // Set Loading State
        predictBtn.classList.add('loading');
        predictBtn.disabled = true;

        try {
            const response = await fetch('/api/ai/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ features })
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert(data.message || `Prediction request failed with HTTP ${response.status}`, 'error');
                return;
            }

            // Display Results
            displayResult(data);

        } catch (err) {
            showAlert(`Network or execution error: ${err.message}`, 'error');
        } finally {
            predictBtn.classList.remove('loading');
            predictBtn.disabled = false;
        }
    });

    // 7. Render Result in Result Card
    function displayResult(res) {
        resultPlaceholder.classList.add('hidden');
        resultContent.classList.remove('hidden');

        const score = res.riskScore;
        const level = res.riskLevel; // "SAFE", "WARNING", "DANGER"

        // Update badge
        riskBadge.textContent = level;
        riskBadge.className = 'risk-badge ' + level.toLowerCase();

        // Update score
        riskScoreDisplay.textContent = score.toFixed(4);

        // Update meter
        const percentage = Math.min(100, Math.max(0, score * 100));
        meterBar.style.width = `${percentage}%`;
        meterBar.className = 'meter-bar ' + level.toLowerCase();

        // Update meta items
        metaThreshold.textContent = Number(res.validatedThreshold).toFixed(4);
        metaBinaryDecision.textContent = res.binaryDecision;
        metaBinaryDecision.style.color = (res.binaryDecision === 'DISASTER_RISK_ALERT') ? '#EF4444' : '#10B981';
        metaLatency.textContent = `${res.latencyMs} ms`;
        metaVersion.textContent = res.modelVersion;

        // Raw JSON output
        jsonOutput.textContent = JSON.stringify(res, null, 2);
    }

    // Helper: Show Alert
    function showAlert(msg, type = 'info') {
        alertBox.textContent = msg;
        alertBox.className = `alert-box ${type === 'error' ? 'error' : ''}`;
        alertBox.classList.remove('hidden');
    }

    function hideAlert() {
        alertBox.classList.add('hidden');
    }

    // Initial Execution
    checkHealth();
    fetchDemoScenarios();
});
