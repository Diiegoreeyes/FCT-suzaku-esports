import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CodigosDescuentoService } from '../../services/codigos-descuento.service';

@Component({
  selector: 'app-admin-codigos-descuento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-codigos-descuento.component.html',
  styleUrls: ['./admin-codigos-descuento.component.css']
})
export class AdminCodigosDescuentoComponent implements OnInit {
  /* ──────────────── LISTADO ──────────────── */
  codigos: any[] = [];

  /* ──────────────── CREACIÓN ─────────────── */
  nuevoCodigo: any = { codigo: '', porcentaje: 0 };

  /* ──────────────── EDICIÓN INLINE ────────── */
  editId: number | null = null;
  editCodigo: string = '';
  editPorcentaje: number = 0;

  constructor(private descuentoService: CodigosDescuentoService) {}

  ngOnInit(): void {
    this.obtenerCodigos();
  }

  /* --------- CRUD --------- */

  /** Obtener todos los códigos */
  obtenerCodigos(): void {
    this.descuentoService.getAll().subscribe({
      next: (res: any) => (this.codigos = res.sort(this.ordenarPorCodigo)),
      error: (err) => console.error('Error al obtener códigos:', err)
    });
  }
  
  /** Crear nuevo código */
  crearCodigo(): void {
    if (!this.nuevoCodigo.codigo || this.nuevoCodigo.porcentaje <= 0) return;

    this.descuentoService.create(this.nuevoCodigo).subscribe({
      next: () => {
        this.obtenerCodigos();
        this.nuevoCodigo = { codigo: '', porcentaje: 0 };
      },
      error: (err) => console.error('Error al crear código:', err)
    });
  }

  /** Iniciar edición en la tarjeta seleccionada */
  iniciarEdicion(cod: any): void {
    this.editId = cod.id;
    this.editCodigo = cod.codigo;
    this.editPorcentaje = cod.porcentaje;
  }

  /** Guardar cambios de la tarjeta en edición */
  guardarEdicion(): void {
    if (this.editId === null) return;

    const payload = {
      codigo: this.editCodigo,
      porcentaje: this.editPorcentaje
    };

    this.descuentoService.update(this.editId, payload).subscribe({
      next: () => {
        this.obtenerCodigos();
        this.cancelarEdicion();
      },
      error: (err) => console.error('Error al actualizar código:', err)
    });
  }

  /** Cancelar edición */
  cancelarEdicion(): void {
    this.editId = null;
    this.editCodigo = '';
    this.editPorcentaje = 0;
  }

  /** Eliminar código */
  eliminarCodigo(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este código?')) return;

    this.descuentoService.delete(id).subscribe({
      next: () => this.obtenerCodigos(),
      error: (err) => console.error('Error al eliminar código:', err)
    });
  }

  /** Orden alfabético ascendente por 'codigo' */
  private ordenarPorCodigo(a: any, b: any): number {
    return a.codigo.localeCompare(b.codigo, 'es', { sensitivity: 'base' });
  }

}
