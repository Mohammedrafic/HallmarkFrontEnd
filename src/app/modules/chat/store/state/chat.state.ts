import { Injectable } from '@angular/core';

import { Action, State, StateContext } from '@ngxs/store';

import { DefaultChatState } from '../../constants';
import { ChatModel } from '../chat.model';
import { Chat } from '../actions';

@State<ChatModel>({
  name: 'chat',
  defaults: DefaultChatState,
})
@Injectable()
export class ChatState {

  @Action(Chat.ToggleChatDialog)
  ToggleChatDialog(
    { patchState, getState }: StateContext<ChatModel>
  ): void {
    const isOpen = getState().chatOpen;

    patchState({
      chatOpen: !isOpen,
    });
  }
}
