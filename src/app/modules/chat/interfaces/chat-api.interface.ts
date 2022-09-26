import { ReceivedChatMessage } from './chat-common.interface';

export interface ChatThread {
  userId: string;
  threadId: string | null;
  displayName: string;
  businessUnitName: string;
  lastMessage?: ReceivedChatMessage;
  lasMessageOn: Date;
}
