export interface HistoricalEvent {
  dateTime: string;
  content: string;
  userName?: string;
}

export interface OrderHistoricalEvent {
  actionTime: string;
  actionDescription: string;
  userId: string;
  userType: number;
  firstName: string;
  lastName: string;
}
