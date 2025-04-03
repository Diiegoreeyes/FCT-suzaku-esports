import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingService } from '../../services/ranking.service';

@Component({
  selector: 'app-admin-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ranking.component.html',
  styleUrls: ['./admin-ranking.component.css']
})
export class AdminRankingComponent implements OnInit {
  selectedSection: string = 'participantes';

  juegos: any[] = [];
  nuevoJuego: any = {};
  juegoEditando: any = null;

  competiciones: any[] = [];
  nuevaCompeticion: any = {};
  competicionEditando: any = null;
  imagenCompeticion: File | null = null;

  equiposCompetitivos: any[] = [];
  nuevoEquipoCompetitivo: any = {};
  equipoEditando: any = null;
  logoSeleccionado: File | null = null;

  equiposParticipantes: any[] = [];
  nuevoParticipante: any = {};
  participanteEditando: any = null;

  partidos: any[] = [];
  nuevoPartido: any = {};
  partidoEditando: any = null;
  juegoLogoSeleccionado: File | null = null;
  competicionSeleccionadaId: number | null = null;


  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.obtenerDatos();
    if (this.competiciones.length > 0) {
      const id = this.competiciones[0].id;
      this.competicionSeleccionadaId = id;
      this.nuevoPartido.competicion_id = id;
      this.actualizarEquiposFiltrados(id);
    }
    
  }

  cambiarSeccion(seccion: string) {
    this.selectedSection = seccion;
  }

  obtenerDatos() {
    this.rankingService.getCompeticiones().subscribe(data => {
      this.competiciones = data;
      if (this.competiciones.length > 0) {
        this.nuevoPartido.competicion_id = this.competiciones[0].id;
        if (this.nuevoPartido.competicion_id) {
          this.actualizarEquiposFiltrados(this.nuevoPartido.competicion_id);
        }      }
    });
  
    this.rankingService.getEquiposParticipantes().subscribe(data => {
      this.equiposParticipantes = data;
      if (this.nuevoPartido.competicion_id) {
        this.actualizarEquiposFiltrados(this.nuevoPartido.competicion_id);
      }    });
  
    this.rankingService.getJuegos().subscribe(data => this.juegos = data);
    this.rankingService.getEquiposCompetitivos().subscribe(data => this.equiposCompetitivos = data);
    this.rankingService.getPartidos().subscribe(data => this.partidos = data);
  }
  

  // 🎮 Juegos

  onJuegoFileSelected(event: any) {
    this.juegoLogoSeleccionado = event.target.files[0];
  }

  crearJuego() {
    const formData = new FormData();
    formData.append('nombre', this.nuevoJuego.nombre);
    formData.append('descripcion', this.nuevoJuego.descripcion);
    if (this.juegoLogoSeleccionado) {
      formData.append('logo', this.juegoLogoSeleccionado);
    }

    this.rankingService.crearJuego(formData).subscribe(j => {
      this.juegos.push(j);
      this.nuevoJuego = {};
      this.juegoLogoSeleccionado = null;
    });
  }

  eliminarJuego(id: number) {
    if (confirm('¿Eliminar juego?')) {
      this.rankingService.eliminarJuego(id).subscribe(() => {
        this.juegos = this.juegos.filter(j => j.id !== id);
      });
    }
  }
  editarJuego(juego: any) {
    this.juegoEditando = { ...juego };
  }
  guardarEdicionJuego() {
    this.rankingService.actualizarJuego(this.juegoEditando.id, this.juegoEditando).subscribe(j => {
      const i = this.juegos.findIndex(p => p.id === j.id);
      if (i !== -1) this.juegos[i] = j;
      this.juegoEditando = null;
    });
  }
  cancelarEdicionJuego() {
    this.juegoEditando = null;
  }

  // 🏆 Competiciones

 
  crearCompeticion() {
    const formData = new FormData();
    formData.append('nombre', this.nuevaCompeticion.nombre);
    formData.append('descripcion', this.nuevaCompeticion.descripcion);
    formData.append('juego_id', this.nuevaCompeticion.juego_id);
  
    this.rankingService.crearCompeticion(formData).subscribe(c => {
      this.competiciones.push(c);
      this.nuevaCompeticion = {};
      this.imagenCompeticion = null;
    });
  }
  
  editarCompeticion(c: any) {
    this.competicionEditando = { ...c };
  }
  cancelarEdicionCompeticion() {
    this.competicionEditando = null;
  }
  eliminarCompeticion(id: number) {
    if (confirm('¿Eliminar esta competición?')) {
      this.rankingService.eliminarCompeticion(id).subscribe(() => {
        this.competiciones = this.competiciones.filter(c => c.id !== id);
      });
    }
  }

  
  guardarEdicionCompeticion() {
    const data = {
      nombre: this.competicionEditando.nombre,
      descripcion: this.competicionEditando.descripcion
      // imagen no editable en esta versión
    };
    this.rankingService.actualizarCompeticion(this.competicionEditando.id, data).subscribe(updated => {
      const i = this.competiciones.findIndex(p => p.id === updated.id);
      if (i !== -1) this.competiciones[i] = updated;
      this.competicionEditando = null;
    });
  }
  getParticipantesPorCompeticion(competicionId: number) {
    return this.equiposParticipantes
      .filter(p => p.competicion?.id === competicionId)
      .sort((a, b) => b.puntos - a.puntos);  // Ordenar por puntos
  }
  
  filtrarParticipantesPorCompeticion(idCompeticion: number) {
    return this.equiposParticipantes.filter(p => p.competicion?.id === idCompeticion);
  }
  

  // 🛡️ Equipos Competitivos
  onFileSelected(event: any) {
    this.logoSeleccionado = event.target.files[0];
  }

  crearEquipoCompetitivo() {
    const formData = new FormData();
    formData.append('nombre', this.nuevoEquipoCompetitivo.nombre);
    formData.append('pais', this.nuevoEquipoCompetitivo.pais);
    if (this.logoSeleccionado) {
      formData.append('logo', this.logoSeleccionado);
    }
    this.rankingService.crearEquipoCompetitivo(formData).subscribe(e => {
      this.equiposCompetitivos.push(e);
      this.nuevoEquipoCompetitivo = {};
      this.logoSeleccionado = null;
    });
  }
  eliminarEquipoCompetitivo(id: number) {
    if (confirm('¿Eliminar equipo competitivo?')) {
      this.rankingService.eliminarEquipoCompetitivo(id).subscribe(() => {
        this.equiposCompetitivos = this.equiposCompetitivos.filter(e => e.id !== id);
      });
    }
  }
  editarEquipo(e: any) {
    this.equipoEditando = { ...e };
  }
  guardarEdicionEquipo() {
    const formData = new FormData();
    formData.append('nombre', this.equipoEditando.nombre);
    formData.append('pais', this.equipoEditando.pais);
    this.rankingService.actualizarEquipoCompetitivo(this.equipoEditando.id, formData).subscribe(e => {
      const i = this.equiposCompetitivos.findIndex(eq => eq.id === e.id);
      if (i !== -1) this.equiposCompetitivos[i] = e;
      this.equipoEditando = null;
    });
  }
  cancelarEdicionEquipo() {
    this.equipoEditando = null;
  }

  // 👥 Participantes
  crearParticipante() {
    this.rankingService.crearEquipoParticipante(this.nuevoParticipante).subscribe(p => {
      this.equiposParticipantes.push(p);
      this.nuevoParticipante = {};
    });
  }
  eliminarParticipante(id: number) {
    if (confirm('¿Eliminar participante?')) {
      this.rankingService.eliminarEquipoParticipante(id).subscribe(() => {
        this.equiposParticipantes = this.equiposParticipantes.filter(p => p.id !== id);
      });
    }
  }
  editarParticipante(p: any) {
    this.participanteEditando = { ...p };
  }
  guardarEdicionParticipante() {
    const data = {
      puntos: this.participanteEditando.puntos,
      victorias: this.participanteEditando.victorias,
      derrotas: this.participanteEditando.derrotas,
      equipo_competitivo_id: this.participanteEditando.equipo_competitivo?.id,
      competicion_id: this.participanteEditando.competicion?.id
    };
  
    this.rankingService.actualizarEquipoParticipante(this.participanteEditando.id, data).subscribe(p => {
      const i = this.equiposParticipantes.findIndex(x => x.id === p.id);
      if (i !== -1) this.equiposParticipantes[i] = p;
      this.participanteEditando = null;
    });
  }
  
  cancelarEdicionParticipante() {
    this.participanteEditando = null;
  }

  // ⚔️ Partidos
  crearPartido() {
    this.rankingService.crearPartido(this.nuevoPartido).subscribe(p => {
      this.partidos.push(p);
      this.nuevoPartido = {};
    });
  }
  eliminarPartido(id: number) {
    if (confirm('¿Eliminar partido?')) {
      this.rankingService.eliminarPartido(id).subscribe(() => {
        this.partidos = this.partidos.filter(p => p.id !== id);
      });
    }
  }
  editarPartido(p: any) {
    this.partidoEditando = { ...p };
  }
  guardarEdicionPartido() {
    const data = {
      marcador_equipo1: this.partidoEditando.marcador_equipo1,
      marcador_equipo2: this.partidoEditando.marcador_equipo2,
      fecha_partido: this.partidoEditando.fecha_partido,
      estado: this.partidoEditando.estado,
      equipo1_id: this.partidoEditando.equipo1.id,
      equipo2_id: this.partidoEditando.equipo2.id,
      competicion_id: this.partidoEditando.competicion.id
    };
  
    this.rankingService.actualizarPartido(this.partidoEditando.id, data).subscribe(p => {
      const i = this.partidos.findIndex(x => x.id === p.id);
      if (i !== -1) this.partidos[i] = p;
      this.partidoEditando = null;
    });
  }
  equiposFiltrados: any[] = [];

  actualizarEquiposFiltrados(id: number | string) {
    const idNum = Number(id);
    console.log('ID recibido:', idNum);
    console.log('nuevoPartido antes de filtrar:', this.nuevoPartido);
  
    this.nuevoPartido.competicion_id = idNum;
  
    this.equiposFiltrados = this.equiposParticipantes.filter(
      ep => ep.competicion?.id === idNum
    );
  
    console.log('Equipos filtrados:', this.equiposFiltrados);
  }
  
  onCompeticionChange(id: number) {
    this.nuevoPartido.competicion_id = id;
    this.actualizarEquiposFiltrados(id);
  }
  
  getEquiposDeCompeticionSeleccionada(): any[] {
    return this.equiposFiltrados || [];
  }
  

  cancelarEdicionPartido() {
    this.partidoEditando = null;
  }
  getPartidosPendientes() {
    return this.partidos.filter(p => p.estado === 'pendiente');
  }
  
  getPartidosFinalizados() {
    return this.partidos.filter(p => p.estado === 'finalizado');
  }
  
  

  getBandera(pais: string): string {
    const banderas: { [key: string]: string } = {
      Espana: '🇪🇸', España: '🇪🇸', Francia: '🇫🇷', Alemania: '🇩🇪', Italia: '🇮🇹',
      Mexico: '🇲🇽', Brasil: '🇧🇷', Argentina: '🇦🇷', Chile: '🇨🇱', Colombia: '🇨🇴',
      Japon: '🇯🇵', Corea: '🇰🇷', EstadosUnidos: '🇺🇸', EEUU: '🇺🇸', Peru: '🇵🇪'
    };
    return banderas[pais.trim()] || '🏳️';
  }
}