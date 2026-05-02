namespace ClinicManagement.Application.DTO
{
    public record DoctorScheduleReq(
         Guid DoctorUserId,
         DayOfWeek WeekDay,
         TimeOnly StartTime, // I Want Specific Time Already  ==> TimeOnly Is VeryGood 
         TimeOnly EndTime,
         int SlotDurationMinutes,
         bool isActive
        );


}
