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

    const quizQuestions = [
        {
            question: "What is the first thing you should do during an earthquake?",
            answers: [
                { text: "Run outside immediately", correct: false },
                { text: "Drop, Cover, and Hold On", correct: true },
                { text: "Stand in a doorway", correct: false },
                { text: "Call for help", correct: false }
            ],
            explanation: "Drop to the ground, take cover under a sturdy table, and hold on until the shaking stops. This is the safest action."
        },
        {
            question: "Which of these items should be in your emergency kit?",
            answers: [
                { text: "Video games", correct: false },
                { text: "Water, first-aid kit, and a flashlight", correct: true },
                { text: "Decorative candles", correct: false },
                { text: "Heavy blankets", correct: false }
            ],
            explanation: "A basic emergency kit should contain essentials like water, food, a first-aid kit, flashlight, and batteries."
        },
        {
            question: "If you are caught in a flood, what should you do?",
            answers: [
                { text: "Try to walk or swim through the floodwater", correct: false },
                { text: "Stay in your car", correct: false },
                { text: "Climb to the highest point of your building", correct: true },
                { text: "Wait for the water to go down", correct: false }
            ],
            explanation: "Seek higher ground immediately. Never enter floodwaters as they can be deeper and faster-moving than they appear."
        }
    ];

    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', startQuiz);

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
        }, 1500); // Wait 1.5 seconds before next question
    }

    function showScore() {
        questionScreen.classList.add('d-none');
        scoreScreen.classList.remove('d-none');
        scoreText.innerText = `${score} out of ${quizQuestions.length}`;
        let feedback = '';
        if (score === quizQuestions.length) {
            feedback = "Excellent! You're a preparedness expert!";
        } else if (score >= quizQuestions.length / 2) {
            feedback = "Good job! You know your safety basics.";
        } else {
            feedback = "It's a good start. Review the learning materials to improve!";
        }
        scoreFeedback.innerText = feedback;
    }

    function resetState() {
        while (answerButtons.firstChild) {
            answerButtons.removeChild(answerButtons.firstChild);
        }
    }
});