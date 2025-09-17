document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const questionScreen = document.getElementById('question-screen');
    const scoreScreen = document.getElementById('score-screen');

    const startBtn = document.getElementById('start-btn');
    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('answer-buttons');
    const scoreText = document.getElementById('score-text');
    const scoreFeedback = document.getElementById('score-feedback');
    const restartBtn = document.getElementById('restart-btn');

    let currentQuestionIndex = 0;
    let score = 0;

    // --- NEW 10 QUESTION QUIZ ---
    const quizQuestions = [
        {
            question: "What is the first thing you should do during an earthquake?",
            answers: [
                { text: "Run outside immediately", correct: false },
                { text: "Drop, Cover, and Hold On", correct: true },
                { text: "Stand in a doorway", correct: false },
                { text: "Call for help", correct: false }
            ]
        },
        {
            question: "In case of a fire, you should stay low to the ground to avoid what?",
            answers: [
                { text: "Heat", correct: false },
                { text: "Falling debris", correct: false },
                { text: "Smoke inhalation", correct: true },
                { text: "Flames", correct: false }
            ]
        },
        {
            question: "Which of these is NOT an essential item for an emergency kit?",
            answers: [
                { text: "First-aid supplies", correct: false },
                { text: "A week's supply of water", correct: false },
                { text: "Video games", correct: true },
                { text: "A battery-powered flashlight", correct: false }
            ]
        },
        {
            question: "If you are caught in a flood, what is the safest action?",
            answers: [
                { text: "Try to swim through the water", correct: false },
                { text: "Seek higher ground immediately", correct: true },
                { text: "Stay in your car", correct: false },
                { text: "Wait on the ground floor", correct: false }
            ]
        },
        {
            question: "What does the 'DDMA' stand for in disaster management?",
            answers: [
                { text: "District Disaster Management Authority", correct: true },
                { text: "Daily Disaster Monitoring Agency", correct: false },
                { text: "Department of Disaster Mitigation", correct: false },
                { text: "Drill Deployment and Management Agency", correct: false }
            ]
        },
        {
            question: "During a cyclone, where is the safest place to take shelter?",
            answers: [
                { text: "In a car", correct: false },
                { text: "Under a large tree", correct: false },
                { text: "In a sturdy building, away from windows", correct: true },
                { text: "On the beach", correct: false }
            ]
        },
        {
            question: "What is the national emergency helpline number in India?",
            answers: [
                { text: "100", correct: false },
                { text: "101", correct: false },
                { text: "112", correct: true },
                { text: "108", correct: false }
            ]
        },
        {
            question: "What is a key component of a family disaster plan?",
            answers: [
                { text: "Knowing your favorite TV shows", correct: false },
                { text: "A designated meeting place outside the home", correct: true },
                { text: "Having the latest smartphone", correct: false },
                { text: "Stocking up on snacks", correct: false }
            ]
        },
        {
            question: "If someone is bleeding heavily, what is the first thing you should do?",
            answers: [
                { text: "Offer them water", correct: false },
                { text: "Apply direct pressure to the wound", correct: true },
                { text: "Help them stand up", correct: false },
                { text: "Look for a bandage", correct: false }
            ]
        },
        {
            question: "After a major disaster, how should you primarily get information?",
            answers: [
                { text: "From social media rumors", correct: false },
                { text: "By calling friends and family", correct: false },
                { text: "From official news sources and authorities", correct: true },
                { text: "By exploring the affected area", correct: false }
            ]
        }
    ];

    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', () => window.location.href = '/leaderboard'); // Restart button now goes to leaderboard

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        startScreen.classList.add('d-none');
        scoreScreen.classList.add('d-none');
        questionScreen.classList.remove('d-none');
        showNextQuestion();
    }

    function showNextQuestion() {
        resetState();
        const question = quizQuestions[currentQuestionIndex];
        questionText.innerText = question.question;
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn', 'btn-outline-primary', 'btn-lg');
            button.addEventListener('click', () => selectAnswer(answer.correct));
            answerButtons.appendChild(button);
        });
    }

    function selectAnswer(isCorrect) {
        if (isCorrect) {
            score++;
        }
        Array.from(answerButtons.children).forEach((button, index) => {
            const question = quizQuestions[currentQuestionIndex];
            if (question.answers[index].correct) {
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-success');
            } else {
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-danger');
            }
            button.disabled = true;
        });
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                showNextQuestion();
            } else {
                showScore();
            }
        }, 1500);
    }

    function showScore() {
        questionScreen.classList.add('d-none');
        scoreScreen.classList.remove('d-none');
        
        const xpGained = score * 10;
        scoreText.innerText = `You scored ${score} out of ${quizQuestions.length}`;
        scoreFeedback.innerText = `Awarding ${xpGained} XP... Redirecting to leaderboard.`;
        restartBtn.innerText = 'View Leaderboard';

        // --- NEW: Update XP and redirect to leaderboard ---
        // !!! IMPORTANT: Make sure this is a REAL student ID from your database !!!
        const demoUserId = "68ca7e2c77b55d5a050def87";
        
        fetch('/quiz/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: demoUserId, score: xpGained })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("XP updated successfully!");
                // Redirect after a short delay to allow user to see score
                setTimeout(() => {
                    window.location.href = '/leaderboard';
                }, 2000);
            }
        })
        .catch(error => {
            console.error("Error updating XP:", error);
            // Still redirect even if the fetch fails
            setTimeout(() => {
                window.location.href = '/leaderboard';
            }, 2000);
        });
    }

    function resetState() {
        while (answerButtons.firstChild) {
            answerButtons.removeChild(answerButtons.firstChild);
        }
    }
});