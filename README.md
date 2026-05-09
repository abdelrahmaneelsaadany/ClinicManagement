# 🏥 Clinic Management System

A production-ready REST API for managing clinics — built with **Clean Architecture** and modern .NET best practices.

---

## 📋 Overview

A full-featured backend system designed for Egyptian clinics, covering everything from patient registration and appointment booking to doctor scheduling, prescriptions, and payment tracking.

---

## 🏗️ Architecture

Built with **Clean Architecture** — strict separation across 4 layers:

```
ClinicManagement.Domain          → Entities, Interfaces, Enums (no dependencies)
ClinicManagement.Application     → Services, DTOs, Business Logic
ClinicManagement.Infrastructure  → EF Core, Repositories, JWT, Password Hashing
ClinicManagement.Api             → Controllers, Middleware, Authorization Handlers
```

The **Domain layer has zero dependencies** on any external framework — EF Core, JWT, and all infrastructure concerns live exclusively in the Infrastructure layer.

---

## ⚙️ Design Patterns & Features

### ✅ Generic Repository + Unit of Work
All database operations go through a generic repository with a Unit of Work pattern — ensuring atomic transactions and clean data access abstraction.

### ✅ Result Pattern
Every service method returns `Result<T>` — a centralized wrapper that carries success/failure state, status code, and error message. No unhandled exceptions leak through the API.

```csharp
Result<T>.Success(data)
Result<T>.Failure("error message")
Result<T>.NotFound()
Result<T>.Unauthorized()
Result<T>.Forbidden()
```

### ✅ Centralized Global Response
`BaseController.ToResponse<T>()` maps every `Result<T>` to the correct HTTP status code — one place, consistent across all endpoints.

### ✅ Policy-Based + Resource-Based Authorization
- **Role-Based**: Admin / Doctor / Patient roles enforced on every endpoint
- **Resource-Based**: Patients can only reschedule or cancel their own appointments. Doctors can only modify their own schedules.

### ✅ JWT Authentication + Refresh Token Rotation
Secure token generation with automatic refresh token rotation on every refresh request. Tokens stored and validated against the database.

### ✅ Global Exception Middleware
Unhandled exceptions are caught by a middleware pipeline and returned as a structured JSON response — no raw stack traces exposed to clients.

### ✅ FluentValidation
All incoming DTOs are validated with FluentValidation. Invalid requests are rejected with a unified error envelope before reaching the service layer.

### ✅ Pagination
All list endpoints support pagination via `PagedResult<T>` — built using `IQueryable` to push `OFFSET/FETCH` directly to the database, never loading full tables into memory.

```
GET /api/users?page=1&pageSize=10
```

### ✅ EF Core Performance
- `AsNoTracking()` on all read-only queries
- Database indexes on `PatientId` and `DoctorId` in the Appointments table
- Conflict detection before booking to prevent double-booking

---

## 👥 Roles & Permissions

| Action | Patient | Doctor | Admin |
|---|---|---|---|
| Register | ✅ | ❌ (Admin only) | ✅ |
| Book Appointment | ✅ | ❌ | ✅ |
| Reschedule Own Appointment | ✅ | ❌ | ✅ |
| Cancel Own Appointment | ✅ | ✅ | ✅ |
| Complete Appointment | ❌ | ✅ (own only) | ✅ |
| Write Prescription | ❌ | ✅ | ✅ |
| Manage Own Schedule | ❌ | ✅ (own only) | ✅ |
| Mark Payment as Paid | ❌ | ❌ | ✅ |
| View All Users | ❌ | ❌ | ✅ |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register/patient` | Public | Register new patient |
| POST | `/api/auth/register/doctor` | Admin | Register new doctor |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh-token` | Public | Refresh access token |

### Appointments
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/appointment/{id}` | Admin | Get appointment by ID |
| GET | `/api/appointment/patientId` | Patient, Admin | Get my appointments |
| GET | `/api/appointment/doctorId` | Doctor, Admin | Get my appointments |
| POST | `/api/appointment` | Patient | Book appointment |
| PUT | `/api/appointment/reschedule/{id}` | Patient | Reschedule own appointment |
| PUT | `/api/appointment/cancel/{id}` | Patient, Doctor | Cancel appointment |
| PUT | `/api/appointment/complete/{id}` | Doctor, Admin | Complete + add prescriptions |
| PUT | `/api/appointment/pay/{id}` | Admin | Mark as paid |
| DELETE | `/api/appointment/{id}` | Admin | Delete appointment |

### Doctors
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/doctor/{userId}` | All | Get doctor profile |
| GET | `/api/doctor/available` | All | Get available doctors |
| GET | `/api/doctor/specialization` | All | Filter by specialization |
| PUT | `/api/doctor/availability` | Doctor, Admin | Toggle availability |

### Doctor Schedules
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/doctorschedule/doctor` | Doctor, Admin | Get my schedules |
| GET | `/api/doctorschedule/active` | Patient, Admin | Get active schedules |
| GET | `/api/doctorschedule/day` | Patient, Admin | Get schedules by day |
| POST | `/api/doctorschedule` | Doctor, Admin | Create schedule |
| PUT | `/api/doctorschedule/toggle-active/{id}` | Doctor, Admin | Toggle schedule active |

### Prescriptions
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/prescription/{id}` | Admin | Get by ID |
| GET | `/api/prescription/doctor` | Doctor, Admin | Get my prescriptions |
| GET | `/api/prescription/patient` | Patient, Admin | Get my prescriptions |
| GET | `/api/prescription/appointment/{id}` | Doctor, Admin | Get by appointment |

---

## 🗄️ Data Model

```
User (base identity)
 ├── Patient → Appointments → Prescriptions
 └── Doctor  → Appointments → DoctorSchedules
                               └── Prescriptions
```

**Key fields added for real-world use:**
- `Patient`: PhoneNumber, DateOfBirth, MedicalHistory
- `Doctor`: ConsultationFee, ClinicAddress, PhoneNumber
- `Appointment`: PaymentStatus (Pending / Paid / Refunded)

---

## 🚀 Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server

### Setup

```bash
# Clone the repository
git clone https://github.com/abdelrahmaneelsaadany/ClinicManagement.git

# Navigate to the project
cd ClinicManagement

# Update connection string in appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=ClinicDB;Trusted_Connection=True;"
}

# Apply migrations
dotnet ef database update --project ClinicManagement.Infrastructure --startup-project ClinicManagement.Api

# Run the API
dotnet run --project ClinicManagement.Api
```

### Default Admin Account
The database seeder creates a default admin on first run:
```
Email:    admin@clinic.com
Password: Admin@123
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 |
| Database | SQL Server |
| Auth | JWT Bearer + Refresh Tokens |
| Validation | FluentValidation |
| Architecture | Clean Architecture |
| Patterns | Repository, Unit of Work, Result Pattern |

---

## 📁 Project Structure

```
ClinicManagement/
├── ClinicManagement.Api/
│   ├── Controllers/
│   ├── Authorization/          # Resource-Based Handlers
│   └── Middleware/             # Global Exception Handler
├── ClinicManagement.Application/
│   ├── Service/                # Business Logic
│   ├── DTO/                    # Data Transfer Objects
│   └── Interfaces/             # Service Contracts
├── ClinicManagement.Domain/
│   ├── Entities/               # Core Domain Models
│   ├── Interfaces/             # Repository Contracts
│   ├── Enums/
│   └── Common/                 # PagedResult, shared types
└── ClinicManagement.Infrastructure/
    ├── Data/                   # DbContext + Seeder
    ├── Repositories/           # EF Core Implementations
    └── Identity/               # JWT + Password Hasher
```

---

## 👨‍💻 Author

**Abdelrahman**
- GitHub: [@your-username](https://github.com/abdelrahmaneelsaadany)
- LinkedIn: [your-linkedin](https://linkedin.com/in/https://www.linkedin.com/in/abdelrahaman-elsaadany-13685927b?utm_source=share_via&utm_content=profile&utm_medium=member_android)
