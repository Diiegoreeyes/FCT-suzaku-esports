import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-sponsorspublic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sponsorspublic.component.html',
  styleUrls: ['./sponsorspublic.component.css']
})
export class SponsorspublicComponent implements OnInit {
  sponsors: any[] = [];
  private api = 'http://127.0.0.1:8000/api/sponsors/';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.http.get<any[]>(this.api).subscribe({
      next: (data) => this.sponsors = data,
      error: (err) => console.error('Error al cargar sponsors:', err)
    });
  }

  getSafeVideoUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w\-]{11})/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${match[1]}`);
    }
    return null;
  }
}
