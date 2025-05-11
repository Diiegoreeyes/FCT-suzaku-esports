import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-sponsors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-sponsors.component.html',
  styleUrls: ['./admin-sponsors.component.css']
})
export class AdminSponsorsComponent implements OnInit {
  sponsors: any[] = [];
  showForm = false;
  editandoId: number | null = null;
  sponsorSeleccionadoId: number | null = null;
  descripcionImagenExtra: string = '';
  formSponsor!: FormGroup;
  preview: string | null = null;
  private api = 'http://127.0.0.1:8000/api/sponsors/';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer  // ✅ Añadido para sanear la URL del video
  ) {}

  ngOnInit(): void {
    this.formSponsor = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      sitio_web: [''],
      video_url: [''],
      imagen_portada: [null]
    });
    this.cargarSponsors();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.resetFormulario();
  }

  resetFormulario(): void {
    this.editandoId = null;
    this.formSponsor.reset();
    this.preview = null;
  }

  cargarSponsors(): void {
    this.http.get<any[]>(this.api).subscribe({
      next: (data) => this.sponsors = data,
      error: (err) => console.error('Error al cargar sponsors:', err)
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formSponsor.patchValue({ imagen_portada: file });
      const reader = new FileReader();
      reader.onload = () => this.preview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  crearSponsor(): void {
    if (this.formSponsor.invalid) return;

    const fd = new FormData();
    fd.append('nombre', this.formSponsor.value.nombre);
    fd.append('descripcion', this.formSponsor.value.descripcion);
    fd.append('sitio_web', this.formSponsor.value.sitio_web);
    fd.append('video_url', this.formSponsor.value.video_url);
    const file = this.formSponsor.value.imagen_portada;
    if (file) fd.append('imagen_portada', file);

    if (this.editandoId) {
      this.http.put(`${this.api}${this.editandoId}/`, fd).subscribe({
        next: () => {
          this.cargarSponsors();
          this.toggleForm();
        },
        error: (err) => console.error('Error al editar sponsor:', err)
      });
    } else {
      this.http.post(this.api, fd).subscribe({
        next: (nuevo) => {
          this.sponsors.push(nuevo);
          this.toggleForm();
        },
        error: (err) => console.error('Error al crear sponsor:', err)
      });
    }
  }

  editarSponsor(s: any): void {
    this.editandoId = s.id;
    this.formSponsor.patchValue({
      nombre: s.nombre,
      descripcion: s.descripcion,
      sitio_web: s.sitio_web,
      video_url: s.video_url
    });
    this.preview = s.imagen_portada;
    this.showForm = true;
  }

  eliminarSponsor(id: number): void {
    if (!confirm('¿Eliminar este sponsor?')) return;
    this.http.delete(`${this.api}${id}/`).subscribe({
      next: () => this.sponsors = this.sponsors.filter(s => s.id !== id),
      error: (err) => console.error('Error al eliminar sponsor:', err)
    });
  }

  seleccionarSponsorParaImagen(s: any): void {
    this.sponsorSeleccionadoId = s.id;
    this.descripcionImagenExtra = '';
  }

  onImagenExtraChange(event: any, sponsorId: number): void {
    const files: FileList = event.target.files;
    const sponsor = this.sponsors.find(s => s.id === sponsorId);
    if (files.length && sponsor) {
      sponsor.imagenesExtraFiles = Array.from(files);
    }
  }

  subirImagenExtra(sponsor: any): void {
    if (!sponsor.imagenesExtraFiles || !sponsor.imagenesExtraFiles.length) {
      alert('Por favor, selecciona al menos una imagen.');
      return;
    }

    sponsor.imagenesExtraFiles.forEach((file: File) => {
      const formData = new FormData();
      formData.append('sponsor', sponsor.id);
      formData.append('imagen', file);
      if (sponsor.descripcionImagenExtra) {
        formData.append('descripcion', sponsor.descripcionImagenExtra);
      }

      this.http.post('http://127.0.0.1:8000/api/sponsorimage/', formData).subscribe({
        next: (nuevaImagen) => {
          sponsor.imagenes = sponsor.imagenes || [];
          sponsor.imagenes.push(nuevaImagen);
        },
        error: (err) => {
          console.error('Error al subir imagen:', err);
        }
      });
    });

    sponsor.imagenesExtraFiles = [];
    sponsor.descripcionImagenExtra = '';
    sponsor.showUpload = false;
  }

  extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&?/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  getSafeVideoUrl(url: string): SafeResourceUrl | null {
    const id = this.extractYoutubeId(url);
    return id ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`) : null;
  }
}
