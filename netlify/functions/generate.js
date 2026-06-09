exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Use POST." })
      };
    }

    const { produto, idioma, funil } = JSON.parse(event.body || "{}");

    if (!produto || !idioma || !funil) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Dados incompletos." })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "GEMINI_API_KEY não configurada." })
      };
    }

    const prompt = `
Gere exatamente 15 títulos e 4 descrições para Google Ads Rede de Pesquisa.

Produto: ${produto}
Idioma: ${idioma}
Funil: ${funil}

Regras:
- Retorne somente JSON válido.
- Não use markdown.
- Cada título deve ter no máximo 30 caracteres incluindo espaços.
- Cada descrição deve ter no máximo 90 caracteres incluindo espaços.
- Conte os caracteres reais.
- Não use emojis.
- Não use promessas enganosas.
- Não repita frases.
- Use categorias: produto, beneficio, diferencial, comparacao, cta, compra.
- Use gatilhos: urgencia, confianca, autoridade, prova_social, economia, conveniencia, curiosidade.
- Cada item deve ter categoria e gatilhos.

Estrutura obrigatória:
{
  "resposta": {
    "produto": "${produto}",
    "idioma": "${idioma}",
    "funil": "${funil}",
    "intencao_compra_aplicada": "baixa|media|alta",
    "estatisticas": {
      "total_titulos": 15,
      "total_descricoes": 4,
      "titulos_validos": true,
      "descricoes_validas": true
    },
    "titulos": [
      {
        "texto": "Título",
        "caracteres": 0,
        "categoria": "beneficio",
        "gatilhos": ["curiosidade"]
      }
    ],
    "descricoes": [
      {
        "texto": "Descrição",
        "caracteres": 0,
        "categoria": "beneficio",
        "gatilhos": ["confianca"]
      }
    ]
  }
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data.error?.message || "Erro ao chamar Gemini."
        })
      };
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texto) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Resposta vazia do Gemini." })
      };
    }

    const json = JSON.parse(texto);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
