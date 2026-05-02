namespace ClinicManagement.Domain.Entities
{
    public class DoctorSchedule : BaseEntity
    {
        public Guid DoctorId { get; set; }
        public DayOfWeek WeekDay { get; set; }
        public TimeOnly StartTime { get; set; } // I Want Specific Time Already  ==> TimeOnly Is VeryGood 
        public TimeOnly EndTime { get; set; }
        public int SlotDurationMinutes { get; set; } = 30;
        public bool IsActive { get; set; } = true; // المعاد ده شغال يعني ولا لا 


        public Doctor Doctor { get; set; } = null!;
    }
}
