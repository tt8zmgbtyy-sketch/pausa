# Instalar a Pausa usando Windows

Você não precisa possuir um Mac nem instalar uma máquina virtual. O **GitHub Actions** compila em um Mac na nuvem; o **Sideloadly no Windows** assina e instala no iPhone.

O arquivo incluído automatiza a compilação, mas ela **ainda não foi executada** neste ambiente. O app e a extensão também precisam ser verificados no seu iPhone. Um `.ipa` sem assinatura não pode ser instalado simplesmente tocando nele no aparelho.

## Você vai precisar

- Windows com navegador e cabo de conexão com o iPhone.
- iPhone com iOS 17 ou posterior.
- Conta no GitHub para executar a compilação.
- Conta Apple para o Sideloadly assinar a instalação. Não envie a senha da Apple para o GitHub, este chat ou o repositório.
- Sideloadly obtido no site oficial: https://sideloadly.io/.

O Sideloadly informa suporte a contas Apple gratuitas, com validade de 7 dias; depois é necessário renovar a assinatura. O app e a extensão usam identificadores de desenvolvimento e contam para os limites da conta. Restrições de provisionamento da Apple podem impedir a instalação ou exigir ajustes; a instalação desta extensão com uma conta gratuita ainda não foi verificada.

O uso de máquinas macOS no GitHub depende das cotas e da cobrança da sua conta. Repositórios públicos normalmente têm runners padrão gratuitos; repositórios privados usam os minutos disponíveis do seu plano. Consulte os valores exibidos pelo GitHub antes de habilitar cobrança.

## 1. Colocar o projeto no GitHub

1. Extraia o ZIP do projeto no Windows.
2. Entre em https://github.com/ e crie um repositório, por exemplo `pausa-iphone`.
3. No repositório, use **Add file → Upload files**.
4. Envie **o conteúdo da pasta Pausa**, mantendo a estrutura das pastas, e confirme em **Commit changes**. Não envie apenas o ZIP: o GitHub não o extrai para compilar.

Na raiz do repositório devem aparecer `Pausa.xcodeproj`, `PausaApp`, `PausaExtension`, `package.json`, `package-lock.json`, `tests` e `scripts`. Eles não podem estar dentro de uma pasta extra `Pausa`.

Inclua também `.github/workflows/compilar-iphone.yml`. Se o navegador não enviar a pasta `.github`, use **Add file → Create new file**, digite esse caminho completo, copie o conteúdo do arquivo que está no pacote e confirme em **Commit changes**. Ao abrir o arquivo local, o Windows pode perguntar qual programa usar; Bloco de Notas serve.

Não é necessário configurar certificados, senhas ou secrets no GitHub. O workflow gera um arquivo **sem assinatura**.

## 2. Baixar o arquivo IPA

1. Abra a aba **Actions** do repositório e habilite os workflows, se o GitHub solicitar.
2. Selecione **Compilar Pausa para iPhone**.
3. Clique em **Run workflow → Run workflow** e aguarde a conclusão.
4. Abra a execução concluída com sucesso.
5. Na seção **Artifacts**, baixe **Pausa-para-instalar-no-Windows**. O download fica disponível por 7 dias.
6. Extraia o ZIP baixado. Dentro dele estará **Pausa-sem-assinatura.ipa**.

Se a execução falhar, abra a etapa vermelha para ver a mensagem. Não haverá um IPA válido para instalar até a compilação terminar com sucesso. Uma execução pode ser iniciada novamente depois de corrigir o erro.

## 3. Assinar e instalar pelo Windows

1. Instale o Sideloadly a partir de https://sideloadly.io/. Siga os requisitos atuais do próprio site para iTunes e iCloud; ele informa que precisa das versões web no Windows, em vez das versões da Microsoft Store.
2. Conecte o iPhone por cabo e confirme **Confiar neste computador** no aparelho.
3. Abra o Sideloadly e selecione seu iPhone.
4. Arraste **Pausa-sem-assinatura.ipa** para o programa.
5. Informe sua conta Apple e conclua a autenticação solicitada pelo próprio Sideloadly.
6. **Preserve a extensão do aplicativo.** Se houver uma opção como **Remove Extensions**, não remova `PausaExtension.appex`. Sem ela, só o guia será instalado e não haverá bloqueio no Safari.
7. Inicie a instalação em **Start**. Mantenha os identificadores do app e da extensão relacionados; não tente trocar somente um deles manualmente.
8. Se o iPhone solicitar, em **Ajustes → Geral → VPN e Gerenciamento de Dispositivo**, confie no perfil da sua conta de desenvolvedor.
9. Se o iOS solicitar o **Modo de Desenvolvedor**, siga a instrução em **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor**, reinicie e confirme. A opção pode aparecer apenas depois da primeira tentativa de instalação.

Se houver erro de limite de apps, identificadores ou provisionamento, leia a mensagem antes de tentar novamente. Remover a extensão da Pausa não é uma solução: ela é a parte que faz o bloqueio.

## 4. Ativar o bloqueio no Safari

1. Abra **Ajustes → Apps → Safari → Extensões → Pausa** e ative. Em algumas versões do iOS, o caminho começa em **Ajustes → Safari**.
2. Abra `https://www.instagram.com/` no Safari.
3. No menu da página, permita o acesso da Pausa ao site do Instagram.
4. Abra a Pausa nesse menu e mantenha **Proteção contra Reels** ligada.
5. Recarregue o Instagram e siga a verificação em `TESTE-NO-IPHONE.md`.

Com conta Apple gratuita, renove a instalação pelo Sideloadly antes de vencer o período de assinatura. Confira depois se o app e a extensão continuam disponíveis. O bloqueio funciona somente no Safari e pode ser desativado pelo próprio usuário; não altera o aplicativo oficial do Instagram.

## Referências

- Sideloadly e instruções atuais: https://sideloadly.io/ e https://sideloadly.io/faq
- Execução manual no GitHub Actions: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/manually-running-a-workflow
- Downloads de artefatos: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/downloading-workflow-artifacts
