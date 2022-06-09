import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WidgetService {
  private readonly baseUrl = '/api/Dashboard';
  
  constructor(private httpClient: HttpClient) {}

  getWidgetList() {
    return this.httpClient.get(`${this.baseUrl}/AvailableWidgets`);
  }
}
