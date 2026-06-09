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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resposta: {
          produto,
          idioma,
          funil,
          intencao_compra_aplicada: funil === "fundo" ? "alta" : funil === "meio" ? "media" : "baixa",
          estatisticas: {
            total_titulos: 15,
            total_descricoes: 4,
            titulos_validos: true,
            descricoes_validas: true
          },
          titulos: [
            { texto: "Compare Modelos", caracteres: 15, categoria: "comparacao", gatilhos: ["economia"] },
            { texto: "Veja Benefícios", caracteres: 15, categoria: "beneficio", gatilhos: ["curiosidade"] },
            { texto: "Mais Performance", caracteres: 16, categoria: "beneficio", gatilhos: ["autoridade"] }
          ],
          descricoes: [
            { texto: "Compare recursos e benefícios antes de escolher.", caracteres: 46, categoria: "comparacao", gatilhos: ["economia"] }
          ]
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
