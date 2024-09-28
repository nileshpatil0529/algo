import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertsListUrl = 'https://algo.cryptogyani.com/api/get-alerts-list';
  private alertsUrl = 'https://algo.cryptogyani.com/api/get-alerts';

  constructor(private http: HttpClient) {}

  getAlertsList(): Observable<any> {
    return this.http.get(this.alertsListUrl);
  }

  getAlerts(indicator: string): Observable<any> {
    const body = { indicator };
    return this.http.post(this.alertsUrl, body);
  }
}
