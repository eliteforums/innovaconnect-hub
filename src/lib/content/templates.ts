/** Templates for "Add item" when a list starts empty (keyed by the list's field name). */
export const listTemplates: Record<string, unknown> = {
  awards: { title: "", kind: "cash", value: "", eligibility: "", conditions: "" },
  partners: { name: "", category: "", url: "", logo: "", challenge: "", verified: true },
  winners: { team: "", award: "", project: "" },
  judgesAndMentors: { name: "", role: "" },
  gallery: { src: "", alt: "", credit: "" },
  social: { label: "", url: "" },
  body: { type: "p", text: "" },
  article: { type: "p", text: "" },
  items: "",
};
