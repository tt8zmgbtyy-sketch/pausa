# Pausa · Instagram sem Reels no Safari

Protótipo de um aplicativo para iPhone com uma **Safari Web Extension**. Oculta links para Reels, incluindo a aba de navegação, e exibe uma tela de bloqueio nas páginas de Reels do Instagram aberto no Safari. O feed, as mensagens, as publicações e os perfis continuam acessíveis na versão web.

**O app oficial do Instagram não é modificado.** O iOS não oferece uma API pública para um aplicativo bloquear apenas uma aba dentro de outro. Este projeto implementa a alternativa para Safari.

## O que está incluído

- App SwiftUI em português, com guia de ativação e informações de privacidade.
- Extensão com controle para ligar e desligar a proteção, salvo localmente.
- Interceptação de links e cobertura de páginas `/reel/…`, `/reels/…` e `/usuario/reels/`.
- Tratamento de links diretos, alterações no site sem recarregar a página e navegação pelo histórico.
- Pausa de áudio e vídeo enquanto uma página de Reels está coberta pelo bloqueio.
- Ícones, projeto Xcode, esquema compartilhado e testes automatizados em DOM simulado.

Não há servidor, cadastro na Pausa, anúncios ou análise de navegação. O login no Instagram acontece diretamente no site do Instagram.

## Instalar usando Windows

Veja **[INSTALAR-PELO-WINDOWS.md](INSTALAR-PELO-WINDOWS.md)**. O pacote inclui um workflow manual do GitHub Actions para compilar em um Mac na nuvem e gerar um `.ipa` sem assinatura, preservando a extensão. O Sideloadly no Windows faz a assinatura e a instalação. A compilação na nuvem e a instalação desse pacote ainda precisam ser executadas e verificadas.

## Instalar no iPhone com um Mac

Requisitos: **macOS com Xcode 16 ou posterior**, iPhone com **iOS 17 ou posterior**, Apple ID configurado no Xcode e assinatura de desenvolvimento apropriada. O app não está publicado na App Store e este pacote não é um instalador `.ipa`.

1. Abra `Pausa.xcodeproj` no Xcode.
2. Em **Signing & Capabilities**, selecione sua equipe nos targets **Pausa** e **PausaExtension**.
3. Troque os identificadores de exemplo por identificadores únicos. O da extensão deve manter o prefixo do app, por exemplo `com.seunome.Pausa` e `com.seunome.Pausa.Extension`.
4. Conecte seu iPhone, selecione o esquema **Pausa** e o aparelho como destino. Ative o Modo de Desenvolvedor no aparelho se o Xcode solicitar.
5. Execute com **Run** (`⌘R`). Não é preciso instalar dependências JavaScript para compilar o aplicativo: os recursos da extensão já estão no projeto.

Uma conta gratuita pode ter limites de provisionamento e exigir reinstalação periódica. Distribuição por TestFlight ou App Store exige o Apple Developer Program e o processo de assinatura e revisão da Apple.

## Ativar a extensão

1. No iPhone, abra **Ajustes → Apps → Safari → Extensões → Pausa** e ative a extensão. Dependendo da versão do iOS, o caminho começa em **Ajustes → Safari**.
2. Abra `https://www.instagram.com/` **no Safari**. Você pode copiar o endereço no app Pausa e colar na barra do Safari.
3. No menu da página do Safari, abra as extensões e permita que **Pausa** atue em `instagram.com`. O Safari pode listar o subdomínio `www.instagram.com`; autorize o site que estiver usando.
4. Abra o painel da extensão e mantenha **Proteção contra Reels** ligada. Recarregue a página após a primeira ativação.
5. Continue usando o Instagram no Safari. Se aparecer um convite para abrir o app oficial, permaneça no navegador.

O controle indica a preferência da extensão; a proteção também depende da permissão do site. Desativar ou remover a extensão, revogar a permissão ou usar outro navegador elimina o bloqueio. A Navegação Privada pode exigir autorização separada.

## Limites do protótipo

- **Não atua no app oficial, em outros navegadores ou em navegadores embutidos em outros apps.** Não modifica o Instagram instalado.
- Bloqueia os acessos e as rotas de Reels; não classifica todos os vídeos exibidos no feed, em Stories ou em publicações `/p/…`.
- A cobertura de uma página é uma intervenção na interface. Não impede que o Instagram faça requisições de rede por trás dela.
- Mudanças na navegação interna sem alteração do DOM são verificadas a cada 400 ms enquanto o Safari permite executar a extensão. Pode haver uma breve exibição antes do bloqueio.
- Os links são reconhecidos pelo destino, sem depender dos nomes de classes do Instagram. Ainda assim, mudanças no site podem exigir manutenção e a aba só é ocultada quando é representada por um link reconhecido.
- A Pausa é uma ferramenta de autocontrole, que o usuário pode desligar. Não é um controle parental inviolável.

## Testes

Para os testes da extensão, use Node.js 22.8 ou posterior (recomendado: Node.js 24):

```sh
npm ci
npm test
npm run check
```

Os testes usam `node:test` e jsdom. Exercitam as rotas, ocultação dos links, eventos, navegação interna, reprodução e persistência de preferências. Eles não substituem um teste no Safari real.

Para verificar a compilação em um Mac, sem assinar um instalador:

```sh
xcodebuild -project Pausa.xcodeproj -scheme Pausa \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/PausaDerivedData \
  CODE_SIGNING_ALLOWED=NO build
```

**Situação de validação:** a lógica JavaScript é testável neste ambiente Linux. Compilação Swift, instalação, permissões do Safari e comportamento contra a versão atual do Instagram precisam ser validados no Mac/iPhone; não foram executados aqui.

Veja `TESTE-NO-IPHONE.md` para o roteiro de validação no aparelho.

## Estrutura

```text
Pausa.xcodeproj/           Projeto com app e extensão embutida
PausaApp/                 Interface SwiftUI, guia, privacidade e ícone
PausaExtension/           Handler nativo e Info.plist da extensão
  Resources/              Manifest, política de URLs, scripts, CSS e painel
tests/                    Testes em DOM simulado
scripts/                  Verificação dos recursos locais do projeto
```

Os identificadores `br.com.exemplo.Pausa` e `br.com.exemplo.Pausa.Extension` são exemplos. A Pausa não tem vínculo com Instagram ou Meta.
