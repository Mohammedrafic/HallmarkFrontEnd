import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { Store } from '@ngxs/store';
import { UserService } from '@shared/services/user.service';
import { Observable, catchError, map, of } from 'rxjs';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';

@Injectable({
  providedIn: 'root'
})
export class NotificationResolver implements Resolve<boolean> {
  
  constructor(private router: Router, private userService:UserService, private store: Store,) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    let routeSnapshot = state.url.split('/notification/'+route.params['notificationId']);
    return this.userService.getAlertDetailsForId(route.params['notificationId']).pipe(
      map((data) => {
        if (data.organizationId) {
            window.localStorage.setItem("BussinessUnitID",JSON.stringify(data.organizationId));
            this.store.dispatch(
              new SetLastSelectedOrganizationAgencyId({
                lastSelectedAgencyId: null,
                lastSelectedOrganizationId: data.organizationId
              })
            );
        }
        if(data.orderId){
            window.localStorage.setItem("OrderId",JSON.stringify(data.orderId));
        }
        if(data.title){
            window.localStorage.setItem("alertTitle",JSON.stringify(data.alertTitle));
        } 
        if(data.id){
          window.localStorage.setItem("alertId",JSON.stringify(data.id));
        }     
        if(data.publicId){
          window.localStorage.setItem("OrderPublicId",JSON.stringify(data.publicId));
        }

        this.router.navigate([routeSnapshot[0]]);
        return true;
      }),catchError(err => {
        this.router.navigate([+routeSnapshot[0]]);
        return of(true);
      })
    );

  }
}
