// 1. Setup - Minimal Cloud-Ready Code
const express = require('express'); 
const app = express(); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For handling API data

// IMPORTANT: Cloud hosts use environment variables for the port.
// We use process.env.PORT for cloud, or default to 3000 locally.
const port = process.env.PORT || 3000; 

// 2. Frontend Configuration (EJS)
app.set('view engine', 'ejs');
app.set('views', './views'); 

// 3. Database & AI Service Connections (PERMANENTLY DISABLED FOR CLOUD STABILITY)
// We will re-add a cloud-based AI connection later (Google Generative AI).

// 4. Routes

// Route to show the Phase 1 Questionnaire
app.get('/', (req, res) => {
    res.render('index', { message: 'Phase 1: Integrity Protocol Core is Ready. AI OFFLINE.' });
});

// Route to handle form submission (POST) - TEMPORARY SUCCESS CHECK
app.post('/generate', async (req, res) => {
    // This confirms your frontend and backend are perfectly connected.
    const rawAnswers = req.body; 
    console.log("Form data received, ready for AI synthesis:", rawAnswers);

    // This is a temporary success message. We will integrate the cloud AI here next.
    res.send(`SUCCESS! Form data received. AI analysis is currently running offline. You submitted: ${JSON.stringify(rawAnswers)}`);
});

// 5. Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
