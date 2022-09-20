import { ChatClient } from '@azure/communication-chat';
import { ChatDialogState } from '../enums';
import { ChatThread } from '../interfaces';

export interface ChatModel {
  chatOpen: boolean;
  token: string;
  currentUserId: string;
  currentUserIdentity: string;
  currentDialogView: ChatDialogState;
  activeThreads: ChatThread[];
  avaliableParticipants: ChatThread[];
  currentChatRoomData: ChatThread | null;
  chatClient: ChatClient | null;
}
