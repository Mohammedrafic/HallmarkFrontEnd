export interface BookingsOverlapsRequest {
  shiftId: number | null;
  startTime: string | null;
  endTime: string | null;
  employeeScheduledDays: EmployeeScheduledDays[];
}

export interface BookingsOverlapsResponse {
  employeeId: number;
  firstName: string;
  lastName: string;
  bookings: Booking[];
}

interface EmployeeScheduledDays {
  employeeId: number;
  bookedDays: string[];
}

interface Booking {
  shiftDate: string;
  startTime: string;
  endTime: string;
  location: string;
  department: string;
}
