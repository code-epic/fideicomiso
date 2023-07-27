import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { PrincipalComponent } from '../../pages/principal/principal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BuscadorComponent } from 'src/app/pages/generico/buscador/buscador.component';
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { PerfilComponent } from 'src/app/pages/generico/perfil/perfil.component';
import { ConfigurarComponent } from 'src/app/pages/configurar/configurar.component';
import { ReportesComponent } from 'src/app/pages/reportes/reportes.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCommonModule, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { CambiarclaveComponent } from 'src/app/pages/generico/perfil/cambiarclave/cambiarclave.component';
import { HechiceroComponent } from 'src/app/pages/generico/hechicero/hechicero.component';
import { TablaComponent } from 'src/app/pages/generico/tabla/tabla.component';
import { MatTableModule } from '@angular/material/table';
import { AfiliadosComponent } from 'src/app/pages/principal/afiliados/afiliados.component';
import { ContratosComponent } from 'src/app/pages/principal/contratos/contratos.component';
import { AportesComponent } from 'src/app/pages/principal/aportes/aportes.component';
import { ContabilidadComponent } from 'src/app/pages/principal/contabilidad/contabilidad.component';
import { InversionesComponent } from 'src/app/pages/principal/inversiones/inversiones.component';
import { PortafolioComponent } from 'src/app/pages/principal/administracion/portafolio/portafolio.component';
import { AdministracionComponent } from 'src/app/pages/principal/administracion/administracion.component';
import { EmpresaComponent } from 'src/app/pages/principal/administracion/empresa/empresa.component';
import { FileUploadComponent } from 'src/app/pages/generico/file/file-upload/file-upload.component';
import { FileComponent } from 'src/app/pages/generico/file/file/file.component';
import { TransaccionesComponent } from 'src/app/pages/principal/operaciones/transacciones/transacciones.component';
import { EjecutivosComponent } from 'src/app/pages/principal/administracion/ejecutivos/ejecutivos.component';
import { PlancontableComponent } from 'src/app/pages/principal/contabilidad/plancontable/plancontable.component';
import { ComprobanteComponent } from 'src/app/pages/principal/contabilidad/comprobante/comprobante.component';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { CuentaComponent } from 'src/app/pages/principal/contabilidad/cuenta/cuenta.component';
  
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { OperacionesComponent } from 'src/app/pages/principal/operaciones/operaciones.component';
import { ProcesosComponent } from 'src/app/pages/principal/operaciones/procesos/procesos.component';
import { ListadosComponent } from 'src/app/pages/principal/operaciones/listados/listados.component';
import { PrecierreComponent } from 'src/app/pages/principal/operaciones/procesos/precierre/precierre.component';
import { CierreComponent } from 'src/app/pages/principal/operaciones/procesos/cierre/cierre.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    ClipboardModule,
    NgxUiLoaderModule,
    MatCommonModule,
    MatFormFieldModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatButtonToggleModule,
    AutocompleteLibModule,
    NgxMaskModule.forRoot(),
    MatListModule,
    MatInputModule,
    MatPaginatorModule,
    MatDialogModule,
    MatToolbarModule,
    MatSelectModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    CurrencyMaskModule,
  ],
  declarations: [
    PrincipalComponent,
    BuscadorComponent,
    PerfilComponent,
    ConfigurarComponent,
    ReportesComponent,
    CambiarclaveComponent,
    HechiceroComponent,
    TablaComponent,
    AfiliadosComponent,
    ContratosComponent,
    AportesComponent,
    ContabilidadComponent,
    InversionesComponent,
    PortafolioComponent,
    AdministracionComponent,
    EmpresaComponent,
    FileUploadComponent,
    FileComponent,    
    OperacionesComponent,
    ProcesosComponent,
    ListadosComponent,
    PrecierreComponent,
    CierreComponent,
    TransaccionesComponent,
    EjecutivosComponent,
    PlancontableComponent,
    ComprobanteComponent,
    CuentaComponent
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
  ],
})

export class AdminLayoutModule {}
