import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Afiliado, Direccion } from 'src/app/services/banfanb/afiliado.service';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ejecutivos',
  templateUrl: './ejecutivos.component.html',
  styleUrls: ['./ejecutivos.component.scss']
})
export class EjecutivosComponent implements OnInit {
  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }
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

  public Ejecutivo: Afiliado = {
    nacionalidad: '',
    cedula: '',
    estatus: 0,
    estadocivil: '',
    pnombre: '',
    smombre: '',
    papellido: '',
    sapellido: '',
    sexo: '',
    nacimiento: '',
    ingreso: '',
    actividad: 'NEGOCIO',
    Direccion: this.Direccion
  }

  public nacimiento = new FormControl(new Date());
  public ingreso = new FormControl(new Date());

  public lstEjecutivos: []
    
  public lstPaises = []

  public lstCiudades = []

  public lstEstados = []

  public tipoDocumento: string = 'V'
  public numeroDocumento: string = ''

  public empre_insert: string = ''
  public empre_search: string = 'none'
  public esEdicion: boolean = false

  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.Listar()
    this.ListarPaises()
    this.ListarEstados()
  }

  atras(){
    this.empre_insert = ''
    this.empre_search = 'none'
  }

  editar(e) {
    this.Ejecutivo = JSON.parse(JSON.stringify(e))
    this.esEdicion = true
    if (e.cedula && e.cedula.includes('-')) {
      const partes = e.cedula.split('-')
      this.tipoDocumento = partes[0] || 'V'
      this.numeroDocumento = partes[1] || ''
    }
    if (e.nacimiento) {
      this.nacimiento.setValue(new Date(e.nacimiento))
    }
    if (e.ingreso) {
      this.ingreso.setValue(new Date(e.ingreso))
    }
    this.empre_insert = ''
    this.empre_search = 'none'
  }

  Listar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_EJECUTIVOS
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) this.lstEjecutivos = data
      },
      (error) => {
        console.error(error)
        this.Limpiar()
      }
    )
  }
  ListarPaises() {
    this.xAPI.funcion = environment.xApi.LISTAR_PAISES
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstPaises = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  }

  ListarEstados() {
    this.xAPI.funcion = environment.xApi.LISTAR_ESTADOS
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstEstados = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  }

  ListarCiudades() {
    this.xAPI.funcion = environment.xApi.LISTAR_CIUDAD
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstCiudades = data
      },
      (error) => {
        console.error(error)
      }
    )
  }
  Consultar() {
    const cedula = this.tipoDocumento + '-' + this.numeroDocumento
    if (!this.numeroDocumento || this.numeroDocumento.trim() === '') return

    this.xAPI.funcion = environment.xApi.CONSULTAR_EJECUTIVO
    this.xAPI.parametros = cedula

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined && Array.isArray(data) && data.length > 0 && data[0]) {
          this.Ejecutivo = data[0]
          this.esEdicion = true
          if (data[0].nacimiento) {
            this.nacimiento.setValue(new Date(data[0].nacimiento))
          }
          if (data[0].ingreso) {
            this.ingreso.setValue(new Date(data[0].ingreso))
          }
        }
      },
      (error) => {
        console.error(error)
      }
    )
  }

  Seleccionar() {
    this.Listar()
    this.empre_insert = 'none'
    this.empre_search = ''
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

    this.Ejecutivo = {
      nacionalidad: '',
      cedula: '',
      estatus: 0,
      estadocivil: '',
      pnombre: '',
      smombre: '',
      papellido: '',
      sapellido: '',
      sexo: '',
      nacimiento: '',
      ingreso: '',
      actividad: 'NEGOCIO',
      Direccion: {
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
    }

    this.tipoDocumento = 'V'
    this.numeroDocumento = ''
    this.esEdicion = false
    this.nacimiento.setValue(new Date())
    this.ingreso.setValue(new Date())
  }


  Guardar() {

    if (!this.formularioValido()) {
      this._snackBar.open('Debe completar y validar todos los campos obligatorios', 'Ok')
      return
    }
    this.Ejecutivo.cedula = this.tipoDocumento + '-' + this.numeroDocumento
    this.ngxService.startLoader('load-ejecutivo')

    let n = new Date(this.nacimiento.value).toISOString()
    let i = new Date(this.ingreso.value).toISOString()
    this.Ejecutivo.nacimiento = n
    this.Ejecutivo.ingreso = i


    var obj = {
      "coleccion": "ejecutivo",
      "objeto": this.Ejecutivo,
      "donde": `{\"cedula\":\"${this.Ejecutivo.cedula}\"}`,
      "driver": "MGDBA",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.apiService.Mensaje('Proceso exitoso', this.esEdicion ? 'Ejecutivo actualizado correctamente' : 'Ejecutivo registrado correctamente', 'success', 'ejecutivo')
        this.ngxService.stopLoader('load-ejecutivo')
        this.Limpiar()
        this.Listar()
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-ejecutivo')
      }
    )
  }

  formularioValido(): boolean {
    return !!this.tipoDocumento
      && !!this.numeroDocumento?.trim()
      && !!this.Ejecutivo.actividad
      && !!this.Ejecutivo.pnombre?.trim()
      && !!this.Ejecutivo.papellido?.trim()
      && !!this.Ejecutivo.Direccion.correo?.trim()
      && !!this.Ejecutivo.Direccion.telefono?.trim()
      && !!this.Ejecutivo.Direccion.celular?.trim()
      && this.validarNumeroDocumento(this.numeroDocumento)
      && this.validarEmail(this.Ejecutivo.Direccion.correo)
      && this.validarNumerico(this.Ejecutivo.Direccion.telefono, 7, 11)
      && this.validarNumerico(this.Ejecutivo.Direccion.celular, 10, 11)
  }

  validarNumeroDocumento(numero: string): boolean {
    if (!numero) return false
    return /^\d{6,10}$/.test(numero)
  }

  validarCedula(cedula: string): boolean {
    if (!cedula) return false
    return /^\d{6,10}$/.test(cedula)
  }

  validarEmail(email: string): boolean {
    if (!email) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  validarNumerico(valor: string, min: number, max: number): boolean {
    if (!valor) return false
    return /^\d+$/.test(valor) && valor.length >= min && valor.length <= max
  }

  campoInvalido(campo: string): boolean {
    const val = this.obtenerValorCampo(campo)
    if (val === null || val === undefined) return false
    if (typeof val === 'string' && val === '') return false
    return !this.validarCampo(campo, val)
  }

  obtenerValorCampo(campo: string): any {
    switch(campo) {
      case 'numeroDocumento': return this.numeroDocumento
      case 'correo': return this.Ejecutivo.Direccion.correo
      case 'telefono': return this.Ejecutivo.Direccion.telefono
      case 'celular': return this.Ejecutivo.Direccion.celular
      default: return null
    }
  }

  validarCampo(campo: string, valor: any): boolean {
    switch(campo) {
      case 'numeroDocumento': return this.validarNumeroDocumento(valor)
      case 'correo': return this.validarEmail(valor)
      case 'telefono': return this.validarNumerico(valor, 7, 11)
      case 'celular': return this.validarNumerico(valor, 10, 11)
      default: return true
    }
  }

  mensajeError(campo: string): string {
    switch(campo) {
      case 'numeroDocumento': return 'Debe ser numérico (6-10 dígitos)'
      case 'correo': return 'Formato de correo electrónico inválido'
      case 'telefono': return 'Debe ser numérico (7-11 dígitos)'
      case 'celular': return 'Debe ser numérico (10-11 dígitos)'
      default: return ''
    }
  }


}


