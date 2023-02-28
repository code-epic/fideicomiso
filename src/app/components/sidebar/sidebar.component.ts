import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/seguridad/login.service';
import { MensajeService } from 'src/app/services/util/mensaje.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router, 
    private mesageService : MensajeService,
    private loginService: LoginService) { 

  }

  async ngOnInit() {

    
    
    if (ROUTES.length == 0){
      await this.loginService.Iniciar()
      var App = this.loginService.Aplicacion
      let i = 0
      App.Rol.Menu.forEach(e => {
        
        if (i == 1){
          ROUTES.push({
            path : '/administracion',
            title: 'Administracion',
            icon : 'ni ni-circle-08',
            class : 'text-pink'
          })
  
        }
        ROUTES.push({
          path : e.url,
          title: e.nombre,
          icon : e.icono,
          class : e.clase
        })
        i++

      });
    }
    this.menuItems = ROUTES.filter(menuItem => menuItem);    
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }

  msj(pagina : string){
    this.mesageService.contenido$.emit(pagina.toUpperCase())
  }
}