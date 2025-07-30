# Hospital Management System (HMS) Backend

A comprehensive Hospital Management System backend built with Node.js, TypeScript, and Drizzle ORM. This system supports multiple departments, bed management, billing, role-based access control, and external system integrations.

## 🏥 Features

### Core Modules
- **Patient Management**: Complete patient registration, medical records, and history tracking
- **Dental Department**: Dental records, X-rays, appointments, and inventory management
- **Inpatient Management**: Bed allocation, patient monitoring, medications, and discharge
- **ICU Management**: Critical care monitoring, procedures, and daily reports
- **Pediatric Care**: Growth charts, vaccinations, and pediatric-specific records
- **Physical Therapy**: Assessments, therapy sessions, and outcome tracking
- **Billing & Payments**: Comprehensive billing system with multiple payment methods
- **Role-Based Access Control**: Secure authentication with department-specific permissions

### External Integrations
- **PACS**: Picture Archiving and Communication System for medical imaging
- **HL7/FHIR**: Healthcare data exchange standards
- **ERP**: Enterprise Resource Planning integration
- **Insurance**: Automated claim processing and verification

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hospital-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database and configuration settings
   ```

4. **Database Setup**
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/v1/auth/login` | User login | Public |
| POST | `/api/v1/auth/register` | User registration | Public |
| POST | `/api/v1/auth/logout` | User logout | Protected |
| POST | `/api/v1/auth/change-password` | Change password | Protected |
| GET | `/api/v1/auth/profile` | Get user profile | Protected |

### Patient Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/api/v1/patients` | Create patient | admin, doctor, nurse, receptionist |
| GET | `/api/v1/patients` | Get patients list | admin, doctor, nurse, receptionist, therapist, cashier |
| GET | `/api/v1/patients/:id` | Get patient by ID | admin, doctor, nurse, receptionist, therapist, cashier |
| PUT | `/api/v1/patients/:id` | Update patient | admin, doctor, nurse, receptionist |
| DELETE | `/api/v1/patients/:id` | Delete patient | admin |
| POST | `/api/v1/patients/:id/medical-records` | Add medical record | doctor, nurse |
| GET | `/api/v1/patients/:id/medical-records` | Get medical records | admin, doctor, nurse, therapist |

### Billing & Payments

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/api/v1/billing/bills` | Create bill | admin, doctor, cashier |
| GET | `/api/v1/billing/bills` | Get bills list | admin, doctor, cashier |
| GET | `/api/v1/billing/bills/:id` | Get bill by ID | admin, doctor, cashier |
| POST | `/api/v1/billing/payments` | Process payment | admin, cashier |
| GET | `/api/v1/billing/payments` | Get payments list | admin, cashier |
| GET | `/api/v1/billing/service-charges` | Get service charges | admin, doctor, cashier |

### System Information

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/docs` | API documentation |

## 🏗️ Architecture

### Database Schema

The system uses PostgreSQL with the following main tables:

- **patients**: Patient information and demographics
- **medical_records**: Patient visit records and diagnoses
- **users**: System users and staff
- **bills**: Billing information
- **payments**: Payment records
- **beds**: Hospital bed management
- **appointments**: Appointment scheduling
- **dental_records**: Dental-specific records
- **icu_admissions**: ICU patient tracking
- **therapy_sessions**: Physical therapy records

### Project Structure

```
src/
├── controllers/          # Route controllers
├── middleware/          # Authentication, validation, audit
├── routes/             # API route definitions
├── db/                 # Database configuration and schema
│   └── schema/         # Database table schemas
├── types/              # TypeScript type definitions
├── utils/              # Helper functions and validation
├── services/           # External system integrations
└── server.ts           # Main application entry point
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Department and role-specific permissions
- **Password Hashing**: bcrypt for secure password storage
- **Audit Logging**: Complete action tracking
- **Input Validation**: Joi-based request validation
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin policies

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=hospital_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# External Integration URLs
PACS_API_URL=http://localhost:3001/pacs
HL7_FHIR_URL=http://localhost:3002/fhir
ERP_API_URL=http://localhost:3003/erp
INSURANCE_API_URL=http://localhost:3004/insurance

# Security
BCRYPT_ROUNDS=12
```

## 👥 Default Users

After running the seed script, the following users are available:

| Role | Email | Password | Department |
|------|-------|----------|------------|
| Admin | admin@hospital.com | admin123 | administration |
| Doctor | doctor@hospital.com | doctor123 | dental |
| Nurse | nurse@hospital.com | nurse123 | inpatient |
| Cashier | cashier@hospital.com | cashier123 | administration |

## 🔄 External System Integration

The system provides integration stubs for:

1. **PACS (Picture Archiving and Communication System)**
   - Medical image storage and retrieval
   - DICOM standard support
   - X-ray and diagnostic image management

2. **HL7/FHIR (Health Level 7 / Fast Healthcare Interoperability Resources)**
   - Healthcare data exchange
   - Patient data synchronization
   - Diagnostic report sharing

3. **ERP (Enterprise Resource Planning)**
   - Staff data synchronization
   - Inventory management
   - Financial data integration

4. **Insurance Systems**
   - Eligibility verification
   - Claim submission and tracking
   - Coverage verification

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio
npm run seed         # Seed database with initial data
```

### Database Operations

```bash
# Generate new migration
npm run db:generate

# Push changes to database
npm run db:migrate

# View database in browser
npm run db:studio
```

## 📊 API Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": any,           // Response data (when success is true)
  "message": string,     // Success message (optional)
  "error": string,       // Error message (when success is false)
  "errors": array        // Validation errors (optional)
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
- [HL7 FHIR Specification](https://www.hl7.org/fhir/)
- [DICOM Standard](https://www.dicomstandard.org/)
