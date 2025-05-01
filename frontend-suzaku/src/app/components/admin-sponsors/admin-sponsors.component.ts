import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-sponsors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-sponsors.component.html',
  styleUrls: ['./admin-sponsors.component.css']
})
export class AdminSponsorsComponent implements OnInit {
  sponsors: any[] = [];
  showForm = false;
  formSponsor!: FormGroup;
  preview: string | null = null;
  private api = 'http://127.0.0.1:8000/api/sponsors/';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.formSponsor = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      sitio_web: [''],
      logo: [null]
    });
    this.cargarSponsors();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
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
      this.formSponsor.patchValue({ logo: file });
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
    if (this.formSponsor.value.logo) {
      fd.append('logo', this.formSponsor.value.logo);
    }

    this.http.post(this.api, fd).subscribe({
      next: (nuevo) => {
        this.sponsors.push(nuevo);
        this.toggleForm();
      },
      error: (err) => console.error('Error al crear sponsor:', err)
    });
  }
}
