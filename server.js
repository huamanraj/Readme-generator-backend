const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const userLastRequestTime = new Map();

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const userId = req.ip; // Using IP as user identifier
  const currentTime = Date.now();
  const lastRequestTime = userLastRequestTime.get(userId) || 0;

  if (currentTime - lastRequestTime < 15000) { // 15 seconds
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait 15 seconds between requests.' });
  }

  userLastRequestTime.set(userId, currentTime);
  next();
};

// Fetch repo information from GitHub API with authentication to avoid rate limits
async function getRepoInfo(repoUrl) {
  const [, , , username, repo] = repoUrl.split('/');
  const apiUrl = `https://api.github.com/repos/${username}/${repo}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`, // GitHub authentication
      },
    });
    return {
      name: response.data.name,
      description: response.data.description,
      language: response.data.language,
    };
  } catch (error) {
    console.error('Error fetching repo info:', error.response?.data || error.message);
    throw new Error('Failed to fetch repository information or it may be a private repository');
  }
}

// Check the rate limit for debugging purposes
async function checkRateLimit() {
  const apiUrl = 'https://api.github.com/rate_limit';
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
    console.log('GitHub API rate limit:', response.data.rate);
  } catch (error) {
    console.error('Error checking rate limit:', error.response?.data || error.message);
  }
}


app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend! Deployment is working.' });
});



// Generate README based on GitHub repo info and OpenAI's response
app.post('/generate-readme', rateLimitMiddleware, async (req, res) => {
  const { repoUrl } = req.body;

  try {
    // Fetch repository info from GitHub
    const repoInfo = await getRepoInfo(repoUrl);

    // Prompt to OpenAI to generate the README
    const prompt = `Generate a comprehensive and detailed README for the GitHub repository named '${repoInfo.name}'.

    Repository description: ${repoInfo.description || 'No description available'}
    Main language: ${repoInfo.language || 'Not specified'}

    Create an extensive README that includes:

    1. Project Title and Description:
       - A clear, concise title
       - A detailed description of the project's purpose and functionality

    2. Features:
       - A comprehensive list of features
       - Brief explanations of key functionalities

    3. Technologies Used:
       - List all major technologies, frameworks, and libraries used

    4. Prerequisites:
       - Any system requirements or dependencies

    5. Installation:
       - Step-by-step installation instructions
       - Include any necessary commands

    6. Configuration:
       - Instructions for any required configuration or environment setup

    7. Usage:
       - Detailed examples of how to use the project
       - Include code snippets where appropriate

    8. API Reference (if applicable):
       - Overview of available endpoints or functions
       - Parameters and return values

    9. Testing:
       - Instructions on how to run tests

    10. Contributing:
        - Guidelines for contributors
        - Code of conduct
        - How to submit pull requests

    11. License:
        - Specify the license and link to the full license file

    12. Contact Information:
        - How to reach the maintainers

    13. Acknowledgments:
        - Credits to contributors or third-party resources

    Format the README in Markdown, use appropriate headings, and include code blocks where necessary. Aim for a professional, well-structured document that's easy to read and navigate.`;

    // Send request to OpenAI for generating the README
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates GitHub README files.' },
        { role: 'user', content: prompt },
      ],
    });

    // Send generated README back to the client
    res.json({ readme: response.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while generating the README' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Optional: Check rate limit on server start for debugging
  checkRateLimit();
});

