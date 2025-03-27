import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-post.component.html',
  styleUrls: ['./admin-post.component.css']
})
export class AdminPostComponent implements OnInit {

  posts: any[] = [];
  modoEdicion = false;
  
  // ✅ Nueva variable para mostrar/ocultar el form
  mostrarForm = false;

  postSeleccionado: any = {
    id: null,
    titulo: '',
    descripcion: '',
    orden: 0,
    imagen: null
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPosts();
  }

  cargarPosts(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/post-equipo/')
      .subscribe({
        next: (data) => {
          this.posts = data;
        },
        error: (err) => {
          console.error('Error al cargar posts:', err);
        }
      });
  }

  // Para preparar el formulario en modo CREAR:
  nuevoPost(): void {
    this.modoEdicion = false;
    this.mostrarForm = true;  // ✅ Muestra el form
    this.postSeleccionado = {
      id: null,
      titulo: '',
      descripcion: '',
      orden: 0,
      imagen: null
    };
  }

  // Para preparar el formulario en modo EDICIÓN:
  editarPost(post: any): void {
    this.modoEdicion = true;
    this.mostrarForm = true;  // ✅ Muestra el form
    this.postSeleccionado = {
      id: post.id,
      titulo: post.titulo,
      descripcion: post.descripcion,
      orden: post.orden,
      imagen: null
    };
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.postSeleccionado.imagen = file;
    }
  }

  guardarPost(): void {
    const formData = new FormData();
    formData.append('titulo', this.postSeleccionado.titulo);
    formData.append('descripcion', this.postSeleccionado.descripcion);
    formData.append('orden', this.postSeleccionado.orden);
    if (this.postSeleccionado.imagen) {
      formData.append('imagen', this.postSeleccionado.imagen);
    }

    if (this.modoEdicion && this.postSeleccionado.id !== null) {
      // PUT
      this.http.put(`http://127.0.0.1:8000/api/post-equipo/${this.postSeleccionado.id}/`, formData)
        .subscribe({
          next: () => {
            alert('Post actualizado correctamente');
            this.cargarPosts();
            this.modoEdicion = false;
            this.mostrarForm = false; // Oculta el form tras guardar
          },
          error: (err) => {
            console.error('Error al actualizar post', err);
            alert('Error al actualizar post');
          }
        });
    } else {
      // POST
      this.http.post('http://127.0.0.1:8000/api/post-equipo/', formData)
        .subscribe({
          next: () => {
            alert('Post creado correctamente');
            this.cargarPosts();
            this.mostrarForm = false; // Oculta el form tras guardar
          },
          error: (err) => {
            console.error('Error al crear post', err);
            alert('Error al crear post');
          }
        });
    }
  }

  eliminarPost(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este post?')) {
      return;
    }
    this.http.delete(`http://127.0.0.1:8000/api/post-equipo/${id}/`)
      .subscribe({
        next: () => {
          alert('Post eliminado');
          this.cargarPosts();
        },
        error: (err) => {
          console.error('Error al eliminar post', err);
          alert('Error al eliminar post');
        }
      });
  }

  // ✅ Método para cancelar y ocultar el form
  cancelar(): void {
    this.modoEdicion = false;
    this.mostrarForm = false;
  }

}
