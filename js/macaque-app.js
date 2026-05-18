document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        mode: null, // 'practice' or 'test'
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: {}, // index: selectedOptionIndex
        isReviewing: false
    };

    // DOM Elements
    const screens = {
        start: document.getElementById('screen-start'),
        quiz: document.getElementById('screen-quiz'),
        results: document.getElementById('screen-results')
    };

    const els = {
        btnPractice: document.getElementById('btn-practice-mode'),
        btnTest: document.getElementById('btn-test-mode'),
        testSetup: document.getElementById('test-setup-container'),
        numQuestionsInput: document.getElementById('num-questions'),
        btnStartTest: document.getElementById('btn-start-test'),
        btnTheme: document.getElementById('btn-theme'),
        
        category: document.getElementById('question-category'),
        counter: document.getElementById('question-counter'),
        tracker: document.getElementById('question-tracker'),
        qText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        btnSubmit: document.getElementById('btn-submit-test'),
        
        finalScore: document.getElementById('final-score'),
        btnReview: document.getElementById('btn-review'),
        btnRestart: document.getElementById('btn-restart'),
        
        logoHome: document.getElementById('logo-home'),
        ongoingSessionContainer: document.getElementById('ongoing-session-container'),
        ongoingSessionText: document.getElementById('ongoing-session-text'),
        btnResumeSession: document.getElementById('btn-resume-session'),
        btnNewPractice: document.getElementById('btn-new-practice'),
        btnNewTest: document.getElementById('btn-new-test')
    };

    // Initialization
    els.numQuestionsInput.max = 115;

    // Theme Toggle Logic
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        els.btnTheme.textContent = '☀️ Light Mode';
    } else {
        document.documentElement.removeAttribute('data-theme');
        els.btnTheme.textContent = '🌙 Dark Mode';
    }

    els.btnTheme.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            els.btnTheme.textContent = '☀️ Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            els.btnTheme.textContent = '🌙 Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });

    function updateStartScreenState() {
        if (state.mode !== null && !state.isReviewing) {
            // Show ongoing session dashboard
            document.querySelector('.mode-selection').classList.add('hidden');
            els.testSetup.classList.add('hidden');
            els.ongoingSessionContainer.classList.remove('hidden');

            const modeLabel = state.mode === 'practice' ? 'Practice Mode' : 'Test Mode';
            let progressInfo = '';
            if (state.mode === 'practice') {
                const { correctCount, answeredCount } = getPracticeScore();
                progressInfo = `Question ${state.currentQuestionIndex + 1} • Score: ${correctCount}/${answeredCount}`;
            } else {
                progressInfo = `Question ${state.currentQuestionIndex + 1} of ${state.questions.length}`;
            }
            els.ongoingSessionText.innerHTML = `You have an active <strong>${modeLabel}</strong> session in progress (${progressInfo}).`;
        } else {
            // Show standard clean selection dashboard
            document.querySelector('.mode-selection').classList.remove('hidden');
            els.ongoingSessionContainer.classList.add('hidden');
            // Make sure cards are deselected
            els.btnPractice.classList.remove('selected');
            els.btnTest.classList.remove('selected');
            els.testSetup.classList.add('hidden');
        }
    }

    // Navigation Helpers
    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
        if (screenName === 'start') {
            updateStartScreenState();
        }
    }

    // Start Screen Logic
    els.btnPractice.addEventListener('click', () => {
        els.btnPractice.classList.add('selected');
        els.btnTest.classList.remove('selected');
        els.testSetup.classList.add('hidden');
        startPracticeMode();
    });

    els.btnTest.addEventListener('click', () => {
        els.btnTest.classList.add('selected');
        els.btnPractice.classList.remove('selected');
        els.testSetup.classList.remove('hidden');
    });

    els.btnStartTest.addEventListener('click', () => {
        startTestMode();
    });

    function startPracticeMode() {
        state.mode = 'practice';
        // Shuffle the pre-compiled bank of 200 unique questions
        state.questions = [...macaqueQuestions].sort(() => 0.5 - Math.random());
        
        state.currentQuestionIndex = 0;
        state.userAnswers = {};
        state.isReviewing = false;
        
        els.tracker.classList.add('hidden');
        els.btnPrev.classList.add('hidden');
        els.btnSubmit.classList.add('hidden');
        
        showScreen('quiz');
        loadQuestion();
    }

    function startTestMode() {
        let numRequested = parseInt(els.numQuestionsInput.value, 10);
        if (isNaN(numRequested) || numRequested < 1) numRequested = 1;
        if (numRequested > 115) numRequested = 115;

        state.mode = 'test';
        
        // Slice a unique set up to 115 from our pre-compiled 200 questions bank
        state.questions = [...macaqueQuestions]
            .sort(() => 0.5 - Math.random())
            .slice(0, numRequested)
            .map((q, idx) => ({
                ...q,
                id: idx + 1 // Re-index for the active test
            }));
        
        state.currentQuestionIndex = 0;
        state.userAnswers = {};
        state.isReviewing = false;

        els.tracker.classList.remove('hidden');
        renderTracker();
        
        showScreen('quiz');
        loadQuestion();
    }

    // Practice Mode Score Helper
    function getPracticeScore() {
        let correctCount = 0;
        let answeredCount = 0;
        Object.entries(state.userAnswers).forEach(([qIdx, ansIdx]) => {
            const q = state.questions[parseInt(qIdx, 10)];
            if (q && q.options[ansIdx] && q.options[ansIdx].isCorrect) {
                correctCount++;
            }
            answeredCount++;
        });
        return { correctCount, answeredCount };
    }

    // Quiz Rendering Logic
    function loadQuestion() {
        const q = state.questions[state.currentQuestionIndex];
        
        els.category.textContent = q.category;
        if (state.mode === 'practice') {
            const { correctCount, answeredCount } = getPracticeScore();
            els.counter.textContent = `Question ${state.currentQuestionIndex + 1} • Score: ${correctCount}/${answeredCount}`;
        } else {
            els.counter.textContent = `Question ${state.currentQuestionIndex + 1} / ${state.questions.length}`;
        }
        els.qText.textContent = q.text;
        
        els.optionsContainer.innerHTML = '';

        const isAnsweredInTest = state.mode === 'test' && state.userAnswers[state.currentQuestionIndex] !== undefined;

        q.options.forEach((opt, index) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'option-card';
            
            const optText = document.createElement('div');
            optText.className = 'option-text';
            optText.textContent = opt.text;
            
            const optExp = document.createElement('div');
            optExp.className = 'option-explanation';
            optExp.textContent = opt.explanation;

            optDiv.appendChild(optText);
            optDiv.appendChild(optExp);

            // Restoring state if reviewing or previously answered
            if (state.isReviewing) {
                optDiv.classList.add('disabled', 'show-explanation');
                if (opt.isCorrect) optDiv.classList.add('correct');
                if (state.userAnswers[state.currentQuestionIndex] === index && !opt.isCorrect) {
                    optDiv.classList.add('incorrect');
                }
            } else if (state.mode === 'test' && isAnsweredInTest) {
                if (state.userAnswers[state.currentQuestionIndex] === index) {
                    optDiv.classList.add('selected-test');
                }
            }

            if (!state.isReviewing && !(state.mode === 'practice' && state.userAnswers[state.currentQuestionIndex] !== undefined)) {
                optDiv.addEventListener('click', () => handleOptionClick(index, optDiv));
            }

            els.optionsContainer.appendChild(optDiv);
        });

        updateFooterButtons();
        if (state.mode === 'test') updateTrackerHighlight();
    }

    function handleOptionClick(selectedIndex, clickedDiv) {
        if (state.mode === 'practice') {
            // Prevent changing answer in practice mode
            if (state.userAnswers[state.currentQuestionIndex] !== undefined) return;
            state.userAnswers[state.currentQuestionIndex] = selectedIndex;
            
            // Instantly update counter with new practice score
            const { correctCount, answeredCount } = getPracticeScore();
            els.counter.textContent = `Question ${state.currentQuestionIndex + 1} • Score: ${correctCount}/${answeredCount}`;
            
            const options = Array.from(els.optionsContainer.children);
            options.forEach((optDiv, idx) => {
                optDiv.classList.add('disabled', 'show-explanation');
                const isCorrect = state.questions[state.currentQuestionIndex].options[idx].isCorrect;
                
                if (isCorrect) {
                    optDiv.classList.add('correct');
                } else if (idx === selectedIndex) {
                    optDiv.classList.add('incorrect');
                }
            });
            els.btnNext.classList.remove('hidden');

        } else if (state.mode === 'test') {
            state.userAnswers[state.currentQuestionIndex] = selectedIndex;
            
            // Highlight selected
            const options = Array.from(els.optionsContainer.children);
            options.forEach(optDiv => optDiv.classList.remove('selected-test'));
            clickedDiv.classList.add('selected-test');

            updateTrackerHighlight();
            
            // Auto advance
            setTimeout(() => {
                if (state.currentQuestionIndex < state.questions.length - 1) {
                    state.currentQuestionIndex++;
                    loadQuestion();
                } else {
                    updateFooterButtons();
                }
            }, 300);
        }
    }

    // Footer Buttons Logic
    function updateFooterButtons() {
        if (state.mode === 'practice') {
            els.btnPrev.classList.add('hidden');
            els.btnSubmit.classList.add('hidden');
            if (state.userAnswers[state.currentQuestionIndex] !== undefined) {
                els.btnNext.classList.remove('hidden');
            } else {
                els.btnNext.classList.add('hidden');
            }
        } else if (state.mode === 'test') {
            els.btnPrev.classList.toggle('hidden', state.currentQuestionIndex === 0);
            
            if (state.currentQuestionIndex < state.questions.length - 1) {
                els.btnNext.classList.remove('hidden');
                els.btnSubmit.classList.add('hidden');
            } else {
                els.btnNext.classList.add('hidden');
                if (!state.isReviewing) {
                    els.btnSubmit.classList.remove('hidden');
                } else {
                    els.btnSubmit.classList.add('hidden');
                }
            }
        }
    }

    els.btnNext.addEventListener('click', () => {
        if (state.mode === 'practice' && state.currentQuestionIndex === state.questions.length - 1) {
            // Append a new random compiled question to allow infinite scroll!
            const randomTemplate = baseTemplates[Math.floor(Math.random() * baseTemplates.length)];
            const compiled = compileQuestionTemplate(randomTemplate, state.questions.length);
            state.questions.push(compiled);
        }

        if (state.currentQuestionIndex < state.questions.length - 1) {
            state.currentQuestionIndex++;
            loadQuestion();
        }
    });

    els.btnPrev.addEventListener('click', () => {
        if (state.currentQuestionIndex > 0) {
            state.currentQuestionIndex--;
            loadQuestion();
        }
    });

    els.btnSubmit.addEventListener('click', () => {
        if (state.mode === 'practice') {
            // Restart practice mode basically
            location.reload();
        } else if (state.mode === 'test') {
            finishTest();
        }
    });

    // Test Tracker Logic
    function renderTracker() {
        els.tracker.innerHTML = '';
        for (let i = 0; i < state.questions.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'tracker-btn';
            btn.textContent = i + 1;
            btn.addEventListener('click', () => {
                state.currentQuestionIndex = i;
                loadQuestion();
            });
            els.tracker.appendChild(btn);
        }
    }

    function updateTrackerHighlight() {
        const btns = Array.from(els.tracker.children);
        btns.forEach((btn, idx) => {
            btn.classList.remove('current', 'correct', 'incorrect', 'answered');
            
            if (state.isReviewing) {
                const q = state.questions[idx];
                const userAnsIdx = state.userAnswers[idx];
                const isCorrect = userAnsIdx !== undefined && q.options[userAnsIdx].isCorrect;
                
                if (isCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
            } else {
                if (state.userAnswers[idx] !== undefined) {
                    btn.classList.add('answered');
                }
            }
            
            if (idx === state.currentQuestionIndex) {
                btn.classList.add('current');
            }
        });
    }

    // Results & Review Logic
    function finishTest() {
        let score = 0;
        state.questions.forEach((q, idx) => {
            const userAnsIdx = state.userAnswers[idx];
            if (userAnsIdx !== undefined && q.options[userAnsIdx].isCorrect) {
                score++;
            }
        });

        els.finalScore.textContent = `${score} / ${state.questions.length}`;
        showScreen('results');
    }

    els.btnReview.addEventListener('click', () => {
        state.isReviewing = true;
        state.currentQuestionIndex = 0;
        showScreen('quiz');
        loadQuestion();
    });

    els.btnRestart.addEventListener('click', () => {
        location.reload();
    });

    // Logo / Return Home Logic
    els.logoHome.addEventListener('click', () => {
        if (state.mode !== null && !state.isReviewing && screens.quiz.classList.contains('active')) {
            // Take them home to display the resume/start-new menu
            showScreen('start');
        } else {
            // No active session or already completed/reviewing, return directly home by reloading
            location.reload();
        }
    });

    // Ongoing Session Actions Logic
    els.btnResumeSession.addEventListener('click', () => {
        showScreen('quiz');
        loadQuestion();
    });

    els.btnNewPractice.addEventListener('click', () => {
        startPracticeMode();
    });

    els.btnNewTest.addEventListener('click', () => {
        // Reset state
        state.mode = null;
        state.questions = [];
        state.currentQuestionIndex = 0;
        state.userAnswers = {};
        state.isReviewing = false;

        // Display test setup container
        updateStartScreenState();
        els.btnTest.classList.add('selected');
        els.btnPractice.classList.remove('selected');
        els.testSetup.classList.remove('hidden');
    });
});
