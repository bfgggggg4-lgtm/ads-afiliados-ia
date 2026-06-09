async function gerarComIA(){
const produto=document.getElementById("produto").value.trim();
const idioma=document.getElementById("idioma").value;
const funil=document.getElementById("funil").value;
const botao=document.getElementById("gerar");
const status=document.getElementById("status");
const jsonBox=document.getElementById("json");
if(!produto){alert("Digite o nome do produto.");return;}
botao.disabled=true;status.textContent="Gerando anúncios com IA...";jsonBox.textContent="{}";
try{
const resposta=await fetch("/.netlify/functions/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({produto,idioma,funil})});
const dados=await resposta.json();
if(!resposta.ok){throw new Error(dados.error||"Erro ao gerar anúncios.");}
jsonBox.textContent=JSON.stringify(dados,null,2);
status.textContent="Anúncios gerados com sucesso.";
}catch(erro){
status.textContent="Erro: "+erro.message;
jsonBox.textContent=JSON.stringify({erro:erro.message},null,2);
}finally{botao.disabled=false;}
}
function copiarJSON(){navigator.clipboard.writeText(document.getElementById("json").textContent);alert("JSON copiado!");}
document.getElementById("gerar").addEventListener("click",gerarComIA);
document.getElementById("copiar").addEventListener("click",copiarJSON);
