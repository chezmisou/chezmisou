/** Couleurs et typographies de Chez Misou (identiques au site). */
export const colors = {
  marronProfond: "#3B2314",
  marron: "#6B3A2A",
  marronClair: "#8B5E3C",
  marronDoux: "#A67C5B",
  orange: "#D4762C",
  orangeVif: "#E8872F",
  orangeClair: "#F0A05C",
  orangeBg: "#FBEBDD",
  blanc: "#FFFFFF",
  blancCreme: "#FFF8EE",
  grisChaud: "#9B8B7A",
  textBody: "#4A3728",
  border: "#EADCCB",
  success: "#2F7D32",
  successBg: "#E7F4E8",
  danger: "#B42318",
  dangerBg: "#FDECEA",
} as const;

export const fonts = {
  serif: "PlayfairDisplay_700Bold",
  serifRegular: "PlayfairDisplay_400Regular",
  sans: "DMSans_400Regular",
  sansMedium: "DMSans_500Medium",
  sansBold: "DMSans_700Bold",
} as const;

export const radius = { sm: 10, md: 14, lg: 20 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
