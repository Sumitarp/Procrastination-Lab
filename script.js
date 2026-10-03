const $ = id => document.getElementById(id);

const task = $("task");
const minutes = $("minutes");
const deadline = $("deadline");

const reward = $("reward");
const aversion = $("aversion");
const clarity = $("clarity");

const rewardValue = $("rewardValue");
const aversionValue = $("aversionValue");
const clarityValue = $("clarityValue");

const result = $("result");
const resultTitle = $("resultTitle");
const resultSummary = $("resultSummary");
const pullScore = $("pullScore");
const pullFill = $("pullFill");
const friction = $("friction");
const lever = $("lever");
const actionTitle = $("actionTitle");
const actionText = $("actionText");

const diagnoseBtn = $("diagnoseBtn");
const startBtn = $("startBtn");
const timer = $("timer");
const timerDisplay = $("timerDisplay");
const timerStatus = $("timerStatus");
const pauseBtn = $("pauseBtn");
const finishBtn = $("finishBtn");

let timerSeconds = 0;
let timerInterval = null;
let timerRunning = false;

function syncSlider(input, output) {
    input.addEventListener("input", () => {
        output.textContent = input.value;
    });
}

syncSlider(reward, rewardValue);
syncSlider(aversion, aversionValue);
syncSlider(clarity, clarityValue);

function getDeadlinePressure() {
    if (!deadline.value) return 0;

    const due = new Date(deadline.value).getTime();
    const now = Date.now();
    const hours = (due - now) / 36e5;

    if (hours <= 0) return 10;
    if (hours <= 2) return 10;
    if (hours <= 6) return 9;
    if (hours <= 24) return 7;
    if (hours <= 72) return 5;
    if (hours <= 168) return 3;
    return 1;
}

function diagnose() {
    const rewardScore = Number(reward.value);
    const aversionScore = Number(aversion.value);
    const clarityScore = Number(clarity.value);
    const deadlinePressure = getDeadlinePressure();

    // This is a reflective heuristic, not a clinical or scientific diagnosis.
    const pull = Math.round(
        rewardScore * 4 +
        aversionScore * 4 +
        (10 - clarityScore) * 2
    );

    const boundedPull = Math.min(100, Math.max(0, pull));

    let mainFriction;
    let bestLever;
    let title;
    let summary;
    let actionTitleText;
    let actionTextText;

    if (clarityScore <= 4) {
        mainFriction = "Unclear starting point";
        bestLever = "Shrink the first action";
        title = "Your task may be too vague to start.";
        summary = "When the next physical action is unclear, the brain has an easy escape route: do something else. Don't solve the whole project. Define the next visible action.";
        actionTitleText = "Write the next 5-minute action";
        actionTextText = "Turn the task into something you can physically do: open the document, write three ugly sentences, find one source, send one message, or create the first heading.";
    } else if (aversionScore >= 8) {
        mainFriction = "Emotional resistance";
        bestLever = "Make it less unpleasant";
        title = "You're probably negotiating with discomfort.";
        summary = "The problem may not be knowing what to do. The problem is that starting feels bad. Research on procrastination often points to short-term mood repair: avoiding the task makes the present moment feel better.";
        actionTitleText = "Lower the emotional cost";
        actionTextText = "Give yourself permission to do a deliberately imperfect first pass. Your goal is not to finish. Your goal is to make contact with the task.";
    } else if (rewardScore >= 8) {
        mainFriction = "Immediate reward";
        bestLever = "Remove the competing reward";
        title = "The present is beating the future.";
        summary = "Your distraction has an immediate payoff while the task's payoff is delayed. That makes “later” feel strangely reasonable, even when you know what matters.";
        actionTitleText = "Make distraction harder for 25 minutes";
        actionTextText = "Put the phone away, close the distracting tabs, and leave only the tools needed for this task. Don't rely on a motivational feeling arriving first.";
    } else if (deadlinePressure <= 2 && deadline.value) {
        mainFriction = "Distant consequence";
        bestLever = "Create a nearer finish line";
        title = "Your deadline is too far away to create urgency.";
        summary = "A distant consequence can lose against immediate alternatives. Create a smaller commitment that matters today instead of waiting for deadline pressure to rescue you.";
        actionTitleText = "Create a personal deadline";
        actionTextText = "Choose a specific time today when the first meaningful piece must exist. A smaller deadline gives your future goal a present consequence.";
    } else {
        mainFriction = "Mixed friction";
        bestLever = "Start before negotiating";
        title = "You don't need to solve procrastination before you start.";
        summary = "Several small forces are competing: the task has some discomfort, distractions have some reward, and the future benefit is not urgent enough. The practical move is to lower the starting threshold.";
        actionTitleText = "Commit to one short session";
        actionTextText = "Set a small block of time and work only on the first concrete action. You can reassess when the timer ends.";
    }

    resultTitle.textContent = title;
    resultSummary.textContent = summary;
    pullScore.textContent = boundedPull;
    pullFill.style.width = `${boundedPull}%`;
    friction.textContent = mainFriction;
    lever.textContent = bestLever;
    actionTitle.textContent = actionTitleText;
    actionText.textContent = actionTextText;

    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
}

diagnoseBtn.addEventListener("click", () => {
    if (!task.value.trim()) {
        task.focus();
        task.placeholder = "Name the exact thing you're avoiding...";
        return;
    }
    diagnose();
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function updateTimer() {
    timerDisplay.textContent = formatTime(timerSeconds);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
}

startBtn.addEventListener("click", () => {
    const mins = Math.max(5, Number(minutes.value) || 25);
    timerSeconds = mins * 60;
    updateTimer();

    timer.classList.remove("hidden");
    timerStatus.textContent = `Work on: ${task.value.trim()}. Do not solve the entire project.`;
    startBtn.textContent = "Session running";
    startBtn.disabled = true;
    pauseBtn.textContent = "Pause";
    timerRunning = true;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimer();

        if (timerSeconds <= 0) {
            stopTimer();
            timerDisplay.textContent = "00:00";
            timerStatus.textContent = "Session complete. Notice what became easier once you started.";
            startBtn.textContent = "Start another session";
            startBtn.disabled = false;
        }
    }, 1000);
});

pauseBtn.addEventListener("click", () => {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;
        pauseBtn.textContent = "Resume";
        timerStatus.textContent = "Paused. Resume when you're ready.";
    } else if (timerSeconds > 0) {
        timerRunning = true;
        pauseBtn.textContent = "Pause";
        timerStatus.textContent = `Work on: ${task.value.trim()}.`;
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimer();
            if (timerSeconds <= 0) {
                stopTimer();
                timerStatus.textContent = "Session complete.";
                startBtn.textContent = "Start another session";
                startBtn.disabled = false;
            }
        }, 1000);
    }
});

finishBtn.addEventListener("click", () => {
    stopTimer();
    timerSeconds = 0;
    updateTimer();
    timerStatus.textContent = "Session ended. The win was starting, not being perfect.";
    startBtn.textContent = "Start another session";
    startBtn.disabled = false;
});

deadline.addEventListener("change", () => {
    if (deadline.value && new Date(deadline.value).getTime() < Date.now()) {
        deadline.style.borderColor = "var(--accent)";
    } else {
        deadline.style.borderColor = "";
    }
});
