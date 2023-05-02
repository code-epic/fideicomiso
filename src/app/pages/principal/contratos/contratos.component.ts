import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Direccion } from 'src/app/services/banfanb/afiliado.service';
import { Contrato, Ejecutivo, Politicas, Saldos } from 'src/app/services/banfanb/contrato.service';
import { SemilleroService } from 'src/app/services/banfanb/semillero';
import { Semillero } from 'src/app/services/banfanb/semillero';
import { UtilService } from 'src/app/services/util/util.service';

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
    portafolionomb: '',
    metodocalculo: '',
    tipocalculo: '',
    rendicion: '',
    condicionganancia: '',
    metodoganancia: '',
    comision: '',
    tasa : 0,
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

  public lstEjecutivos = []
  
  public Contrato: Contrato = {
    numero: '',
    rif: '',
    razonsocial: '',
    plan: '',
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
    Ejecutivo: this.lstEjecutivos,
    Politicas: this.Politicas,
    Saldos: this.Saldos,

  }

  public semillero : Semillero = {
    codigo: 0,
    plan: '',
    descripcion: '',
    fecha: new Date(),
    autor: ''
  }




  public portafolio = ''

  public lstTipoFideicomiso = [
    { "key": "ADMINISTRACION", "val" : [
      {"key": "0", "val":"OBRAS"}, 
      {"key": "1", "val":"PRESTACIONES SOCIALES"}, 
      {"key": "2", "val": "FONDO DE AHORRO"},
      {"key": "3", "val": "OTROS"}
    ] 
    
  },
    { "key": "INVERSION", "val"  : [{"key": "0", "val":"PERSONAL"}, {"key": "1", "val":"JURIDICO"}] ,},
    { "key": "MIXTO" , "val" : [{"key": "0", "val":"JURIDICO"}] ,}
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

  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  myOficina = new FormControl('');
  oficinas: string[] = [];
  filteredOficinas: Observable<string[]>;

  public oficinatutora = 'Oficina Tutora'

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService
    ) { }

  ngOnInit(): void {
    this.Listar()
    this.ListarPaises()
    this.ListarEstados()
    this.ListarEjecutivos()
    this.ListarOficinas()
  }



  GenerarSemillero(){
    this.xAPI.funcion = "FID_CSemillero"
    this.xAPI.parametros = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          let codigo = parseInt(data[0].codigo) + 1
          this.Contrato.numero = this.util.zfill(codigo, 4)
        
        } else {
          this.Contrato.numero = "0001"
        }

      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  ListarEjecutivos(){
    this.xAPI.funcion = "FID_CEjecutivos"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        
        if (data != null && data.msj == undefined) {
          data.forEach(e => {
            let valor = e.nacionalidad + e.cedula + ' ' + e.papellido + ' ' + e.pnombre + ' | ' + e.actividad 
            this.options.push(valor)
          });

        }

        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || '')),
        );
      },
      (error) => {
        console.log(error)
      }
    )
    
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ListarOficinas(){
    this.xAPI.funcion = "FID_COficinas"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        if (data != null && data.msj == undefined) {
          data.forEach(e => {
            let valor = e.direccion + ' | ' + e.telefonos 
            this.oficinas.push(valor)
          });

        }

        this.filteredOficinas = this.myOficina.valueChanges.pipe(
          startWith(''),
          map(value => this._filteroficinas(value || '')),
        );
      },
      (error) => {
        console.log(error)
      }
    )
  }

  private _filteroficinas(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.oficinas.filter(option => option.toLowerCase().includes(filterValue));
  }



  insertar(){
    let value = this.myControl.value + ''
    this.lstEjecutivos.push({ "nombre": value.toUpperCase() })
    this.myControl.setValue('')

  }
  tabActive(event) {
   
    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      //this.contrato_search = 'none'
      this.GenerarSemillero()
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
    this.myOficina.setValue(this.Contrato.oficinatutora.toUpperCase())
    this.lstEjecutivos = this.Contrato.Ejecutivo
    this.getTipoFideicomiso()
    this.tabSaldos = true
  }

  getTipoFideicomiso() {
    
    let codigo = this.Contrato.plan
    // console.log(codigo)

    this.lstTipoFid = []
    this.lstTipoFideicomiso.forEach(e => {
      
      if (e.key == codigo){
        this.lstTipoFid = e.val
        
      }
    });
    
    // console.log(this.lstTipoFid)
  }

  Listar() {
    this.xAPI.funcion = "FID_CContratos"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
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
        // console.log(data)
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
        //console.log(data)
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
          this.myOficina.setValue(this.Contrato.oficinatutora.toUpperCase())
          this.lstEjecutivos = this.Contrato.Ejecutivo
          this.getTipoFideicomiso()
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
    this.xAPI.parametros = this.Contrato.rif.toUpperCase()


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


  // ConsultarEjecutivo() {

  //   this.xAPI.funcion = "FID_CEjecutivo"
  //   this.xAPI.parametros = this.Ejecutivo.cedula

  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     (data) => {
  //       console.log(data)
  //       if (data != null && data.msj == undefined) {
  //         this.Ejecutivo = data[0]
  //       } else {
  //         let aux = this.Ejecutivo.cedula
  //         this.Limpiar()
  //         this.Ejecutivo.cedula = aux
  //       }
  //     },
  //     (error) => {
  //       console.log(error)
  //       this.Limpiar()
  //     }
  //   )
  // }

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
      portafolionomb : '',
      metodocalculo: '',
      tipocalculo: '',
      rendicion: '',
      condicionganancia: '',
      metodoganancia: '',
      comision: '',
      tasa : 0,
      enviar: '',
      numeromaximo: 0,
      intervalominimo: 0
    }

    this.Contrato = {
      numero: '',
      rif: '',
      razonsocial: '',
      plan: '',
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
      Ejecutivo: this.lstEjecutivos,
      Politicas: this.Politicas,
      Saldos : this.Saldos
    }

    this.getTipoFideicomiso()
    this.lstEjecutivos = []
  }


  Guardar() {
    if(this.fechainicio.value == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }

    this.ngxService.startLoader('load-cont')
    this.semillero.codigo = parseInt(this.Contrato.numero)
    this.semillero.plan = this.Contrato.numero
    this.semillero.descripcion = "Contratos"
    let f = new Date()
    this.semillero.fecha = f

    var obj = {
      "coleccion": "semillero",
      "objeto": this.semillero,
      "donde": `{\"codigo\":\"${this.semillero.codigo }\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    // console.log(obj)

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.GuardarContrato() 
        
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  GuardarContrato() {
   
    this.Contrato.Ejecutivo = this.lstEjecutivos

    
    let f = new Date( this.fechainicio.value ).toISOString()

    let ofc = this.myOficina.value + ''
    this.Contrato.oficinatutora = ofc.toUpperCase()
    this.Contrato.Saldos.fechainicio = f
    var obj = {
      "coleccion": "contratos",
      "objeto": this.Contrato,
      "donde": `{\"numero\":\"${this.Contrato.numero}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    // console.log(obj)

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.ngxService.stopLoader('load-cont')
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'contratos')
        
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  ConsultarPortafolio() {

    this.xAPI.funcion = "FID_CPortafolio"
    this.xAPI.parametros = this.Contrato.Politicas.portafolio

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
       
        if (data != null && data.msj == undefined) {
          this.Contrato.Politicas.portafolionomb = data[0].descripcion
        } else {
          let aux = this.Contrato.Politicas.portafolio
          this.Contrato.Politicas.portafolio = aux
        }
      },
      (error) => {
        console.log(error)
        
      }
    )
  }

  
    

}
