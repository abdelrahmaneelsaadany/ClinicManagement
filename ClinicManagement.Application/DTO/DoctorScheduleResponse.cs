namespace ClinicManagement.Application.DTO
{
    public record DoctorScheduleResponse(
         Guid Id,
         Guid DoctorId,
         string DoctorName,
         DayOfWeek WeekDay,
         TimeOnly StartTime, // I Want Specific Time Already  ==> TimeOnly Is VeryGood 
         TimeOnly EndTime,
         int SlotDurationMinutes,
         bool IsActive
        );


}
