import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
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
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from "@angular/material/dialog";

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

  public tabEjecutivo: boolean = false

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
  public total_disponible = ''
  public saldo_disponible = ''
  public capital_asignado = ''
  public saldo_patrimonio = ''
  public fechaultimo = ''
  public fechaUltimoComparacion = ''
  public fecha: string = ''
  public fdesde: string = '2023-12-01'
  public fhasta: string = '2023-12-31'
  public estatus: string = '%'

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    private toasService: ToastrService,
    public dialog: MatDialog,
    public formatter: NgbDateParserFormatter,
  ) { }

  ngOnInit(): void {
    this.Listar()
    this.ListarPaises()
    this.ListarEstados()
    this.ListarEjecutivos()
    this.ListarOficinas()
    this.ListarPortafolio()
    this.consultarUltimoCierre()
  }


  consultarUltimoCierre() {
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CUltimoCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    // console.log('hola')
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        let ultc = data.Cuerpo
        if (ultc.length > 0) {
          let fecha = ultc[0].fecha_cierre;
          let d = fecha.split('-');
          this.fechaultimo = d[0] + '-' + d[1] + '-' + d[2];
          this.fechaUltimoComparacion = d;
        }
        

      },
      (error) => {
        console.log(error)
      }
    )
  }


  ConsultarSaldos(){
    

    let antes = new Date(this.fechaUltimoComparacion).setHours(+23)

    let sHoy = this.fechaultimo
    let sAntes = new Date(antes).toISOString().substring(0, 10)

    this.fecha = `${sAntes},${sHoy}`
    this.xAPI.funcion = "FID_CBalanceFecha"
    this.xAPI.parametros = `${this.fecha},${this.estatus}`

    //console.log(this.xAPI.parametros)
    this.saldo_disponible = '0'

    this.apiService.Ejecutar(this.xAPI).subscribe(
      
      async data => {
        let sdd = 0
        let tdd = 0
        let cdd = 0
        let pdd = 0
        data.Cuerpo.forEach((e) => {
          console.log(e.codigo_padre)
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
        this.saldo_disponible = sdd.toFixed(2)
        this.total_disponible = tdd.toFixed(2)
        this.capital_asignado = cdd.toFixed(2)
        this.saldo_patrimonio = pdd.toFixed(2)

        // console.log(sdd, tdd, cdd, pdd)
      },
      (error) => {
        console.log(error);
      }
    );

    this.ngxService.stopLoader('load-precierre')



  }

  GenerarSemillero() {


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

  ListarEjecutivos() {
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

  ListarOficinas() {
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



  insertar() {
    let value = this.myControl.value + ''
    this.lstEjecutivos.push({ "nombre": value.toUpperCase() })
    this.myControl.setValue('')

  }
  tabActive(event) {

    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      //this.contrato_search = 'none'
      //this.GenerarSemillero()
      this.Contrato.numero = this.util.GenerarUnicId()
      this.Contrato.estatus = "2"

      this.Listar()
      this.tabSaldos = false
      this.planFideicomiso.identificador = 0
      console.log(this.planFideicomiso)
    } else {
      this.active = !this.active

    }

  }

  editar(e) {
    this.Contrato = e
    this.selectedIndex = 1
    this.active = true
    //this.contrato_search = ''
    this.fechainicio = NgbDate.from(this.formatter.parse(this.Contrato.Saldos.fechainicio))


    this.myOficina.setValue(this.Contrato.oficinatutora.toUpperCase())
    this.lstEjecutivos = this.Contrato.Ejecutivo
    this.getTipoFideicomiso()
    this.saldo_inicio = this.Contrato.Saldos.saldoinicio.toString()
    this.planFideicomiso.identificador = parseInt(this.Contrato.numero)
    this.tabSaldos = true
    // this.SaldoDisponible()
    // this.CapitalAsignado()

    this.ConsultarSaldos()

    console.log(this.planFideicomiso)

  }

  getTipoFideicomiso() {

    let codigo = this.Contrato.plan
    // console.log(codigo)

    this.lstTipoFid = []
    this.lstTipoFideicomiso.forEach(e => {

      if (e.key == codigo) {
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

  Buscar(e) {

  }

  Consultar() {
    this.xAPI.funcion = "FID_CContrato"
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
        console.log(error)
        this.Limpiar()
      }
    )
  }

  ConsultarEmpresa() {
    this.xAPI.funcion = "FID_CEmpresa"
    this.xAPI.parametros = this.Contrato.rif.toUpperCase()


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null) {
          let Empresa = data[0]
          this.Contrato.rif = Empresa.rif
          this.Contrato.razonsocial = Empresa.razonsocial
          this.Contrato.Politicas.tipocuenta = Empresa.tipo
          this.Contrato.Politicas.numerocuenta = Empresa.numerocuenta
          this.Contrato.Politicas.enviar = Empresa.Direccion.correo
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

    this.Saldos = {
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
      tasaflat: 0,
      flat: 'NO'
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
      clasificacion: '1',
      fecha: new Date(),
      Direccion: this.Direccion,
      Ejecutivo: this.lstEjecutivos,
      Politicas: this.Politicas,
      Saldos: this.Saldos
    }

    this.getTipoFideicomiso()
    this.lstEjecutivos = []
  }


  getPlanFideicomisoDB() {


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

    if (this.Contrato.Saldos.fechainicio == "" && this.saldo_inicio == '') {
      this._snackBar.open("Debe verificar todos los campos de fecha...", "Ok");
      return
    }

    this.ngxService.startLoader('load-cont')

    this.getPlanFideicomisoDB()
    console.log(this.planFideicomiso)


    this.xAPI.funcion = this.planFideicomiso.identificador > 0 ? 'FID_UPlanFideicomiso' : 'FID_IPlanFideicomiso'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.planFideicomiso)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null && data.msj != undefined) {
          let numero = this.planFideicomiso.identificador > 0 ? this.planFideicomiso.identificador : data.msj
          let monto = this.planFideicomiso.monto_apertura

          this.Contrato.numero = this.util.zfill(numero, 4)
          this.Contrato.Saldos.fechainicio = this.planFideicomiso.fecha_apertura
          this.Contrato.Saldos.saldoinicio = this.planFideicomiso.monto_apertura

          this.AsientoContrato(numero, monto, this.planFideicomiso.fecha_apertura)

          this.GuardarContrato()

        }
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )


  }

  GuardarContrato() {

    this.Contrato.Ejecutivo = this.lstEjecutivos
    let ofc = this.myOficina.value + ''
    this.Contrato.oficinatutora = ofc.toUpperCase()

    var obj = {
      "coleccion": "contratos",
      "objeto": this.Contrato,
      "donde": `{\"numero\":\"${this.Contrato.numero}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    console.log(obj)

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
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  ListarPortafolio() {
    this.xAPI.funcion = "FID_CPortafolios"
    this.xAPI.parametros = this.Contrato.Politicas.portafolio

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstDataPortafolio = data.Cuerpo
      },
      (error) => {
        console.log(error)

      }
    )

  }

  ConsultarPortafolio() {

    this.xAPI.funcion = "FID_CPortafolio"
    this.xAPI.parametros = this.Contrato.Politicas.portafolio

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {

        if (data != null && data.msj == undefined) {
          this.Contrato.Politicas.portafolionomb = data.Cuerpo[0].descripcion
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


  //18 fideicomiso de inversion
  //3 disponibilidad en cuenta operativa
  AsientoContrato(plan: number, monto: number, fecha_operacion: string) {
    this.movimiento.plan = plan
    this.movimiento.cuenta = 3
    this.movimiento.debe = monto
    this.movimiento.haber = 0
    this.movimiento.fecha_operacion = fecha_operacion
    this.movimiento.fecha_precierre = "1900-01-01"
    this.movimiento.fecha_cierre = "1900-01-01"

    this.xAPI.funcion = "FID_IMovComision";
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(this.movimiento);

    // this.apiService.Ejecutar(this.xAPI).subscribe(
    //   (data) => {
    //     this.movimiento.cuenta = 18,
    //     this.movimiento.debe = 0,
    //     this.movimiento.haber = monto

    //     this.xAPI.valores = JSON.stringify(this.movimiento);
    //     this.apiService.Ejecutar(this.xAPI).subscribe(
    //       (data) => {
    //         this._snackBar.open("Movimientos de Comisiones Generado...", "Ok");
    //       },
    //       (error) => {
    //         this._snackBar.open(
    //           "No se ha generado el movimiento.. 712.",
    //           "Error"
    //         );
    //       }
    //     )
    //   },
    //   (error) => {
    //     this._snackBar.open("No se ha generado el movimiento 711...", "Error");
    //   }
    // );
  }

  // SaldoDisponible() {
  //   this.xAPI.funcion = "FID_CSaldoDisponible"
  //   this.xAPI.parametros = parseInt(this.Contrato.numero).toString()
  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     (data) => {
      
  //       this.total_disponible = data.Cuerpo[0].saldo
  //       this.saldo_disponible = data.Cuerpo[0].saldo
  //     },
  //     (error) => {
  //       console.log(error)

  //     }
  //   )
  // }

  // CapitalAsignado() {
  //   this.xAPI.funcion = "FID_CCapitalAsignado"
  //   this.xAPI.parametros = parseInt(this.Contrato.numero).toString()
  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     (data) => {

  //       this.capital_asignado = data.Cuerpo[0].saldo
  //     },
  //     (error) => {
  //       console.log(error)

  //     }
  //   )
  // }

  Imprimir(){

  }

  openDialog(): void {

    //this.xinver = JSON.stringify(e)

    

    const dialogRef = this.dialog.open(this.estadocuenta, {
      width: '100px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
    });
  }

}
