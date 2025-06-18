import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';

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


  public lstIndex = [] 
  public cuenta = ''
  public plan = ''
  lstData = []
  public total_debe : number = 0
  public total_haber : number = 0

  constructor(private apiService: ApiService,
    private toastrService: ToastrService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private cierre: CierreService
  ) { }

  ngOnInit(): void {
    this.semestral = false
    this.estatus = 'M'
    this.plan = '%'
    this.consultarUltimoPreCierre()
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


  async consultarUltimoPreCierre() {
    this.fechaultimo = await this.cierre.getUltimoPrecierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);  
    this.semestral = this.cierre.getSemestral(this.fechaultimo)
    this.estatus = this.semestral ? 'S' : this.estatus
    this.dias = 1
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
    this.xAPI.funcion = environment.xApi.CONSULTAR_MAYOR_ANALITICO
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
        console.error(error)
      }
    )
  }

  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }
}
