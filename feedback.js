// feedbackWidget.js

// Initialize Supabase client
const SUPABASE_URL = 'https://dvsoyesscauzsirtjthh.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c295ZXNzY2F1enNpcnRqdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzNTU4NDQsImV4cCI6MjAyOTkzMTg0NH0.3HoGdobfXm7-SJtRSVF7R9kraDNHBFsiEaJunMjwpHk'; // Replace with your Supabase Key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to create the feedback widget
function createFeedbackWidget() {
    // Create feedback button
    const feedbackBtn = document.createElement('button');
    feedbackBtn.textContent = 'Feedback';
    feedbackBtn.id = 'feedback-btn';
    document.body.appendChild(feedbackBtn);

    // Create feedback widget container
    const feedbackWidget = document.createElement('div');
    feedbackWidget.id = 'feedback-widget';
    feedbackWidget.className = 'feedback-widget';
    
    feedbackWidget.innerHTML = `
        <button class="close-btn" id="close-feedback">&times;</button>
        <h2>Feedback Form</h2>
        <form id="feedback-form">
            <label for="category">Category:</label>
            <select id="category" name="category" required>
                <option value="" disabled selected>Select a category</option>
                <option value="bug">Bug or Error</option>
                <option value="gamereq">Game Request</option>
                <option value="feature">Feature Request</option>
                <option value="userreport">User Report</option>
                <option value="sitefeedback">Website Feedback</option>
                <option value="other">Other</option>
            </select>
            <div id="dynamic-questions"></div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required placeholder="Your email">
            <button type="submit">Submit Feedback</button>
        </form>
        <div id="response-message"></div>
    `;

    document.body.appendChild(feedbackWidget);

    // Style the feedback widget
    const style = document.createElement('style');
    style.innerHTML = `
        body {
            font-family: Arial, sans-serif;
        }
        .feedback-widget {
            display: none; /* Initially hidden */
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            border: 1px solid #ccc;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        .feedback-widget.show {
            display: block; /* Show when 'show' class is added */
        }
        .close-btn {
            cursor: pointer;
            background: none;
            border: none;
            font-size: 1.5rem;
            float: right;
        }
        .rating-button.active {
            background-color: #007bff;
            color: white;
        }
    `;
    document.head.appendChild(style);

    // Show/Hide Feedback Form
    feedbackBtn.addEventListener('click', () => {
        feedbackWidget.classList.toggle('show'); // Toggle the 'show' class to slide form in/out
        feedbackBtn.style.display = 'none'; // Hide feedback button when clicked
    });

    const closeBtn = document.getElementById('close-feedback');
    closeBtn.addEventListener('click', () => {
        feedbackWidget.classList.remove('show'); // Hide widget
        feedbackBtn.style.display = 'block'; // Show feedback button again
    });

    // Function to convert file to data URL
    const fileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Handle form submission
    document.getElementById('feedback-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const category = document.getElementById('category').value;
        const email = document.getElementById('email').value;

        // Collect all dynamic questions
        const questions = document.querySelectorAll('.dynamic-question');
        const feedbackAnswers = [];

        for (const q of questions) {
            const questionText = q.previousElementSibling.textContent; // Label text
            let answer = '';

            if (q.type === 'radio') {
                answer = document.querySelector(`input[name="${q.name}"]:checked`)?.value || '';
            } else if (q.type === 'file') {
                const file = q.files[0]; // Handle file uploads
                if (file) {
                    try {
                        answer = await fileToDataURL(file);
                    } catch (error) {
                        answer = 'Failed to upload file.';
                    }
                } else {
                    answer = 'No file uploaded';
                }
            } else if (q.type === 'hidden') {
                answer = q.value; // Hidden inputs for ratings
            } else if (q.dataset.type === 'rating') {
                answer = q.dataset.selectedRating || 'No rating'; // Retrieve the selected rating
            } else {
                answer = q.value;
            }

            feedbackAnswers.push({ questionText, answer }); // Store question and answer as an object
        }

        const responseMessage = document.getElementById('response-message');
        responseMessage.textContent = ''; // Clear previous messages

        try {
            // Insert feedback into Supabase
            const { data, error } = await supabase
                .from('feedback')
                .insert([{ category, email, feedback: feedbackAnswers.map(item => `${item.questionText} ${item.answer}`).join(' | ') }]);

            if (error) {
                throw error;
            }

            responseMessage.textContent = 'Thank you for your feedback!';
            responseMessage.style.color = 'green';
            document.getElementById('feedback-form').reset();
        } catch (error) {
            responseMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Change questions dynamically based on category
    document.getElementById('category').addEventListener('change', (event) => {
        const dynamicQuestionsDiv = document.getElementById('dynamic-questions');
        dynamicQuestionsDiv.innerHTML = ''; // Clear existing questions

        // Define questions based on category
        let questions = [];
        if (event.target.value === 'bug') {
            questions = [
                { type: 'rating', label: 'Rate the issue severity (1-5):', scale: 5 },
                { type: 'textarea', label: 'Describe the issue:' },
                { type: 'file', label: 'Upload a screenshot (optional):' }
            ];
        } else if (event.target.value === 'feature') {
            questions = [
                { type: 'textarea', label: 'Describe the feature:' },
                { type: 'rating', label: 'Priority (1-10):', scale: 10 },
                { type: 'dropdown', label: 'Have other people expressed interest in this feature?', options: ['Yes', 'No'] }
            ];
        } else if (event.target.value === 'gamereq') {
            questions = [
                { type: 'textarea', label: 'Requested game name (Not all games are able to be added.):' },
                { type: 'rating', label: 'Global popularity (1-10):', scale: 10 },
                { type: 'textarea', label: 'Describe why you would like the game:' }
            ];
        } else if (event.target.value === 'userreport') {
            questions = [
                { type: 'textarea', label: "User's name:" },
                { type: 'textarea', label: "Please describe the user's activity leading to this report:" }
            ];
        } else if (event.target.value === 'sitefeedback') {
            questions = [
                { type: 'rating', label: 'What would you rate our website on a scale from 1-10?:', scale: 10 },
                { type: 'rating', label: 'How likely are you to recommend MN Games to someone else?:', scale: 10 },
                { type: 'textarea', label: 'Other feedback or questions:' }
            ];
        } else if (event.target.value === 'other') {
            questions = [
                { type: 'textarea', label: 'Help us out! Explain your problem:' },
                { type: 'file', label: 'Upload any supporting document (optional):' }
            ];
        }

        // Generate the questions dynamically
        questions.forEach((question) => {
            const label = document.createElement('label');
            label.textContent = question.label;
            dynamicQuestionsDiv.appendChild(label);

            if (question.type === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.classList.add('dynamic-question');
                textarea.rows = 2;
                dynamicQuestionsDiv.appendChild(textarea);
            } else if (question.type === 'rating') {
                const ratingDiv = document.createElement('div');
                ratingDiv.classList.add('dynamic-question');
                ratingDiv.dataset.type = 'rating'; // Mark this as a rating question

                for (let i = 1; i <= question.scale; i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.classList.add('rating-button');
                    button.type = 'button';
                    ratingDiv.appendChild(button);

                    button.addEventListener('click', () => {
                        // Clear previous active ratings
                        ratingDiv.querySelectorAll('.rating-button').forEach(b => b.classList.remove('active'));
                        // Set current button as active
                        button.classList.add('active');

                        // Store the selected rating in the ratingDiv's data attribute
                        ratingDiv.dataset.selectedRating = i;

                        // Log the selected rating for debugging
                        console.log(`Rating selected: ${i}`);
                    });
                }
                dynamicQuestionsDiv.appendChild(ratingDiv);
            } else if (question.type === 'dropdown') {
                const select = document.createElement('select');
                select.classList.add('dynamic-question');
                question.options.forEach(option => {
                    const optionElem = document.createElement('option');
                    optionElem.value = option;
                    optionElem.textContent = option;
                    select.appendChild(optionElem);
                });
                dynamicQuestionsDiv.appendChild(select);
            } else if (question.type === 'file') {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.classList.add('dynamic-question');
                dynamicQuestionsDiv.appendChild(fileInput);
            }
        });

        dynamicQuestionsDiv.style.display = 'block'; // Ensure dynamic questions are shown
    });
}

// Execute the createFeedbackWidget function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', createFeedbackWidget);
