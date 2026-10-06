import type { ComponentType } from "react";
import type { ImageSourcePropType } from "react-native";

import {
  FinanceiroIcon,
  JuridicoIcon,
  NutricionistaIcon,
  PreparadorFisicoIcon,
  PsicologoIcon,
  type BenefitIconProps,
} from "@/components/icons/benefits";

export type Benefit = {
  key: string;
  title: string;
  Icon: ComponentType<BenefitIconProps>;
  /** Chamada curta exibida no card da lista. */
  subtitle: string;
  /** Imagem do profissional exibida no topo do sheet (opcional). */
  image?: ImageSourcePropType;
  /** Texto do sheet (detalhe) — pode ter parágrafos (\n\n). */
  description: string;
  /** Assinatura do profissional (nome + registro + mini-bio). */
  professional?: { name: string; credential?: string; bio?: string };
  /** Número de WhatsApp em formato internacional, somente dígitos. */
  whatsappNumber?: string;
  disabled?: boolean;
  bullets?: string[];
};

export const BENEFITS: Benefit[] = [
  {
    key: "psicologo",
    title: "Psicológico",
    Icon: PsicologoIcon,
    whatsappNumber: "31642221607",
    subtitle: "Apoio psicológico para performance e cabeça no lugar.",
    image: require("../../../assets/images/benefits/psicologia_persona.jpeg"),
    description:
      "Sua mente também precisa estar pronta para o jogo — em qualquer fase da carreira.\n\n" +
      "A busca por um novo clube exige resiliência, mas o cuidado com a saúde mental não deve acontecer apenas nos momentos de transição. A psicologia do esporte é um treino contínuo: fortalece sua inteligência emocional, mantém o foco e sustenta sua alta performance tanto na busca por oportunidades quanto no dia a dia em atividade no campo. Conte com nosso suporte para evoluir constantemente e estar sempre pronto para dar o seu melhor!",
    professional: {
      name: "Geissiane Andrade",
      credential: "CRP/SP 219208",
      bio: "Psicóloga Clínica e do Esporte\n\nExperiência, dedicação e cuidado com a mente e o desempenho.",
    },
  },
  {
    key: "nutricionista",
    title: "Nutricional",
    Icon: NutricionistaIcon,
    whatsappNumber: "5551995383198",
    subtitle: "Nutrição esportiva para evoluir dentro e fora de campo.",
    image: require("../../../assets/images/benefits/3d11fe1f-4100-4a1c-b960-6f62e6202e72.jpeg"),
    description:
      "Sua performance começa muito antes do jogo.\n\n" +
      "Minha história com o futebol começou dentro de campo. Passei pelas categorias de base de Portuguesa, Palmeiras e Nacional e vivi de perto a rotina, os desafios e os sonhos de quem busca construir uma carreira como jogador.\n\n" +
      "Foi essa vivência que me aproximou da nutrição esportiva. Hoje, como nutricionista, tenho a oportunidade de trabalhar com atletas profissionais de clubes do Brasil e do exterior, ajudando jogadores a cuidarem melhor do corpo e a utilizarem a nutrição como uma ferramenta para evoluir dentro e fora de campo.\n\n" +
      "Acredito que cada atleta tem uma realidade, uma necessidade e um objetivo diferente. Por isso, minha abordagem é individualizada e vai muito além de simplesmente montar uma dieta: envolve alimentação, hidratação, suplementação, recuperação, qualidade de vida e performance, sempre de acordo com as demandas e características de cada jogador.\n\n" +
      "Seja para melhorar a composição corporal, ter mais energia para os treinos e jogos, otimizar a recuperação, potencializar a performance ou cuidar melhor da saúde, a nutrição pode fazer diferença em todas as fases da carreira.\n\n" +
      "E isso vale para todos os momentos da trajetória de um jogador: esteja você em um grande clube, em busca de novas oportunidades ou atualmente sem clube, cuidar do seu corpo e da sua performance continua sendo fundamental para estar preparado quando a próxima oportunidade aparecer.\n\n" +
      "Se você é jogador de futebol e quer entender como a nutrição pode contribuir para o seu momento e para os seus próximos passos, vou ter prazer em conhecer sua história e ajudar você nessa jornada.",
    professional: {
      name: "Sylvio Prado",
      credential: "CRN3: 71838",
    },
  },
  {
    key: "financeiro",
    title: "Finanças",
    Icon: FinanceiroIcon,
    whatsappNumber: "5584991180660",
    subtitle: "Organize a carreira e o dinheiro desde já.",
    image: require("../../../assets/images/benefits/1956cd3e-92d9-4da2-a6b3-aeebd0f72182.jpeg"),
    description:
      "A carreira de um jogador de futebol é intensa e curta. Em poucos anos, ele pode ganhar o que muita gente leva a vida inteira para conquistar, e é justamente aí que mora o risco. Sem planejamento, o dinheiro vai embora tão rápido quanto chegou.\n\n" +
      "Cuidar das finanças é tão importante quanto cuidar do corpo: é o que garante tranquilidade para focar no jogo hoje e segurança para a vida depois dos gramados.\n\n" +
      "Sou Arthur França, consultor financeiro, e meu trabalho é ajudar você atleta a organizar, proteger e fazer o patrimônio crescer, para que o sucesso dentro de campo continue fora dele.",
  },
  {
    key: "juridico",
    title: "Jurídico",
    Icon: JuridicoIcon,
    whatsappNumber: "5548991195011",
    subtitle: "Seus contratos e direitos protegidos.",
    image: require("../../../assets/images/benefits/advocacia_profile.jpeg"),
    description:
      "No futebol, cada transferência, renovação ou contratação depende de um contrato bem feito. O jurídico protege a carreira do atleta, garantindo salário, direitos de imagem e condições justas, e assegura a clubes e agentes o retorno sobre seu investimento.\n\n" +
      "Com regras da CBF e da FIFA em constante mudança, um prazo perdido ou uma cláusula mal escrita pode custar caro. Para atletas sem contrato, a orientação jurídica é ainda mais essencial para evitar promessas vazias e negociar com segurança.\n\n" +
      "Talento abre portas, mas é o jurídico que garante que elas continuem abertas.",
  },
  {
    key: "preparador",
    title: "Preparador físico",
    Icon: PreparadorFisicoIcon,
    disabled: true,
    subtitle: "Treinos e preparação pra chegar no seu auge.",
    description:
      "Preparação física individualizada para evoluir força, velocidade e resistência — respeitando a sua rotina e posição.",
    bullets: [
      "Programa de treino individual",
      "Prevenção de lesões",
      "Evolução acompanhada",
      "Ajustes por objetivo",
    ],
  },
];
