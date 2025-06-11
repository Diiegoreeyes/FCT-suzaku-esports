import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DireccionesService } from '../../services/direcciones.service';

@Component({
  selector: 'app-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {
  direcciones: any[] = [];
  direccionForm!: FormGroup;
  mensaje: string = '';
  direccionEditando: any = null;

  mostrarFormulario: boolean = false; // Control de visibilidad para "Agregar Nueva Dirección"

  constructor(
    private direccionesService: DireccionesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarDirecciones();
    this.inicializarFormulario();
  }

  // Cargar direcciones desde el servicio
  cargarDirecciones(): void {
    this.direccionesService.getDirecciones().subscribe({
      next: (data) => {
        this.direcciones = data;
        // data debería contener [{ id, alias, direccion, ciudad, provincia, codigo_postal, pais, activa }]
      },
      error: (error) => {
        console.error('Error al cargar direcciones', error);
      }
    });
  }

  // Inicializar el formulario para agregar dirección
  inicializarFormulario(): void {
    this.direccionForm = this.fb.group({
      alias: [''],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      provincia: [''],
      codigo_postal: [''],
      pais: ['', Validators.required]
    });
  }

  // Método para preparar edición
  editarDireccion(dir: any): void {
    this.direccionEditando = dir;
    this.mostrarFormulario = true;

    this.direccionForm.patchValue({
      alias: dir.alias,
      direccion: dir.direccion,
      ciudad: dir.ciudad,
      provincia: dir.provincia,
      codigo_postal: dir.codigo_postal,
      pais: dir.pais
    });

    this.mensaje = '';
  }
  // Toggle para mostrar/ocultar el formulario de nueva dirección
  toggleFormulario(): void {
    if (this.mostrarFormulario && this.direccionEditando) {
      this.direccionEditando = null; // cancelar edición
      this.direccionForm.reset();
      this.mensaje = '';
      this.mostrarFormulario = false;
    } else {
      this.mostrarFormulario = !this.mostrarFormulario;
      if (this.mostrarFormulario) {
        this.direccionForm.reset();
        this.mensaje = '';
      }
    }
  }

  agregarDireccion(): void {
    if (this.direccionForm.invalid) {
      return;
    }

    const data = this.direccionForm.value;

    if (this.direccionEditando) {
      // Actualizar
      this.actualizarDireccion(this.direccionEditando.id, data);
    } else {
      // Crear nueva
      this.direccionesService.crearDireccion(data).subscribe({
        next: (res) => {
          this.mensaje = "Dirección creada exitosamente";
          this.direccionForm.reset();
          this.mostrarFormulario = false;
          this.cargarDirecciones();
        },
        error: (err) => {
          console.error('Error al crear la dirección', err);
          this.mensaje = "Error al crear la dirección";
        }
      });
    }
  }

  actualizarDireccion(id: number, data: any): void {
    this.direccionesService.actualizarDireccion(id, data).subscribe({
      next: () => {
        this.mensaje = "Dirección actualizada correctamente";
        this.direccionForm.reset();
        this.mostrarFormulario = false;
        this.direccionEditando = null;
        this.cargarDirecciones();
      },
      error: (err) => {
        console.error('Error al actualizar dirección', err);
        this.mensaje = "Error al actualizar la dirección";
      }
    });
  }

  // Marcar una dirección como activa
  marcarComoActiva(dir: any): void {
    // 1) Si la dirección ya está activa, no hacemos nada
    if (dir.activa) {
      return;
    }

    // 2) Enviamos patch al backend con activa=true
    const dataPatch = { activa: true };
    this.direccionesService.actualizarDireccion(dir.id, dataPatch).subscribe({
      next: () => {
        // Tras marcar ésta como activa, el backend debería
        // desactivar las demás. Volvemos a recargar.
        this.cargarDirecciones();
      },
      error: (err) => {
        console.error('Error al marcar dirección como activa', err);
        this.mensaje = "Error al marcar dirección como activa";
      }
    });
  }

  // Eliminar dirección (opcional)
  eliminarDireccion(dir: any): void {
    if (!confirm('¿Deseas eliminar esta dirección?')) {
      return;
    }
    this.direccionesService.eliminarDireccion(dir.id).subscribe({
      next: () => {
        this.mensaje = 'Dirección eliminada';
        this.cargarDirecciones();
      },
      error: (err) => {
        console.error('Error al eliminar dirección', err);
        this.mensaje = 'Error al eliminar dirección';
      }
    });
  }
}
