// src/app/pipes/moneda.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'moneda'
})
export class MonedaPipe implements PipeTransform {

  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number): string | null {
    return this.currencyPipe.transform(value, 'EUR', 'symbol', '1.2-2', 'es-ES');
  }
}
