import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlgoDataService {
  private apiUrl = 'http://localhost:8080/api/get-exp-strike';
  private nseDataUrl = 'http://localhost:8080/api/get-option-chain-data';
  // private apiUrl = 'https://algo.cryptogyani.com/api/get-exp-strike';
  // private nseDataUrl = 'https://algo.cryptogyani.com/api/get-data';

  constructor(private http: HttpClient) {}

  getExchangeData(exchange: string): Observable<any> {
    const body = {exchange: exchange };
    return this.http.post<any>(this.apiUrl, body);
  }

  getNseData(payload: any): Observable<any> {
    return this.http.post<any>(this.nseDataUrl, payload);
  }
}
