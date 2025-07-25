import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

// Importaciones de Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';

import * as XLSX from 'xlsx'; // Importa la librería para Excel
import jsPDF from 'jspdf'; // Importa la librería principal para PDF
import autoTable from 'jspdf-autotable'; // Importa el plugin para tablas en PDF


@Component({
	selector: 'app-users',
	standalone: true,
	imports: [
		CommonModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule
	],
	templateUrl: './users.html',
	styleUrl: './users.scss'
})
export class UsersComponent implements OnInit, AfterViewInit {
	private userService = inject(UserService);
	private backendUrl = 'http://127.0.0.1:8000';
	displayedColumns: string[] = ['user_code', 'email', 'name', 'created_at', 'actions'];
	dataSource: MatTableDataSource<any>;

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	constructor() {
		this.dataSource = new MatTableDataSource<any>([]);
	}

	ngOnInit(): void {
		this.loadUsers();
	}

	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	loadUsers(): void {
		this.userService.getUsers().subscribe(data => {
			this.dataSource.data = data;
		});
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	deleteUser(user: any): void {
		Swal.fire({
			title: '¿Estás seguro?',
			text: `Deseas eliminar al usuario "${user.name}". Esta acción no se puede revertir.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Sí, ¡eliminar!',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.isConfirmed) {
				this.userService.deleteUser(user._id).subscribe(() => {
					Swal.fire(
						'¡Eliminado!',
						'El usuario ha sido eliminado.',
						'success'
					);
					this.loadUsers(); // Recarga la tabla para reflejar el cambio
				});
			}
		});
	}
	openUserModal(): void {
		Swal.fire({
			title: 'Nuevo Usuario',
			html: `
        <input id="swal-input-name" class="swal2-input" placeholder="Nombre completo">
        <input id="swal-input-email" type="email" class="swal2-input" placeholder="Correo electrónico">
        <input id="swal-input-phone" type="tel" class="swal2-input" placeholder="Teléfono (Opcional)">
        <input id="swal-input-photo" type="file" class="swal2-file" accept="image/*">
      `,
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			cancelButtonText: 'Cancelar',
			preConfirm: () => {
				const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
				const email = (document.getElementById('swal-input-email') as HTMLInputElement).value;
				const phone = (document.getElementById('swal-input-phone') as HTMLInputElement).value;
				const photoInput = (document.getElementById('swal-input-photo') as HTMLInputElement);
				const photo = photoInput.files ? photoInput.files[0] : null;

				if (!name || !email || !photo) {
					Swal.showValidationMessage(`Nombre, correo y foto son requeridos`);
					return false;
				}

				const formData = new FormData();
				formData.append('name', name);
				formData.append('email', email);
				if (phone) {
					formData.append('phone', phone);
				}
				formData.append('profile_photo', photo);

				return formData;
			}
		}).then((result) => {
			if (result.isConfirmed) {
				this.userService.createUser(result.value).subscribe({
					next: () => {
						this.loadUsers();
						Swal.fire('¡Guardado!', 'El usuario ha sido creado.', 'success');
					},
					error: (err) => {
						Swal.fire('Error', 'No se pudo crear el usuario. Revisa los datos.', 'error');
						console.error(err);
					}
				});
			}
		});
	}
	openDetailModal(user: any): void {
		const photoUrl = user.profile_photo_path
			? `${this.backendUrl}/storage/${user.profile_photo_path}`
			: 'https://via.placeholder.com/150';

		// Lógica para generar la lista de perfiles como "badges"
		let profilesHtml = '<p><strong>Perfiles:</strong> No asignados</p>';
		if (user.profiles && user.profiles.length > 0) {
			const badges = user.profiles.map((profile: string) =>
				`<span style="background-color: #e0e0e0; color: #333; border-radius: 12px; padding: 4px 12px; margin-right: 5px; font-size: 12px;">${profile}</span>`
			).join('');
			profilesHtml = `<p><strong>Perfiles:</strong> ${badges}</p>`;
		}

		Swal.fire({
			title: `Detalles de ${user.name}`,
			html: `
      <div style="text-align: left; padding: 1em;">
        <div style="text-align: center; margin-bottom: 1em;">
          <img src="${photoUrl}" alt="Foto de perfil" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
        </div>
        <p><strong>Usuario (Email):</strong> ${user.email}</p>
        <p><strong>Nombre:</strong> ${user.name}</p>
        <p><strong>Teléfono:</strong> ${user.phone || 'No especificado'}</p>
        ${profilesHtml} </div>
    `,
			confirmButtonText: 'Cerrar'
		});
	}
	openEditUserModal(user: any): void {
		Swal.fire({
			title: 'Editar Usuario',
			html: `
        <input id="swal-input-name" class="swal2-input" placeholder="Nombre completo" value="${user.name}">
        <input id="swal-input-email" type="email" class="swal2-input" placeholder="Correo electrónico" value="${user.email}">
        <input id="swal-input-phone" type="tel" class="swal2-input" placeholder="Teléfono (Opcional)" value="${user.phone || ''}">
        <label style="display: block; margin-top: 1em;">Cambiar foto de perfil (opcional)</label>
        <input id="swal-input-photo" type="file" class="swal2-file" accept="image/*">
      `,
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonText: 'Actualizar',
			cancelButtonText: 'Cancelar',
			preConfirm: () => {
				const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
				const email = (document.getElementById('swal-input-email') as HTMLInputElement).value;
				const phone = (document.getElementById('swal-input-phone') as HTMLInputElement).value;
				const photoInput = (document.getElementById('swal-input-photo') as HTMLInputElement);
				const photo = photoInput.files ? photoInput.files[0] : null;

				if (!name || !email) {
					Swal.showValidationMessage(`Nombre y correo son requeridos`);
					return false;
				}

				const formData = new FormData();
				formData.append('_method', 'PUT'); // <-- Method spoofing para Laravel
				formData.append('name', name);
				formData.append('email', email);
				if (phone) {
					formData.append('phone', phone);
				}
				if (photo) {
					formData.append('profile_photo', photo);
				}

				return formData;
			}
		}).then((result) => {
			if (result.isConfirmed) {
				this.userService.updateUser(user._id, result.value).subscribe({
					next: () => {
						this.loadUsers();
						Swal.fire('¡Actualizado!', 'El usuario ha sido modificado.', 'success');
					},
					error: (err) => {
						Swal.fire('Error', 'No se pudo actualizar el usuario. Revisa los datos.', 'error');
					}
				});
			}
		});
	}


	/**
	 * Acciones de datatable para exportar a Excel y PDF 
	*/
	exportToExcel(): void {
		// 1. Tomamos los datos filtrados y ordenados directamente de la tabla
		const dataToExport = this.dataSource.filteredData.map(user => {
			return {
				'Código': user._id,
				'Nombre': user.name,
				'Usuario': user.email,
				'Fecha de Creación': new Date(user.created_at).toLocaleString()
			};
		});

		// 2. Creamos una hoja de cálculo a partir de los datos
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

		// 3. Creamos un libro de trabajo y le añadimos la hoja
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

		// 4. Descargamos el archivo
		XLSX.writeFile(wb, 'listado_usuarios.xlsx');
	}

	exportToPdf(): void {
		const doc = new jsPDF();

		// 1. Define las columnas que quieres en el PDF
		const head = [['Código', 'Nombre', 'Usuario', 'Fecha de Creación']];

		// 2. Mapea los datos de la tabla al formato que necesita la librería
		const body = this.dataSource.filteredData.map(user => {
			return [user._id, user.name, user.email, new Date(user.created_at).toLocaleString()];
		});

		// 3. Genera la tabla en el documento PDF
		autoTable(doc, { head, body });

		// 4. Descarga el archivo
		doc.save('listado_usuarios.pdf');
	}
}