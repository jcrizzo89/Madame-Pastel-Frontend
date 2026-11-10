const nodemailer = require('nodemailer');
const path = require('path');

// Crear el transportador de nodemailer
const createTransporter = async () => {
  const missing = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASSWORD']
    .filter(key => !process.env[key]);
  if (missing.length) throw new Error('Email delivery is not configured');

  const { default: hbs } = await import('nodemailer-express-handlebars');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
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
