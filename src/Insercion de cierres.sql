SELECT 0, NOW(), id AS cuenta, 1, '2025-02-01', saldo_actual, 'Administrador', 'M',id_plan FROM (	
	SELECT 
		c.id,
		@suma:=IF(ISNULL(S.saldo),0,S.saldo) AS saldo_inicial,
		@xdebe:=IF(ISNULL(debe),0,debe) AS xdebe,
		@xhaber:=IF(ISNULL(haber),0,haber) AS xhaber,
		IF(ISNULL(debe),0,debe) AS debe, IF(ISNULL(haber),0,haber) AS haber, 
		IF(c.aumenta='DEBE', @suma+(@xdebe-@xhaber), @suma+(@xhaber-@xdebe)) AS saldo_actual,
		S.id_plan
	FROM 
		(
			SELECT 
				id_cuenta, sum(debe) as debe,sum(haber) as haber, id_plan
			FROM 
				movimientos m 
			WHERE 
	      		
				m.fecha_operacion = '2025-02-01'
			GROUP BY 
				id_cuenta
		) M
	RIGHT JOIN cuenta c ON M.id_cuenta =c.id 
	LEFT JOIN (
		SELECT * FROM 
			saldos 
		WHERE 
			fecha_cierre = '2025-01-31'
				-- (SELECT MAX(fecha_cierre) FROM saldos)
	) S ON 
		c.id = S.id_cuenta
	-- WHERE S.fecha_cierre ='2023-06-30'
		ORDER BY 
		c.codigo_padre, c.parte, c.moneda,
		c.nivel_1,c.nivel_2,c.nivel_3,
		c.nivel_4,c.nivel_5
		) AS A