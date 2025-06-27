import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MensajeService } from 'src/app/services/util/mensaje.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  public pagina : string = '';
  public opened: boolean = true;

  constructor(private ruta : Router, private msj: MensajeService) { }

  ngOnInit() {
    const pagina = this.ruta.url.split("/")
    
    this.pagina = pagina[1].toUpperCase()
    this.msj.contenido$.subscribe( e => {
      this.pagina = e == 'NPANEL'?'NEGOCIO':e
    })
  }

  IrA(url : string){
    this.pagina =  url.toUpperCase() == 'NPANEL'?'NEGOCIO': url.toUpperCase()
    this.ruta.navigate(['/' + url]);
  }

  onChangeSidenav(e: any){
    this.opened = !this.opened;
  }
}
