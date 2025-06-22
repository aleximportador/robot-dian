const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('¡Tu servidor está funcionando correctamente en Render! 🚀');
});

// Render asigna el puerto con una variable de entorno llamada PORT
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
