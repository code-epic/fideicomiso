import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Direccion } from 'src/app/services/banfanb/afiliado.service';
import { Contrato, Ejecutivo, MovComision, Politicas, Saldos } from 'src/app/services/banfanb/contrato.service';
import { Semillero } from 'src/app/services/banfanb/semillero';
import { UtilService } from 'src/app/services/util/util.service';
import { PlanFideicomiso } from 'src/app/services/banfanb/contabilidad.service';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from "@angular/material/dialog";
import { environment } from 'src/environments/environment';
import { EstadocuentaComponent } from './estadocuenta/estadocuenta.component';
import { CierreService } from 'src/app/services/banfanb/cierre.service';

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
    tasa: 0,
    enviar: '',
    numeromaximo: 0,
    intervalominimo: 0,
    flat: 'NO',
    tasaflat: 0
  }

  public Saldos: Saldos = {
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
    tiporif: 'J-',
    rif: '',
    razonsocial: '',
    plan: '',
    estatus: '2',
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
    clasificacion: '1'
  }

  public semillero: Semillero = {
    codigo: 0,
    plan: '',
    descripcion: '',
    fecha: new Date(),
    autor: ''
  }

  public planFideicomiso: PlanFideicomiso = {
    fecha_apertura: '',
    observacion: '',
    monto_apertura: 0,
    usuario: '',
    estatus: 0,
    metodo_ganancia: 0,
    frecuencia: 0,
    tasa_flat: 0,
    comision_flat: 0,
    tipo_calculo: 0,
    tasa_comision: 0,
    tipo_comision: 0,
    clasificacion: '',
    tipo_fideicomiso: '',
    fideicomiso: '',
    portafolio: 0,
    porcentaje: 0,
    identificador: 0
  }

  public movimiento: MovComision = {
    debe: 0,
    estatus: 0,
    fecha_cierre: '',
    fecha_precierre: '',
    haber: 0,
    cuenta: 0,
    plan: 0,
    llave: '',
    usuario: '',
    fecha_operacion: ''
  }

  contratoForm: FormGroup

  @ViewChild('estadocuenta', { static: true }) estadocuenta: TemplateRef<any>;

  public portafolio = ''

  public lstTipoFideicomiso = [
    {
      "key": "ADMINISTRACION", "val": [
        { "key": "0", "val": "OBRAS" },
        { "key": "1", "val": "PRESTACIONES SOCIALES" },
        { "key": "2", "val": "FONDO DE AHORRO" },
        { "key": "3", "val": "OTROS" }
      ]

    },
    { "key": "INVERSION", "val": [{ "key": "0", "val": "PERSONAL" }, { "key": "1", "val": "JURIDICO" }, { "key": "2", "val": "GUBERNAMENTAL" }], },
    { "key": "MIXTO", "val": [{ "key": "0", "val": "JURIDICO" }], }
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

  public fechai: any
  public fechainicio: any

  public fechar: any
  public fecharegistro: any

  public tabSaldos: boolean = false
  public focus: boolean = false
  public buscar = ''

  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  myOficina = new FormControl('');
  oficinas: string[] = [];
  filteredOficinas: Observable<string[]>;

  public oficinatutora = 'Oficina Tutora'

  public lstDataPortafolio = []

  public saldo_inicio = ''
  private fechaultimo = ''
  private estatus: string = '%'

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public dialog: MatDialog,
    public formatter: NgbDateParserFormatter,
    private fb: FormBuilder,
    private cierre: CierreService
  ) { }

  ngOnInit(): void {
    this.iniciarFormulario()
    this.Listar()
    this.ListarPaises()
    this.ListarEstados()
    this.ListarEjecutivos()
    this.ListarOficinas()
    this.ListarPortafolio()
    this.consultarUltimoCierre()
  }

  private iniciarFormulario(): void {
    this.contratoForm = this.fb.group({
      // Datos principales
      numero: [{value: '', disabled: true}, Validators.required],
      tiporif: ['J-'],
      rif: ['', Validators.required],
      razonsocial: ['', Validators.required],
      estatus: ['', Validators.required],
      plan: ['', Validators.required],
      tipo: ['', Validators.required],
      clasificacion: ['', Validators.required],
      empresa: [''],
      fideicomiso: [''],
      reporte: [''],
      plananterior: [''],
      // Oficina
      myOficina: [''],
      oficina: [''],

      fechar: [''],
      fechai: [{value: '', disabled: true}, Validators.required],
      saldo_inicio: [0, Validators.required],
      total_disponible: [''],
      saldo_disponible: [''],
      capital_asignado: [''],
      saldo_patrimonio: [''],
      
      // Politicas (anidado)
      Politicas: this.fb.group({
        tipocuenta: ['', Validators.required],
        numerocuenta: ['', Validators.required],
        enviar: ['', Validators.required],
        comision: ['', Validators.required],
        tasa: [0, Validators.required],
        tipocalculo: ['', Validators.required],
        flat: [0, Validators.required],
        tasaflat: [0, Validators.required],
        numeromaximo: [0, Validators.required],
        condicionganancia: ['', Validators.required],
        metodoganancia: ['', Validators.required],
        portafolionomb: [''],
        observaciones: [''],
        intervalominimo: [0],
        portafolio: [''],
        metodocalculo: [''],
        rendicion: [''],
      }),
      
      // Saldos (anidado)
      Saldos: this.fb.group({
        saldoinicio: [0],
        fechainicio: [''],
        sse_fechainicio: [''],
        fondo: [0],
        total: [0],
        prestamo: [0],
        capital: [0],
        valor: [0],
        utilidad: [0],
      }),
      // Ejecutivo (anidado, si lo necesitas como grupo)
      // Ejecutivo: this.fb.group({
        negocio: [''],
        cliente: [''],
        proceso: [''],
      // }),
    });
  }

  async consultarUltimoCierre() {
    this.fechaultimo = await this.cierre.getUltimoCierre()
  }

  ConsultarSaldos(){
    const antes = new Date(this.util.ConvertirFechaDB(this.fechaultimo))

    const sHoy = this.util.ConvertirFechaDB(this.fechaultimo)
    const sAntes = new Date(antes).toISOString().substring(0, 10)

    const fecha = `${sAntes},${sHoy}`

    this.xAPI.funcion = environment.xApi.CONSULTAR_BALANCE_FECHA
    this.xAPI.parametros = `${fecha},${this.estatus}`

    this.apiService.Ejecutar(this.xAPI).subscribe(
      
      async data => {
        let sdd = 0
        let tdd = 0
        let cdd = 0
        let pdd = 0
        data.Cuerpo.forEach((e) => {
          if (e.codigo_padre.indexOf("711") == 0 ) {
            sdd +=  parseFloat(e.saldo_inicial)
            
          } else if (e.codigo_padre.indexOf("71") == 0 ){
            tdd +=  parseFloat(e.saldo_inicial)
          } else if (e.codigo_padre.indexOf("731") == 0 ){
            cdd +=  parseFloat(e.saldo_inicial)
          }else if (e.codigo_padre.indexOf("73") == 0 ){
            pdd +=  parseFloat(e.saldo_inicial)
          }

        })
        tdd += sdd
        pdd += cdd
        this.contratoForm.get('saldo_disponible').setValue(sdd.toFixed(2))
        this.contratoForm.get('total_disponible').setValue(tdd.toFixed(2))
        this.contratoForm.get('capital_asignado').setValue(cdd.toFixed(2))
        this.contratoForm.get('saldo_patrimonio').setValue(pdd.toFixed(2))
      },
      (error) => {
        console.error(error);
      }
    );
  }

  ListarEjecutivos() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_EJECUTIVOS
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
        console.error(error)
      }
    )
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ListarOficinas() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_OFICINAS
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          data.forEach(e => {
            let valor = e.direccion + ' | ' + e.telefonos
            this.oficinas.push(valor)
          });
        }

        this.filteredOficinas = this.contratoForm.get('myOficina').valueChanges.pipe(
          startWith(''),
          map(value => this._filteroficinas(value || '')),
        );
      },
      (error) => {
        console.error(error)
      }
    )
  }

  private _filteroficinas(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.oficinas.filter(option => option.toLowerCase().includes(filterValue));
  }

  insertar() {
    const value = this.contratoForm.get('oficina').value
    if(value){
      this.lstEjecutivos.push({ "nombre": value.toUpperCase() })
      this.contratoForm.get('oficina').setValue('')
    }else{
      this.apiService.Mensaje('Agregue un ejecutivo', '', 'warning', '')
    }
  }

  tabActive(event) {
    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      this.iniciarFormulario()
      this.contratoForm.get('numero').setValue(this.util.GenerarUnicId())
      this.contratoForm.get('estatus').setValue('2')
      this.Listar()
      this.tabSaldos = false
      this.planFideicomiso.identificador = 0
    } else {
      this.active = !this.active
    }

  }

  editar(e: any) {
    this.Contrato = e
    this.Limpiar()
    this.contratoForm.patchValue(this.Contrato)
    this.contratoForm.get('saldo_inicio').setValue(this.Contrato.Saldos.saldoinicio)
    this.contratoForm.get('Politicas.tipocuenta').setValue(this.Contrato.Politicas.tipocuenta)

    this.selectedIndex = 1
    this.active = true
    this.fechainicio = NgbDate.from(this.formatter.parse(this.Contrato.Saldos.fechainicio))

    this.myOficina.setValue(this.Contrato.oficinatutora.toUpperCase())
    this.lstEjecutivos = this.Contrato.Ejecutivo
    this.getTipoFideicomiso()
    this.saldo_inicio = this.Contrato.Saldos.saldoinicio.toString()
    this.planFideicomiso.identificador = parseInt(this.Contrato.numero)
    this.tabSaldos = true
    this.ConsultarSaldos()

  }

  getTipoFideicomiso() {
    const codigo = this.contratoForm.get('plan').value
    const tipoActual = this.contratoForm.get('tipo').value

    this.lstTipoFid = []
    this.lstTipoFideicomiso.forEach(e => {

      if (e.key == codigo) {
        this.lstTipoFid = e.val
      }
    });

    if (tipoActual && !this.lstTipoFid.some(e => e.val === tipoActual)) {
      this.contratoForm.get('tipo').setValue('')
    }
  }

  Listar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_CONTRATOS
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstContratos = data
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

  Buscar(e) {

  }

  Consultar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_CONTRATO
    this.xAPI.parametros = this.Contrato.numero
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Contrato = data[0]

          this.fechainicio = NgbDate.from(this.formatter.parse(this.Contrato.Saldos.fechainicio))
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
        console.error(error)
        this.Limpiar()
      }
    )
  }

  ConsultarEmpresa() {
    let rifBusqueda = this.contratoForm.get('rif').value;
    const tiporif = this.contratoForm.get('tiporif')?.value || '';
    if (rifBusqueda && tiporif && !rifBusqueda.toUpperCase().startsWith(tiporif.substring(0, 1))) {
      rifBusqueda = tiporif + rifBusqueda;
    }
    this.xAPI.funcion = environment.xApi.CONSULTAR_EMPRESA
    this.xAPI.parametros = rifBusqueda || this.contratoForm.get('rif').value

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.length > 0) {
          let Empresa = data[0]
          let rifStr: string = Empresa.rif || '';
          const match = rifStr.match(/^(J|V|G|E|P|C)-?/i);
          if (match) {
            const prefix = match[1].toUpperCase() + '-';
            this.contratoForm.get('tiporif')?.setValue(prefix);
            rifStr = rifStr.substring(match[0].length);
          }
          this.contratoForm.get('rif').setValue(rifStr || Empresa.rif)
          this.contratoForm.get('razonsocial').setValue(Empresa.razonsocial)
          this.contratoForm.get('Politicas.tipocuenta').setValue(Empresa.tipo)
          this.contratoForm.get('Politicas.numerocuenta').setValue(Empresa.numerocuenta)
          this.contratoForm.get('Politicas.enviar').setValue(Empresa.Direccion.correo)
        }
      },
      (error) => {
        console.error(error)
        this.Limpiar()
      }
    )
  }

  Limpiar() {
    this.contratoForm.reset()

    this.getTipoFideicomiso()
    this.lstEjecutivos = []
  }


  getPlanFideicomisoDB() {
    this.Contrato = this.contratoForm.getRawValue()

    this.fechai = this.contratoForm.get('Saldos.fechainicio').value
    this.fecharegistro = this.contratoForm.get('fechar').value
    this.saldo_inicio = this.contratoForm.get('saldo_inicio').value

    this.planFideicomiso.fecha_apertura = typeof this.fechai == 'object' ? this.util.ConvertirFecha(this.fechai) : this.Contrato.Saldos.fechainicio.substring(0, 10)

    this.planFideicomiso.observacion = this.Contrato.rif + '|' + this.Contrato.razonsocial
    this.planFideicomiso.monto_apertura = parseFloat(this.saldo_inicio)
    this.planFideicomiso.usuario = ''
    this.planFideicomiso.estatus = parseInt(this.Contrato.estatus)
    this.planFideicomiso.metodo_ganancia = parseInt(this.Contrato.Politicas.metodoganancia)
    this.planFideicomiso.frecuencia = parseInt(this.Contrato.Politicas.condicionganancia)
    this.planFideicomiso.tasa_flat = parseFloat(this.Contrato.Politicas.tasaflat.toString())
    this.planFideicomiso.comision_flat = parseInt(this.Contrato.Politicas.flat)
    this.planFideicomiso.tipo_calculo = parseInt(this.Contrato.Politicas.tipocalculo.toString())
    this.planFideicomiso.tasa_comision = parseFloat(this.Contrato.Politicas.tasa.toString())
    this.planFideicomiso.tipo_comision = parseInt(this.Contrato.Politicas.comision)
    this.planFideicomiso.clasificacion = this.Contrato.clasificacion
    this.planFideicomiso.tipo_fideicomiso = this.Contrato.tipo
    this.planFideicomiso.fideicomiso = this.Contrato.plan
    this.planFideicomiso.porcentaje = this.Contrato.Politicas.numeromaximo

    this.planFideicomiso.portafolio = parseInt(this.Contrato.Politicas.portafolionomb)
  }

  Guardar() {

    this.getPlanFideicomisoDB()


    if (this.Contrato.Saldos.fechainicio == "" && this.saldo_inicio == '') {
      this._snackBar.open("Debe verificar todos los campos de fecha...", "Ok");
      return
    }

    this.ngxService.startLoader('load-cont')

    this.xAPI.funcion = this.planFideicomiso.identificador > 0 ? 'FID_UPlanFideicomiso' : 'FID_IPlanFideicomiso'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.planFideicomiso)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj != undefined) {
          let numero = this.planFideicomiso.identificador > 0 ? this.planFideicomiso.identificador : data.msj

          this.Contrato.numero = this.util.zfill(numero, 4)
          this.Contrato.Saldos.fechainicio = this.planFideicomiso.fecha_apertura
          this.Contrato.Saldos.saldoinicio = this.planFideicomiso.monto_apertura
          this.guardarContrato()
        }
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }

  private guardarContrato() {
    this.Contrato.Ejecutivo = this.lstEjecutivos || []
    let ofc = this.myOficina.value + ''
    this.Contrato.oficinatutora = ofc.toUpperCase()

    var obj = {
      "coleccion": "contratos",
      "objeto": this.Contrato,
      "donde": `{\"numero\":\"${this.Contrato.numero}\"}`,
      "driver": "MGDBA",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.ngxService.stopLoader('load-cont')
        this.apiService.Mensaje(
          "Felicitaciones, Proceso exitoso",
          "Codigo de plan #" + this.Contrato.numero,
          "success",
          "contratos"
        );
      },
      (error) => {        
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  ListarPortafolio() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_PORTAFOLIOS
    this.xAPI.parametros = this.Contrato.Politicas.portafolio
    this.xAPI.parametros = this.contratoForm.get('Politicas.portafolio').value

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstDataPortafolio = data.Cuerpo
      },
      (error) => {
        console.error(error)

      }
    )

  }

  openDialog(): void {

    const dialogRef = this.dialog.open(EstadocuentaComponent, {
      data: {contrato: this.Contrato},
      width: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.animal = result;
    });
  }

}
