const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

// Crear el transportador de nodemailer
const createTransporter = () => {
  // En producción, se utilizarían las credenciales reales del servicio de correo
  // Para desarrollo, podemos usar una cuenta de prueba o ethereal.email
  
  // Configuración para entorno de desarrollo (ejemplo con Gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'madamepastelmdp@gmail.com', // Cambiar por email real en producción
      pass: process.env.EMAIL_PASSWORD || 'tu_contraseña_segura', // Usar variables de entorno en producción
    },
  });
  
  // Configuración de plantillas handlebars
  const handlebarOptions = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.resolve('./views/emails/partials'),
      layoutsDir: path.resolve('./views/emails/layouts'),
      defaultLayout: 'main',
    },
    viewPath: path.resolve('./views/emails/templates'),
    extName: '.hbs',
  };
  
  // Usar plantillas handlebars
  transporter.use('compile', hbs(handlebarOptions));
  
  return transporter;
};

module.exports = { createTransporter };
