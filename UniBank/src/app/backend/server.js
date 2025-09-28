// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'unibank_secret_key_2024'; // Cambiar en producción por algo más seguro

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200', // URL de tu Angular
  credentials: true
}));
app.use(express.json());

// Configuración de la base de datos MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root', // Cambia por tu usuario de MySQL
  password: 'root', // Cambia por tu contraseña de MySQL (si tienes)
  database: 'bancoDB'
};

// Función para crear conexión a la base de datos
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    mensaje: 'Servidor de UniBank funcionando correctamente' 
  });
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  // Validaciones básicas
  if (!correo || !contrasena) {
    return res.status(400).json({
      success: false,
      mensaje: 'Correo y contraseña son requeridos'
    });
  }

  let connection;
  
  try {
    connection = await getConnection();
    
    // Consulta para obtener el usuario con su rol
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
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    const usuario = rows[0];

    // Verificar contraseña (por ahora sin hash, después se puede mejorar)
    if (contrasena !== usuario.contrasena) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo: usuario.correo, 
        rol: usuario.rol,
        nombre_usuario: usuario.nombre_usuario
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Respuesta exitosa
    res.json({
      success: true,
      mensaje: 'Login exitoso',
      token: token,
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
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Middleware para verificar JWT
function verifyToken(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      mensaje: 'Token de acceso requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      mensaje: 'Token inválido o expirado'
    });
  }
}

// Ruta protegida para obtener perfil del usuario
app.get('/api/user/profile', verifyToken, async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        u.id, 
        u.nombre_usuario, 
        u.correo, 
        u.telefono,
        r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      usuario: rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Ruta para verificar si el token es válido
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    mensaje: 'Token válido',
    usuario: {
      id: req.user.id,
      correo: req.user.correo,
      rol: req.user.rol,
      nombre_usuario: req.user.nombre_usuario
    }
  });
});

// Ruta de logout (opcional, principalmente para limpiar del lado del cliente)
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    mensaje: 'Logout exitoso'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    mensaje: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor UniBank ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${dbConfig.database}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
});

module.exports = app;