import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CustomFormGroup } from '@core/interface';

import { Store } from '@ngxs/store';
import { ChatSearchForm } from '../../interfaces';
import { ChatService } from '../../services';

import { ChatDialogState } from './../../enums';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContainerComponent {
  public title: string;

  public readonly chatStates = ChatDialogState;

  public currentChatState = ChatDialogState.List;

  public searchForm: CustomFormGroup<ChatSearchForm>;

  constructor(
    private store: Store,
    private chatService: ChatService,
  ) {
    this.searchForm = this.chatService.createForm();
  }

  public closeChat(): void {}
}
