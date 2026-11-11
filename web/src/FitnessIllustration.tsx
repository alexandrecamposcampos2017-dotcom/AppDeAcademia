import { useEffect, useId, useState } from "react";

type ActivityVariant = "strength" | "running" | "cycling" | "swimming" | "mobility" | "sports" | "general";

const palettes: Record<ActivityVariant, { start: string; end: string; accent: string }> = {
  strength: { start: "#193d79", end: "#58a4ee", accent: "#b7e5ff" },
  running: { start: "#164d71", end: "#59c4c0", accent: "#c5ffe9" },
  cycling: { start: "#214c70", end: "#81b6e3", accent: "#f0d7a5" },
  swimming: { start: "#164a79", end: "#51b5d4", accent: "#c6f7ff" },
  mobility: { start: "#493c78", end: "#a18fe5", accent: "#f2dbff" },
  sports: { start: "#6c422c", end: "#f0a454", accent: "#fff0bc" },
  general: { start: "#22466e", end: "#79a9db", accent: "#d8eaff" },
};

function getVariant(value: string): ActivityVariant {
  const text = value.toLocaleLowerCase("pt-BR");
  if (/natac|swim|piscina/.test(text)) return "swimming";
  if (/cicl|bike|biciclet/.test(text)) return "cycling";
  if (/corrida|caminhada|run|esteira|cardio|hiit|funcional/.test(text)) return "running";
  if (/yoga|pilates|along|mobilidade|flexib|stretch/.test(text)) return "mobility";
  if (/futebol|basquete|basket|esport|quadra/.test(text)) return "sports";
  if (/muscul|força|forca|supino|agach|peso|halter|barra|remada|leg press|flex[aã]o|peito|costas|ombro|perna|gl[uú]te|bíceps|b[ií]ceps|tr[ií]ceps|quadr[ií]ceps|panturrilha|abd[oô]men|core/.test(text)) return "strength";
  return "general";
}

function AthletePose({ variant }: { variant: ActivityVariant }) {
  if (variant === "cycling") {
    return (
      <>
        <circle className="illustration-wheel" cx="113" cy="145" r="37" />
        <circle className="illustration-wheel" cx="220" cy="145" r="37" />
        <path className="illustration-bike" d="M113 145l38-48 38 48h-76l34-58h40l33 58m-86-72h20" />
        <circle className="illustration-head" cx="165" cy="55" r="13" />
        <path className="illustration-limb" d="M158 72l18 25-23 27-32 21m55-48l34-14 14-22m-44 63l29 21" />
      </>
    );
  }
  if (variant === "swimming") {
    return (
      <>
        <circle className="illustration-head" cx="131" cy="91" r="12" />
        <path className="illustration-limb" d="M145 94q33-13 62-2l28 12m-83-9l-39-22-29 10m53 13l-35 22-38-2m111-21l34 18 37-1" />
        <path className="illustration-water" d="M48 143q15-9 30 0t30 0t30 0t30 0t30 0t30 0t30 0m-203 16q15-9 30 0t30 0t30 0t30 0t30 0t30 0t30 0" />
      </>
    );
  }
  if (variant === "mobility") {
    return (
      <>
        <circle className="illustration-head" cx="166" cy="56" r="13" />
        <path className="illustration-limb" d="M166 73v49m0-34l-41-27-34 2m75 25l35-39 33 0m-68 73l-39 34-32 0m71-34l35 34 31 0" />
      </>
    );
  }
  if (variant === "sports") {
    return (
      <>
        <circle className="illustration-head" cx="165" cy="54" r="13" />
        <path className="illustration-limb" d="M166 71l-9 49-36 17-28-14m64-41l-35-22-27 4m28-4l24-27 28 3m-18 84l25 24 31 4m-31-4l24-30" />
        <circle className="illustration-ball" cx="247" cy="138" r="15" />
        <path className="illustration-ball-lines" d="M237 127l20 22m1-24l-22 25" />
      </>
    );
  }
  if (variant === "running") {
    return (
      <>
        <circle className="illustration-head" cx="171" cy="51" r="13" />
        <path className="illustration-limb" d="M168 69l-10 48 25 22m-20-54l-37-19-24 20m25-21l25-26 24 8m7 92l38 10 20-9m-45-23l-16 32-27 24" />
      </>
    );
  }
  if (variant === "strength") {
    return (
      <>
        <path className="illustration-equipment" d="M93 51h146m-127-10v20m-10-16v12m117-16v20m10-16v12" />
        <circle className="illustration-head" cx="166" cy="70" r="12" />
        <path className="illustration-limb" d="M166 84v39m0-29l-39-14-25-29m64 43l39-14 25-29m-64 72l-28 29-34 1m62-30l29 27 33 3" />
      </>
    );
  }
  return (
    <>
      <circle className="illustration-head" cx="166" cy="58" r="13" />
      <path className="illustration-limb" d="M166 75v48m0-34l-38-16-26-26m64 42l37-21 25-24m-62 55l-31 34-30 4m61-38l29 34 31 4" />
    </>
  );
}

function imageFilename(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const imageAliases: Record<string, string[]> = {
  "crucifixo-com-halteres": ["crucifizo-halteres"],
  "dead-bug": ["deadbug"],
  "desenvolvimento-com-halteres": ["desenvolvimento-halteres"],
  "flexao-de-bracos": ["flexao-bracos"],
  "pullover-na-polia": ["pullover"],
  "supino-inclinado-com-halteres": ["supino-inclinado"],
};

const imageExtensions = ["png", "jpg", "jpeg", "webp", "svg"] as const;

function findImageCandidates(values: string[]) {
  const candidates: string[] = [];
  for (const value of values) {
    const slug = imageFilename(value);
    if (!slug) continue;
    const names = [...new Set([
      ...(imageAliases[slug] ?? []).flatMap((name) => [name.replaceAll("-", "_"), name]),
      slug.replaceAll("-", "_"),
      slug,
    ])];
    for (const name of names) {
      for (const extension of imageExtensions) {
        candidates.push(`/images/training/${name}.${extension}`, `/${name}.${extension}`);
      }
    }
  }
  return [...new Set(candidates)];
}

export default function FitnessIllustration({ activity, imageKey = activity, label, className = "" }: {
  activity: string; imageKey?: string | string[]; label?: string; className?: string;
}) {
  const variant = getVariant(activity);
  const colors = palettes[variant];
  const description = label ?? `Ilustração de ${activity}`;
  const gradientId = `illustration-${useId().replaceAll(":", "")}`;
  const imageKeys = Array.isArray(imageKey) ? imageKey : [imageKey];
  const imageKeysDependency = imageKeys.join("\0");
  const imageCandidates = findImageCandidates(imageKeys);
  const [imageState, setImageState] = useState({ dependency: imageKeysDependency, index: 0, loaded: false });
  const imageIndex = imageState.dependency === imageKeysDependency ? imageState.index : 0;
  const imageLoaded = imageState.dependency === imageKeysDependency && imageState.loaded;
  const customImageSrc = imageCandidates[imageIndex] ?? "";

  useEffect(() => {
    setImageState({ dependency: imageKeysDependency, index: 0, loaded: false });
  }, [imageKeysDependency]);

  return (
    <div className={`fitness-artwork ${className}`}>
      {customImageSrc && <img
        className="fitness-custom-image"
        src={customImageSrc}
        alt={description}
        onLoad={() => setImageState({ dependency: imageKeysDependency, index: imageIndex, loaded: true })}
        onError={() => setImageState({ dependency: imageKeysDependency, index: imageIndex + 1, loaded: false })}
      />}
      {!imageLoaded && <svg
        className="fitness-illustration"
        viewBox="0 0 320 210"
        role="img"
        aria-label={description}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradientId}-background`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <radialGradient id={`${gradientId}-glow`}>
            <stop stopColor={colors.accent} stopOpacity=".6" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="210" rx="22" fill={`url(#${gradientId}-background)`} />
        <circle className="illustration-glow" cx="245" cy="35" r="89" fill={`url(#${gradientId}-glow)`} />
        <circle className="illustration-orbit" cx="162" cy="102" r="72" />
        <circle className="illustration-orbit illustration-orbit-back" cx="162" cy="102" r="92" />
        <path className="illustration-ground" d="M28 178h264" />
        <g className="illustration-athlete"><AthletePose variant={variant} /></g>
        <g className="illustration-sparkles" fill={colors.accent}>
          <circle cx="61" cy="62" r="3" /><circle cx="260" cy="86" r="2.5" /><circle cx="85" cy="130" r="2" />
        </g>
        <path className="illustration-wave" d="M0 188q50-16 100 0t100 0t120 0v22H0z" />
      </svg>}
    </div>
  );
}
