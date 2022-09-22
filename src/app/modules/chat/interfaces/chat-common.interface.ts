import { SendMessageOptions, SendMessageRequest } from '@azure/communication-chat';

export interface ChatSearchForm {
  searchCriteria: string;
}

export interface ReceivedChatMessage {
  id: string;
  sender: string,
  message: string,
  timestamp?: Date,
  isCurrentUser: boolean,
  isRead?: boolean;
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

export interface MessageRequestMeta {
  options: SendMessageOptions;
  req: SendMessageRequest;
}
