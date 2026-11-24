// Musique de fond de la vidéo, composée par ce programme (aucun morceau extérieur, donc aucun droit à payer).
// Pop entraînante à 112 battements par minute : nappe d'accords, basse, arpèges pincés, batterie légère.
// Utilisation : node musique.mjs <sortie.wav> [durée en secondes, 67 par défaut]
import fs from "node:fs";

const [sortie = "musique.wav", dureeTexte = "67"] = process.argv.slice(2);
const DUREE = Number(dureeTexte),
  FE = 44100,
  N = Math.round(DUREE * FE);
const G = new Float32Array(N),
  D = new Float32Array(N); // canaux gauche et droit
const BPM = 112,
  TEMPS = 60 / BPM,
  MESURE = 4 * TEMPS;
const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Pseudo-hasard reproductible (même musique à chaque fois)
let graine = 85;
const hasard = () => {
  graine = (graine * 1103515245 + 12345) % 2147483648;
  return graine / 2147483648;
};

function ajouter(debut, echantillons, gain = 1, pan = 0) {
  const i0 = Math.round(debut * FE),
    gl = gain * Math.cos(((pan + 1) * Math.PI) / 4),
    gd = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < echantillons.length && i0 + i < N; i++) {
    G[i0 + i] += echantillons[i] * gl;
    D[i0 + i] += echantillons[i] * gd;
  }
}

// ── Instruments ──
function nappe(midis, duree) {
  // accords doux : dents de scie désaccordées, filtrées
  const n = Math.round(duree * FE),
    s = new Float32Array(n);
  for (const m of midis)
    for (const desacc of [-0.07, 0.07]) {
      const f = freq(m + desacc);
      let ph = hasard(),
        filtre = 0;
      for (let i = 0; i < n; i++) {
        ph = (ph + f / FE) % 1;
        filtre += 0.06 * (2 * ph - 1 - filtre);
        const env =
          Math.min(1, i / (0.25 * FE)) * Math.min(1, (n - i) / (0.3 * FE));
        s[i] += filtre * env * 0.11;
      }
    }
  return s;
}
function basse(m, duree) {
  const n = Math.round(duree * FE),
    s = new Float32Array(n),
    f = freq(m);
  for (let i = 0; i < n; i++) {
    const t = i / FE,
      env = Math.exp(-t * 3) * Math.min(1, (n - i) / 400);
    s[i] =
      (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) *
      env;
  }
  return s;
}
function pince(m, duree) {
  // corde pincée (Karplus-Strong)
  const n = Math.round(duree * FE),
    s = new Float32Array(n),
    p = Math.round(FE / freq(m)),
    tampon = new Float32Array(p);
  for (let i = 0; i < p; i++) tampon[i] = hasard() * 2 - 1;
  for (let i = 0; i < n; i++) {
    const k = i % p,
      v = tampon[k];
    s[i] = v;
    tampon[k] = 0.996 * 0.5 * (v + tampon[(k + 1) % p]);
  }
  return s;
}
function grosseCaisse() {
  const n = Math.round(0.35 * FE),
    s = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / FE,
      f = 50 + 90 * Math.exp(-t * 30);
    ph += (2 * Math.PI * f) / FE;
    s[i] = Math.sin(ph) * Math.exp(-t * 9);
  }
  return s;
}
function caisseClaire() {
  const n = Math.round(0.25 * FE),
    s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / FE;
    s[i] =
      ((hasard() * 2 - 1) * 0.7 + 0.4 * Math.sin(2 * Math.PI * 185 * t)) *
      Math.exp(-t * 18);
  }
  return s;
}
function charleston() {
  const n = Math.round(0.06 * FE),
    s = new Float32Array(n);
  let prec = 0;
  for (let i = 0; i < n; i++) {
    const b = hasard() * 2 - 1;
    s[i] = (b - prec) * Math.exp((-i / FE) * 60);
    prec = b;
  }
  return s;
}

// ── Partition : Do – Sol – La mineur – Fa, en boucle ──
const ACCORDS = [
  [48, 52, 55],
  [43, 47, 50],
  [45, 48, 52],
  [41, 45, 48],
];
const KICK = grosseCaisse(),
  SNARE = caisseClaire(),
  HAT = charleston();
const mesures = Math.ceil(DUREE / MESURE);
for (let b = 0; b < mesures; b++) {
  const t0 = b * MESURE,
    a = ACCORDS[b % 4],
    fin = t0 > DUREE - 6; // dernières secondes : plus calme
  ajouter(
    t0,
    nappe(
      a.map((m) => m + 12),
      MESURE + 0.2,
    ),
    0.9,
  );
  if (b >= 1) {
    // basse et arpèges dès la 2e mesure
    for (const [k, temps] of [
      [0, 0],
      [0, 1.5],
      [0, 2],
      [1, 3],
      [0, 3.5],
    ])
      ajouter(
        t0 + temps * TEMPS,
        basse(a[0] - 12 + (k ? 7 : 0), TEMPS * 0.9),
        0.32,
      );
    const motif = [0, 1, 2, 1, 0, 2, 1, 2];
    motif.forEach((k, j) =>
      ajouter(
        t0 + (j * TEMPS) / 2,
        pince(a[k] + 24, 0.5),
        fin ? 0.12 : 0.18,
        j % 2 ? 0.35 : -0.35,
      ),
    );
  }
  if (b >= 2 && !fin) {
    // batterie dès la 3e mesure
    for (const temps of [0, 2]) ajouter(t0 + temps * TEMPS, KICK, 0.55);
    if (b % 2) ajouter(t0 + 2.5 * TEMPS, KICK, 0.35);
    for (const temps of [1, 3]) ajouter(t0 + temps * TEMPS, SNARE, 0.22);
    for (let j = 0; j < 8; j++)
      ajouter(t0 + (j * TEMPS) / 2, HAT, j % 2 ? 0.07 : 0.045, 0.2);
  }
}

// ── Mixage : fondu d'entrée et de sortie, volume de fond (−6 dB crête) ──
let crete = 0;
for (let i = 0; i < N; i++)
  crete = Math.max(crete, Math.abs(G[i]), Math.abs(D[i]));
const tampon = Buffer.alloc(44 + N * 4);
tampon.write("RIFF", 0);
tampon.writeUInt32LE(36 + N * 4, 4);
tampon.write("WAVEfmt ", 8);
tampon.writeUInt32LE(16, 16);
tampon.writeUInt16LE(1, 20);
tampon.writeUInt16LE(2, 22);
tampon.writeUInt32LE(FE, 24);
tampon.writeUInt32LE(FE * 4, 28);
tampon.writeUInt16LE(4, 32);
tampon.writeUInt16LE(16, 34);
tampon.write("data", 36);
tampon.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / FE,
    fondu = Math.min(1, t / 0.8) * Math.min(1, (DUREE - t) / 3);
  const k = (0.5 / crete) * fondu;
  tampon.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, G[i] * k)) * 32767),
    44 + i * 4,
  );
  tampon.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, D[i] * k)) * 32767),
    46 + i * 4,
  );
}
fs.writeFileSync(sortie, tampon);
console.log(`✓ ${sortie} (${DUREE} s)`);
