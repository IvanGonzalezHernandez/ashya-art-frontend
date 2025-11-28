import { Component, AfterViewInit, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { DashboardService, DashboardTotals } from '../../../services/dashboard/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, AfterViewInit {

  totalClientes: number = 0;
  totalProductos: number = 0;
  totalReservas: number = 0;
  totalIngresos: number = 0;

  // La gráfica con mock
  resumenLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
  resumenDatos: number[] = [1200, 1500, 1800, 1300, 1700];

  private chart?: Chart;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarTotales();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  private cargarTotales(): void {
    this.dashboardService.getTotals().subscribe({
      next: (data: DashboardTotals) => {
        this.totalClientes  = data.totalClientes;
        this.totalProductos = data.totalProductos;
        this.totalReservas  = data.totalReservas;
        this.totalIngresos  = data.totalIngresos;
      },
      error: err => console.error('Error loading dashboard totals', err)
    });
  }

  private renderChart(): void {
    const ctx = document.getElementById('resumenChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.resumenLabels,
        datasets: [{
          label: 'Revenue (€)',
          data: this.resumenDatos,
          borderColor: '#3A9097',
          backgroundColor: 'rgba(25,135,84,0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
