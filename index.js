// index.js
const express = require("express");
const puppeteer = require("puppeteer");

async function consultarHSCode(hsCode) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  // Paso 1: Abrir la página de consulta
  await page.goto("https://muisca.dian.gov.co/WebArancel/DefMenuConsultas.faces");
  // Paso 2: Hacer click en "General"
  await page.waitForSelector('input[name="btnGeneral"]');
  await page.click('input[name="btnGeneral"]');
  // Paso 3: Escribir el código HS
  await page.waitForSelector('input[name="codNomenclatura"]');
  await page.type('input[name="codNomenclatura"]', hsCode);
  // Paso 4: Clic en "Buscar" y esperar navegación
  await Promise.all([
    page.click('input[name="btnBuscar"]'),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ]);
  // Paso 5: Comprobar si hay tabla de resultados
  const tabla = await page.$("table#dtDatos");
  if (!tabla) {
    await browser.close();
    return { message: "No se encontraron resultados para este código." };
  }
  // Paso 6: Extraer datos
  const data = await page.evaluate(() => {
    const filas = Array.from(document.querySelectorAll("table#dtDatos tr"));
    return filas.map(f => {
      const cols = Array.from(f.querySelectorAll("td"));
      return cols.map(c => c.innerText.trim());
    });
  });
  await browser.close();
  return data;
}

const app = express();
const PORT = process.env.PORT || 10000;

// Endpoint de healthcheck (opcional)
app.get("/healthz", (_req, res) => res.send("ok"));

// Endpoint principal: ?code=XXXXXXXX
app.get("/", async (req, res) => {
  const code = req.query.code || "8471300000";
  try {
    const resultado = await consultarHSCode(code);
    res.json({ success: true, resultado });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`)
);
