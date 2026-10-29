import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Empresa } from 'src/app/services/banfanb/administracion';
import { Direccion } from 'src/app/services/banfanb/afiliado.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss']
})
export class EmpresaComponent implements OnInit {

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

  public Empresa: Empresa = {
    rif: '',
    razonsocial: '',
    Direccion: this.Direccion,
    tipo: 'AHORRO',
    numerocuenta: ''
  }

  public lstEmpresa: []
    
  public lstPaises = []

  public lstCiudades = []

  public lstEstados = []

  public tipoDocumento: string = 'J'
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
    this.Empresa = JSON.parse(JSON.stringify(e))
    this.esEdicion = true
    if (e.rif) {
      if (e.rif.includes('-')) {
        const partes = e.rif.split('-')
        this.tipoDocumento = partes[0] || 'J'
        this.numeroDocumento = partes[1] || ''
      } else {
        this.tipoDocumento = e.rif.charAt(0) || 'J'
        this.numeroDocumento = e.rif.substring(1) || ''
      }
    }
    this.empre_insert = ''
    this.empre_search = 'none'
  }

  Listar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_EMPRESAS
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) this.lstEmpresa = data
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
    this.xAPI.funcion = "ListarEstados"
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
    this.xAPI.funcion = "ListarCiudad"
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
    this.xAPI.funcion = "FID_CEmpresa"
    this.xAPI.parametros = this.Empresa.rif

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined && Array.isArray(data) && data.length > 0 && data[0]) {
          this.Empresa = data[0]
          this.esEdicion = true
          if (data[0].rif && data[0].rif.includes('-')) {
            const partes = data[0].rif.split('-')
            this.tipoDocumento = partes[0] || 'J'
            this.numeroDocumento = partes[1] || ''
          }
        } else {
          this.Limpiar()
        }
      },
      (error) => {
        console.error(error)
        this.Limpiar()
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

    this.Empresa = {
      rif: '',
      razonsocial: '',
      Direccion: this.Direccion,
      numerocuenta: '',
      tipo: ''
    }

    this.tipoDocumento = 'J'
    this.numeroDocumento = ''
    this.esEdicion = false
  }


  Guardar() {

    if (!this.formularioValido()) {
      this._snackBar.open('Debe completar y validar todos los campos obligatorios', 'Ok')
      return
    }
    this.Empresa.rif = this.tipoDocumento + '-' + this.numeroDocumento.toUpperCase()
    this.ngxService.startLoader('load-inver')
    var obj = {
      "coleccion": "empresa",
      "objeto": this.Empresa,
      "donde": `{\"rif\":\"${this.Empresa.rif}\"}`,
      "driver": "MGDBA",
      "upsert": this.esEdicion
    }
    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.apiService.Mensaje('Proceso exitoso', this.esEdicion ? 'Empresa actualizada correctamente' : 'Empresa registrada correctamente', 'success', 'empresa')
        this.ngxService.stopLoader('load-inver')
        this.Limpiar()
        this.Listar()
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-inver')
      }
    )
  }

  formularioValido(): boolean {
    return !!this.tipoDocumento
      && !!this.numeroDocumento?.trim()
      && !!this.Empresa.razonsocial?.trim()
      && !!this.Empresa.Direccion.direccion?.trim()
      && !!this.Empresa.Direccion.pais
      && !!this.Empresa.Direccion.ciudad
      && !!this.Empresa.Direccion.codigopostal?.trim()
      && !!this.Empresa.Direccion.telefono?.trim()
      && !!this.Empresa.Direccion.correo?.trim()
      && !!this.Empresa.tipo
      && !!this.Empresa.numerocuenta?.trim()
      && this.validarNumeroDocumento(this.numeroDocumento)
      && this.validarEmail(this.Empresa.Direccion.correo)
      && this.validarNumerico(this.Empresa.Direccion.codigopostal, 4, 8)
      && this.validarNumerico(this.Empresa.Direccion.telefono, 7, 11)
      && this.validarNumerico(this.Empresa.numerocuenta, 4, 20)
  }

  validarNumeroDocumento(numero: string): boolean {
    if (!numero) return false
    return /^\d{7,10}$/.test(numero)
  }

  validarRif(rif: string): boolean {
    if (!rif) return false
    return /^[VJGE]-\d{7,10}$/.test(rif.toUpperCase())
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
      case 'razonsocial': return this.Empresa.razonsocial
      case 'direccion': return this.Empresa.Direccion.direccion
      case 'pais': return this.Empresa.Direccion.pais
      case 'ciudad': return this.Empresa.Direccion.ciudad
      case 'codigopostal': return this.Empresa.Direccion.codigopostal
      case 'telefono': return this.Empresa.Direccion.telefono
      case 'correo': return this.Empresa.Direccion.correo
      case 'tipo': return this.Empresa.tipo
      case 'numerocuenta': return this.Empresa.numerocuenta
      default: return null
    }
  }

  validarCampo(campo: string, valor: any): boolean {
    switch(campo) {
      case 'numeroDocumento': return this.validarNumeroDocumento(valor)
      case 'correo': return this.validarEmail(valor)
      case 'codigopostal': return this.validarNumerico(valor, 4, 8)
      case 'telefono': return this.validarNumerico(valor, 7, 11)
      case 'numerocuenta': return this.validarNumerico(valor, 4, 20)
      default: return true
    }
  }

  mensajeError(campo: string): string {
    switch(campo) {
      case 'numeroDocumento': return 'Debe ser numérico (7-10 dígitos)'
      case 'correo': return 'Formato de correo electrónico inválido'
      case 'codigopostal': return 'Debe ser numérico (4-8 dígitos)'
      case 'telefono': return 'Debe ser numérico (7-11 dígitos)'
      case 'numerocuenta': return 'Debe ser numérico (4-20 dígitos)'
      default: return ''
    }
  }




}
