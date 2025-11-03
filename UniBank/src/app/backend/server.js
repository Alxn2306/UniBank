const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const nodemailer = require('nodemailer');

// Configurar Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'frigaro123@gmail.com', // ← Cambia esto
    pass: 'nqleknvfvuqldeos'    // ← Contraseña de aplicación de Gmail
  }
});

// Función simple para enviar correos
async function enviarCorreo(destinatario, asunto, html) {
  try {
    await transporter.sendMail({
      from: '"UniBank" <tu_correo@gmail.com>',
      to: destinatario,
      subject: asunto,
      html: html
    });
    console.log('Correo enviado a:', destinatario);
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}


const app = express();
const PORT = 3000;
const JWT_SECRET = 'unibank_secret_key_2024';

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Configuración base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bancoDB'
};

async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// 🟢 Prueba del servidor
app.get('/', (req, res) => {
  res.json({
    success: true,
    mensaje: 'Servidor de UniBank funcionando correctamente'
  });
});

// 🟢 LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      success: false,
      mensaje: 'Correo y contraseña son requeridos'
    });
  }

  let connection;
  try {
    connection = await getConnection();

    const [rows] = await connection.execute(`
      SELECT 
        u.id, 
        u.nombre_usuario, 
        u.correo, 
        u.contrasena, 
        u.telefono,
        r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.correo = ?
    `, [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
    }

    const usuario = rows[0];
    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre_usuario: usuario.nombre_usuario },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor' });
  } finally {
    if (connection) await connection.end();
  }
});


// Almacenar códigos temporales en memoria
const codigosRecuperacion = new Map();

// 🟢 SOLICITAR CÓDIGO DE RECUPERACIÓN
app.post('/api/auth/solicitar-codigo', async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ success: false, mensaje: 'Correo requerido' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verificar que el correo existe
    const [rows] = await connection.execute(
      'SELECT id, nombre_usuario FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'No existe una cuenta con ese correo' 
      });
    }

    const usuario = rows[0];

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar código con expiración de 15 minutos
    codigosRecuperacion.set(correo, {
      codigo,
      expira: Date.now() + 15 * 60 * 1000
    });

    // Plantilla del correo
    const htmlCorreo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🏦 UniBank</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p style="color: #666; font-size: 16px;">Hola <strong>${usuario.nombre_usuario}</strong>,</p>
          <p style="color: #666; font-size: 16px;">Usa este código para recuperar tu contraseña:</p>
          
          <div style="background: white; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px dashed #667eea;">
            <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${codigo}</h1>
          </div>
          
          <p style="color: #666; font-size: 14px;">Este código expira en <strong>15 minutos</strong>.</p>
          <p style="color: #666; font-size: 14px;">Si no solicitaste esto, ignora este correo.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">UniBank - Tu banco digital de confianza</p>
        </div>
      </div>
    `;

    // Enviar correo
    await enviarCorreo(correo, '🔐 Código de Recuperación - UniBank', htmlCorreo);

    res.json({ 
      success: true, 
      mensaje: 'Código enviado a tu correo. Revisa tu bandeja de entrada.' 
    });

  } catch (error) {
    console.error('Error en recuperación:', error);
    res.status(500).json({ success: false, mensaje: 'Error al enviar el código' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 VERIFICAR CÓDIGO Y CAMBIAR CONTRASEÑA
app.post('/api/auth/cambiar-password', async (req, res) => {
  const { correo, codigo, nuevaContrasena } = req.body;

  if (!correo || !codigo || !nuevaContrasena) {
    return res.status(400).json({ 
      success: false, 
      mensaje: 'Faltan datos requeridos' 
    });
  }

  // Verificar si existe el código
  const datoCodigo = codigosRecuperacion.get(correo);

  if (!datoCodigo) {
    return res.status(400).json({ 
      success: false, 
      mensaje: 'No se ha solicitado código para este correo' 
    });
  }

  // Verificar si el código expiró
  if (Date.now() > datoCodigo.expira) {
    codigosRecuperacion.delete(correo);
    return res.status(400).json({ 
      success: false, 
      mensaje: 'El código ha expirado. Solicita uno nuevo.' 
    });
  }

  // Verificar si el código es correcto
  if (datoCodigo.codigo !== codigo) {
    return res.status(400).json({ 
      success: false, 
      mensaje: 'Código incorrecto' 
    });
  }

  // Código válido, actualizar contraseña
  let connection;
  try {
    connection = await getConnection();

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    await connection.execute(
      'UPDATE usuarios SET contrasena = ? WHERE correo = ?',
      [hashedPassword, correo]
    );

    // Eliminar el código usado
    codigosRecuperacion.delete(correo);

    res.json({ 
      success: true, 
      mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' 
    });

  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    res.status(500).json({ success: false, mensaje: 'Error al actualizar la contraseña' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 REGISTRO
app.post('/api/auth/register', async (req, res) => {
  const { nombre_usuario, correo, telefono, contrasena, rol_id } = req.body;

  if (!nombre_usuario || !correo || !contrasena || !rol_id) {
    return res.status(400).json({
      success: false,
      mensaje: 'Faltan campos requeridos'
    });
  }

  let connection;
  try {
    connection = await getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'El correo ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const [result] = await connection.execute(`
      INSERT INTO usuarios (nombre_usuario, correo, telefono, contrasena, rol_id)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre_usuario, correo, telefono, hashedPassword, rol_id]);

    const usuarioId = result.insertId;

    // 🟢 Crear cuenta con saldo inicial
    await connection.execute(
      'INSERT INTO cuentas (usuario_id, saldo) VALUES (?, ?)',
      [usuarioId, 10000]
    );

    res.json({
      success: true,
      mensaje: 'Usuario registrado correctamente con cuenta inicial de $10,000'
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno al registrar el usuario'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 Verificar Token
function verifyToken(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) return res.status(401).json({ success: false, mensaje: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, mensaje: 'Token inválido o expirado' });
  }
}

// 🟢 Perfil usuario
app.get('/api/user/profile', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const [rows] = await connection.execute(`
      SELECT 
        u.id, u.nombre_usuario, u.correo, u.telefono, r.nombre as rol, c.saldo
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      JOIN cuentas c ON u.id = c.usuario_id
      WHERE u.id = ?
    `, [req.user.id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });

    res.json({ success: true, usuario: rows[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 NUEVO ENDPOINT: Transferencia entre cuentas
app.post('/api/transferencia', verifyToken, async (req, res) => {
  const { destinatario_id, monto } = req.body;
  const remitente_id = req.user.id;

  if (!destinatario_id || !monto || monto <= 0) {
    return res.status(400).json({ success: false, mensaje: 'Datos inválidos' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Obtener saldo actual del remitente
    const [[remitenteCuenta]] = await connection.execute(
      'SELECT saldo FROM cuentas WHERE usuario_id = ?',
      [remitente_id]
    );

    if (!remitenteCuenta)
      return res.status(404).json({ success: false, mensaje: 'Cuenta del remitente no encontrada' });

    const saldoActual = parseFloat(remitenteCuenta.saldo);
    const comision =
      monto >= 1500
        ? (monto / 100) * 15
        : (monto / 100) * 10;
    const totalDescuento = monto + comision;

    if (saldoActual < totalDescuento) {
      return res.status(400).json({ success: false, mensaje: 'Saldo insuficiente' });
    }

    // Verificar existencia del destinatario
    const [[destinatarioCuenta]] = await connection.execute(
      'SELECT saldo FROM cuentas WHERE usuario_id = ?',
      [destinatario_id]
    );
    if (!destinatarioCuenta)
      return res.status(404).json({ success: false, mensaje: 'Cuenta destino no encontrada' });

    // Actualizar saldos
    await connection.execute(
      'UPDATE cuentas SET saldo = saldo - ? WHERE usuario_id = ?',
      [totalDescuento, remitente_id]
    );

    await connection.execute(
      'UPDATE cuentas SET saldo = saldo + ? WHERE usuario_id = ?',
      [monto, destinatario_id]
    );

    // Registrar la transferencia
    await connection.execute(`
      INSERT INTO transferencias (remitente_id, destinatario_id, monto, comision)
      VALUES (?, ?, ?, ?)
    `, [remitente_id, destinatario_id, monto, comision]);

    // Obtener correos de remitente y destinatario
const [[remitenteData]] = await connection.execute(
  'SELECT nombre_usuario, correo FROM usuarios WHERE id = ?',
  [remitente_id]
);

const [[destinatarioData]] = await connection.execute(
  'SELECT nombre_usuario, correo FROM usuarios WHERE id = ?',
  [destinatario_id]
);

// Correo al que envió
const htmlRemitente = `
  <h2 style="color: #7c3aed;">✅ Transferencia Exitosa</h2>
  <p>Hola <strong>${remitenteData.nombre_usuario}</strong>,</p>
  <p>Enviaste $${monto} a ${destinatarioData.nombre_usuario}</p>
  <p>Comisión: $${comision.toFixed(2)}</p>
`;
enviarCorreo(remitenteData.correo, 'Transferencia Realizada - UniBank', htmlRemitente);

// Correo al que recibió
const htmlDestinatario = `
  <h2 style="color: #7c3aed;">💰 Recibiste Dinero</h2>
  <p>Hola <strong>${destinatarioData.nombre_usuario}</strong>,</p>
  <p>Recibiste $${monto} de ${remitenteData.nombre_usuario}</p>
`;
enviarCorreo(destinatarioData.correo, 'Recibiste una Transferencia - UniBank', htmlDestinatario);

    res.json({
      success: true,
      mensaje: `Transferencia exitosa de $${monto} con comisión de $${comision}`,
      comision
    });

  } catch (error) {
    console.error('Error en transferencia:', error);
    res.status(500).json({ success: false, mensaje: 'Error al procesar la transferencia' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 RETIRO SIN TARJETA
app.post('/api/retiro', verifyToken, async (req, res) => {
  const { monto } = req.body;
  const usuario_id = req.user.id;

  if (!monto || monto <= 0) {
    return res.status(400).json({ success: false, mensaje: 'Monto inválido' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verificar saldo
    const [[cuenta]] = await connection.execute(
      'SELECT saldo FROM cuentas WHERE usuario_id = ?',
      [usuario_id]
    );

    if (!cuenta) {
      return res.status(404).json({ success: false, mensaje: 'Cuenta no encontrada' });
    }

    const saldoActual = parseFloat(cuenta.saldo);
    const comision = monto * 0.02; // 2% de comisión
    const totalDescuento = monto + comision;

    if (saldoActual < totalDescuento) {
      return res.status(400).json({ success: false, mensaje: 'Saldo insuficiente' });
    }

    // Generar código único de 8 dígitos
    const codigo = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Actualizar saldo
    await connection.execute(
      'UPDATE cuentas SET saldo = saldo - ? WHERE usuario_id = ?',
      [totalDescuento, usuario_id]
    );

    // Registrar retiro (necesitamos crear esta tabla)
    await connection.execute(`
      INSERT INTO retiros (usuario_id, monto, comision, codigo, estado)
      VALUES (?, ?, ?, ?, 'pendiente')
    `, [usuario_id, monto, comision, codigo]);

    // Obtener correo del usuario
const [[usuarioData]] = await connection.execute(
  'SELECT nombre_usuario, correo FROM usuarios WHERE id = ?',
  [usuario_id]
);

// Enviar correo con el código
const htmlRetiro = `
  <h2 style="color: #7c3aed;">🏧 Código de Retiro</h2>
  <p>Hola <strong>${usuarioData.nombre_usuario}</strong>,</p>
  <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 6px;">${codigo}</h1>
  <p>Monto: $${monto}</p>
  <p>Comisión: $${comision.toFixed(2)}</p>
  <p>⚠️ Usa este código en el cajero</p>
`;
enviarCorreo(usuarioData.correo, 'Tu Código de Retiro - UniBank', htmlRetiro);

    res.json({
      success: true,
      mensaje: 'Retiro generado exitosamente',
      codigo,
      monto,
      comision,
      total: totalDescuento
    });

  } catch (error) {
    console.error('Error en retiro:', error);
    res.status(500).json({ success: false, mensaje: 'Error al procesar el retiro' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 CANCELAR RETIRO (devuelve el dinero a la cuenta)
app.post('/api/retiro/cancelar', verifyToken, async (req, res) => {
  const { codigo } = req.body;
  const usuario_id = req.user.id;

  if (!codigo) {
    return res.status(400).json({ success: false, mensaje: 'Código requerido' });
  }

  let connection;
  try {
    connection = await getConnection();

    const [[retiro]] = await connection.execute(
      'SELECT * FROM retiros WHERE codigo = ? AND usuario_id = ? AND estado = "pendiente"',
      [codigo, usuario_id]
    );

    if (!retiro) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Código inválido, no es tuyo o ya fue procesado' 
      });
    }

    const totalDevolver = parseFloat(retiro.monto) + parseFloat(retiro.comision);
    await connection.execute(
      'UPDATE cuentas SET saldo = saldo + ? WHERE usuario_id = ?',
      [totalDevolver, usuario_id]
    );

    await connection.execute(
      'UPDATE retiros SET estado = "cancelado" WHERE codigo = ?',
      [codigo]
    );

    res.json({
      success: true,
      mensaje: `Retiro cancelado. Se devolvieron $${totalDevolver.toFixed(2)} a tu cuenta`,
      monto_devuelto: totalDevolver
    });

  } catch (error) {
    console.error('Error cancelando retiro:', error);
    res.status(500).json({ success: false, mensaje: 'Error al cancelar el retiro' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟢 Verificación de token (frontend)
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    mensaje: 'Token válido',
    usuario: req.user
  });
});

// 🟢 Logout simbólico
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ success: true, mensaje: 'Logout exitoso' });
});


// 🟢 Obtener movimientos (transferencias realizadas y recibidas)
app.get('/api/movimientos', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const usuario_id = req.user.id;

    const [rows] = await connection.execute(`
      SELECT 
        t.id,
        t.monto,
        t.comision,
        t.fecha,
        t.remitente_id,
        t.destinatario_id,
        r.nombre_usuario AS remitente,
        d.nombre_usuario AS destinatario
      FROM transferencias t
      JOIN usuarios r ON t.remitente_id = r.id
      JOIN usuarios d ON t.destinatario_id = d.id
      WHERE t.remitente_id = ? OR t.destinatario_id = ?
      ORDER BY t.fecha DESC
    `, [usuario_id, usuario_id]);

    res.json({ success: true, movimientos: rows });

  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({ success: false, mensaje: 'Error al obtener movimientos' });
  } finally {
    if (connection) await connection.end();
  }
});

// 🟠 Middleware de errores
app.use((req, res) => {
  res.status(404).json({ success: false, mensaje: 'Ruta no encontrada' });
});
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ success: false, mensaje: 'Error interno del servidor' });
});


// 🟢 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor UniBank ejecutándose en http://localhost:${PORT}`);
  console.log(`Base de datos: ${dbConfig.database}`);
  console.log(`CORS habilitado para: http://localhost:4200`);
});

module.exports = app;
