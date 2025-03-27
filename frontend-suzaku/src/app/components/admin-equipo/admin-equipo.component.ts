import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-equipo.component.html',
  styleUrls: ['./admin-equipo.component.css']
})
export class AdminEquipoComponent implements OnInit {

  // Lista completa de integrantes
  integrantes: any[] = [];
  // Lista filtrada según “jugador” / “creador”
  integrantesFiltrados: any[] = [];

  // Variable para distinguir entre crear y editar
  modoEdicion = false;
  // Para mostrar u ocultar formulario
  mostrarForm = false;

  // ✅ Filtro: "jugador" o "creador"
  filtroTipo = 'jugador';

  // Objeto para el form
  integranteSeleccionado: any = {
    id: null,
    nombre: '',
    primer_apellido: '',
    nickname: '',
    descripcion: '',
    tipo: 'jugador',
    foto: null
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarIntegrantes();
  }

  // 1) Cargar lista total y filtrar
  cargarIntegrantes(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/equipo/')
      .subscribe({
        next: (data) => {
          this.integrantes = data;
          // Iniciar el filtrado
          this.filtrarIntegrantes();
        },
        error: (err) => {
          console.error('Error al cargar integrantes:', err);
        }
      });
  }

  // 2) Método para aplicar el filtro
  filtrarIntegrantes(): void {
    this.integrantesFiltrados = this.integrantes.filter((i) => i.tipo === this.filtroTipo);
  }

  // 3) Cambiar el filtro según la elección: “jugador” o “creador”
  seleccionarFiltro(tipo: string): void {
    this.filtroTipo = tipo;  
    this.filtrarIntegrantes(); 
  }

  // Crear nuevo
  nuevoIntegrante(): void {
    this.modoEdicion = false;
    this.mostrarForm = true;
    this.integranteSeleccionado = {
      id: null,
      nombre: '',
      primer_apellido: '',
      nickname: '',
      descripcion: '',
      tipo: 'jugador',
      foto: null
    };
  }

  // Editar existente
  editarIntegrante(integrante: any): void {
    this.modoEdicion = true;
    this.mostrarForm = true;
    this.integranteSeleccionado = {
      id: integrante.id,
      nombre: integrante.nombre,
      primer_apellido: integrante.primer_apellido,
      nickname: integrante.nickname,
      descripcion: integrante.descripcion,
      tipo: integrante.tipo,
      foto: null
    };
  }

  // Manejar archivo de imagen
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.integranteSeleccionado.foto = file;
    }
  }

  // Guardar (crear/actualizar)
  guardarIntegrante(): void {
    const formData = new FormData();
    formData.append('nombre', this.integranteSeleccionado.nombre);
    formData.append('primer_apellido', this.integranteSeleccionado.primer_apellido);
    formData.append('nickname', this.integranteSeleccionado.nickname);
    formData.append('descripcion', this.integranteSeleccionado.descripcion);
    formData.append('tipo', this.integranteSeleccionado.tipo);

    if (this.integranteSeleccionado.foto) {
      formData.append('foto', this.integranteSeleccionado.foto);
    }

    if (this.modoEdicion && this.integranteSeleccionado.id !== null) {
      // PUT /api/equipo/<id>/
      this.http.put(`http://127.0.0.1:8000/api/equipo/${this.integranteSeleccionado.id}/`, formData)
        .subscribe({
          next: () => {
            alert('Integrante actualizado correctamente');
            this.cargarIntegrantes();
            this.mostrarForm = false;
            this.modoEdicion = false;
          },
          error: (err) => {
            console.error('Error al actualizar integrante', err);
            alert('Error al actualizar integrante');
          }
        });
    } else {
      // POST /api/equipo/
      this.http.post('http://127.0.0.1:8000/api/equipo/', formData)
        .subscribe({
          next: () => {
            alert('Integrante creado correctamente');
            this.cargarIntegrantes();
            this.mostrarForm = false;
          },
          error: (err) => {
            console.error('Error al crear integrante', err);
            alert('Error al crear integrante');
          }
        });
    }
  }

  // Eliminar
  eliminarIntegrante(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este integrante?')) return;

    this.http.delete(`http://127.0.0.1:8000/api/equipo/${id}/`)
      .subscribe({
        next: () => {
          alert('Integrante eliminado');
          this.cargarIntegrantes();
        },
        error: (err) => {
          console.error('Error al eliminar integrante', err);
          alert('Error al eliminar integrante');
        }
      });
  }

  // Cancelar
  cancelar(): void {
    this.mostrarForm = false;
    this.modoEdicion = false;
  }

}
