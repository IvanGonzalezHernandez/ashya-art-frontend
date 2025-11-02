import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

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

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
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