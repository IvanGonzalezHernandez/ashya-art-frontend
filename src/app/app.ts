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
        //Scroll al inicio en cada cambio de ruta
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        // Google Analytics
        gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}
