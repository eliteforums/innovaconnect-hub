/**
 * Content for the Section 09 map of Mumbai.
 *
 * Station and landmark positions are approximate (lat, lon). Rail lines are
 * drawn station to station, so they follow the real route only loosely. The
 * map shows the city that inspires this edition — it does not mark an event
 * venue, which has not been announced.
 */

export type Station = { name: string; lat: number; lon: number; label?: "left" | "right" };

export type RailLine = {
  id: "western" | "central" | "harbour";
  name: string;
  colour: string;
  stations: Station[];
  /** Where the line continues beyond the city limits. */
  continues: { lat: number; lon: number; label: string };
};

export const railLines: RailLine[] = [
  {
    id: "western",
    name: "Western line",
    colour: "#941B45",
    stations: [
      { name: "Churchgate", lat: 18.9353, lon: 72.827, label: "left" },
      { name: "Marine Lines", lat: 18.9447, lon: 72.8236 },
      { name: "Charni Road", lat: 18.9517, lon: 72.8183 },
      { name: "Grant Road", lat: 18.9633, lon: 72.8165 },
      { name: "Mumbai Central", lat: 18.969, lon: 72.8195, label: "left" },
      { name: "Mahalaxmi", lat: 18.9826, lon: 72.8242 },
      { name: "Lower Parel", lat: 18.996, lon: 72.8303 },
      { name: "Prabhadevi", lat: 19.008, lon: 72.8357 },
      { name: "Dadar", lat: 19.0186, lon: 72.8429 },
      { name: "Matunga Road", lat: 19.0277, lon: 72.8467 },
      { name: "Mahim", lat: 19.041, lon: 72.8406 },
      { name: "Bandra", lat: 19.0544, lon: 72.8406, label: "left" },
      { name: "Khar Road", lat: 19.0697, lon: 72.8378 },
      { name: "Santacruz", lat: 19.0814, lon: 72.8411 },
      { name: "Vile Parle", lat: 19.0996, lon: 72.8437 },
      { name: "Andheri", lat: 19.1197, lon: 72.8464, label: "left" },
      { name: "Jogeshwari", lat: 19.1364, lon: 72.8489 },
      { name: "Goregaon", lat: 19.1648, lon: 72.8494, label: "left" },
      { name: "Malad", lat: 19.1867, lon: 72.8486 },
      { name: "Kandivali", lat: 19.2045, lon: 72.8517 },
      { name: "Borivali", lat: 19.229, lon: 72.8573, label: "left" },
      { name: "Dahisar", lat: 19.2502, lon: 72.8597 },
    ],
    continues: { lat: 19.279, lon: 72.862, label: "to Virar" },
  },
  {
    id: "central",
    name: "Central line",
    colour: "#D62828",
    stations: [
      { name: "CSMT", lat: 18.9398, lon: 72.8355, label: "right" },
      { name: "Masjid", lat: 18.9517, lon: 72.8382 },
      { name: "Byculla", lat: 18.9767, lon: 72.8331, label: "left" },
      { name: "Parel", lat: 19.0091, lon: 72.8384 },
      { name: "Dadar", lat: 19.0183, lon: 72.8439, label: "left" },
      { name: "Matunga", lat: 19.0275, lon: 72.8551 },
      { name: "Sion", lat: 19.0466, lon: 72.8638 },
      { name: "Kurla", lat: 19.0659, lon: 72.8794, label: "left" },
      { name: "Ghatkopar", lat: 19.0859, lon: 72.9081, label: "right" },
      { name: "Vikhroli", lat: 19.111, lon: 72.9277 },
      { name: "Kanjurmarg", lat: 19.1293, lon: 72.9319 },
      { name: "Bhandup", lat: 19.144, lon: 72.9378 },
      { name: "Mulund", lat: 19.172, lon: 72.9563, label: "left" },
    ],
    continues: { lat: 19.186, lon: 72.9757, label: "to Thane" },
  },
  {
    id: "harbour",
    name: "Harbour line",
    colour: "#6D28D9",
    stations: [
      { name: "CSMT", lat: 18.9398, lon: 72.8355 },
      { name: "Sandhurst Road", lat: 18.9614, lon: 72.8394 },
      { name: "Cotton Green", lat: 18.9866, lon: 72.8432 },
      { name: "Sewri", lat: 18.9985, lon: 72.8546 },
      { name: "Vadala Road", lat: 19.0166, lon: 72.859, label: "right" },
      { name: "Chunabhatti", lat: 19.0517, lon: 72.8693 },
      { name: "Kurla", lat: 19.0659, lon: 72.8794 },
      { name: "Chembur", lat: 19.0622, lon: 72.901 },
      { name: "Govandi", lat: 19.0553, lon: 72.9152 },
      { name: "Mankhurd", lat: 19.0482, lon: 72.9318, label: "right" },
    ],
    continues: { lat: 19.063, lon: 72.99, label: "to Vashi" },
  },
];

/** Stations where lines meet, drawn as interchanges. */
export const interchanges = ["CSMT", "Dadar", "Kurla"];

export type Landmark = {
  n: number;
  name: string;
  note: string;
  lat: number;
  lon: number;
  /** Offset (in map units) for markers that would sit on top of a station. */
  offset?: [number, number];
  href?: string;
};

export const landmarks: Landmark[] = [
  { n: 1, name: "Gateway of India", note: "Arch monument on the waterfront at Apollo Bunder.", lat: 18.922, lon: 72.8347, offset: [16, 6] },
  { n: 2, name: "Kala Ghoda", note: "South Mumbai's art precinct.", lat: 18.9285, lon: 72.8318, offset: [-18, 4], href: "/#the-city" },
  { n: 3, name: "CSMT & BMC headquarters", note: "The UNESCO-listed terminus, with the BMC building opposite.", lat: 18.94, lon: 72.835, offset: [26, -16], href: "/#the-city" },
  { n: 4, name: "Marine Drive", note: "The seafront promenade curving along Back Bay.", lat: 18.944, lon: 72.823, offset: [-20, -10], href: "/#the-city" },
  { n: 5, name: "Bandra–Worli Sea Link", note: "Cable-stayed bridge across Mahim Bay.", lat: 19.0237, lon: 72.816, offset: [-18, 0] },
  { n: 6, name: "Juhu Beach", note: "The suburbs' long sandy shoreline.", lat: 19.0988, lon: 72.8267 },
  { n: 7, name: "Mumbai airport", note: "Chhatrapati Shivaji Maharaj International Airport.", lat: 19.0896, lon: 72.8656 },
  { n: 8, name: "Powai Lake", note: "Lake in the eastern suburbs.", lat: 19.1273, lon: 72.9055 },
  { n: 9, name: "Sanjay Gandhi National Park", note: "Forested national park within the city limits.", lat: 19.2147, lon: 72.9106 },
];

export const seaLink: [[number, number], [number, number]] = [
  [19.0108, 72.8154],
  [19.036, 72.8173],
];

/** Water and orientation labels. Rotation in degrees. */
export const placeLabels: {
  text: string;
  lat: number;
  lon: number;
  rotate?: number;
  kind: "water" | "area" | "outside";
  /** Draws a leader line from the label to this point (lat, lon). */
  leader?: [number, number];
}[] = [
  { text: "Arabian Sea", lat: 19.15, lon: 72.779, rotate: -90, kind: "water" },
  { text: "Back Bay", lat: 18.917, lon: 72.797, kind: "water" },
  { text: "Mumbai Harbour", lat: 18.945, lon: 72.9, kind: "water" },
  { text: "Thane Creek", lat: 19.105, lon: 72.983, rotate: -72, kind: "water" },
  { text: "Mumbai Suburban", lat: 19.195, lon: 72.89, kind: "area" },
  { text: "Mumbai City", lat: 18.982, lon: 72.9, kind: "area", leader: [18.975, 72.84] },
  { text: "Thane", lat: 19.225, lon: 72.975, kind: "outside" },
];
