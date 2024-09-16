// Initialize Supabase client
const SUPABASE_URL = 'https://dvsoyesscauzsirtjthh.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c295ZXNzY2F1enNpcnRqdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzNTU4NDQsImV4cCI6MjAyOTkzMTg0NH0.3HoGdobfXm7-SJtRSVF7R9kraDNHBFsiEaJunMjwpHk'; // Replace with your Supabase Key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Log to ensure the script is running
console.log('Script loaded');

// Handle form submission
document.getElementById('feedback-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    console.log('Form submitted');

    // Retrieve form values
    const category = document.getElementById('category').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback').value;

    console.log('Category:', category);
    console.log('Email:', email);
    console.log('Feedback:', feedback);

    const responseMessage = document.getElementById('response-message');
    responseMessage.textContent = ''; // Clear previous messages

    try {
        // Insert feedback into Supabase
        const { data, error } = await supabase
            .from('feedback')
            .insert([{ category, email, feedback }]);

        if (error) {
            throw error; // Throw error if there is an issue
        }

        console.log('Feedback submitted successfully', data);
        responseMessage.textContent = 'Thank you for your feedback!';
        responseMessage.style.color = 'green';
        document.getElementById('feedback-form').reset(); // Reset the form after successful submission
    } catch (error) {
        console.error('Error:', error); // Log error details in the console
        responseMessage.textContent = `Error: ${error.message}`;
        responseMessage.style.color = 'red';
    }
});
