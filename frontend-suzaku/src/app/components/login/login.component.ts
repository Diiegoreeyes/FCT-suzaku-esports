// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
  
    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
  
    this.authService.login(loginData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario_id', res.user_id.toString());
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        alert(err.error.error || 'Credenciales incorrectas');
      }
    });
  }
  
  
}
