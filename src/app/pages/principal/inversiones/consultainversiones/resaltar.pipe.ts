import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: 'resaltar'
})
export class ResaltarPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(texto: string, termino: string): SafeHtml {
    if (!texto || !termino || !termino.trim()) {
      return this.sanitizer.bypassSecurityTrustHtml(texto || '');
    }
    const q = termino.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'gi');
    return this.sanitizer.bypassSecurityTrustHtml(
      texto.replace(re, '<mark class="resaltado">$1</mark>')
    );
  }
}
