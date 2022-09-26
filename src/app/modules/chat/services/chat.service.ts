import { FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

import { CustomFormGroup } from '@core/interface';
import { ChatSearchForm } from '../interfaces';

@Injectable()
export class ChatService {
  private readonly sound = new Audio();

  constructor(
    private fb: FormBuilder,
  ) {
    this.createNotificationSound();
  }

  public createForm(): CustomFormGroup<ChatSearchForm> {
    return this.fb.group({
      searchCriteria: [null, Validators.maxLength(100)],
    }) as CustomFormGroup<ChatSearchForm>;
  }

  public playNotificationSound(): void {
    this.sound.play();
  }

  private createNotificationSound(): void {
    this.sound.src = '../../../assets/audio/notification.mp3';
    this.sound.load();
  }
}
