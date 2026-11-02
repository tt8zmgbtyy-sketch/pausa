import SwiftUI
import UIKit

private enum PausaTheme {
    static let ink = Color(red: 0.09, green: 0.14, blue: 0.19)
    static let paper = Color(red: 0.97, green: 0.96, blue: 0.93)
    static let coral = Color(red: 0.80, green: 0.24, blue: 0.17)
    static let muted = Color(red: 0.34, green: 0.39, blue: 0.41)
    static let mint = Color(red: 0.87, green: 0.93, blue: 0.87)
}

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(showGuide: { selectedTab = 1 })
                .tabItem { Label("Início", systemImage: "pause.circle") }
                .tag(0)
            GuideView()
                .tabItem { Label("Como ativar", systemImage: "sparkles") }
                .tag(1)
            PrivacyView()
                .tabItem { Label("Privacidade", systemImage: "hand.raised") }
                .tag(2)
        }
        .tint(PausaTheme.coral)
    }
}

private struct HomeView: View {
    let showGuide: () -> Void
    @State private var copied = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                hero

                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("O que muda no Safari")
                            .font(.title2.weight(.bold))
                        FeatureRow(icon: "eye.slash", title: "A aba Reels fica oculta", detail: "Menos um convite para a rolagem infinita.")
                        FeatureRow(icon: "hand.raised", title: "Links de Reels são bloqueados", detail: "A extensão intercepta a abertura dessas páginas.")
                        FeatureRow(icon: "bubble.left.and.bubble.right", title: "O restante continua acessível", detail: "Use o feed, os perfis e as mensagens disponíveis na versão web.")
                    }
                    .padding(24)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24))

                    VStack(alignment: .leading, spacing: 16) {
                        Text("Comece por aqui")
                            .font(.title2.weight(.bold))
                        Text("Ative a extensão e depois abra o Instagram no Safari.")
                            .foregroundStyle(PausaTheme.muted)

                        Button(action: showGuide) {
                            Label("Ver como ativar", systemImage: "arrow.right")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 17)
                        }
                        .buttonStyle(.plain)
                        .foregroundStyle(.white)
                        .background(PausaTheme.coral, in: RoundedRectangle(cornerRadius: 16))

                        Button {
                            UIPasteboard.general.string = "https://www.instagram.com/"
                            copied = true
                            UIAccessibility.post(notification: .announcement, argument: "Endereço do Instagram copiado. Cole na barra de endereço do Safari.")
                        } label: {
                            Label(copied ? "Endereço copiado" : "Copiar endereço do Instagram", systemImage: copied ? "checkmark" : "doc.on.doc")
                                .font(.subheadline.weight(.semibold))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 13)
                        }
                        .buttonStyle(.plain)
                        .foregroundStyle(PausaTheme.ink)

                        if copied {
                            Text("Abra o Safari e cole o endereço na barra de busca. Se o iPhone sugerir abrir o app do Instagram, continue no navegador.")
                                .font(.footnote)
                                .foregroundStyle(PausaTheme.muted)
                                .accessibilityAddTraits(.isStaticText)
                        }
                    }
                    .padding(24)
                    .background(PausaTheme.mint, in: RoundedRectangle(cornerRadius: 24))

                    Label {
                        Text("A Pausa não modifica o app oficial do Instagram. O bloqueio funciona somente no Safari, com a extensão ativada e autorizada.")
                    } icon: {
                        Image(systemName: "info.circle")
                    }
                    .font(.footnote)
                    .foregroundStyle(PausaTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)

                    Text("Um pouco mais de escolha.\nUm pouco menos de automático.")
                        .font(.callout)
                        .foregroundStyle(PausaTheme.muted)
                        .frame(maxWidth: .infinity)
                        .multilineTextAlignment(.center)
                        .padding(.vertical, 8)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .background(PausaTheme.paper)
        .foregroundStyle(PausaTheme.ink)
    }

    private var hero: some View {
        VStack(alignment: .leading, spacing: 24) {
            HStack(spacing: 10) {
                Image(systemName: "pause.fill")
                    .font(.system(size: 20, weight: .black))
                    .foregroundStyle(PausaTheme.ink)
                    .frame(width: 42, height: 42)
                    .background(PausaTheme.mint, in: RoundedRectangle(cornerRadius: 13))
                    .accessibilityHidden(true)
                Text("pausa")
                    .font(.system(.title, design: .rounded, weight: .bold))
                Spacer()
                Text("PARA O SAFARI")
                    .font(.caption2.weight(.bold))
                    .tracking(1.2)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 9)
                    .background(.white.opacity(0.10), in: Capsule())
            }

            VStack(alignment: .leading, spacing: 16) {
                Text("Menos rolagem.\nMais presença.")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityAddTraits(.isHeader)
                Text("Dê uma pausa nos Reels do Instagram aberto no Safari.")
                    .font(.title3)
                    .foregroundStyle(.white.opacity(0.8))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.vertical, 12)

            HStack(spacing: 8) {
                Image(systemName: "leaf")
                Text("Seu tempo, de volta para você.")
            }
            .font(.subheadline)
            .foregroundStyle(PausaTheme.mint)
        }
        .padding(24)
        .padding(.top, 8)
        .padding(.bottom, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(.white)
        .background(PausaTheme.ink)
    }
}

private struct FeatureRow: View {
    let icon: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(PausaTheme.coral)
                .frame(width: 26, height: 26)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 5) {
                Text(title).font(.subheadline.weight(.semibold))
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(PausaTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

private struct GuideView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text("Uma pequena configuração.\nUma navegação mais tranquila.")
                        .font(.title2.weight(.bold))
                        .padding(.top, 8)

                    VStack(spacing: 24) {
                        GuideStep(number: 1, title: "Ative a extensão", detail: "Abra Ajustes → Apps → Safari → Extensões → Pausa e ative a extensão. Em versões anteriores do iOS, o caminho começa em Ajustes → Safari.")
                        Divider()
                        GuideStep(number: 2, title: "Permita no Instagram", detail: "Abra instagram.com no Safari. No menu da página, entre em Extensões, selecione Pausa e permita seu uso em instagram.com. O ícone e os nomes do menu podem variar com a versão do iOS.")
                        Divider()
                        GuideStep(number: 3, title: "Confira o controle da Pausa", detail: "Nesse mesmo menu, abra a Pausa. O controle de bloqueio deve estar ligado. É ali que você pode ligar ou desligar o bloqueio depois.")
                        Divider()
                        GuideStep(number: 4, title: "Continue no navegador", detail: "Recarregue a página do Instagram. A aba Reels deve desaparecer e os links para Reels devem ser interceptados. Se aparecer a opção de abrir o app oficial, continue usando o Safari.")
                    }
                    .padding(24)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24))

                    VStack(alignment: .leading, spacing: 12) {
                        Label("A aba Reels ainda aparece?", systemImage: "questionmark.circle")
                            .font(.headline)
                        Text("Confira a permissão para instagram.com, o controle na extensão e recarregue a página. Em Navegação Privada, o Safari pode exigir uma permissão separada. Mudanças no site do Instagram podem exigir uma atualização da Pausa.")
                            .font(.subheadline)
                            .foregroundStyle(PausaTheme.muted)
                    }
                    .padding(24)
                    .background(PausaTheme.mint, in: RoundedRectangle(cornerRadius: 24))

                    Text("O iOS não permite bloquear uma aba dentro de outro aplicativo. A Pausa atua na versão web do Instagram e pode ser desativada a qualquer momento nas extensões do Safari. Vídeos comuns no feed não são todos bloqueados.")
                        .font(.footnote)
                        .foregroundStyle(PausaTheme.muted)
                        .padding(.bottom, 20)
                }
                .padding(.horizontal, 20)
            }
            .background(PausaTheme.paper)
            .foregroundStyle(PausaTheme.ink)
            .navigationTitle("Como ativar")
        }
    }
}

private struct GuideStep: View {
    let number: Int
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Text(String(number))
                .font(.headline)
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(PausaTheme.coral, in: Circle())
                .accessibilityLabel("Passo \(number)")
            VStack(alignment: .leading, spacing: 8) {
                Text(title).font(.headline)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(PausaTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

private struct PrivacyView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Image(systemName: "hand.raised.circle.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(PausaTheme.coral)
                        .accessibilityHidden(true)
                        .padding(.top, 16)

                    Text("Uma pausa também\npara a coleta de dados.")
                        .font(.title.weight(.bold))

                    VStack(alignment: .leading, spacing: 22) {
                        FeatureRow(icon: "person.crop.circle.badge.checkmark", title: "Sem conta na Pausa", detail: "Você entra no Instagram diretamente no Safari. A Pausa não pede seu usuário ou sua senha.")
                        FeatureRow(icon: "iphone", title: "Preferência guardada no aparelho", detail: "O controle de bloqueio é salvo no armazenamento local da extensão.")
                        FeatureRow(icon: "network.slash", title: "Sem envio para nossos servidores", detail: "Este projeto não inclui servidor, anúncios, análises de uso ou rastreadores.")
                    }
                    .padding(24)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24))

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Por que a permissão do Safari?")
                            .font(.headline)
                        Text("A extensão precisa atuar nas páginas de instagram.com para identificar links, ocultar os acessos aos Reels e bloquear essas rotas. Essa permissão é concedida pelo Safari e pode ser revogada nos Ajustes.")
                            .font(.subheadline)
                            .foregroundStyle(PausaTheme.muted)
                    }

                    Text("Pausa é um projeto independente, sem vínculo com o Instagram ou a Meta. O uso do Instagram continua sujeito às políticas do próprio serviço.")
                        .font(.footnote)
                        .foregroundStyle(PausaTheme.muted)
                        .padding(.bottom, 24)
                }
                .padding(.horizontal, 24)
            }
            .background(PausaTheme.paper)
            .foregroundStyle(PausaTheme.ink)
            .navigationTitle("Privacidade")
        }
    }
}

#Preview {
    ContentView()
}
