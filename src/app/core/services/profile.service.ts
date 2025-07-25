import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/profiles';

  getProfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  createProfile(profile: { name: string }): Observable<any> {
    return this.http.post(this.apiUrl, profile);
  }

  updateProfile(id: string, profile: { name: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, profile);
  }

  deleteProfile(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
