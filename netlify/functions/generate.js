exports.handler = async function(event) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resposta: {
        produto: "Teste",
        status: "Função funcionando"
      }
    })
  };
};
