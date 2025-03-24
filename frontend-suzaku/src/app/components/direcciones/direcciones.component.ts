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

  // Toggle para mostrar/ocultar el formulario de nueva dirección
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario) {
      this.direccionForm.reset();
      this.mensaje = '';
    }
  }

  // Enviar el formulario para crear una nueva dirección
  agregarDireccion(): void {
    if (this.direccionForm.invalid) {
      return;
    }

    const data = {
      alias: this.direccionForm.get('alias')?.value,
      direccion: this.direccionForm.get('direccion')?.value,
      ciudad: this.direccionForm.get('ciudad')?.value,
      provincia: this.direccionForm.get('provincia')?.value,
      codigo_postal: this.direccionForm.get('codigo_postal')?.value,
      pais: this.direccionForm.get('pais')?.value
    };

    this.direccionesService.crearDireccion(data).subscribe({
      next: (res) => {
        this.mensaje = "Dirección creada exitosamente";
        this.direccionForm.reset();
        this.mostrarFormulario = false; // Ocultamos el formulario tras crear
        this.cargarDirecciones(); // Recargar direcciones para ver la nueva
      },
      error: (err) => {
        console.error('Error al crear la dirección', err);
        this.mensaje = "Error al crear la dirección";
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
