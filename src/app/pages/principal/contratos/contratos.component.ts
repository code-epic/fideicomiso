import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {

  public nombre: string = 'Analista'
  public nombrecompleto: string = ''
  public analista: string = ''
  public cedula: string = ''
  public telefono: string = ''
  public correo: string = ''
  public perfil: string = ''
  public color: string = 'primary'
  animal: string;
  name: string;
  panelOpenState = false;
  
  @ViewChild('cambiarClave', { static: true }) cambiarClave: TemplateRef<any>;
  // email = new FormControl('', [Validators.required, Validators.email]);
  constructor() { }

  ngOnInit(): void {
  }

}
