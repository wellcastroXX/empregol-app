import type { ComponentType } from "react";

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
  /** Texto do sheet (detalhe). */
  description: string;
  bullets: string[];
};

export const BENEFITS: Benefit[] = [
  {
    key: "psicologo",
    title: "Psicólogo",
    Icon: PsicologoIcon,
    subtitle: "Apoio psicológico para performance e cabeça no lugar.",
    description:
      "Sessões com psicólogos do esporte para lidar com pressão, foco e a rotina de atleta — do dia a dia aos grandes jogos.",
    bullets: [
      "Sessões online, no seu horário",
      "Profissionais especializados em esporte",
      "Sigilo total das suas conversas",
      "Sem custo extra pra quem está na vitrine",
    ],
  },
  {
    key: "nutricionista",
    title: "Nutricionista",
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
    title: "Financeiro",
    Icon: FinanceiroIcon,
    subtitle: "Organize a carreira e o dinheiro desde já.",
    description:
      "Orientação financeira para atletas: como organizar receitas, planejar o futuro e evitar as armadilhas comuns da carreira.",
    bullets: [
      "Planejamento e organização",
      "Educação financeira prática",
      "Apoio em contratos e receitas",
      "Visão de longo prazo",
    ],
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
    title: "Preparador Físico",
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
