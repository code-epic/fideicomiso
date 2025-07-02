import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


export interface IUsuario{
  nombre : string,
  cedula : string,
  tipo : string,
  componente : string,
  clave : string,
  correo : string,
}

export interface IToken{
  token : string,
}

export interface UClave{
  login: string,
  clave : string,
  nueva: string,
  repetir: string,
  correo : string,
}

@Injectable({
  providedIn: 'root'
})



export class LoginService {
 
  public URL : string =  environment.API
  
  public Id : string = ''
  
  public SToken : any

  public Token : any

  public Usuario : any

  public Aplicacion : any

  constructor(private router: Router, private http : HttpClient) {
    this.Id = environment.ID
    if (sessionStorage.getItem("token") != undefined ) this.SToken = sessionStorage.getItem("token");
  }

  async Iniciar() {
    await this.getUserDecrypt()
    this.obenterAplicacion()
    
  }
  getLogin(user: string, clave : string) : Observable<IToken>{
    const usuario = {
      "nombre" : user,
      "clave" : clave,
    }
    const url = this.URL + 'wusuario/login'
    return this.http.post<IToken>(url, usuario )
  }
  
  makeUser(user: IUsuario): Observable<any>{    
    const url = this.URL + 'identicacion'   
    return this.http.post<any>( url, user )
  }

  logout(){
    this.router.navigate(['login']);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("id");
  }

  protected getUserDecrypt() : any {    
    const e = sessionStorage.getItem("token");
    const s = e.split(".");
    
    const str = atob( s[1] );
    this.Token = JSON.parse(str)
    this.Usuario = this.Token.Usuario
    return JSON.parse(str);
  }
  
  //ObenterAplicacion 
  protected obenterAplicacion(){
    
    const Aplicacion = this.Token.Usuario.Aplicacion
    Aplicacion.forEach(e => {
      if(e.id == this.Id ){
        this.Aplicacion = e;
      }
    });
  }
  
  obtenerMenu() : any {
    return this.Aplicacion.Rol.Menu
  }

  obtenerPrivilegiosMenu(idUrl : string) : any {
    const App = this.Aplicacion
    let Menu: any
    App.Rol.Menu.forEach(e => {if (e.url == idUrl) Menu = e});
    return Menu
    
  }

  obtenerSubMenu(idUrl : string) : any{   
    const App = this.Aplicacion
    let SubMenu = [] 
    App.Rol.Menu.forEach(e => {if (e.url == idUrl) SubMenu = e.SubMenu});
    return SubMenu
  }

}
