import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
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
  public ultimoCierre: string = ''
  public ultimoPreCierre: string = ''

  constructor(
    private router: Router, 
    private mesageService : MensajeService,
    private loginService: LoginService,
    private apiService: ApiService
  ) { }

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

    this.consultarPreCierre()
    this.consultarCierre()
  }

  consultarPreCierre() {
    let xAPI: IAPICore = {
      funcion: '',
      parametros: '',
      valores: ''
    }

    xAPI.funcion = 'FID_CFechaMaxPreCierre'
    xAPI.parametros = ''
    xAPI.valores = ''

    this.apiService.Ejecutar(xAPI).subscribe(
      data => {
        if (data.Cuerpo != undefined ){
          this.ultimoPreCierre = data.Cuerpo[0].fecha          
        }
      },
      err => {
        console.error(err);
      }
    )
  }

  consultarCierre() {
    let xAPI: IAPICore = {
      funcion: '',
      parametros: '',
      valores: ''
    }
    xAPI.funcion = "FID_CUltimoCierre"
    xAPI.parametros = ''
    xAPI.valores = ''

    this.apiService.Ejecutar(xAPI).subscribe(
      async data => {

        let ultc = data.Cuerpo
        if (ultc.length > 0) {
          let fecha = ultc[0].fecha_cierre;
          let d = fecha.split('-');
          this.ultimoCierre = d[0] + '-' + d[1] + '-' + d[2];          
        }
      },
      (error) => {
        console.log(error)
      }
    )
  }

  msj(pagina : string){
    this.mesageService.contenido$.emit(pagina.toUpperCase())
  }
}