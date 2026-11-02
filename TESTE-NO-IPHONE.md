# Verificação no Safari do iPhone

Este roteiro ainda precisa ser executado em um aparelho real antes de distribuir o app. Registre a versão do iOS e a data, porque o site do Instagram pode mudar.

## Preparação

Compile e instale pelo Xcode, seguindo o README. Ative a Pausa nas extensões do Safari, autorize o site do Instagram e recarregue a página. Entre no Instagram pelo próprio site. Mantenha o controle da extensão ligado.

| Ação | Resultado esperado |
| --- | --- |
| Abrir o feed no Safari | Feed acessível; link da aba Reels oculto |
| Abrir mensagens, um perfil, Stories e publicação `/p/…` | Conteúdo acessível, respeitando os recursos disponíveis no site |
| Colar `https://www.instagram.com/reels/` na barra do Safari | Tela da Pausa com botão para voltar ao início |
| Abrir um link `/reel/…` válido | Página de Reels coberta; reprodução pausada |
| Abrir a aba Reels de um perfil | Acesso interceptado ou página coberta |
| Tentar chegar aos Reels pela navegação interna do Instagram | Página coberta após a mudança de rota |
| Voltar e avançar pelo histórico | Bloqueio aplicado apenas nas rotas de Reels |
| Tocar em “Voltar ao início do Instagram” na tela de bloqueio | Feed acessível novamente, permanecendo no Safari |
| Desligar o controle no painel da extensão | Links reaparecem e a tela de bloqueio é removida |
| Fechar e reabrir o painel | Preferência anterior mantida |
| Ligar novamente com duas abas do Instagram abertas | Preferência atualizada nas abas autorizadas |
| Revogar a permissão do site ou desligar a extensão | Bloqueio deixa de atuar; o painel não deve ser interpretado como prova de permissão |
| Usar Navegação Privada | Confirmar permissão específica exigida pelo Safari |
| Usar VoiceOver e texto ampliado | Guia, controle e botão de retorno legíveis e acionáveis |
| Abrir o aplicativo oficial do Instagram | Permanece inalterado, conforme informado pela Pausa |

Também confirme que não há pedidos de conta ou senha pela Pausa, nem chamadas de rede feitas pelo código da extensão. O próprio site do Instagram continuará realizando suas requisições habituais.
