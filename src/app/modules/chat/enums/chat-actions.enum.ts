export enum ChatActions {
  GetUserThreads = '[chat] Get user threads',
  SetCurrentView = '[chat] Set current dialog view',
  CreateThread = '[chat] Create chat thread',
  ConnectThread = '[chat] Connect existing thread',
  GetParticipants = '[chat] Get participants',
  EnterChatRoom = '[chat] Enter chat room',
  UpdateMessages = '[chat] Update messages in all active threads',
  GetChatConfig = '[chat] Get user chat configuration',
  StartNewConversation = '[chat] Start new conversation',
  CloseChat = '[chat] Close chat window',
  SearchFor = '[chat] Search for participant or active thread',
  SortThreads = '[chat] Sort threads by last message',
}
