# Medical Clinic Database - COSC 3380

A comprehensive management system for medical clinic featuring role-based access, appointment scheduling, patient records management, and report-generation functionality

## Technology Stack

### Frontend
- ReactJS
- Axios for HTTP requests
- React Router DOM for navigation
- React Datepicker for date selection
- React Select for enhanced dropdowns
- Font Awesome for icons

### Backend
- Node.js
- RESTful API architecture
- JWT for authentication
- PDF and CSV report generation

### Database
- MySQL (Relational Database)

## Requirements

- Node.js (v16 or later)
- MySQL Server
- npm (comes with Node.js)

## Installation & Setup

### Database Setup
1. Create a MySQL database for the project
2. Import the schema and seed data:
   ```
   mysql -u youruser -p yourdatabase < dump.sql
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd Medical_Clinic_Database/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   - For production:
     ```
     node server.js
     ```
   - For development (with auto-reload):
     ```
     npx nodemon server.js
     ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd Medical_Clinic_Database/frontend
   ```

2. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

## Features

- Role-based access control (Admin, Doctor, Nurse, Patient)
- Appointment scheduling and management
- Patient records management
- Medical history tracking
- Prescription management
- Billing and payment tracking
- Reporting (PDF and CSV formats)
- Secure authentication with JWT

## Team Members
- Marlon [@marlmelara](https://github.com/marlmelara)
- Salvador   [@/Salvador-gr](https://github.com/Salvador-gr)
- Jay  [@Jay-gethub](https://github.com/Jay-gethub)
- Jolie  [@Jolieb7](https://github.com/Jolieb7)
- Afra [@afnawar910](https://github.com/afnawar910)



