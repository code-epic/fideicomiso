// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  ID : 'ID-003',
  Url: 'http://localhost',
  API: '/v1/api/',
  Hash: ':c521f27fb1b3311d686d511b668e5bd4',

  xApi: {
    // Operaciones básicas de consulta
    CONSULTAR_ULTIMO_CIERRE: 'FID_CUltimoCierre',
    CONSULTAR_ULTIMO_PRECIERRE: 'FID_CUltimoPreCierre',
    CONSULTAR_ULTIMO_CIERRE_SEMESTRAL: 'FID_CFechaMaxPreCierreSemestral',

    // Ubicaciones geográficas
    LISTAR_PAISES: 'ListarPaises',
    LISTAR_ESTADOS: 'ListarEstados',
    LISTAR_CIUDAD: 'ListarCiudad',

    // Entidades y personas
    CONSULTAR_EJECUTIVOS: 'FID_CEjecutivos',
    CONSULTAR_EJECUTIVO: 'FID_CEjecutivo',
    CONSULTAR_EMPRESAS: 'FID_CEmpresas',
    CONSULTAR_EMPRESA: 'FID_CEmpresa',
    CONSULTAR_OFICINAS: 'FID_COficinas',
    CONSULTAR_AFILIADOS: 'FID_CAfiliados',
    CONSULTAR_AFILIADO: 'FID_CAfiliado',

    // Portafolios
    CONSULTAR_PORTAFOLIOS: 'FID_CPortafolios',
    CONSULTAR_PORTAFOLIO: 'FID_CPortafolio',
    INSERTAR_PORTAFOLIO: 'FID_IPortafolio',
    CONSULTAR_MONTO_PORTAFOLIO: 'FID_CMontoPortafolio',
    CONSULTAR_APORTE_INICIAL: 'FID_CAporteInicial',
    INSERTAR_APORTE_INICIAL: 'FID_IAporteInicial',
    INSERTAR_RETIROS: 'FID_IRetiros',

    // Contratos
    CONSULTAR_CONTRATOS: 'FID_CContratos',
    CONSULTAR_CONTRATO: 'FID_CContrato',
    CONSULTAR_APORTES: 'FID_CAportes',

    // Contabilidad y comprobantes
    CONSULTAR_COMPROBANTES: 'FID_CComprobantes',
    INSERTAR_COMPROBANTE: 'FID_IComprobante',
    ELIMINAR_COMPROBANTE: 'FID_EComprobante',
    INSERTAR_DETALLE_COMPROBANTE: 'FID_IDetalleComprobante',
    CONSULTAR_MOVIMIENTOS_COMPROBANTE: 'FID_CMovimientosComprobante',
    INSERTAR_MOVIMIVIENTOS_COMPROBANTES: 'FID_IMovimientosComprobantes',
    PAGINAR_COMPROBANTES: 'FID_CComprobantesPaginado',
    CONTAR_COMPROBANTES: 'FID_CCantidadComprobantes',

    // Cuentas contables
    CONSULTAR_CUENTAS: 'FID_CCuentas',
    CONSULTAR_CUENTA: 'FID_CCuenta',
    INSERTAR_CUENTA: 'FID_ICuenta',
    BORRAR_CUENTA: 'FID_DCuentaContable',
    CONSULTAR_PLAN_CONTABLE: 'FID_CPlanContable',
    CONSULTAR_ESTADO_CUENTA: 'FID_CEstadoCuenta',

    // Reportes contables
    CONSULTAR_BALANCE_COMPROBACION: 'FID_CBalanceComprobacion',
    CONSULTAR_BALANCE_FECHA: 'FID_CBalanceFecha',
    CONSULTAR_MAYOR_ANALITICO: 'FID_CMayorAnalitico',
    CONSULTAR_SEMILLERO_CONTABLE: 'FID_CSemilleroContable',
    CONSULTAR_SEMILLERO: 'FID_CSemillero',

    // Cierres
    INSERTAR_SALDOS_CIERRE: 'FID_ISaldosCierre',
    BORRAR_CIERRE_SEMESTRAL: 'FID_DCierreSemestral',
    CONSULTAR_MOVIMIENTOS_SEMESTRALES: 'FID_CMovimientosSemestrales',

    // Inversiones
    CONSULTAR_INVERSIONES: 'FID_CInversiones',
    CONSULTAR_INVERSION: 'FID_CInversion',
    INSERTAR_INVESION: 'FID_IInversion',
    ACTUALIZAR_INVERSION: 'FID_UInversion',
    CONSULTAR_EMISOR: 'FID_CEmisor',
    CONSULTAR_CUSTODIA: 'FID_CCustodia',
    CONSULTAR_INSTRUMENTO: 'FID_CInstrumento',
    CONSULTAR_CARTERA_INVERSIONES: 'FID_CCarteraInversiones',
    CONSULTAR_POSICIONES_INVERSIONES: 'FID_CPosicionInversiones',
    CONSULTAR_VENCIMIENTO_INVERSIONES: 'FID_CVencimientoInversiones',
    CONSULTAR_COMPRA_INVERSIONES: 'FID_CCompraInversiones',
    INSERTAR_DEVENGO_INVERIONES: 'FID_IDevengoInversiones',
    INSERTAR_VENCIMIENTO_INVERSIONES: 'FID_IVencimientoInversiones',
    INSERTAR_COMPRA_INVERSIONES: 'FID_ICompraInversiones',
    INSERTAR_MOVIMIENTOS_INVERSION: 'FID_IMovInversion',
    INSERTAR_INVERSIONES_PORTAFOLIO: 'FID_IInversionesPortafolio',
    CONSULTAR_INVERSIONES_PORTAFOLIO: 'FID_CInversionesPortafolio',

    // Capital y comisiones
    CONSULTAR_CAPITAL_ASIGNADO: 'FID_CCapitalAsignado',
    CONSULTAR_SALDO_DISPONIBLE: 'FID_CSaldoDisponible',
    CALCULAR_COMISION: 'FID_CalcularComision',
    INSERTAR_COMISIONES_ADMINISTRATIVAS: 'FID_IComisionesAdministrativas',
    INSERTAR_MOVIMIENTO_COMISION: 'FID_IMovComision',
    INSERTAR_MOVIMIENTOS_LOTE: 'FID_BashIPosicion',
    BORRAR_MOVIMIENTOS_LOTE: 'FID_BashDPosicion',
    DISTRIBUIR_INTERESES: 'FID_BashIntereses',
    INSERTAR_INCREMENTO: 'FID_IIncremento'
  }, //total 69

  functions: {
    
  },

  services:{
    
  },
};

