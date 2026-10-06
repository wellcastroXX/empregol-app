/**
 * Canal de suporte da Empregol.
 * Número de WhatsApp em formato internacional, somente dígitos (+55 47 9269-0179).
 */
export const SUPPORT_WHATSAPP = "554792690179";

/** Mensagem pré-preenchida ao abrir o suporte. */
export const SUPPORT_WHATSAPP_MESSAGE =
  "Olá! Preciso de ajuda com o Empregol.";

/** URL wa.me do suporte, já com a mensagem (padrão ou custom). */
export function supportWhatsappUrl(
  message: string = SUPPORT_WHATSAPP_MESSAGE,
): string {
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
