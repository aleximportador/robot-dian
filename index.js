const express = require("express");
const puppeteer = require("puppeteer");

async function consultarHSCode(code) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // Paso 1: Abrir la página de consulta
  await page.goto("https://muisca.dian.gov.co/WebArancel/DefMenuConsultas.faces");

  // Paso 2: Click en “Generar”
  await page.click('input[name="btnGeneral"]');

  // Paso 3: Escribir el código HS
  await page.type('input[name="cUdnomenclatura"]', code);

  // Paso 4: Click en “Buscar” y esperar navegación
  await Promise.all([
    page.click('input[name="btnBuscar"]'),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ]);

  // Paso 5: Comprobar si hay tabla de resultados
  const tabla = await page.$("table#tblDatos");
  if (!tabla) {
    await browser.close();
    return { mensaje: "No se encontraron resultados para este código." };
  }

  // Paso 6: Extraer datos de la tabla
  const data = await page.evaluate(() => {
    const filas = Array.from(document.querySelectorAll("table#tblDatos tr"));
    return filas.map(fila => {
      const cols = Array.from(fila.querySelectorAll("td"));
      return cols.map(c => c.innerText.trim());
    });
  });

  await browser.close();
  return data;
}

const app = express();
const PORT = process.env.PORT || 10000;

// Endpoint de healthcheck (opcional)
app.get("/healthz", (_, res) => res.send("ok"));

// Endpoint principal: recibe código arancelario por query
app.get("/", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.send("¡Tu servidor está funcionando correctamente en Render! 🚀");
  }
  try {
    const resultado = await consultarHSCode(code);
    res.json({ success: true, data: resultado });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
