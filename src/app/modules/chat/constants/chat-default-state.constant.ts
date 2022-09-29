import { ChatDialogState } from '../enums';
import { ChatModel } from '../store';

export const DefaultChatState: ChatModel = {
  chatOpen: false,
  token: '',
  currentUserId: '',
  currentUserIdentity: '',
  currentDialogView: ChatDialogState.List,
  activeThreads: [],
  displayedThreads: [],
  avaliableParticipants: [],
  displayedParticipants: [],
  currentChatRoomData: null,
  chatClient: null,
  typingIndicator: null,
  userIdToStart: null,
  startThreadId: '',
  threadIdToUpdate: '',
  readReceiptEvent: null,
}
