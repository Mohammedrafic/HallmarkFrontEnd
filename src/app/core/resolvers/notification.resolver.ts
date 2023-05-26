import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { UserService } from '@shared/services/user.service';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationResolver implements Resolve<boolean> {
  constructor(private router: Router, private userService:UserService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService.getAlertDetailsForId(route.params['notificationId']).pipe(
      map((data) => {
      //  console.log('data',data);
      if (data.businessUnitId) {
          window.localStorage.setItem("BussinessUnitID",JSON.stringify(data.businessUnitId));
      }
      if(data.orderId){
        window.localStorage.setItem("OrderId",JSON.stringify(data.orderId));
      }
      if(data.title){
       window.localStorage.setItem("alertTitle",JSON.stringify(data.title));
      }
        this.router.navigate(['/client/order-management']);
        return true;
      }),catchError(err => {
       // console.log('err =====>',err);
        this.router.navigate(['/client/order-management']);
        return of(true);
      })
    );

  }
}
