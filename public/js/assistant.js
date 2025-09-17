document.addEventListener('DOMContentLoaded', () => {
    const assistantBtn = document.getElementById('voice-assistant-btn');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        assistantBtn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    function speak(text) {
        console.log("Attempting to speak:", text); // DEBUG
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }

    assistantBtn.addEventListener('click', () => {
        console.log("Assistant button clicked. Starting recognition..."); // DEBUG
        assistantBtn.textContent = '👂 Listening...';
        assistantBtn.disabled = true;
        recognition.start();
    });

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Command successfully received:', command); // DEBUG
        processCommand(command);
    };

    recognition.onend = () => {
        console.log("Recognition service has ended."); // DEBUG
        assistantBtn.textContent = '🎤 Activate Voice Assistant';
        assistantBtn.disabled = false;
    };
    
    recognition.onerror = (event) => {
        console.error('A speech recognition error occurred:', event.error); // DEBUG
        speak("Sorry, I didn't catch that. Please try again.");
    };

    async function processCommand(command) {
        // First, check for simple navigation commands
        if (command.includes('open quiz') || command.includes('show contacts') || command.includes('read alert')) {
            console.log("Processing as a simple navigation command."); // DEBUG
            // ... (your existing navigation logic will run here) ...
            if (command.includes('open') && command.includes('quiz')) {
                speak("Opening the quiz.");
                window.location.href = '/quiz';
            } else if (command.includes('show') && command.includes('contact')) {
                speak("Showing emergency contacts.");
                window.location.href = '/contacts';
            } else if (command.includes('read') && command.includes('alert')) {
                const alertContent = document.getElementById('alert-content');
                speak(alertContent ? "Reading the latest alert. " + alertContent.textContent : "I could not find an alert to read.");
            }
        } else {
            // If it's not a navigation command, send it to the AI
            console.log("Command not for navigation. Sending to AI..."); // DEBUG
            speak("Asking the AI assistant... please wait.");
            try {
                const response = await fetch('/ask-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: command })
                });

                console.log("Received response from our server:", response); // DEBUG

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const data = await response.json();
                console.log("AI Answer received:", data.answer); // DEBUG
                speak(data.answer);

            } catch (error) {
                console.error('Error in fetch process:', error); // DEBUG
                speak("Sorry, I'm having trouble connecting to the AI assistant right now.");
            }
        }
    }
});