import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit {

  totalClientes: number = 123;
  totalProductos: number = 45;
  totalReservas: number = 78;
  totalIngresos: number = 3500;

  resumenLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
  resumenDatos: number[] = [1200, 1500, 1800, 1300, 1700];

  ngAfterViewInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    const ctx = document.getElementById('resumenChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
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
}
