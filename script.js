(function() {
    const baseRecipe = {
        servings: 9,
        ingredients: [
            { name: "Unsalted butter, melted", qty: "1 cup (226g)" },
            { name: "Granulated sugar", qty: "2 cups (400g)" },
            { name: "Large eggs", qty: "4" },
            { name: "Vanilla extract", qty: "2 tsp" },
            { name: "All-purpose flour", qty: "1 cup (125g)" },
            { name: "Unsweetened cocoa powder", qty: "¾ cup (75g)" },
            { name: "Salt", qty: "½ tsp" },
            { name: "Semisweet chocolate chips", qty: "1 cup (175g)" }
        ],
        steps: [
            "Preheat oven to 350°F (175°C). Line a 9×9 inch pan with parchment.",
            "Whisk melted butter and sugar until combined.",
            "Beat in eggs one at a time, then vanilla.",
            "Sift in flour, cocoa, and salt. Fold gently until no streaks remain.",
            "Stir in chocolate chips (save a few for topping).",
            "Pour batter into pan, smooth top, sprinkle reserved chips.",
            "Bake 25-30 min until toothpick comes out with moist crumbs.",
            "Cool completely in pan before lifting out and slicing."
        ]
    };

    let currentServings = 9;
    let checkedIngredients = new Array(baseRecipe.ingredients.length).fill(false);
    let completedSteps = new Array(baseRecipe.steps.length).fill(false);
    let timerInterval = null;
    let timerRunning = false;
    let timerSeconds = 25 * 60;

    const ingredientsList = document.getElementById('ingredientsList');
    const stepList = document.getElementById('stepList');
    const servingsCountEl = document.getElementById('servingsCount');
    const servesDisplayEl = document.getElementById('servesDisplay');
    const incrementBtn = document.getElementById('incrementServings');
    const decrementBtn = document.getElementById('decrementServings');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerStartPause = document.getElementById('timerStartPause');
    const timerReset = document.getElementById('timerReset');
    const toast = document.getElementById('toast');

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function scaleQty(qtyStr, factor) {
        return qtyStr.replace(/(\d+(\.\d+)?)/g, (match) => {
            let num = parseFloat(match);
            if (isNaN(num)) return match;
            let scaled = num * factor;
            return scaled < 10 ? scaled.toFixed(1).replace(/\.0$/, '') : Math.round(scaled).toString();
        });
    }

    function renderIngredients() {
        const factor = currentServings / baseRecipe.servings;
        ingredientsList.innerHTML = '';
        baseRecipe.ingredients.forEach((ing, idx) => {
            const li = document.createElement('li');
            if (checkedIngredients[idx]) li.classList.add('checked');
            li.innerHTML = `<span class="checkbox-circle">✓</span><span class="ingredient-qty">${scaleQty(ing.qty, factor)}</span><span>${ing.name}</span>`;
            li.addEventListener('click', () => {
                checkedIngredients[idx] = !checkedIngredients[idx];
                renderIngredients();
                showToast(checkedIngredients[idx] ? '✓ Ingredient checked' : 'Ingredient unchecked');
            });
            ingredientsList.appendChild(li);
        });
    }

    function updateProgress() {
        const completed = completedSteps.filter(v => v).length;
        const percent = Math.round((completed / baseRecipe.steps.length) * 100);
        progressFill.style.width = `${percent}%`;
        progressLabel.textContent = `${percent}% completed`;
    }

    function renderSteps() {
        stepList.innerHTML = '';
        baseRecipe.steps.forEach((step, idx) => {
            const li = document.createElement('li');
            if (completedSteps[idx]) li.classList.add('completed-step');
            li.innerHTML = `<span class="step-num">${idx + 1}</span><span class="step-content">${step}</span>`;
            li.addEventListener('click', () => {
                completedSteps[idx] = !completedSteps[idx];
                renderSteps();
                updateProgress();
                showToast(completedSteps[idx] ? 'Step completed!' : 'Step undone');
            });
            stepList.appendChild(li);
        });
        updateProgress();
    }

    function updateServings(delta) {
        const newServings = currentServings + delta;
        if (newServings < 1 || newServings > 24) return;
        currentServings = newServings;
        servingsCountEl.textContent = currentServings;
        servesDisplayEl.textContent = currentServings;
        renderIngredients();
        showToast(`Servings adjusted to ${currentServings}`);
    }

    incrementBtn.addEventListener('click', () => updateServings(1));
    decrementBtn.addEventListener('click', () => updateServings(-1));

    function formatTime(sec) {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    function updateTimerDisplay() { timerDisplay.textContent = formatTime(timerSeconds); }
    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        timerRunning = false;
        timerStartPause.textContent = '▶ Start';
        timerStartPause.classList.remove('running');
    }
    function startTimer() {
        if (timerSeconds <= 0) { showToast('⏰ Timer finished! Reset to start again.'); stopTimer(); return; }
        timerRunning = true;
        timerStartPause.textContent = '⏸ Pause';
        timerStartPause.classList.add('running');
        timerInterval = setInterval(() => {
            if (timerSeconds <= 0) {
                stopTimer();
                timerDisplay.textContent = '00:00';
                showToast('🔔 Brownies are ready! (Timer finished)');
                return;
            }
            timerSeconds--;
            updateTimerDisplay();
        }, 1000);
    }
    function resetTimer() {
        stopTimer();
        timerSeconds = 25 * 60;
        updateTimerDisplay();
        showToast('Timer reset to 25:00');
    }

    timerStartPause.addEventListener('click', () => timerRunning ? stopTimer() : startTimer());
    timerReset.addEventListener('click', resetTimer);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `panel-${tabId}`) panel.classList.add('active');
            });
        });
    });

    renderIngredients();
    renderSteps();
    updateTimerDisplay();
    servingsCountEl.textContent = currentServings;
    servesDisplayEl.textContent = currentServings;
    window.addEventListener('beforeunload', () => { if (timerInterval) clearInterval(timerInterval); });
})();