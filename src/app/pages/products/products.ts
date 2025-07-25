import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import Swal from 'sweetalert2'; // 1. Importa SweetAlert2
import { MatIconModule } from '@angular/material/icon';
// Importaciones de Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
	MatIconModule 
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  // Inyección de servicios
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  // Columnas que se mostrarán en la tabla
  displayedColumns: string[] = ['product_code', 'name', 'price','brand', 'created_at', 'actions'];
  // Fuente de datos para la tabla de Material
  dataSource: MatTableDataSource<any>;

  // 3. Usa @ViewChild para obtener una referencia al paginador y al ordenador de la vista
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Formulario para crear productos
  productForm = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    price: [null, [Validators.required, Validators.max(999)]]
  });

  constructor() {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // 4. Añade el método ngAfterViewInit
  ngAfterViewInit() {
    // Conecta el paginador y el ordenador a la fuente de datos
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

	loadProducts(): void {
		this.productService.getProducts().subscribe(data => {
		this.dataSource.data = data;
		});
	}
  
	onSubmit(): void {
		if (this.productForm.valid) {
		this.productService.createProduct(this.productForm.value as any).subscribe(() => {
			this.loadProducts();
			this.productForm.reset();
		});
		}
	}

  	// Método para el filtrado de la tabla
	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
		this.dataSource.paginator.firstPage();
		}
	}
	// 2. Método para abrir el modal de SweetAlert2
	openProductModal() {
		Swal.fire({
		title: 'Nuevo Producto',
		html: `
			<input id="swal-input-name" class="swal2-input" placeholder="Nombre del producto">
			<input id="swal-input-brand" class="swal2-input" placeholder="Marca">
			<input id="swal-input-price" type="number" class="swal2-input" placeholder="Precio (máx. 999)">
		`,
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: 'Guardar',
		cancelButtonText: 'Cancelar',
		preConfirm: () => {
			// Valida y recoge los datos del formulario del modal
			const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
			const brand = (document.getElementById('swal-input-brand') as HTMLInputElement).value;
			const price = parseInt((document.getElementById('swal-input-price') as HTMLInputElement).value, 10);

			if (!name || !brand || !price) {
			Swal.showValidationMessage(`Todos los campos son requeridos`);
			return false;
			}
			if (price > 999) {
				Swal.showValidationMessage(`El precio no puede ser mayor a 999`);
				return false;
			}
			return { name, brand, price };
		}
		}).then((result) => {
		// Si el formulario se confirmó y los datos son válidos, crea el producto
		if (result.isConfirmed) {
			this.productService.createProduct(result.value).subscribe(() => {
			this.loadProducts(); // Recarga la tabla
			Swal.fire('¡Guardado!', 'El producto ha sido creado.', 'success');
			});
		}
		});
	}


	openEditModal(product: any) {
		Swal.fire({
		title: 'Editar Producto',
		html: `
			<input id="swal-input-name" class="swal2-input" placeholder="Nombre" value="${product.name}">
			<input id="swal-input-brand" class="swal2-input" placeholder="Marca" value="${product.brand}">
			<input id="swal-input-price" type="number" class="swal2-input" placeholder="Precio" value="${product.price}">
		`,
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: 'Actualizar',
		cancelButtonText: 'Cancelar',
		preConfirm: () => {
			const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
			const brand = (document.getElementById('swal-input-brand') as HTMLInputElement).value;
			const price = parseInt((document.getElementById('swal-input-price') as HTMLInputElement).value, 10);

			if (!name || !brand || isNaN(price)) {
			Swal.showValidationMessage(`Todos los campos son requeridos`);
			return false;
			}
			if (price > 999) {
			Swal.showValidationMessage(`El precio no puede ser mayor a 999`);
			return false;
			}
			return { name, brand, price };
		}
		}).then((result) => {
		if (result.isConfirmed) {
			// Llama al nuevo método 'updateProduct' del servicio
			this.productService.updateProduct(product._id, result.value).subscribe(() => {
			this.loadProducts(); // Recarga la tabla
			Swal.fire('¡Actualizado!', 'El producto ha sido modificado.', 'success');
			});
		}
		});
	}
  /**
   * Acciones dentro de listado de productos 
   */
  	deleteProduct(product: any) {
		Swal.fire({
		title: '¿Estás seguro?',
		text: `Deseas eliminar el producto "${product.name}". ¡Esta acción no se puede revertir!`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sí, ¡eliminar!',
		cancelButtonText: 'Cancelar'
		}).then((result) => {
		// Si el usuario confirma la eliminación
		if (result.isConfirmed) {
			this.productService.deleteProduct(product._id).subscribe(() => {
			Swal.fire(
				'¡Eliminado!',
				'El producto ha sido eliminado.',
				'success'
			);
			// Recarga la tabla para mostrar los cambios
			this.loadProducts();
			});
		}
		});
	}
	
}