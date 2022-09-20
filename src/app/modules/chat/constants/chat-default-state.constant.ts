import { ChatDialogState } from '../enums';
import { ChatModel } from '../store';

export const DefaultChatState: ChatModel = {
  chatOpen: false,
  token: '',
  currentUserId: '',
  currentUserIdentity: '',
  currentDialogView: ChatDialogState.List,
  activeThreads: [],
  avaliableParticipants: [],
  currentChatRoomData: null,
  chatClient: null,
}
