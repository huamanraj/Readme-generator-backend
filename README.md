# Readme Generator Backend

A Node.js and Express backend for generating GitHub README using the OpenAI API.

## Features
- Utilizes the OpenAI API for generating GitHub README files.
- Supports customization of README content.
- Provides a user-friendly interface for generating README files efficiently.

## Technologies Used
- JavaScript
- Node.js
- Express
- OpenAI API

## Prerequisites
- Node.js installed on your machine
- OpenAI API key
- NPM (Node Package Manager)

## Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/Readme-generator-backend.git
```

2. Install dependencies:
```bash
npm install
```

## Configuration
1. Rename the `.env.example` file to `.env`.
2. Add your OpenAI API key to the `.env` file.

## Usage
1. Start the server:
```bash
npm start
```

2. Access the application at `http://localhost:3000`.

## API Reference
- Endpoint: `/generate-readme`
- Parameters: 
  - `title`: The title of the README
  - `description`: The description of the project
  - `features`: A list of features
  - `technologies`: A list of technologies used

## Testing
To run tests, use the following command:
```bash
npm test
```


## Contact Information
For any inquiries, please contact the maintainers at [aman-raj.xyz](aman-raj.xyz).

## Acknowledgments
- OpenAI for providing the powerful API for README generation.
