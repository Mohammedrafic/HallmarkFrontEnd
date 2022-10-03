import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxsModule } from '@ngxs/store';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { FeatherModule } from 'angular-feather';
import { X, Send, Eye, ArrowDown } from 'angular-feather/icons';

import { ChatRoomComponent, ChatContactComponent, ChatSummaryComponent } from './components';
import { ChatContainerComponent } from './containers/chat-container/chat-container.component';
import { ChatApiService, ChatMediatorService, ChatService } from './services';
import { ChatState } from './store/state/chat.state';


@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    FeatherModule.pick({X, Send, Eye, ArrowDown }),
    ButtonModule,
    TextBoxAllModule,
    NgxsModule.forFeature([ChatState]),
    ReactiveFormsModule,
    RichTextEditorModule,
    FormsModule,
  ],
  declarations: [
    ChatContainerComponent,
    ChatSummaryComponent,
    ChatContactComponent,
    ChatRoomComponent,
  ],
  providers: [
    ChatApiService,
    ChatService,
    ChatMediatorService,
  ],
  exports: [ChatContainerComponent, ChatRoomComponent],
})
export class UserChatModule {}