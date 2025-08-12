import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Secreto } from '../../models/secreto.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SecretoService {
  private apiUrl = `${environment.apiUrl}/secretos`;

  constructor(private http: HttpClient) {}

  getSecretos(): Observable<Secreto[]> {
    return this.http.get<Secreto[]>(this.apiUrl);
  }

  getSecretoPorId(id: number): Observable<Secreto> {
    return this.http.get<Secreto>(`${this.apiUrl}/${id}`);
  }


}
