import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Estadisticas, EstadisticasService, PeriodoEstadisticas } from '../../../services/estadisticas/estadisticas';

const ORIGENES: Record<string, string> = {
  GOOGLE: 'Google',
  DIRECT: 'Direct',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  NEWSLETTER: 'Newsletter & email',
  SEARCH: 'Other search engines',
  OTHER: 'Other websites'
};
const DISPOSITIVOS: Record<string, string> = { MOBILE: 'Mobile', DESKTOP: 'Desktop', TABLET: 'Tablet' };
const IDIOMAS: Record<string, string> = { de: 'German', en: 'English', es: 'Spanish', other: 'Other' };

@Component({
  selector: 'app-estadisticas-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-dashboard.html',
  styleUrl: './estadisticas-dashboard.scss'
})
export class EstadisticasDashboard implements OnInit, OnDestroy {
  @ViewChild('visitasChart') set canvas(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.canvasRef = ref;
    this.renderChart();
  }

  readonly periodos: Array<{ valor: PeriodoEstadisticas; texto: string }> = [
    { valor: '7d', texto: '7 days' },
    { valor: '30d', texto: '30 days' },
    { valor: '12m', texto: '12 months' }
  ];
  private readonly textoPeriodo: Record<PeriodoEstadisticas, string> = {
    '7d': 'last 7 days',
    '30d': 'last 30 days',
    '12m': 'last 12 months'
  };

  periodo: PeriodoEstadisticas = '30d';
  datos: Estadisticas | null = null;
  loading = false;
  error = false;

  private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  cambiarPeriodo(periodo: PeriodoEstadisticas): void {
    if (periodo === this.periodo && this.datos) return;
    this.periodo = periodo;
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = false;
    this.estadisticasService.getResumen(this.periodo).subscribe({
      next: datos => {
        this.datos = datos;
        this.loading = false;
        this.renderChart();
      },
      error: err => {
        console.error('Error loading statistics', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  get tituloGrafico(): string {
    return 'Visits · ' + this.textoPeriodo[this.periodo];
  }

  /**
   * Reservas / vistas, solo de los talleres con vistas registradas: las reservas de talleres sin
   * visitas (anteriores al contador o creadas desde el admin) inflarían el porcentaje.
   */
  get conversion(): number {
    const conVistas = (this.datos?.talleres ?? []).filter(t => t.vistas > 0);
    const vistas = conVistas.reduce((suma, t) => suma + t.vistas, 0);
    const reservas = conVistas.reduce((suma, t) => suma + t.reservas, 0);
    return vistas ? (reservas / vistas) * 100 : 0;
  }

  /** "+12% vs previous period", o un aviso si antes no había nada con qué comparar. */
  textoCambio(actual: number, anterior: number): string {
    if (!anterior) return 'no data for the previous period';
    const cambio = Math.round(((actual - anterior) / anterior) * 100);
    return `${cambio > 0 ? '+' : ''}${cambio}% vs previous period`;
  }

  porcentaje(valor: number, total: number): number {
    return total ? (valor / total) * 100 : 0;
  }

  /** Reservas / vistas de la ficha; "–" si la ficha no tuvo vistas (reserva sin visita registrada). */
  textoConversion(vistas: number, reservas: number): string {
    return vistas ? `${((reservas / vistas) * 100).toFixed(1)}%` : '–';
  }

  nombreOrigen(clave: string): string {
    return ORIGENES[clave] ?? clave;
  }

  nombreDispositivo(clave: string): string {
    return DISPOSITIVOS[clave] ?? clave;
  }

  nombreIdioma(clave: string): string {
    return IDIOMAS[clave] ?? clave;
  }

  private renderChart(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.datos) return;

    this.chart?.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const relleno = ctx.createLinearGradient(0, 0, 0, 280);
    relleno.addColorStop(0, 'rgba(58, 144, 151, 0.22)');
    relleno.addColorStop(1, 'rgba(58, 144, 151, 0)');
    const ultimo = this.datos.serieActual.length - 1;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.datos.etiquetas,
        datasets: [
          {
            label: 'Visits',
            data: this.datos.serieActual,
            borderColor: '#3A9097',
            backgroundColor: relleno,
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: c => (c.dataIndex === ultimo ? 4 : 0),
            pointBackgroundColor: '#3A9097',
            pointHoverRadius: 5
          },
          {
            label: 'Previous period',
            data: this.datos.serieAnterior,
            borderColor: '#b7ada3',
            borderDash: [4, 3],
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
          y: { beginAtZero: true, ticks: { precision: 0, maxTicksLimit: 6 } }
        }
      }
    });
  }
}
