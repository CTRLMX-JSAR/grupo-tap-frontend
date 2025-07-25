import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/products';

  getProducts() {
    return this.http.get<any[]>(this.apiUrl);
  }
  createProduct(product: { name: string; brand: string; price: number }) {
    return this.http.post(this.apiUrl, product);
  }
  deleteProduct(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  updateProduct(id: string, product: { name: string; brand: string; price: number }) {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }
}