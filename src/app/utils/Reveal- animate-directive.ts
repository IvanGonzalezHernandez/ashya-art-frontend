import { ApplicationRef, Directive, ElementRef, Input, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Pasa a true cuando termina el primer renderizado de la app (hidratación del HTML prerenderizado). */
let renderInicialTerminado = false;

@Directive({
  selector: '[appRevealAnimate]',
  standalone: true,
})
export class RevealAnimateDirective implements OnInit, OnDestroy {
  @Input('appRevealAnimate') animation: string = 'animate__fadeInUp';
  @Input() delay: string = '0s';
  @Input() duration: string = '1s';
  @Input() once: boolean = true;

  private observer?: IntersectionObserver;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly appRef = inject(ApplicationRef);

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // En el HTML prerenderizado el contenido queda visible (sin animación)
    if (!this.isBrowser) return;

    const element = this.el.nativeElement;

    // Al hidratar, lo que ya se ve en pantalla se deja tal cual: ocultarlo para animarlo
    // haría parpadear el contenido que acaba de pintarse. El resto se anima al hacer scroll.
    if (!renderInicialTerminado) {
      this.appRef.whenStable().then(() => renderInicialTerminado = true);
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) return;
    }

    element.style.opacity = '0';
    element.style.animationDelay = this.delay;
    element.style.animationDuration = this.duration;

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.classList.add('animate__animated', this.animation);
          element.style.opacity = '1';

          if (this.once) this.observer?.unobserve(element);
        }
      });
    }, { threshold: 0.2 });

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
