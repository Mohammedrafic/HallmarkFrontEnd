import { ChatActions, ChatDialogState } from '../../enums';

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
}
