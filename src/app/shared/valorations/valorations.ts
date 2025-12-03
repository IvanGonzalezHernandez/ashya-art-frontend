// src/app/shared/valorations/valorations.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { Carousel } from 'bootstrap';

/** Modelo de la reseña */
export interface Review {
  author: string;
  rating: number;   // 1..5
  text: string;
  timeAgo: string;  // "3 months ago"
  initials?: string;
}

/** Dataset común por defecto  */
export const REVIEWS_DATA: Review[] = [
  { author: 'Lidija Germann', rating: 5, timeAgo: '3 months ago',
    text: 'Ich war das erste Mal bei Ashya Art & Keramik Studio und habe mich sofort dort wohl gefühlt. Eigene Idee einbringen, in Ruhe ausprobieren, tolle Tipps und Hilfe – zwei großartige Abende. Ich komme auf jeden Fall wieder :-)))' },
  { author: 'Busra Nur Yonev', rating: 5, timeAgo: '6 months ago',
    text: 'I recently took my first ceramic course here, and it was such a wonderful experience! Warm atmosphere and very patient guidance. Highly recommend for anyone interested in ceramics!' },
  { author: 'Papilio Maackii', rating: 5, timeAgo: '1 year ago',
    text: 'Absolut zu empfehlen! Ashya ist sehr freundlich und man spürt die Keramik-Leidenschaft. Wenn wir näher an Hamburg wohnen würden, wäre ich monatlich im Kurs. Große Empfehlung – auch als schöne Geschenkidee!' },
  { author: 'Claudia Burgel', rating: 5, timeAgo: '2 months ago',
    text: 'Wir 4 (Mutter, Oma und 2 Mädchen) hatten tolle Stunden im Keramikstudio. Kindgerechte Erklärungen, auch wir Erwachsene wurden super eingeführt. Die Kinder hatten viel Spaß – sehr zu empfehlen!' },
  { author: 'Dana Heinze', rating: 5, timeAgo: '1 year ago',
    text: 'Mein erster Keramikkurs bei Ashya – sehr begeistert! Freundlich, engagiert, flexible Terminfindung. Detaillierte Beratung und Erklärungen. Danke für den schönen Einstieg in dieses Hobby :)' },
  { author: 'Anja', rating: 5, timeAgo: '10 months ago',
    text: 'I loved doing Ashya’s workshop so much, I already went twice. Great price and you’ll make pieces that look shop-bought. If you want to try ceramics, definitely book this one.' },
  { author: 'Josephine Erzmann', rating: 5, timeAgo: '7 months ago',
    text: 'First time doing pottery and had a great time! Ashya is lovely and takes time to help. Such a good experience – I will come more often to learn more about pottery!' },
  { author: 'Kamilia S', rating: 5, timeAgo: '5 months ago',
    text: 'Second time here and I will go more often. Amazing warm atmosphere; time flies. Ashya is very helpful and passionate about ceramics. 100% recommendation.' },
  { author: 'Agata Widera', rating: 5, timeAgo: '2 years ago',
    text: 'Ashya hat eine große Leidenschaft fürs Keramikmachen – das merkt man im Kurs. Perfekt, um etwas Neues auszuprobieren und ein persönliches Geschenk zu kreieren!' },
  { author: 'Youngju Kim', rating: 5, timeAgo: '1 year ago',
    text: 'Unsure what to create at first, but Ashya inspired me – love my ceramics! Even if you’re “all thumbs”, you’ll make fantastic artworks with her guidance. Always smiling – thoroughly enjoyed it!' },
  { author: 'Jana Kownatzki', rating: 5, timeAgo: '1 year ago',
    text: 'Gemütlicher Workshop in kleiner Gruppe – jederzeit Fragen stellen, individuelle Hilfe und Ratschläge. Es hat wirklich Spaß gemacht und wir haben tolle Ergebnisse mit nach Hause genommen.' },
  { author: 'Viona Weghaus', rating: 5, timeAgo: '8 months ago',
    text: 'Als Geburtstagsfeier Kurs besucht – super viel Spaß. Jeder konnte Wünsche äußern und umsetzen. Am Ende hatte jeder ein kleines Kunstwerk zum Mitnehmen. Danke, Ashya!' }
];

@Component({
  selector: 'app-valorations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './valorations.html',
  styleUrls: ['./valorations.scss']
})
export class ValorationsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  private static NEXT_ID = 0;

  /** Título del bloque */
  @Input() title = 'What our students think of us';

  /** Lista de reviews. Si no se pasa, usa el dataset común. */
  @Input() reviews: Review[] = REVIEWS_DATA;

  /** Tarjetas por slide */
  @Input() itemsPerSlide = 4;

  /** Intervalo autoplay (ms) */
  @Input() interval = 3000;

  /** ID único del carrusel */
  @Input() carouselId = `reviewCarousel-${++ValorationsComponent.NEXT_ID}`;

  /** Referencia al elemento del carrusel (para inicializar Bootstrap) */
  @ViewChild('carouselEl') carouselEl!: ElementRef<HTMLElement>;

  slides: Review[][] = [];
  five = Array(5).fill(0);

  averageRating = 5.0;   // nota media global
  totalReviews = 50;     // número de reseñas

  private bsCarousel?: Carousel;
  private viewReady = false;

  /** Redondeo para pintar estrellas del rating global sin usar Math en el template */
  get roundedRating(): number {
    return Math.round(this.averageRating);
  }

  ngOnInit(): void {
    this.buildSlides();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    // Inicializa o reinicializa cuando la vista existe
    queueMicrotask(() => this.initOrRefreshCarousel());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambian reviews o el tamaño, recomponemos slides
    if (changes['reviews'] || changes['itemsPerSlide']) {
      this.buildSlides();
    }
    // Si cambia el intervalo o los slides, refrescamos el carrusel (si la vista está lista)
    if (this.viewReady && (changes['interval'] || changes['reviews'] || changes['itemsPerSlide'])) {
      queueMicrotask(() => this.initOrRefreshCarousel());
    }
  }

  ngOnDestroy(): void {
    this.disposeCarousel();
  }

  private buildSlides(): void {
    const arr = this.reviews ?? [];
    const size = Math.max(1, this.itemsPerSlide || 4);
    this.slides = [];
    for (let i = 0; i < arr.length; i += size) {
      this.slides.push(arr.slice(i, i + size));
    }
  }

  private initOrRefreshCarousel(): void {
    if (!this.carouselEl?.nativeElement) return;

    // Si ya existía, lo reciclamos para evitar fugas/duplicados
    this.disposeCarousel();

    this.bsCarousel = new Carousel(this.carouselEl.nativeElement, {
      interval: this.interval,
      ride: 'carousel',
      pause: false,
      touch: true,
      wrap: true,
      keyboard: false
    });

    // Asegura que inicia el ciclo (por si bootstrap no auto-arranca en SPA)
    this.bsCarousel.cycle();
  }

  private disposeCarousel(): void {
    try {
      this.bsCarousel?.dispose();
    } catch { /* no-op */ }
    this.bsCarousel = undefined;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
