import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private http = inject(HttpClient);
	private apiUrl = 'http://127.0.0.1:8000/api';

	login(credentials: any) {
		// Añadimos <any> para que la respuesta no sea de tipo 'unknown'
		return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
		tap((response) => {
			if (response.access_token) {
			localStorage.setItem('access_token', response.access_token);
			}
		})
		);
	}
}