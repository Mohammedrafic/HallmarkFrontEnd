import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CandidateService } from '@agency/services/candidates.service';
import { Observable, switchMap } from 'rxjs';
import { ObservableHelper } from '@core/helpers/observable.helper';

@Pipe({
  name: 'candidateAvatar',
  pure: false,
})
export class CandidateAvatarPipe implements PipeTransform, OnDestroy {
  private asyncPipe: AsyncPipe = new AsyncPipe(this.cdr);
  private request: Observable<string> | null = null;

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  public ngOnDestroy(): void {
    this.asyncPipe.ngOnDestroy();
  }

  public transform(candidateId: number): string | null {
    return this.asyncPipe.transform<string>(
      this.request || (this.request = this.candidateService.getCandidatePhoto(candidateId)
        .pipe(
          switchMap((blob: Blob) => ObservableHelper.blobToBase64Observable(blob)),
        )
    ));
  }
}

