import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-equipo.component.html',
  styleUrls: ['./admin-equipo.component.css']
})
export class AdminEquipoComponent implements OnInit {

  /* ───────── API ───────── */
  private api = 'http://127.0.0.1:8000/api/equipo/';

  /* ───────── LISTAS ───────── */
  integrantes: any[] = [];
  integrantesFiltrados: any[] = [];

  /* ───────── CREACIÓN GLOBAL ───────── */
  mostrarForm = false;
  integranteSeleccionado: any = {
    id: null,
    nombre: '',
    primer_apellido: '',
    nickname: '',
    descripcion: '',
    tipo: 'jugador',
    foto: null as File | null
  };

  /* ───────── EDICIÓN INLINE ───────── */
  editId: number | null = null;
  editNombre = '';
  editApellido = '';
  editNick = '';
  editDescripcion = '';
  editTipo: 'jugador' | 'creador' = 'jugador';
  editFoto: File | null = null;
  editPreviewUrl: string | null = null;

  /* ───────── CONTROL DE MODO ───────── */
  modoEdicion = false;          // true = estamos editando
  filtroTipo: 'jugador' | 'creador' = 'jugador';

  constructor(private http: HttpClient) {}

  /* ========= CICLO DE VIDA ========= */
  ngOnInit(): void { this.cargarIntegrantes(); }

  /* ========= CARGAR + FILTRAR ========= */
  cargarIntegrantes(): void {
    this.http.get<any[]>(this.api).subscribe({
      next: data => {
        this.integrantes = data;
        this.filtrarIntegrantes();
      },
      error: err => console.error('Error al cargar integrantes:', err)
    });
  }
  

  filtrarIntegrantes(): void {
    this.integrantesFiltrados =
      this.integrantes.filter(i => i.tipo === this.filtroTipo);
  }

  seleccionarFiltro(tipo: 'jugador' | 'creador'): void {
    this.filtroTipo = tipo;
    this.filtrarIntegrantes();
  }

  /* ========= CREAR ========= */
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

  onFileChange(ev: any): void {
    if (ev.target.files.length) {
      this.integranteSeleccionado.foto = ev.target.files[0];
    }
  }

  /* ========= INICIAR EDICIÓN INLINE ========= */
  editarIntegrante(i: any): void {
    console.log('👀 Objeto recibido al pulsar ✏️:', i);  // LOG-1
  
    this.modoEdicion = true;
    this.mostrarForm = false;
  
    this.editId          = i.id;
    this.editNombre      = i.nombre ?? '';
    this.editApellido    = i.primer_apellido ?? '';
    this.editNick        = i.nickname;
    this.editDescripcion = i.descripcion;
    this.editTipo        = i.tipo;
    this.editFoto        = null;
    this.editPreviewUrl  = null;
  
    console.log('📋 Variables después de copiar:', {
      editNombre: this.editNombre,
      editApellido: this.editApellido
    });                                              // LOG-2
  }
  

  onEditFileChange(ev: any): void {
    if (!ev.target.files.length) return;
    const file = ev.target.files[0] as File;
    this.editFoto = file;
    if (this.editPreviewUrl) URL.revokeObjectURL(this.editPreviewUrl);
    this.editPreviewUrl = URL.createObjectURL(file);
  }

  cancelarEdicion_inline(): void {
    if (this.editPreviewUrl) URL.revokeObjectURL(this.editPreviewUrl);
    this.editPreviewUrl = null;
    this.editId = null;
    this.modoEdicion = false;
  }

  /* ========= GUARDAR (crear o editar) ========= */
  guardarIntegrante(): void {
    const editandoInline = this.modoEdicion && this.editId !== null;

    /* ---------- PUT (edición inline) ---------- */
    if (editandoInline && this.editId !== null) {
      const fd = new FormData();
      fd.append('nombre', this.editNombre);
      fd.append('primer_apellido', this.editApellido);
      fd.append('nickname', this.editNick);
      fd.append('descripcion', this.editDescripcion);
      fd.append('tipo', this.editTipo);
      if (this.editFoto) fd.append('foto', this.editFoto);

      this.http.put(`${this.api}${this.editId}/`, fd).subscribe({
        next: () => { this.cancelarEdicion_inline(); this.cargarIntegrantes(); },
        error: err => console.error('Error al actualizar integrante', err)
      });
      return;
    }

    /* ---------- POST (crear nuevo) ---------- */
    const fd = new FormData();
    fd.append('nombre', this.integranteSeleccionado.nombre);
    fd.append('primer_apellido', this.integranteSeleccionado.primer_apellido);
    fd.append('nickname', this.integranteSeleccionado.nickname);
    fd.append('descripcion', this.integranteSeleccionado.descripcion);
    fd.append('tipo', this.integranteSeleccionado.tipo);
    if (this.integranteSeleccionado.foto) {
      fd.append('foto', this.integranteSeleccionado.foto);
    }

    this.http.post(this.api, fd).subscribe({
      next: () => { this.mostrarForm = false; this.cargarIntegrantes(); },
      error: err => console.error('Error al crear integrante', err)
    });
  }

  /* ========= ELIMINAR ========= */
  eliminarIntegrante(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este integrante?')) return;
    this.http.delete(`${this.api}${id}/`).subscribe({
      next: () => this.cargarIntegrantes(),
      error: err => console.error('Error al eliminar integrante', err)
    });
  }

  /* ========= UTILIDADES ========= */
  trackById(_: number, item: any) { return item.id; }

  cancelar(): void { this.mostrarForm = false; }
}
