exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: "Método não permitido." }) };
  }

  try {
    const { produto, idioma, funil } = JSON.parse(event.body || "{}");

    if (!produto || !idioma || !funil) {
      return { statusCode: 400, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: "Produto, idioma e funil são obrigatórios." }) };
    }

    if (!process.env.OPENAI_API_KEY) {
      return { statusCode: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: "OPENAI_API_KEY não configurada no Netlify." }) };
    }

    const intencao = { topo: "baixa", meio: "media", fundo: "alta" }[funil] || "media";

    const prompt = `
Você é um especialista em Google Ads para afiliados.

Gere exatamente 15 títulos e 4 descrições para Google Ads Rede de Pesquisa.

ENTRADAS:
Produto: ${produto}
Idioma: ${idioma}
Funil: ${funil}
Intenção de compra aplicada: ${intencao}

REGRAS:
- Retorne somente JSON válido.
- Não use markdown.
- Não inclua explicações.
- Cada título deve ter no máximo 30 caracteres contando espaços.
- Cada descrição deve ter no máximo 90 caracteres contando espaços.
- Todos os títulos devem ser únicos.
- Todas as descrições devem ser únicas.
- Conte os caracteres reais.
- Não use emojis.
- Não use pontuação excessiva.
- Não use maiúsculas excessivas.
- Não invente descontos, garantias, frete grátis, site oficial ou promoções.
- Não afirme "site oficial", "loja oficial" ou "página oficial".
- Evite promessas enganosas.

Categorias válidas:
produto, beneficio, diferencial, comparacao, cta, compra

Gatilhos válidos:
urgencia, confianca, autoridade, prova_social, economia, conveniencia, curiosidade

Cada ativo deve ter 1 categoria e de 1 a 3 gatilhos.

Distribuição mínima dos 15 títulos:
produto: 2
beneficio: 3
diferencial: 2
comparacao: 1
cta: 2
compra: 2
Os 3 restantes são automáticos conforme o funil.

Adaptação:
Topo: beneficio, diferencial, curiosidade, conveniencia.
Meio: beneficio, comparacao, diferencial, autoridade, economia, confianca.
Fundo: compra, cta, produto, urgencia, confianca, prova_social.

Formato exato:
{
  "resposta": {
    "produto": "${produto}",
    "idioma": "${idioma}",
    "funil": "${funil}",
    "intencao_compra_aplicada": "${intencao}",
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

    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
        text: { format: { type: "json_object" } }
      })
    });

    const apiData = await apiResponse.json();

    if (!apiResponse.ok) {
      return { statusCode: apiResponse.status, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: apiData.error?.message || "Erro na OpenAI API." }) };
    }

    const outputText = apiData.output_text || apiData.output?.[0]?.content?.[0]?.text || "";
    const parsed = JSON.parse(outputText);

    return { statusCode: 200, headers: {"Content-Type":"application/json"}, body: JSON.stringify(parsed) };

  } catch (error) {
    return { statusCode: 500, headers: {"Content-Type":"application/json"}, body: JSON.stringify({ error: error.message }) };
  }
};
