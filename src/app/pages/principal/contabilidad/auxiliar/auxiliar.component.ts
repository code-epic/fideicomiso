import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auxiliar',
  templateUrl: './auxiliar.component.html',
  styleUrls: ['./auxiliar.component.css']
})
export class AuxiliarComponent implements OnInit {

  public fechau = ''
  public fechaultimo = ''
  public fechai: any

  public lstMovimientos = []
  public lstMovimientosAuxliares = []
  public bcuentat = false
  public semestral = false

  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = [];
  blista: boolean = false
  bauxiliar: boolean = false
  bAntes = false
  estatus: string = 'M'


  public lstIndex = [] //Cuentas totalizadores de Fideicomiso
  public cuenta = ''
  public plan = ''
  lstData = []
  public total_debe : number = 0
  public total_haber : number = 0

  constructor(private apiService: ApiService,
    private toastrService: ToastrService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }

  ngOnInit(): void {
    this.semestral = false
    this.estatus = 'M'
    this.plan = '%'
    this.consultarUltimoCierre()
    this.iniciarIndex()
  }

  iniciarIndex() {
    this.lstIndex = [
      {
        id: "71",
        total: 0,
        nombre: "TOTAL DE ACTIVOS",
        debe: 0,
        haber: 0,
        acc: 0,
      },
      {
        id: "72",
        total: 0,
        nombre: "TOTAL DE PASIVOS",
        debe: 0,
        haber: 0,
        acc: 0,
      },
      {
        id: "73",
        total: 0,
        nombre: "TOTAL DE PATRIMONIO",
        debe: 0,
        haber: 0,
        acc: 0,
      },
      {
        id: "74",
        total: 0,
        nombre: "TOTAL DE GASTOS",
        debe: 0,
        haber: 0,
        acc: 1,
      },
      {
        id: "75",
        total: 0,
        nombre: "TOTAL DE INGRESOS",
        debe: 0,
        haber: 0,
        acc: 1,
      },
    ]
    this.cuenta = 'X'
  }


  consultarUltimoCierre() {

    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CUltimoPreCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    // console.log('hola')
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        let ultc = data.Cuerpo
        if (ultc.length > 0) {
          let fecha = ultc[0].fecha_cierre;
          let d = fecha.split('-');
          this.fechau = fecha
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0];
          let fechaCierre = new Date(`${d[0]}-${d[1]}-${d[2]}`);
          fechaCierre.setDate(fechaCierre.getDate() + 2);
          fechaCierre.setHours(0, 0, 0, 0);
          this.fechai = fechaCierre;  
          this.dias = 1
        }
        if ( this.fechaultimo == "30/06/2024" || this.fechaultimo == "31/12/2024"  ) {
          this.semestral = true
          this.estatus = 'S'
        }

        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.log(error)
      }
    )
  }


  ConsultarDetalles(){
    let fecha = new Date(this.fechai).toISOString().substring(0, 10)
    if(this.cuenta == 'X') {
      this.toastrService.error(
        'Debe seleccionar una cuenta contable',
        `Bus Empresarial`
      );
      return false
    }
      
    
    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = "FID_CMayorAnalitico"
    this.xAPI.parametros = `${fecha},${this.cuenta}`
    this.xAPI.valores = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.blista = true
        console.log(data)
        this.lstMovimientos = data.Cuerpo
        this.ngxService.stopLoader('load-precierre')
      },
      error => {

      }
    )
  }

  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }


}
