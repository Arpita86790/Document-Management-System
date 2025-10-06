Document Management System (DMS)
Overview

The Document Management System (DMS) is a web-based application that allows users to upload, manage, search, and maintain versions of documents efficiently. It provides functionalities like tagging and document version control, similar to real-world platforms like Google Drive and SharePoint.
______________________________________________________________________________________________________________________________________________________________________________________
Tech Stack

Frontend: React.js

Backend: Node.js, Express.js

Database: Mysql

File Storage: Server-side (uploads folder)

Others: Axios for HTTP requests, Multer for file uploads
____________________________________________________________________________________________________________________________________________________________________________________________________________________

Key Features

Document Upload

Upload PDFs, images, or other documents.

Add tags and specify version numbers.

Search & Filter

Search documents by name or tags.

Filter results for faster access.

Version Control
____________________________________________________________________________________________________________________________________________________________________________________________________________________
Usage

Go to the Upload Document page to add files.

Use Search to find documents by tags or names.

View all documents in the Document List.

Update the version number when modifying a document.
____________________________________________________________________________________________________________________________________________________________________________________________________________________
API Endpoints

POST /api/documents/upload - Upload a document
GET /api/documents - Get all documents
GET /api/documents/search?keyword= - Search documents
PUT /api/documents/update-version/:id - Update document version
_____________________________________________________________________________________________________________________________________________________________________________________________________________________
Dependencies

Axios
Multer
Express
React
_____________________________________________________________________________________________________________________________________________________________________________________________________________________
Local Setup Instructions

1. Clone the repository
git clone <github-repo-url>
cd <repo-folder>

2. Backend Setup
cd backend
npm install

DataBase
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(255) NOT NULL,
  tags VARCHAR(255),
  version INT DEFAULT 1
);


Start the backend server:

npm start


Backend runs on: http://localhost:5000

3. Frontend Setup
cd frontend
npm install
npm install axios
npm install react-router
npm start


Frontend runs on: http://localhost:3000
