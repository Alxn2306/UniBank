const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // Verificar si el correo ya existe
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

    // Hash contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar usuario
    await connection.execute(`
      INSERT INTO usuarios (nombre_usuario, correo, telefono, contrasena, rol_id)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre_usuario, correo, telefono, hashedPassword, rol_id]);

    res.json({
      success: true,
      mensaje: 'Usuario registrado correctamente con contraseña cifrada'
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
        u.id, u.nombre_usuario, u.correo, u.telefono, r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
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
  console.log(`🚀 Servidor UniBank ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${dbConfig.database}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
});

module.exports = app;


