import { Observable, Subscriber } from 'rxjs';

export class ObservableHelper {
  public static blobToBase64Observable(blob: Blob): Observable<string> {
    return new Observable<string>((subscriber: Subscriber<string>) => {
      const reader = new FileReader();

      reader.onload = () => {
        subscriber.next(reader.result as string);
        subscriber.complete();
      };

      reader.readAsDataURL(blob);
    })
  }
}
