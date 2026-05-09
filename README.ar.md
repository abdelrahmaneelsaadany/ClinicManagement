# 🏥 نظام إدارة العيادات

API احترافي لإدارة العيادات — مبني بـ **Clean Architecture** وأحدث تقنيات .NET

---

## 📋 نظرة عامة

نظام متكامل مصمم خصيصاً للعيادات المصرية — يغطي كل حاجة من تسجيل المرضى وحجز المواعيد لجداول الدكاترة والروشتات وتتبع المدفوعات.

---

## 🏗️ المعمارية

مبني بـ **Clean Architecture** — فصل تام بين 4 طبقات:

```
ClinicManagement.Domain          → الـ Entities والـ Interfaces والـ Enums (مش بيعرف حاجة عن باقي الطبقات)
ClinicManagement.Application     → الـ Services والـ DTOs والـ Business Logic
ClinicManagement.Infrastructure  → EF Core والـ Repositories والـ JWT
ClinicManagement.Api             → الـ Controllers والـ Middleware والـ Authorization
```

**الـ Domain layer مش بيعرف عن EF Core أو JWT أو أي framework خارجي** — كل ده محصور في الـ Infrastructure.

---

## ⚙️ الـ Patterns والـ Features

### ✅ Generic Repository + Unit of Work
كل عمليات الـ Database بتمر عبر Generic Repository مع Unit of Work — بيضمن الـ Atomic Transactions ونظافة الـ Data Access.

### ✅ Result Pattern
كل Service Method بترجع `Result<T>` — Wrapper موحد بيحمل حالة النجاح أو الفشل وكود الـ HTTP والرسالة. مفيش Exceptions بتعدي للـ API.

```csharp
Result<T>.Success(data)
Result<T>.Failure("رسالة الخطأ")
Result<T>.NotFound()
Result<T>.Unauthorized()
Result<T>.Forbidden()
```

### ✅ Centralized Global Response
`BaseController.ToResponse<T>()` بتحول كل `Result<T>` لـ HTTP Response صح — مكان واحد، consistent في كل الـ Endpoints.

### ✅ Policy-Based + Resource-Based Authorization
- **Role-Based**: Admin / Doctor / Patient على كل Endpoint
- **Resource-Based**: المريض يعدل مواعيده بس، والدكتور يعدل جدوله بس

### ✅ JWT Authentication + Refresh Token Rotation
توليد Token آمن مع Rotation تلقائي لكل Refresh Request.

### ✅ Global Exception Middleware
الـ Exceptions اللي مش بتتعالج بتتمسك في الـ Middleware وبترجع JSON منظم — مش Stack Trace خام.

### ✅ FluentValidation
كل الـ DTOs بتتتحقق منها بـ FluentValidation — الـ Requests الغلط بترفض قبل ما توصل للـ Service.

### ✅ Pagination
كل الـ List Endpoints بتدعم Pagination بـ `PagedResult<T>` — مبني على `IQueryable` عشان الـ `OFFSET/FETCH` يتبعت للـ Database مباشرة، مش بيحمّل الـ Table كلها في الـ Memory.

```
GET /api/users?page=1&pageSize=10
```

### ✅ EF Core Performance
- `AsNoTracking()` على كل الـ Read Queries
- Database Indexes على `PatientId` و`DoctorId` في جدول المواعيد
- Conflict Detection قبل الحجز لمنع التعارض

---

## 👥 الصلاحيات

| العملية | مريض | دكتور | أدمن |
|---|---|---|---|
| تسجيل حساب | ✅ | ❌ (أدمن بس) | ✅ |
| حجز موعد | ✅ | ❌ | ✅ |
| تغيير موعده | ✅ | ❌ | ✅ |
| إلغاء موعد | ✅ | ✅ | ✅ |
| إتمام الموعد | ❌ | ✅ (بتاعه بس) | ✅ |
| كتابة روشتة | ❌ | ✅ | ✅ |
| إدارة الجدول | ❌ | ✅ (بتاعه بس) | ✅ |
| تسجيل الدفع | ❌ | ❌ | ✅ |
| عرض كل المستخدمين | ❌ | ❌ | ✅ |

---

## 📡 الـ Endpoints

### المصادقة
| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| POST | `/api/auth/register/patient` | Public | تسجيل مريض جديد |
| POST | `/api/auth/register/doctor` | Admin | تسجيل دكتور جديد |
| POST | `/api/auth/login` | Public | تسجيل الدخول |
| POST | `/api/auth/refresh-token` | Public | تجديد الـ Token |

### المواعيد
| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/api/appointment/{id}` | Admin | جيب موعد بالـ ID |
| GET | `/api/appointment/patientId` | Patient, Admin | مواعيدي كمريض |
| GET | `/api/appointment/doctorId` | Doctor, Admin | مواعيدي كدكتور |
| POST | `/api/appointment` | Patient | حجز موعد |
| PUT | `/api/appointment/reschedule/{id}` | Patient | تغيير موعد |
| PUT | `/api/appointment/cancel/{id}` | Patient, Doctor | إلغاء موعد |
| PUT | `/api/appointment/complete/{id}` | Doctor, Admin | إتمام الموعد + روشتة |
| PUT | `/api/appointment/pay/{id}` | Admin | تسجيل الدفع |
| DELETE | `/api/appointment/{id}` | Admin | حذف موعد |

### الدكاترة
| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/api/doctor/{userId}` | الكل | بروفايل الدكتور |
| GET | `/api/doctor/available` | الكل | الدكاترة المتاحين |
| GET | `/api/doctor/specialization` | الكل | فلترة بالتخصص |
| PUT | `/api/doctor/availability` | Doctor, Admin | تغيير حالة التوفر |

### جداول الدكاترة
| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/api/doctorschedule/doctor` | Doctor, Admin | جدولي |
| GET | `/api/doctorschedule/active` | Patient, Admin | الجداول الفعّالة |
| GET | `/api/doctorschedule/day` | Patient, Admin | جداول يوم معين |
| POST | `/api/doctorschedule` | Doctor, Admin | إضافة جدول |
| PUT | `/api/doctorschedule/toggle-active/{id}` | Doctor, Admin | تفعيل/تعطيل جدول |

### الروشتات
| Method | Endpoint | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/api/prescription/{id}` | Admin | روشتة بالـ ID |
| GET | `/api/prescription/doctor` | Doctor, Admin | روشتاتي كدكتور |
| GET | `/api/prescription/patient` | Patient, Admin | روشتاتي كمريض |
| GET | `/api/prescription/appointment/{id}` | Doctor, Admin | روشتات موعد |

---

## 🗄️ نموذج البيانات

```
User (الحساب الأساسي)
 ├── Patient → Appointments → Prescriptions
 └── Doctor  → Appointments → DoctorSchedules
                               └── Prescriptions
```

**حقول مضافة للاستخدام الواقعي:**
- `Patient`: رقم الموبايل، تاريخ الميلاد، التاريخ المرضي
- `Doctor`: سعر الكشف، عنوان العيادة، رقم الموبايل
- `Appointment`: حالة الدفع (Pending / Paid / Refunded)

---

## 🚀 تشغيل المشروع

### المتطلبات
- .NET 8 SDK
- SQL Server

### خطوات التشغيل

```bash
# Clone المشروع
git clone https://github.com/your-username/ClinicManagement.git

# ادخل على المشروع
cd ClinicManagement

# عدّل الـ Connection String في appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=ClinicDB;Trusted_Connection=True;"
}

# طبّق الـ Migrations
dotnet ef database update --project ClinicManagement.Infrastructure --startup-project ClinicManagement.Api

# شغّل الـ API
dotnet run --project ClinicManagement.Api
```

### حساب الأدمن الافتراضي
```
Email:    admin@clinic.com
Password: Admin@123
```

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 |
| Database | SQL Server |
| Auth | JWT Bearer + Refresh Tokens |
| Validation | FluentValidation |
| Architecture | Clean Architecture |
| Patterns | Repository, Unit of Work, Result Pattern |

---

## 📁 هيكل المشروع

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
│   └── Common/                 # PagedResult
└── ClinicManagement.Infrastructure/
    ├── Data/                   # DbContext + Seeder
    ├── Repositories/           # EF Core Implementations
    └── Identity/               # JWT + Password Hasher
```

---

## 👨‍💻 المطور

**عبدالرحمن**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-linkedin)
