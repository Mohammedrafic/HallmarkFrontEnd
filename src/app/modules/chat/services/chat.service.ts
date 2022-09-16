import { FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { CustomFormGroup } from '@core/interface';
import { ChatSearchForm } from '../interfaces';

@Injectable()
export class ChatService {
  constructor(
    private fb: FormBuilder,
  ) {}

  public createForm(): CustomFormGroup<ChatSearchForm> {
    return this.fb.group({
      searchCriteria: [null, Validators.maxLength(100)],
    }) as CustomFormGroup<ChatSearchForm>;
  }
}
