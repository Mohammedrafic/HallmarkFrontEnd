import { ContactUs } from '../shared/models/contact-us.model';
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { ContactUsService } from "@shared/services/contact-us.service";
import { catchError, Observable, tap } from "rxjs";
import {  SaveContactUsForm, SaveContactUsFormSucceeded} from "../store/contact-us.actions";
import { ShowToast } from "../store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { RECORD_ADDED} from "@shared/constants";
import { HttpErrorResponse } from "@angular/common/http";
import { getAllErrors } from "@shared/utils/error.utils";

export interface ContactUsStateModel {
  ContactSupportEntity:ContactUs |null;
}

@State<ContactUsStateModel>({
  name: 'contactUs'
})


@Injectable()
export class ContactusState {
 
  constructor(private contactUsService:ContactUsService) {}

  @Selector()
  static contactSupportEntity(state: ContactUsStateModel): ContactUs | null {
    return state.ContactSupportEntity;
  }

  @Action(SaveContactUsForm)
  SaveContactUsForm(
    { dispatch }: StateContext<ContactUsStateModel>,
    { contactUs }: SaveContactUsForm
  ): Observable<ContactUs | void> {
     return this.contactUsService.saveContactUs(contactUs).pipe(
      tap((result) => {
        dispatch([
          new ShowToast(MessageTypes.Success, RECORD_ADDED),
          new SaveContactUsFormSucceeded(),
        ]);
        return result;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error))))
    );
  }
}