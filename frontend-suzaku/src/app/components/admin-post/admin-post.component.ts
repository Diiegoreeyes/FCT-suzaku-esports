import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-post.component.html',
  styleUrls: ['./admin-post.component.css']
})
export class AdminPostComponent implements OnInit {

  /* ───────── LISTA DE POSTS ───────── */
  posts: any[] = [];

  /* ───────── CREAR NUEVO POST ─────── */
  showCreateForm = false;
  newPost = {
    titulo: '',
    descripcion: '',
    orden: 0,
    imagen: null as File | null
  };

  /* ───────── EDICIÓN INLINE ───────── */
  editId: number | null = null;
  editTitulo = '';
  editDescripcion = '';
  editOrden = 0;
  editImagen: File | null = null;
  editPreviewUrl: string | null = null;


  /* ──────────────── API ───────────── */
  private api = 'http://127.0.0.1:8000/api/post-equipo/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPosts();
  }

  /* ----- ORDENAR POR TÍTULO ----- */
  private ordenarPorTitulo = (a: any, b: any) =>
    a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });

  /* ----- OBTENER POSTS ----- */
  cargarPosts(): void {
    this.http.get<any[]>(this.api).subscribe({
      next: (data) => (this.posts = data.sort(this.ordenarPorTitulo)),
      error: (err) => console.error('Error al cargar posts:', err)
    });
  }

  /* ========== CREAR ========== */
  nuevoPost(): void {
    this.showCreateForm = true;
    this.newPost = { titulo: '', descripcion: '', orden: 0, imagen: null };
  }

  onFileChange(ev: any): void {
    if (ev.target.files.length) this.newPost.imagen = ev.target.files[0];
  }

  crearPost(): void {
    const { titulo, descripcion, orden, imagen } = this.newPost;
    if (!titulo || !descripcion) return;

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('orden', orden.toString());
    if (imagen) formData.append('imagen', imagen);

    this.http.post<any>(this.api, formData).subscribe({
      next: (nuevo) => {
        this.posts.push(nuevo);
        this.posts.sort(this.ordenarPorTitulo);
        this.showCreateForm = false;
      },
      error: (err) => console.error('Error al crear post', err)
    });
  }

  /* ========== EDICIÓN INLINE ========== */
  iniciarEdicion(p: any): void {
    this.editId = p.id;
    this.editTitulo = p.titulo;
    this.editDescripcion = p.descripcion;
    this.editOrden = p.orden;
    this.editImagen = null;
  }

  onEditFileChange(ev: any): void {
    if (!ev.target.files.length) return;
  
    /* archivo seleccionado */
    const file = ev.target.files[0] as File;   // 👉 ya no puede ser null
    this.editImagen = file;
  
    /* libera preview anterior si existía */
    if (this.editPreviewUrl) URL.revokeObjectURL(this.editPreviewUrl);
  
    /* genera nuevo preview con un File garantizado */
    this.editPreviewUrl = URL.createObjectURL(file);
  }
  
  guardarEdicion(): void {
    if (this.editId === null) return;
  
    const formData = new FormData();
    formData.append('titulo', this.editTitulo);
    formData.append('descripcion', this.editDescripcion);
    formData.append('orden', this.editOrden.toString());
    if (this.editImagen) formData.append('imagen', this.editImagen);
  
    this.http.put(`${this.api}${this.editId}/`, formData).subscribe({
      next: () => {
        /* 1️⃣  Cerramos el modo edición inmediatamente                       */
        this.cancelarEdicion();
  
        /* 2️⃣  Recargamos la lista desde el servidor, ya ordenada y actual   */
        this.cargarPosts();
      },
      error: (err) => console.error('Error al actualizar post', err)
    });
  }
  
  
    /* ── trackBy para evitar renders innecesarios ── */
  trackById(_: number, item: any): number {
    return item.id;
  }


  cancelarEdicion(): void {
    /* Libera URL previa si la hubiera */
    if (this.editPreviewUrl) URL.revokeObjectURL(this.editPreviewUrl);
  
    /* 🔄 Resetea todas las variables de edición */
    this.editPreviewUrl = null;
    this.editId         = null;
    this.editTitulo     = '';
    this.editDescripcion= '';
    this.editOrden      = 0;
    this.editImagen     = null;
  }
  

  /* ========== ELIMINAR ========== */
  eliminarPost(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este post?')) return;

    this.http.delete(`${this.api}${id}/`).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
      },
      error: (err) => console.error('Error al eliminar post', err)
    });
  }
}
