import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private http = inject(HttpClient);
	private apiUrl = 'http://127.0.0.1:8000/api/users';

	getUsers(): Observable<any[]> {
		return this.http.get<any[]>(this.apiUrl);
	}
	deleteUser(id: string) {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
	createUser(userData: FormData) {
		return this.http.post(this.apiUrl, userData);
	}
	getUser(id: string) {
		return this.http.get<any>(`${this.apiUrl}/${id}`);
	}
	updateUser(id: string, userData: FormData) {
		// Usamos POST pero Laravel lo interpretará como PUT gracias al campo '_method'
		return this.http.post(`${this.apiUrl}/${id}`, userData);
	}
}