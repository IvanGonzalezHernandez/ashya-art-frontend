import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected title = 'ashya-art-frontend';

  constructor(private router: Router) {}

  ngOnInit() {
    // Suscribirse a cambios de ruta(para google analytics)
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}
