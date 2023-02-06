import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Direccion } from 'src/app/services/banfanb/afiliado.service';
import { Contrato, Ejecutivo, Politicas, Saldos } from 'src/app/services/banfanb/contrato.service';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {

  public Direccion: Direccion = {
    direccion: '',
    pais: '',
    ciudad: '',
    municipio: '',
    parroquia: '',
    codigopostal: '',
    urbanizacion: '',
    telefono: '',
    celular: '',
    correo: '',
    oficinanacional: ''
  }

  public Politicas: Politicas = {
    observaciones: '',
    tipocuenta: '',
    numerocuenta: '',
    portafolio: '',
    metodocalculo: '',
    tipocalculo: '',
    rendicion: '',
    condicionganancia: '',
    metodoganancia: '',
    enviar: '',
    numeromaximo: 0,
    intervalominimo: 0
  }

  public Saldos : Saldos = {
    saldoinicio: 0,
    fechainicio: '',
    sse_fechainicio: '',
    fondo: 0,
    total: 0,
    prestamo: 0,
    capital: 0,
    valor: 0,
    utilidad: 0
  }

  public Ejecutivo: Ejecutivo = {
    negocio: '',
    cliente: '',
    proceso: ''
  }

  public Contrato: Contrato = {
    numero: '',
    rif: '',
    razonsocial: '',
    plan: '',
    estatus: '0',
    tipo: '',
    empresa: '',
    fideicomiso: '',
    reporte: '',
    codigo: '',
    plananterior: '',
    grupoanterior: '',
    segmento: '',
    subsegmento: '',
    oficinatutora: '',
    fecha: new Date(),
    Direccion: this.Direccion,
    Ejecutivo: this.Ejecutivo,
    Politicas: this.Politicas,
    Saldos: this.Saldos,

  }

  public lstContratos = []
  public selectedIndex = 0;
  public active: boolean = false

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }
  public fechainicio = new FormControl(new Date());

  
  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.Listar()
  }

  tabActive(event) {
   
    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      this.Listar()
    } else {
      this.active = !this.active
    }

  }

  editar(e) {

    this.Contrato = e
    this.selectedIndex = 1
    this.active = true

    this.fechainicio.setValue(this.Contrato.Saldos.fechainicio)
  }


  Listar() {
    this.xAPI.funcion = "FID_CContratos"
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstContratos = data
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Consultar() {
    this.xAPI.funcion = "FID_CContrato"
    this.xAPI.parametros = this.Contrato.numero


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Contrato = data[0]
          this.fechainicio.setValue(this.Contrato.Saldos.fechainicio)
        } else {
          let aux = this.Contrato.numero
          this.Limpiar()
          this.Contrato.numero = aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Limpiar() {
    this.Direccion = {
      direccion: '',
      pais: '',
      ciudad: '',
      municipio: '',
      parroquia: '',
      codigopostal: '',
      urbanizacion: '',
      telefono: '',
      celular: '',
      correo: '',
      oficinanacional: ''
    }
    this.Saldos  = {
      saldoinicio: 0,
      sse_fechainicio: '',
      fechainicio: '',
      fondo: 0,
      total: 0,
      prestamo: 0,
      capital: 0,
      valor: 0,
      utilidad: 0
    }
  
    this.Ejecutivo = {
      negocio: '',
      cliente: '',
      proceso: ''
    }
    this.Politicas = {
      observaciones: '',
      tipocuenta: '',
      numerocuenta: '',
      portafolio: '',
      metodocalculo: '',
      tipocalculo: '',
      rendicion: '',
      condicionganancia: '',
      metodoganancia: '',
      enviar: '',
      numeromaximo: 0,
      intervalominimo: 0
    }

    this.Contrato = {
      numero: '',
      rif: '',
      razonsocial: '',
      plan: '',
      estatus: '',
      tipo: '',
      empresa: '',
      fideicomiso: '',
      reporte: '',
      codigo: '',
      plananterior: '',
      grupoanterior: '',
      segmento: '',
      subsegmento: '',
      oficinatutora: '',
      fecha: new Date(),
      Direccion: this.Direccion,
      Ejecutivo: this.Ejecutivo,
      Politicas: this.Politicas,
      Saldos : this.Saldos
    }

  }

  Guardar() {

    if (this.Contrato.numero == "") return
    if(this.fechainicio.value == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    
    this.ngxService.startLoader('load-cont')
    let f = new Date( this.fechainicio.value ).toISOString()

    this.Contrato.Saldos.fechainicio = f
    var obj = {
      "coleccion": "contratos",
      "objeto": this.Contrato,
      "donde": `{\"numero\":\"${this.Contrato.numero}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        console.log(data)
        this.ngxService.stopLoader('load-cont')
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'contratos')
        
      },
      (error) => {
        console.log(error)
      }
    )

  }

  
    

}
