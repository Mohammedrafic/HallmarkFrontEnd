import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CandidateService } from '@agency/services/candidates.service';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { ObservableHelper } from '@core/helpers/observable.helper';

@Pipe({
  name: 'candidateAvatar',
  pure: false,
})
export class CandidateAvatarPipe implements PipeTransform, OnDestroy {
  private asyncPipe: AsyncPipe = new AsyncPipe(this.cdr);
  private request: Observable<string> | null = null;
  private candidateId: number = -1;

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  public ngOnDestroy(): void {
    this.asyncPipe.ngOnDestroy();
  }

  public transform(candidateId: number): string | null {
    if (candidateId !== this.candidateId) {
      this.request = null;
    }

    this.candidateId = candidateId;

    return this.asyncPipe.transform<string>(
      this.request || (this.request = this.candidateService.getCandidatePhoto(candidateId)
        .pipe(
          switchMap((blob: Blob) => ObservableHelper.blobToBase64Observable(blob)),
          catchError(() => of('assets/default-avatar.svg'))
        )
    ));
  }
}

