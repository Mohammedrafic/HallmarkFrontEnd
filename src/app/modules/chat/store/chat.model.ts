import { ChatClient, TypingIndicatorReceivedEvent } from '@azure/communication-chat';

import { ChatDialogState } from '../enums';
import { ChatThread } from '../interfaces';

export interface ChatModel {
  chatOpen: boolean;
  token: string;
  currentUserId: string;
  currentUserIdentity: string;
  currentDialogView: ChatDialogState;
  activeThreads: ChatThread[];
  displayedThreads: ChatThread[];
  avaliableParticipants: ChatThread[];
  displayedParticipants: ChatThread[];
  currentChatRoomData: ChatThread | null;
  chatClient: ChatClient | null;
  typingIndicator: TypingIndicatorReceivedEvent | null;
  userIdToStart: string | null;
  startThreadId: string;
}
