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
    plan: 'INVERSION',
    estatus: '1',
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

  public lstTipoFideicomiso = [
    { "key": "ADMINISTRACION", "val" : [
      {"key": "0", "val":"OBRAS"}, 
      {"key": "1", "val":"PRESTACIONES SOCIALES"}, 
      {"key": "2", "val": "FONDO DE AHORRO"},
      {"key": "3", "val": "OTROS"}
    ] 
    
  },
    { "key": "INVERSION", "val"  : [{"key": "0", "val":"PERSONAL"}, {"key": "1", "val":"JURIDICO"}] ,},
    { "key": "MIXO" , "val" : [{"key": "0", "val":"JURIDICO"}] ,}
  ]

  public lstTipoFid = []

  public lstContratos = []
  
  public lstPaises = []

  public lstCiudades = []

  public lstEstados = []

  public selectedIndex = 0;
  
  public active: boolean = false

  public contrato_search: string = 'none'

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }
  public fechainicio = new FormControl(new Date());

  public tabSaldos : boolean = false

  public focus : boolean = false

  public buscar = ''



  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.Listar()
    this.ListarPaises()
    this.ListarEstados()
    
  }

  tabActive(event) {
   
    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      //this.contrato_search = 'none'
      this.Listar()
      this.tabSaldos = false
    } else {
      this.active = !this.active
    }

  }

  editar(e) {

    this.Contrato = e
    this.selectedIndex = 1
    this.active = true
    //this.contrato_search = ''
    this.fechainicio.setValue(this.Contrato.Saldos.fechainicio)
    this.tabSaldos = true
  }

  getTipoFideicomiso() {
    console.log("Seleccion");
    let codigo = this.Contrato.plan
    console.log(codigo)

    this.lstTipoFid = []
    this.lstTipoFideicomiso.forEach(e => {
      
      if (e.key == codigo){
        this.lstTipoFid = e.val
      }
    });
    
    console.log(this.lstTipoFid)
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

  ListarPaises() {
    this.xAPI.funcion = "ListarPaises"
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstPaises = data.Cuerpo
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ListarEstados() {
    this.xAPI.funcion = "ListarEstados"
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstEstados = data.Cuerpo
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ListarCiudades() {
    this.xAPI.funcion = "ListarCiudad"
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstCiudades = data
      },
      (error) => {
        console.log(error)
      }
    )
  }

  Buscar(e){

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

  ConsultarEmpresa(){
    this.xAPI.funcion = "FID_CEmpresa"
    this.xAPI.parametros = this.Contrato.rif


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null) {
          let Contrato = data[0]
          this.Contrato.rif = Contrato.rif
          this.Contrato.razonsocial = Contrato.razonsocial
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
      plan: 'INVERSION',
      estatus: '1',
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

    this.getTipoFideicomiso()

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
