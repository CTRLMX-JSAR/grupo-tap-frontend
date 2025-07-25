import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import Swal from 'sweetalert2';

// Importaciones de Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
	selector: 'app-profiles',
	standalone: true,
	imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
	templateUrl: './profiles.html',
	styleUrl: './profiles.scss'
})

export class ProfilesComponent implements OnInit, AfterViewInit {
	private profileService = inject(ProfileService);

	displayedColumns: string[] = ['profile_code', 'name', 'created_at', 'actions'];
	dataSource: MatTableDataSource<any>;

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	constructor() {
		this.dataSource = new MatTableDataSource<any>([]);
	}

	ngOnInit(): void {
		this.loadProfiles();
	}

	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	loadProfiles(): void {
		this.profileService.getProfiles().subscribe(data => {
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

	openCreateModal(): void {
		Swal.fire({
			title: 'Nuevo Perfil',
			html: `<input id="swal-input-name" class="swal2-input" placeholder="Nombre del perfil">`,
			focusConfirm: false,
			showCancelButton: true,
			preConfirm: () => {
				const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
				if (!name) {
					Swal.showValidationMessage(`El nombre es requerido`);
					return false;
				}
				return { name };
			}
		}).then(result => {
			if (result.isConfirmed) {
				this.profileService.createProfile(result.value).subscribe(() => {
					this.loadProfiles();
					Swal.fire('¡Guardado!', 'El perfil ha sido creado.', 'success');
				});
			}
		});
	}

	openDetailModal(profile: any): void {
		// Formatea la fecha para mostrarla
		const creationDate = new Date(profile.created_at).toLocaleString('es-MX');

		Swal.fire({
			title: 'Detalles del Perfil',
			html: `
        <div style="text-align: left; padding: 1em;">
          <p><strong>Código de perfil:</strong> ${profile._id}</p>
          <p><strong>Nombre de perfil:</strong> ${profile.name}</p>
          <p><strong>Fecha de creación:</strong> ${creationDate}</p>
          </div>
      `,
			confirmButtonText: 'Cerrar'
		});
	}

	openEditModal(profile: any): void {
		Swal.fire({
			title: 'Editar Perfil',
			html: `<input id="swal-input-name" class="swal2-input" placeholder="Nombre del perfil" value="${profile.name}">`,
			focusConfirm: false,
			showCancelButton: true,
			preConfirm: () => {
				const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
				if (!name) {
					Swal.showValidationMessage(`El nombre es requerido`);
					return false;
				}
				return { name };
			}
		}).then(result => {
			if (result.isConfirmed) {
				this.profileService.updateProfile(profile._id, result.value).subscribe(() => {
					this.loadProfiles();
					Swal.fire('¡Actualizado!', 'El perfil ha sido modificado.', 'success');
				});
			}
		});
	}

	deleteProfile(profile: any): void {
		Swal.fire({
			title: '¿Estás seguro?',
			text: `Deseas eliminar el perfil "${profile.name}".`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, ¡eliminar!',
		}).then((result) => {
			if (result.isConfirmed) {
				this.profileService.deleteProfile(profile._id).subscribe(() => {
					this.loadProfiles();
					Swal.fire('¡Eliminado!', 'El perfil ha sido eliminado.', 'success');
				});
			}
		});
	}

	exportToExcel(): void {
		const dataToExport = this.dataSource.filteredData.map(profile => {
			return {
				'Código': profile._id,
				'Nombre': profile.name,
				'Fecha de Creación': new Date(profile.created_at).toLocaleString()
			};
		});

		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Perfiles');
		XLSX.writeFile(wb, 'listado_perfiles.xlsx');
	}
	exportToPdf(): void {
		const doc = new jsPDF();
		const head = [['Código', 'Nombre', 'Fecha de Creación']];
		const body = this.dataSource.filteredData.map(profile => {
			return [profile._id, profile.name, new Date(profile.created_at).toLocaleString()];
		});

		autoTable(doc, { head, body });
		doc.save('listado_perfiles.pdf');
	}
}