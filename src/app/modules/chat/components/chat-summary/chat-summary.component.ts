import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-summary',
  templateUrl: './chat-summary.component.html',
  styleUrls: ['./chat-summary.component.scss']
})
export class ChatSummaryComponent {
  @Input() name: string;

  @Input() organization: string;

  @Input() lastMessage: string;
}
