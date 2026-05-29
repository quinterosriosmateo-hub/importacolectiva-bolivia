export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const {
    userId,
    url,
    method,
    requestBody,
    status,
    responseBody,
    duration,
    timestamp
  } = req.body;

  // Colores para la terminal (ANSI Escape Codes)
  const cyan = '\x1b[36m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  // Imprime un bloque formateado en la terminal del servidor
  console.log(`\n${bold}${cyan}>>> [API CLIENT LOG]${reset} ${method} ${url} ${bold}${yellow}${status}${reset} (${duration})`);
  console.log(`${bold}User ID:${reset} ${userId || 'Anonymous'}`);
  if (requestBody) console.log(`${bold}Entrada (Body):${reset}`, JSON.stringify(requestBody, null, 2));
  if (responseBody) console.log(`${bold}Salida (Response):${reset}`, JSON.stringify(responseBody, null, 2));
  console.log(`${cyan}<<< --------------------------------------------------${reset}\n`);

  return res.status(200).json({ success: true });
}