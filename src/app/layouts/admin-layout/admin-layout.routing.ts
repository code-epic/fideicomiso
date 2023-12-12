import { Routes } from '@angular/router'
import { AdministracionComponent } from 'src/app/pages/principal/administracion/administracion.component'
import { ConfigurarComponent } from 'src/app/pages/configurar/configurar.component'
import { BuscadorComponent } from 'src/app/pages/generico/buscador/buscador.component'
import { PerfilComponent } from 'src/app/pages/generico/perfil/perfil.component'
import { AfiliadosComponent } from 'src/app/pages/principal/afiliados/afiliados.component'
import { AportesComponent } from 'src/app/pages/principal/aportes/aportes.component'
import { ContabilidadComponent } from 'src/app/pages/principal/contabilidad/contabilidad.component'
import { ContratosComponent } from 'src/app/pages/principal/contratos/contratos.component'
import { InversionesComponent } from 'src/app/pages/principal/inversiones/inversiones.component'
import { ReportesComponent } from 'src/app/pages/reportes/reportes.component'
import { AuthGuardGuard } from 'src/app/services/seguridad/auth-guard.guard'

import { PrincipalComponent } from '../../pages/principal/principal.component'
import { PortafolioComponent } from 'src/app/pages/principal/administracion/portafolio/portafolio.component'
import { TransaccionesComponent } from 'src/app/pages/principal/operaciones/transacciones/transacciones.component'
import { PlancontableComponent } from 'src/app/pages/principal/contabilidad/plancontable/plancontable.component'
import { ComprobanteComponent } from 'src/app/pages/principal/contabilidad/comprobante/comprobante.component'
import { CuentaComponent } from 'src/app/pages/principal/contabilidad/cuenta/cuenta.component'
import { OperacionesComponent } from 'src/app/pages/principal/operaciones/operaciones.component'
import { ProcesosComponent } from 'src/app/pages/principal/operaciones/procesos/procesos.component'
import { ListadosComponent } from 'src/app/pages/principal/operaciones/listados/listados.component'
import { PrecierreComponent } from 'src/app/pages/principal/operaciones/procesos/precierre/precierre.component'
import { CierreComponent } from 'src/app/pages/principal/operaciones/procesos/cierre/cierre.component'
import { TablasComponent } from 'src/app/pages/principal/contabilidad/tablas/tablas.component'
import { ConfiguracionesComponent } from 'src/app/pages/principal/administracion/configuraciones/configuraciones.component'
import { SaldosinversionesComponent } from 'src/app/pages/principal/inversiones/saldosinversiones/saldosinversiones.component'
import { ConsultainversionesComponent } from 'src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component'
import { ProcesooperacionesComponent } from 'src/app/pages/principal/operaciones/procesooperaciones/procesooperaciones.component'
import { AporteinicialComponent } from 'src/app/pages/principal/operaciones/aportes/aporteinicial/aporteinicial.component'
import { IncrementosComponent } from 'src/app/pages/principal/operaciones/aportes/incrementos/incrementos.component'
import { RetirosComponent } from 'src/app/pages/principal/operaciones/aportes/retiros/retiros.component'
import { ProcesocontablesComponent } from 'src/app/pages/principal/contabilidad/procesocontables/procesocontables.component'

export const AdminLayoutRoutes: Routes = [
    {
        path: 'principal',
        component: PrincipalComponent,
        canActivate: [AuthGuardGuard]
    }, {
        path: 'buscador',
        component: BuscadorComponent,
        canActivate: [AuthGuardGuard]
    }, {
        path: 'perfil',
        component: PerfilComponent,
        canActivate: [AuthGuardGuard]
    }, {
        path: 'configurar',
        component: ConfigurarComponent,
        canActivate: [AuthGuardGuard]
    }, {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [AuthGuardGuard]
    }, {
        path: 'contratos',
        component: ContratosComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'inversiones',
        component: InversionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'aportes',
        component: AportesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'afiliado',
        component: AfiliadosComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'procesocontable',
        component: ProcesocontablesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'contabilidad',
        component: ContabilidadComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'inversion',
        component: InversionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'consultas',
        component: ConsultainversionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'saldos',
        component: SaldosinversionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'administracion',
        component: AdministracionComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'configuraciones',
        component: ConfiguracionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'portafolio',
        component: PortafolioComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'empresa',
        component: AdministracionComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'operaciones',
        component: OperacionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'procesooperaciones',
        component: ProcesooperacionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'procesos',
        component: ProcesosComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'precierre',
        component: PrecierreComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'cierre',
        component: CierreComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'transacciones',
        component: TransaccionesComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'listados',
        component: ListadosComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'plancontable',
        component: PlancontableComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'comprobante',
        component: ComprobanteComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'cuenta',
        component: CuentaComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'tabla',
        component: TablasComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'aporteinicial',
        component: AporteinicialComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'incrementos',
        component: IncrementosComponent,
        canActivate: [AuthGuardGuard]
    },{
        path: 'retiros',
        component: RetirosComponent,
        canActivate: [AuthGuardGuard]
    }

];
