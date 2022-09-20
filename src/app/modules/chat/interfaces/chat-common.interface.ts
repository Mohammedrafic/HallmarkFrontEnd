export interface ChatSearchForm {
  searchCriteria: string;
}

export interface ReceivedChatMessage {
  sender: string,
  message: string,
  timestamp?: Date,
  isCurrentUser: boolean,
}

export interface UserChatConfig {
  userId: string;
  userIdentity: string;
  accessToken: string;
  endpoint: string;
  connectionString: string;
}

export interface EnterChatEvent {
  id: string;
  displayName: string;
}
