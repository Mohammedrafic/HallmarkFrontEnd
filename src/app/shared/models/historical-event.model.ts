export interface HistoricalEvent {
  dateTime: string;
  content: string;
  userName?: string;
  localDateTime: string;
}

export interface OrderHistoricalEvent {
  actionTime: string;
  actionDescription: string;
  userId: string;
  userType: number;
  firstName: string;
  lastName: string;
  localDateTime: string;
}
