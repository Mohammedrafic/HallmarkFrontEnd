import { ChatActions, ChatDialogState, ChatSearchType } from '../../enums';

export namespace Chat {
  export class GetUserThreads {
    static readonly type = ChatActions.GetUserThreads;
  }

  export class SetCurrentView {
    static readonly type = ChatActions.SetCurrentView;

    constructor(public readonly view: ChatDialogState) {}
  }

  export class CreateChatThread {
    static readonly type = ChatActions.CreateThread;

    constructor(public readonly userId: string) {}
  }

  export class ConnectExistingThread {
    static readonly type = ChatActions.ConnectThread;
  }

  export class OpenAddView {
    static readonly type = ChatActions.GetParticipants;
  }

  export class EnterChatRoom {
    static readonly type = ChatActions.EnterChatRoom;

    constructor(public readonly threadId: string) {}
  }

  export class UpdateMessages {
    static readonly type = ChatActions.UpdateMessages;
  }

  export class GetUserChatConfig {
    static readonly type = ChatActions.GetChatConfig;
  }

  export class StartNewConversation {
    static readonly type = ChatActions.StartNewConversation;

    constructor(public readonly userId: string) {}
  }

  export class CloseChat {
    static readonly type = ChatActions.CloseChat;
  }

  export class SearcFor {
    static readonly type = ChatActions.SearchFor;

    constructor(
      public readonly searchText: string,
      public readonly searchType: ChatSearchType,
      ) {}
  }
}
