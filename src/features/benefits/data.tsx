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
  bullets?: string[];
};

export const BENEFITS: Benefit[] = [
  {
    key: "psicologo",
    title: "Psicológico",
    Icon: PsicologoIcon,
    subtitle: "Apoio psicológico para performance e cabeça no lugar.",
    image: require("../../../assets/images/benefits/a501954e-333d-4652-85a0-da883ec86bbe.jpeg"),
    description:
      "Sua mente também precisa estar pronta para o jogo — em qualquer fase da carreira.\n\n" +
      "A busca por um novo clube exige resiliência, mas o cuidado com a saúde mental não deve acontecer apenas nos momentos de transição. A psicologia do esporte é um treino contínuo: fortalece sua inteligência emocional, mantém o foco e sustenta sua alta performance tanto na busca por oportunidades quanto no dia a dia em atividade no campo. Conte com nosso suporte para evoluir constantemente e estar sempre pronto para dar o seu melhor!",
    professional: {
      name: "Karina Arruda",
      credential: "CRP/SP: 85812",
      bio: "Com 20 anos de formação e atuação dedicada à saúde mental, nos últimos 8 anos direcionei minha prática para a Psicologia do Esporte.",
    },
  },
  {
    key: "nutricionista",
    title: "Nutricional",
    Icon: NutricionistaIcon,
    subtitle: "Plano alimentar sob medida pro seu rendimento.",
    description:
      "Acompanhamento nutricional voltado à alta performance: energia, recuperação e composição corporal ajustados à sua posição.",
    bullets: [
      "Avaliação e plano individual",
      "Ajustes por fase da temporada",
      "Suporte por mensagem",
      "Foco em recuperação e energia",
    ],
  },
  {
    key: "financeiro",
    title: "Finanças",
    Icon: FinanceiroIcon,
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
    subtitle: "Seus contratos e direitos protegidos.",
    description:
      "Apoio jurídico especializado em direito desportivo para revisar contratos, tirar dúvidas e proteger a sua carreira.",
    bullets: [
      "Revisão de contratos",
      "Direito desportivo",
      "Tira-dúvidas jurídico",
      "Proteção da sua carreira",
    ],
  },
  {
    key: "preparador",
    title: "Preparador físico",
    Icon: PreparadorFisicoIcon,
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
