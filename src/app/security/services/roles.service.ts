import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportPayload } from '@shared/models/export.model';
import { PermissionsTree } from '@shared/models/permission.model';
import { Role, RoleDTO, RolesFilters, RolesPage } from '@shared/models/roles.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private http: HttpClient) {}

  /**
   * Get the list of roles by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitIds
   * @param PageNumber
   * @param PageSize
   * @param Filters
   *
   * @return RolesPage
   */
  public getRolesPage(
    BusinessUnitType: BusinessUnitType,
    BusinessUnitIds: number[],
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    Filters: RolesFilters
  ): Observable<RolesPage> {
    return this.http.post<RolesPage>(`/api/Roles/Filtered`, { BusinessUnitType, BusinessUnitIds, PageNumber, PageSize, SortModel, FilterModel, ...Filters });
  }

  /**
   * Get Permissions Tree
   * @param BusinessUnitType
   * @return PermissionsTree
   */
  public getPermissionsTree(BusinessUnitType: BusinessUnitType): Observable<PermissionsTree> {
    return this.http.get<PermissionsTree>(`/api/Permissions`, { params: { BusinessUnitType } });
  }

/**
   * Get Permissions Tree
   * @param BusinessUnitType
   * @return PermissionsTree
   */
  public getPermissionsIRPTree(BusinessUnitType: BusinessUnitType): Observable<PermissionsTree> {
    return this.http.get<PermissionsTree>(`/api/Permissions/GetIRPPermissions`, { params: { BusinessUnitType } });
  }
  /**
   * Seve Role
   * @param RoleDTO
   * @return Role
   */
  public seveRoles(role: RoleDTO): Observable<Role> {
    return role.id ? this.http.put<Role>(`/api/Roles`, role) : this.http.post<Role>(`/api/Roles`, role);
  }

  /**
   * Remove Role
   * @param Role id
   */
  public removeRoles(id: number): Observable<never> {
    return this.http.delete<never>(`/api/Roles/${id}`);
  }

    /**
   * Get Role by business unit type and id
   * @param BusinessUnitType
   * @param BusinessUnitId
   * @return Roles array
   */
     public getRolesForCopy(BusinessUnitType: BusinessUnitType, BusinessUnitId: number): Observable<Role[]> {
      return this.http.get<Role[]>(`/api/Roles/listByBusinessUnit`, { params: { BusinessUnitType, BusinessUnitId } });
    }

  /**
  * Export users list
  * @param payload
  */
  public export(payload: ExportPayload): Observable<Blob> {
    return this.http.post(`/api/Roles/export`, payload, { responseType: 'blob' });
  }
}
