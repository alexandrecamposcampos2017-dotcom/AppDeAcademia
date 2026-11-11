import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  Activity as ActivityIcon, Apple, ArrowDownToLine, ArrowRight, Award, BarChart3, CalendarDays, Calculator,
  Bell, Check, ChevronDown, Clock3, Dumbbell, Droplets, Flame, Footprints, HeartPulse, LayoutDashboard,
  Camera, LogOut, Plus, Search, Settings2, ShieldCheck, Sparkles, Sun, Moon, Trash2, TrendingUp, UserRound,
  Weight, X, Printer, Pencil,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import FitnessIllustration from "./FitnessIllustration";

type User = { id: string; name: string; email: string; profile: Profile | null };
type Profile = {
  age: number | null; heightCm: number | null; weightKg: number | null; goal: string | null;
  experience: string | null; preferences: string | null; theme: string; isPrivate: boolean; avatarData: string | null;
};
type CalorieCalculatorInput = {
  age: number;
  heightCm: number;
  weightKg: number;
  formulaFactor: "female" | "male" | "";
  activityLevel: string;
  goal: "lose" | "maintain" | "gain";
};
type CalorieEstimate = {
  restingCalories: number;
  maintenanceCalories: number;
  targetCalories: number;
  bmi: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
};
type Exercise = {
  id: string; name: string; muscleGroup: string; type: string; equipment: string | null;
  level: string; modality: string; description: string; instructions: string; createdById: string | null;
};
type WorkoutItem = {
  id: string; exerciseId: string; sets: number; reps: number; loadKg: number | null;
  restSeconds: number; exercise: Exercise;
};
type WorkoutPlan = {
  id: string; name: string; muscleGroup: string | null; description: string | null;
  isFavorite: boolean; exercises: WorkoutItem[];
};
type ActivityRecord = {
  id: string; type: string; durationMinutes: number; distanceKm: number | null;
  calories: number | null; intensity: string | null; date: string; notes: string | null;
};
type Measurement = {
  id: string; date: string; weightKg: number | null; heightCm: number | null;
  bodyFatPct: number | null; muscleMassKg: number | null; waistCm: number | null;
  chestCm: number | null; armCm: number | null; thighCm: number | null; bmi?: number | null;
};
type Goal = { id: string; type: string; target: number; unit: string; period: string; active: boolean };
type Scheduled = { id: string; title: string; type: string; scheduledAt: string; status: string; notes: string | null };
type Meal = { id: string; name: string; mealType: string; recordedAt: string; calories: number; proteinG: number; carbsG: number; fatG: number; notes: string | null };
type Food = { id: string; name: string; calories: number; proteinG: number; carbsG: number; fatG: number };
type WaterEntry = { id: string; amountMl: number; recordedAt: string };
type WorkoutLog = {
  id: string; name: string; startedAt: string; durationMinutes: number;
  sets?: Array<{ exerciseId: string; setNumber: number; reps: number; loadKg: number | null }>;
};
type DashboardData = {
  today: { activityMinutes: number; distanceKm: number; caloriesBurned: number; workouts: number; mealsCalories: number; waterMl: number };
  week: { workouts: number; activityMinutes: number; distanceKm: number };
  scheduled: Scheduled[];
  goals: Array<Goal & { current: number; percent: number }>;
  recent: Array<{ id: string; kind: string; title: string; date: string; detail: string }>;
};
type ReportData = {
  totals: { activityMinutes: number; caloriesBurned: number; distanceKm: number; workouts: number; mealsCalories: number };
  activities: ActivityRecord[];
  workouts: WorkoutLog[];
  measurements: Measurement[];
};
type AchievementsData = {
  currentStreak: number;
  longestStreak: number;
  achievements: Array<{ id: string; title: string; description: string; current: number; target: number; unlocked: boolean }>;
};

const navigation = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { id: "workouts", label: "Meus treinos", icon: Dumbbell },
  { id: "activities", label: "Atividades", icon: ActivityIcon },
  { id: "progress", label: "Evolução e metas", icon: TrendingUp },
  { id: "calendar", label: "Agenda", icon: CalendarDays },
  { id: "nutrition", label: "Alimentação", icon: Apple },
  { id: "calories", label: "Calorias", icon: Calculator },
  { id: "library", label: "Exercícios", icon: Footprints },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "profile", label: "Meu perfil", icon: UserRound },
] as const;
type PageId = typeof navigation[number]["id"];

const activityLevels = [
  { value: "sedentary", label: "Sedentário", description: "Pouco ou nenhum exercício", multiplier: 1.2 },
  { value: "light", label: "Levemente ativo", description: "Exercício leve, 1 a 3 dias por semana", multiplier: 1.375 },
  { value: "moderate", label: "Moderadamente ativo", description: "Exercício moderado, 3 a 5 dias por semana", multiplier: 1.55 },
  { value: "high", label: "Muito ativo", description: "Exercício intenso, 6 a 7 dias por semana", multiplier: 1.725 },
  { value: "very_high", label: "Extremamente ativo", description: "Treino intenso e atividade física diária", multiplier: 1.9 },
] as const;

function sliderValue(value: number | null | undefined, min: number, max: number, fallback: number, step = 1) {
  const clampedValue = Math.min(max, Math.max(min, value ?? fallback));
  return Math.min(max, Math.max(min, min + Math.round((clampedValue - min) / step) * step));
}

function estimateCalories(input: CalorieCalculatorInput): CalorieEstimate | null {
  const { age, heightCm, weightKg } = input;
  if (age < 18 || age > 120 || heightCm < 100 || heightCm > 250 || weightKg < 30 || weightKg > 350 || !input.formulaFactor) return null;
  const activity = activityLevels.find((level) => level.value === input.activityLevel);
  if (!activity) return null;

  const restingCalories = 10 * weightKg + 6.25 * heightCm - 5 * age + (input.formulaFactor === "male" ? 5 : -161);
  const maintenanceCalories = restingCalories * activity.multiplier;
  const targetCalories = maintenanceCalories + (input.goal === "lose" ? -300 : input.goal === "gain" ? 300 : 0);
  const proteinGrams = Math.round(weightKg * 1.6);
  const fatGrams = Math.round(targetCalories * 0.25 / 9);
  const carbohydrateGrams = Math.max(0, Math.round((targetCalories - proteinGrams * 4 - fatGrams * 9) / 4));

  return {
    restingCalories: Math.round(restingCalories),
    maintenanceCalories: Math.round(maintenanceCalories),
    targetCalories: Math.round(targetCalories),
    bmi: weightKg / ((heightCm / 100) ** 2),
    proteinGrams,
    carbohydrateGrams,
    fatGrams,
  };
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path.startsWith("/api") ? path : `/api${path}`, {
    ...init,
    credentials: "include",
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({})) as { error?: string; message?: string };
  if (!response.ok) throw new ApiError(data.error ?? "Não foi possível concluir a operação.", response.status);
  return data as T;
}

function useLoad<T>(path: string, version: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    api<T>(path).then((value) => {
      if (active) { setData(value); setError(""); }
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Falha ao carregar os dados.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, version]);
  return { data, loading, error };
}

const dateTimeLocalNow = () => {
  const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
};
const dateTimeLocal = (value: string) => {
  const date = new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
};
const dateText = (date: string) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeText = (date: string) => new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const numberField = (form: FormData, key: string) => {
  const value = form.get(key);
  return value == null || value === "" ? undefined : Number(value);
};
const isoField = (form: FormData, key: string) => {
  const value = form.get(key);
  return value ? new Date(String(value)).toISOString() : undefined;
};
const textField = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

async function resizeProfileImage(file: File): Promise<string> {
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 512 / image.width, 512 / image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a imagem neste navegador.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.68, 0.52]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (!blob) throw new Error("Não foi possível converter a imagem selecionada.");
      if (blob.size > 512 * 1024) continue;
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Não foi possível ler a imagem convertida."));
        reader.onerror = () => reject(new Error("Não foi possível ler a imagem convertida."));
        reader.readAsDataURL(blob);
      });
    }
    throw new Error("A imagem ficou muito grande. Escolha uma imagem menor.");
  } finally {
    image.close();
  }
}

function Field({ label, name, type = "text", required = false, min, max, step, minLength, defaultValue, placeholder }: {
  label: string; name: string; type?: string; required?: boolean; min?: number; max?: number;
  step?: number; minLength?: number; defaultValue?: string | number; placeholder?: string;
}) {
  const id = useId();
  const numeric = type === "number";
  const rangeMin = min ?? 0;
  const rangeMax = max ?? getRangeMaximum(label, rangeMin, defaultValue);
  const rangeStep = step ?? getRangeStep(label);
  const initialValue = Number(defaultValue ?? rangeMin);
  const [value, setValue] = useState(initialValue);
  const [enabled, setEnabled] = useState(defaultValue !== undefined);
  const fieldRef = useRef<HTMLDivElement>(null);
  const digits = Math.min(3, (String(rangeStep).split(".")[1] ?? "").length);
  const displayedValue = value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: digits });

  useEffect(() => {
    const form = fieldRef.current?.closest("form");
    if (!form) return;
    const resetField = () => {
      setValue(initialValue);
      setEnabled(defaultValue !== undefined);
    };
    form.addEventListener("reset", resetField);
    return () => form.removeEventListener("reset", resetField);
  }, [defaultValue, initialValue, required]);

  if (numeric) {
    return (
      <div className="field range-field" ref={fieldRef}>
        <label htmlFor={id}>{label}{required && <span className="required-marker"> (obrigatório)</span>}</label>
        <output htmlFor={id} className="range-value">{enabled ? `${displayedValue}${rangeUnit(label)}` : "Não informado"}</output>
        <input
          className="range-input"
          id={id}
          type="range"
          min={rangeMin}
          max={rangeMax}
          step={rangeStep}
          value={value}
          disabled={!enabled}
          aria-valuetext={enabled ? `${displayedValue}${rangeUnit(label)}` : "Não informado"}
          onChange={(event) => setValue(Number(event.currentTarget.value))}
        />
        {defaultValue === undefined && (
          <label className="range-optional">
            <input type="checkbox" checked={enabled} required={required} onChange={(event) => setEnabled(event.currentTarget.checked)} />
            <span>{required ? "Definir valor (obrigatório)" : "Informar valor"}</span>
          </label>
        )}
        {enabled && <input type="hidden" name={name} value={value} />}
        {placeholder && <small>{placeholder}</small>}
      </div>
    );
  }

  return (
    <label className="field">
      <span>{label}{required && <span className="required-marker"> (obrigatório)</span>}</span>
      <input name={name} type={type} required={required} min={min} max={max} step={step} minLength={minLength} defaultValue={defaultValue} placeholder={placeholder} />
    </label>
  );
}

function getRangeMaximum(label: string, min: number, defaultValue?: string | number) {
  const normalizedLabel = label.toLocaleLowerCase("pt-BR");
  if (/séries/.test(normalizedLabel)) return 30;
  if (/repetições/.test(normalizedLabel)) return 100;
  if (/descanso/.test(normalizedLabel)) return 3600;
  if (/duração/.test(normalizedLabel)) return 1440;
  if (/idade/.test(normalizedLabel)) return 120;
  if (/altura/.test(normalizedLabel)) return 260;
  if (/peso|carga/.test(normalizedLabel)) return 500;
  if (/gordura corporal/.test(normalizedLabel)) return 80;
  if (/massa muscular/.test(normalizedLabel)) return 300;
  if (/cintura|peito/.test(normalizedLabel)) return 300;
  if (/braço/.test(normalizedLabel)) return 150;
  if (/coxa/.test(normalizedLabel)) return 200;
  if (/distância/.test(normalizedLabel)) return 200;
  if (/calorias/.test(normalizedLabel)) return 10000;
  if (/proteínas|carboidratos|gorduras/.test(normalizedLabel)) return 1000;
  if (/porção/.test(normalizedLabel)) return 1000;
  if (/meta/.test(normalizedLabel)) return Math.max(10000, Number(defaultValue ?? 0) * 2);
  return Math.max(min + 100, Number(defaultValue ?? 0) * 2, 1000);
}

function getRangeStep(label: string) {
  const normalizedLabel = label.toLocaleLowerCase("pt-BR");
  if (/calorias/.test(normalizedLabel)) return 10;
  if (/distância/.test(normalizedLabel)) return 0.1;
  if (/peso|carga|altura|gordura corporal|massa muscular|cintura|peito|braço|coxa|proteínas|carboidratos|gorduras|porção|meta/.test(normalizedLabel)) return 0.1;
  return 1;
}

function rangeUnit(label: string) {
  const match = label.match(/\(([^)]+)\)/);
  if (match) return ` ${match[1]}`;
  const normalizedLabel = label.toLocaleLowerCase("pt-BR");
  if (/séries/.test(normalizedLabel)) return " séries";
  if (/repetições/.test(normalizedLabel)) return " repetições";
  if (/descanso/.test(normalizedLabel)) return " seg";
  if (/duração/.test(normalizedLabel)) return " min";
  if (/distância/.test(normalizedLabel)) return " km";
  if (/calorias/.test(normalizedLabel)) return " kcal";
  if (/proteínas|carboidratos|gorduras/.test(normalizedLabel)) return " g";
  if (/idade/.test(normalizedLabel)) return " anos";
  return "";
}

function SelectField({ label, name, options, required = false, defaultValue }: {
  label: string; name: string; options: Array<[string, string]>; required?: boolean; defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}{required && <span className="required-marker"> (obrigatório)</span>}</span>
      <select name={name} required={required} defaultValue={defaultValue ?? options[0]?.[0]}>
        {options.map(([value, title]) => <option value={value} key={value}>{title}</option>)}
      </select>
    </label>
  );
}

function SubmitButton({ children = "Salvar registro", disabled = false }: { children?: ReactNode; disabled?: boolean }) {
  return <button className="button primary submit-button" type="submit" disabled={disabled}><Plus size={16} />{children}</button>;
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="empty"><Sparkles size={20} /><span>{children}</span></div>;
}

function ErrorBanner({ children }: { children: ReactNode }) {
  return <div className="error-banner" role="alert"><X size={16} /><span>{children}</span></div>;
}

function TextSizeControls({ scale, onChange, className = "" }: {
  scale: number; onChange: (value: number) => void; className?: string;
}) {
  const defaultScale = 1.1;
  const percent = Math.round(scale * 100);
  return (
    <div className={`text-size-controls ${className}`} role="group" aria-label="Ajustar tamanho do texto">
      <span className="text-size-label">Texto</span>
      <button type="button" aria-label="Diminuir tamanho do texto" title="Diminuir tamanho do texto" disabled={scale <= 0.8} onClick={() => onChange(Math.max(0.8, Math.round((scale - 0.1) * 10) / 10))}>A−</button>
      <button type="button" className="text-size-reset" aria-label={`Tamanho do texto em ${percent} por cento. Restaurar padrão de ${Math.round(defaultScale * 100)} por cento`} title={`Restaurar padrão de ${Math.round(defaultScale * 100)}%`} disabled={scale === defaultScale} onClick={() => onChange(defaultScale)}>{percent}%</button>
      <button type="button" aria-label="Aumentar tamanho do texto" title="Aumentar tamanho do texto" disabled={scale >= 2} onClick={() => onChange(Math.min(2, Math.round((scale + 0.1) * 10) / 10))}>A+</button>
    </div>
  );
}

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><h2>{title}</h2>{action}</div>{children}</section>;
}

function AuthScreen({ onLogin, onNotice }: {
  onLogin: (user: User) => void;
  onNotice: (text: string, error?: boolean) => void;
}) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [resetToken, setResetToken] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      if (mode === "forgot") {
        const result = await api<{ message: string; resetToken?: string }>("/auth/forgot-password", {
          method: "POST", body: JSON.stringify({ email: textField(form, "email") }),
        });
        if (result.resetToken) {
          setResetToken(result.resetToken);
          setMode("reset");
          onNotice("Token local gerado. Conclua a redefinição em até 30 minutos.");
        } else onNotice(result.message);
      } else if (mode === "reset") {
        await api("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token: textField(form, "token"), password: textField(form, "password") }),
        });
        setMode("login");
        setResetToken("");
        onNotice("Senha atualizada. Entre com sua nova senha.");
      } else {
        const result = await api<{ user: User }>(`/auth/${mode}`, {
          method: "POST",
          body: JSON.stringify({
            ...(mode === "register" ? { name: textField(form, "name") } : {}),
            email: textField(form, "email"),
            password: textField(form, "password"),
          }),
        });
        onLogin(result.user);
      }
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "Não foi possível continuar.", true);
    } finally { setBusy(false); }
  }

  const title = mode === "login" ? "Bem-vindo de volta" : mode === "register" ? "Crie sua conta" : mode === "forgot" ? "Recuperar acesso" : "Nova senha";
  return (
    <>
    <main className="auth-page" id="main-content" tabIndex={-1} aria-label="Acesso ao FitTrack">
      <div className="auth-visual">
        <div className="brand"><span className="brand-mark"><ActivityIcon aria-hidden="true" size={20} /></span> fittrack</div>
        <div className="auth-message">
          <div className="eyebrow"><span className="status-dot" /> SEU RITMO. SUA EVOLUÇÃO.</div>
          <p className="auth-message-title">Um passo de cada vez.<br /><span>Mais perto de você.</span></p>
          <p>Organize seus treinos, acompanhe sua evolução e transforme consistência em resultado.</p>
        </div>
        <div className="auth-quote"><HeartPulse aria-hidden="true" size={18} /><span>Movimento é cuidado. Celebre cada conquista.</span></div>
        <div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" />
      </div>
      <section className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-mobile-brand brand"><span className="brand-mark"><ActivityIcon aria-hidden="true" size={20} /></span> fittrack</div>
          <div className="eyebrow">FITNESS, DO SEU JEITO</div>
          <h1 aria-live="polite">{title}</h1>
          <p className="muted">{mode === "login" ? "Entre para continuar sua jornada." : mode === "register" ? "Seus dados ficam privados e seguros." : "Vamos ajudar você a recuperar o acesso."}</p>
          <form onSubmit={submit} className="stack-form">
            {mode === "register" && <Field label="Como podemos chamar você?" name="name" required placeholder="Seu nome" />}
            {mode !== "reset" && <Field label="E-mail" name="email" type="email" required placeholder="voce@email.com" />}
            {mode === "reset" && <label className="field"><span>Token de recuperação</span><input name="token" required minLength={32} defaultValue={resetToken} placeholder="Cole o token recebido" /></label>}
            {(mode === "login" || mode === "register" || mode === "reset") && (
              <Field label="Senha" name="password" type="password" required minLength={10} placeholder="Mínimo de 10 caracteres" />
            )}
            <button type="submit" className="button primary auth-submit" disabled={busy}>
              {busy ? "Aguarde..." : mode === "login" ? "Entrar na minha conta" : mode === "register" ? "Criar conta gratuita" : mode === "forgot" ? "Solicitar recuperação" : "Salvar nova senha"}
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" && <><button type="button" onClick={() => setMode("forgot")}>Esqueci minha senha</button><span aria-hidden="true">·</span><button type="button" onClick={() => setMode("register")}>Criar conta</button></>}
            {mode === "register" && <><span>Já tem conta?</span><button type="button" onClick={() => setMode("login")}>Entrar</button></>}
            {(mode === "forgot" || mode === "reset") && <button type="button" onClick={() => setMode("login")}>Voltar para o login</button>}
          </div>
          <div className="privacy-note"><ShieldCheck aria-hidden="true" size={16} /> Seus registros são privados e protegidos.</div>
        </div>
      </section>
    </main>
    </>
  );
}

function Dashboard({ version, onNavigate }: { version: number; onNavigate: (page: PageId) => void }) {
  const timezoneOffset = -new Date().getTimezoneOffset();
  const { data, loading, error } = useLoad<DashboardData>(`/dashboard?offset=${timezoneOffset}`, version);
  const { data: achievements, error: achievementsError } = useLoad<AchievementsData>(`/achievements?offset=${timezoneOffset}`, version);
  const [report, setReport] = useState<ReportData | null>(null);
  const [reportError, setReportError] = useState("");
  useEffect(() => {
    api<ReportData>("/reports?period=week").then((value) => { setReport(value); setReportError(""); }).catch((reason: unknown) => {
      setReport(null);
      setReportError(reason instanceof Error ? reason.message : "Não foi possível carregar o gráfico semanal.");
    });
  }, [version]);
  if (loading) return <div className="loading" role="status" aria-live="polite">Carregando seu resumo...</div>;
  if (error || !data) return <Empty>{error || "Ainda não há dados para mostrar."}</Empty>;
  const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const firstDayOfWeek = new Date();
  firstDayOfWeek.setHours(0, 0, 0, 0);
  firstDayOfWeek.setDate(firstDayOfWeek.getDate() - ((firstDayOfWeek.getDay() + 6) % 7));
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + index);
    return {
      key: dayKey(date),
      day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      weekday: date.toLocaleDateString("pt-BR", { weekday: "long" }),
      minutes: 0,
    };
  });
  report?.activities.forEach((item) => {
    const day = chartDays.find((entry) => entry.key === dayKey(new Date(item.date)));
    if (day) day.minutes += item.durationMinutes;
  });
  report?.workouts.forEach((item) => {
    const day = chartDays.find((entry) => entry.key === dayKey(new Date(item.startedAt)));
    if (day) day.minutes += item.durationMinutes;
  });
  const stats = [
    { title: "Treinos na semana", value: data.week.workouts, unit: "sessões", icon: Dumbbell, tint: "blue" },
    { title: "Tempo em movimento", value: data.today.activityMinutes, unit: "min hoje", icon: Clock3, tint: "purple" },
    { title: "Calorias ativas", value: data.today.caloriesBurned.toLocaleString("pt-BR"), unit: "kcal hoje", icon: Flame, tint: "orange" },
    { title: "Distância percorrida", value: data.today.distanceKm.toFixed(1), unit: "km hoje", icon: Footprints, tint: "green" },
  ];
  return (
    <div className="page-content">
      <div className="welcome-banner">
        <div><div className="eyebrow light-eyebrow">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase()} · SEU RITMO, SUA JORNADA</div><h1>Seu progresso começa <span>hoje.</span></h1><p>Pequenos passos consistentes criam grandes mudanças.</p></div>
        <button className="button white-button" onClick={() => onNavigate("workouts")}><Dumbbell size={17} /> Montar meu treino</button>
        <div className="banner-decoration"><ActivityIcon size={140} strokeWidth={1} /></div>
      </div>
      {reportError && <ErrorBanner>{reportError}</ErrorBanner>}
      {achievementsError && <ErrorBanner>{achievementsError}</ErrorBanner>}
      <div className="stats-grid">
        {stats.map((item) => <article className="stat-card" key={item.title}>
          <div className={`stat-icon ${item.tint}`}><item.icon size={19} /></div>
          <div className="stat-label">{item.title}</div><div className="stat-value">{item.value}<span>{item.unit}</span></div>
          <div className="stat-foot"><span className="soft-dot" /> Atualizado com seus registros</div>
        </article>)}
      </div>
      <div className="dashboard-grid">
        <Panel title="Atividade nesta semana" action={<span className="subtle-chip">Últimos 7 dias</span>} className="chart-panel">
          {report && (report.activities.length > 0 || report.workouts.length > 0) ? <>
            <div className="chart-wrap" aria-hidden="true"><ResponsiveContainer width="100%" height={225}>
            <AreaChart data={chartDays}><defs><linearGradient id="minutes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3378ec" stopOpacity={0.25} /><stop offset="100%" stopColor="#3378ec" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} width={30} /><Tooltip />
              <Area type="monotone" dataKey="minutes" name="Minutos" stroke="#3378ec" strokeWidth={2.5} fill="url(#minutes)" />
            </AreaChart>
          </ResponsiveContainer></div>
            <div className="visually-hidden">
              <p>Minutos ativos em cada dia dos últimos sete dias:</p>
              <ul>{chartDays.map((day) => <li key={day.key}>{day.weekday}: {day.minutes} minutos</li>)}</ul>
            </div>
          </> : <Empty>Registre uma atividade para começar seu gráfico.</Empty>}
          <div className="chart-summary"><span><i className="legend-dot blue-dot" /> Minutos ativos</span><strong>{data.week.activityMinutes} min na semana</strong></div>
        </Panel>
        <Panel title="Metas em andamento" action={<button className="text-button" onClick={() => onNavigate("progress")}>Ver metas <ArrowRight size={14} /></button>}>
          <div className="goal-list">
            {data.goals.length ? data.goals.slice(0, 4).map((goal) => <div className="goal-row" key={goal.id}>
              <div className="goal-row-title"><span>{goal.type === "workouts" ? "Treinos" : goal.type === "distance" ? "Distância" : goal.type === "hydration_ml" ? "Hidratação" : goal.type === "calories" ? "Calorias ativas" : "Tempo ativo"} · {goal.period === "weekly" ? "semana" : goal.period === "monthly" ? "mês" : "dia"}</span><b>{goal.current} / {goal.target} {goal.unit}</b></div>
              <div className="progress-track" role="progressbar" aria-label={`Progresso da meta de ${goal.type === "workouts" ? "treinos" : goal.type === "distance" ? "distância" : goal.type === "hydration_ml" ? "hidratação" : goal.type === "calories" ? "calorias" : "tempo ativo"}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, goal.percent)}><div style={{ width: `${goal.percent}%` }} /></div>
            </div>) : <Empty>Defina uma meta para acompanhar seu ritmo.</Empty>}
          </div>
          <div className="water-summary"><div className="water-icon"><Droplets size={18} /></div><div><b>{(data.today.waterMl / 1000).toFixed(1)} L</b><span>água registrada hoje</span></div><button className="icon-button" aria-label="Registrar água" onClick={() => onNavigate("nutrition")}><Plus size={18} /></button></div>
        </Panel>
      </div>
      <div className="dashboard-grid lower-grid">
        <Panel title="Próximos treinos" action={<button className="text-button" onClick={() => onNavigate("calendar")}>Abrir agenda <ArrowRight size={14} /></button>}>
          {data.scheduled.length ? <div className="upcoming-list">{data.scheduled.map((item) => <div className="upcoming-row" key={item.id}>
            <div className="date-box"><b>{new Date(item.scheduledAt).getDate()}</b><span>{new Date(item.scheduledAt).toLocaleDateString("pt-BR", { month: "short" })}</span></div>
            <div className="upcoming-info"><b>{item.title}</b><span>{item.type} · {timeText(item.scheduledAt)}</span></div><ChevronDown size={16} className="muted-icon" />
          </div>)}</div> : <Empty>Nenhum treino programado. Sua agenda está livre.</Empty>}
        </Panel>
        <Panel title="Atividade recente">
          {data.recent.length ? <div className="recent-list">{data.recent.map((item) => <div className="recent-row" key={`${item.kind}-${item.id}`}>
            <FitnessIllustration activity={item.title} imageKey={item.title} label={`Ilustração de ${item.title}`} className="activity-art-thumb recent-art" />
            <div className="recent-info"><b>{item.title}</b><span>{dateText(String(item.date))} · {item.detail}</span></div><Check size={15} className="check-icon" />
          </div>)}</div> : <Empty>Suas atividades registradas aparecerão aqui.</Empty>}
        </Panel>
      </div>
      <Panel title="Conquistas e sequência ativa" action={<span className="subtle-chip">Baseado nos seus registros</span>}>
        <div className="achievement-content">
          <div className="streak-summary"><div className="streak-icon"><Flame size={21} /></div><div><b>{achievements?.currentStreak ?? 0} dias</b><span>sequência atual</span></div><div className="streak-best"><b>{achievements?.longestStreak ?? 0}</b><span>maior sequência</span></div></div>
          <div className="achievement-grid">{achievements?.achievements.map((badge) => <div className={`achievement-item ${badge.unlocked ? "unlocked" : ""}`} key={badge.id}><span className="achievement-medal"><Award size={17} /></span><div><b>{badge.title}</b><span>{badge.unlocked ? badge.description : `${badge.current} de ${badge.target} · ${badge.description}`}</span></div><span className="achievement-state">{badge.unlocked ? "Conquistada" : "Em progresso"}</span></div>)}</div>
        </div>
      </Panel>
    </div>
  );
}

function RestTimer() {
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const display = `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  return <div className="timer-control"><Clock3 size={15} /><b>{display}</b><button type="button" className="text-button" onClick={() => setRunning(!running)}>{running ? "Pausar" : "Iniciar"}</button><button type="button" className="timer-reset" aria-label="Reiniciar cronômetro" onClick={() => { setRunning(false); setSeconds(60); }}>↺</button></div>;
}

function WorkoutsPage({ version, onSaved, notify }: { version: number; onSaved: (text?: string) => void; notify: (text: string, error?: boolean) => void }) {
  const { data: plans, loading: plansLoading, error: plansError } = useLoad<WorkoutPlan[]>("/workouts", version);
  const { data: exercises, loading: exercisesLoading, error: exercisesError } = useLoad<Exercise[]>("/exercises", version);
  const { data: logs, loading: logsLoading, error: logsError } = useLoad<WorkoutLog[]>("/workout-logs", version);
  const [search, setSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const currentPlans = plans ?? [];
  const selectedPlan = currentPlans.find((plan) => plan.id === selectedPlanId);
  const editingPlan = currentPlans.find((plan) => plan.id === editingPlanId);
  const filteredExercises = (exercises ?? []).filter((item) => `${item.name} ${item.muscleGroup}`.toLowerCase().includes(search.toLowerCase()));
  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await api("/workouts", { method: "POST", body: JSON.stringify({ name: textField(form, "name"), muscleGroup: textField(form, "muscleGroup"), description: textField(form, "description") }) });
      formElement.reset(); onSaved("Treino criado.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível criar o treino.", true); }
    finally { setBusy(false); }
  }
  async function addExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const selectedPlanId = textField(form, "planId");
    if (!selectedPlanId) return notify("Selecione um treino antes de adicionar exercícios.", true);
    try {
      await api(`/workouts/${selectedPlanId}/exercises`, { method: "POST", body: JSON.stringify({
        exerciseId: textField(form, "exerciseId"), sets: numberField(form, "sets"), reps: numberField(form, "reps"),
        loadKg: numberField(form, "loadKg") ?? null, restSeconds: numberField(form, "restSeconds"),
      }) });
      formElement.reset(); setSelectedPlanId(""); onSaved("Exercício adicionado ao treino.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível adicionar o exercício.", true); }
  }
  async function logWorkout(plan: WorkoutPlan, form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    const values = new FormData(form.currentTarget);
    const sets = plan.exercises.flatMap((item) => Array.from({ length: item.sets }, (_, index) => ({
      exerciseId: item.exerciseId, setNumber: index + 1, reps: item.reps,
      loadKg: numberField(values, `load_${item.exerciseId}`) ?? null,
    })));
    try {
      await api("/workout-logs", { method: "POST", body: JSON.stringify({
        planId: plan.id, name: plan.name, durationMinutes: numberField(values, "durationMinutes"), startedAt: new Date().toISOString(), sets,
      }) });
      onSaved("Treino concluído e desempenho registrado.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível registrar o treino.", true); }
  }
  async function remove(path: string, text: string) {
    try { await api(path, { method: "DELETE" }); onSaved(text); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível excluir.", true); }
  }
  async function toggleFavorite(plan: WorkoutPlan) {
    try { await api(`/workouts/${plan.id}`, { method: "PATCH", body: JSON.stringify({ isFavorite: !plan.isFavorite }) }); onSaved(); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível atualizar o treino.", true); }
  }
  async function updatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPlan) return;
    const form = new FormData(event.currentTarget);
    try {
      await api(`/workouts/${editingPlan.id}`, { method: "PATCH", body: JSON.stringify({
        name: textField(form, "name"), muscleGroup: textField(form, "muscleGroup"),
        description: textField(form, "description"),
      }) });
      setEditingPlanId(null);
      onSaved("Treino atualizado.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível editar o treino.", true); }
  }
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">FORÇA E CONSISTÊNCIA</div><h1>Meus treinos</h1><p>Crie sua rotina, organize os exercícios e acompanhe cada sessão.</p></div><RestTimer /></div>
    {(plansError || exercisesError || logsError) && <ErrorBanner>{[plansError, exercisesError, logsError].filter(Boolean).join(" ")}</ErrorBanner>}
    <div className="content-two-col">
      <div className="stack-panels">
        <Panel title="Criar treino personalizado">
          <form onSubmit={submitPlan} className="form-grid">
            <Field label="Nome do treino" name="name" required placeholder="Ex.: Treino A · Superiores" />
            <Field label="Divisão / grupo muscular" name="muscleGroup" placeholder="Ex.: Peito e tríceps" />
            <Field label="Observações" name="description" placeholder="Foco ou instruções do treino" />
            <SubmitButton disabled={busy}>Criar treino</SubmitButton>
          </form>
        </Panel>
        {editingPlan && <Panel title="Editar treino">
          <form className="form-grid" key={editingPlan.id} onSubmit={(event) => void updatePlan(event)}>
            <Field label="Nome" name="name" required defaultValue={editingPlan.name} />
            <Field label="Grupo muscular" name="muscleGroup" defaultValue={editingPlan.muscleGroup ?? ""} />
            <Field label="Descrição" name="description" defaultValue={editingPlan.description ?? ""} />
            <button type="submit" className="button primary submit-button"><Check size={16} /> Salvar treino</button>
            <button type="button" className="text-button" onClick={() => setEditingPlanId(null)}>Cancelar edição</button>
          </form>
        </Panel>}
        <Panel title="Adicionar exercício ao treino">
          <form onSubmit={addExercise} className="form-grid">
            <label className="field">
              <span>Treino<span className="required-marker"> (obrigatório)</span></span>
              <select name="planId" required value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)}>
                <option value="">Selecione um treino</option>
                {currentPlans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}
              </select>
            </label>
            {selectedPlan && <div className="selected-workout-preview">
              <FitnessIllustration
                activity={`${selectedPlan.name} ${selectedPlan.muscleGroup ?? ""} ${selectedPlan.exercises.map((item) => item.exercise.name).join(" ")}`}
                imageKey={[...selectedPlan.exercises.map((item) => item.exercise.name), selectedPlan.name, selectedPlan.muscleGroup ?? ""]}
                label={`Ilustração do ${selectedPlan.name}`}
                className="selected-workout-art"
              />
              <div><b>{selectedPlan.name}</b><span>{selectedPlan.muscleGroup || "Rotina personalizada"}</span></div>
            </div>}
            <SelectField label="Exercício" name="exerciseId" options={(exercises ?? []).map((exercise) => [exercise.id, `${exercise.name} · ${exercise.muscleGroup}`])} required />
            <Field label="Séries" name="sets" type="number" min={1} max={30} defaultValue={3} required />
            <Field label="Repetições" name="reps" type="number" min={1} max={100} defaultValue={10} required />
            <Field label="Carga (kg)" name="loadKg" type="number" min={0} step={0.5} placeholder="Opcional" />
            <Field label="Descanso (seg)" name="restSeconds" type="number" min={0} max={3600} defaultValue={60} required />
            <SubmitButton disabled={!currentPlans.length || !exercises?.length || exercisesLoading}>Adicionar exercício</SubmitButton>
          </form>
        </Panel>
      </div>
      <Panel title="Biblioteca rápida" action={<label className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar exercício" /></label>}>
        <div className="exercise-mini-list">
          {filteredExercises.slice(0, 8).map((exercise) => <div className="exercise-mini" key={exercise.id}><div className="exercise-avatar"><Dumbbell size={17} /></div><div><b>{exercise.name}</b><span>{exercise.muscleGroup} · {exercise.equipment ?? "Peso corporal"}</span></div></div>)}
          {!filteredExercises.length && <Empty>Nenhum exercício encontrado.</Empty>}
        </div>
      </Panel>
    </div>
    <Panel title="Treinos salvos" action={<span className="subtle-chip">{currentPlans.length} {currentPlans.length === 1 ? "treino" : "treinos"}</span>}>
      {plansLoading ? <div className="loading" role="status" aria-live="polite">Carregando seus treinos...</div> : currentPlans.length ? <div className="workout-grid">{currentPlans.map((plan) => <article className="workout-card" key={plan.id}>
        <FitnessIllustration
          activity={`${plan.name} ${plan.muscleGroup ?? ""} ${plan.exercises.map((item) => item.exercise.name).join(" ")}`}
          imageKey={[...plan.exercises.map((item) => item.exercise.name), plan.name, plan.muscleGroup ?? ""]}
          label={`Ilustração do ${plan.name}`}
          className="workout-art"
        />
        <div className="workout-card-top"><div className="workout-mark"><Dumbbell size={20} /></div><div className="workout-card-actions"><button className="icon-button" title="Editar treino" onClick={() => setEditingPlanId(plan.id)}><Pencil size={15} /></button><button className={`favorite-button ${plan.isFavorite ? "active" : ""}`} title={plan.isFavorite ? "Remover dos favoritos" : "Favoritar treino"} onClick={() => void toggleFavorite(plan)}><Award size={18} /></button></div></div>
        <div className="eyebrow">{plan.muscleGroup || "ROTINA PERSONALIZADA"}</div><h3>{plan.name}</h3><p>{plan.description || "Seu treino personalizado."}</p>
        <div className="exercise-plan-list">
          {plan.exercises.map((item) => {
            const lastSet = logs?.flatMap((log) => log.sets ?? []).find((set) => set.exerciseId === item.exerciseId && set.loadKg !== null);
            return <div className="plan-exercise" key={item.id}><div><b>{item.exercise.name}</b><span>{item.sets} × {item.reps} · descanso {item.restSeconds}s{item.loadKg !== null ? ` · planejado ${item.loadKg} kg` : ""}</span>{lastSet && <small className="progression-hint">Última carga: {lastSet.loadKg} kg · progrida gradualmente se estiver confortável.</small>}</div><button className="icon-button danger-quiet" aria-label={`Remover ${item.exercise.name}`} onClick={() => void remove(`/workouts/${plan.id}/exercises/${item.id}`, "Exercício removido.")}><X size={15} /></button></div>;
          })}
          {!plan.exercises.length && <span className="muted small-text">Adicione exercícios para montar sua rotina.</span>}
        </div>
        <form className="log-workout-form" onSubmit={(event) => void logWorkout(plan, event)}>
          {!!plan.exercises.length && <div className="workout-load-inputs">{plan.exercises.map((item) => <Field key={item.id} label={`${item.exercise.name} · carga usada (kg)`} name={`load_${item.exerciseId}`} type="number" min={0} step={0.5} defaultValue={item.loadKg ?? undefined} placeholder="Sem carga" />)}</div>}
          <Field label="Duração (min)" name="durationMinutes" type="number" min={1} max={1440} required defaultValue={45} />
          <button type="submit" className="button primary"><Check size={16} /> Concluir treino</button>
        </form>
        <button className="text-button delete-workout" onClick={() => void remove(`/workouts/${plan.id}`, "Treino excluído.")}><Trash2 size={14} /> Excluir treino</button>
      </article>)}</div> : <Empty>Você ainda não criou um treino. Use o formulário acima para começar.</Empty>}
    </Panel>
    <Panel title="Sessões concluídas" action={<span className="subtle-chip">{logs?.length ?? 0} registros</span>}>
      {logsLoading ? <div className="loading">Carregando histórico...</div> : logs?.length ? <div className="simple-record-list">{logs.slice(0, 6).map((log) => <div className="record-row" key={log.id}><FitnessIllustration activity={log.name} imageKey={log.name} label={`Ilustração do treino ${log.name}`} className="activity-art-thumb" /><div className="record-main"><b>{log.name}</b><span>{dateText(log.startedAt)} · {log.durationMinutes} min · {log.sets?.length ?? 0} séries registradas</span>{log.sets?.length ? <small>{log.sets.map((set) => `${set.reps} rep${set.loadKg === null ? "" : ` · ${set.loadKg}kg`}`).join(" · ")}</small> : null}</div><Check className="check-icon" size={16} /></div>)}</div> : <Empty>Os treinos que você concluir serão registrados aqui.</Empty>}
    </Panel>
  </div>;
}

function ActivitiesPage({ version, onSaved, notify }: { version: number; onSaved: (text?: string) => void; notify: (text: string, error?: boolean) => void }) {
  const { data, loading, error } = useLoad<ActivityRecord[]>("/activities", version);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    const selectedType = textField(form, "type");
    const customType = textField(form, "customType");
    if (selectedType === "Outra" && customType.length < 2) return notify("Informe o nome da modalidade personalizada.", true);
    try {
      await api("/activities", { method: "POST", body: JSON.stringify({
        type: selectedType === "Outra" ? customType : selectedType, durationMinutes: numberField(form, "durationMinutes"),
        distanceKm: numberField(form, "distanceKm") ?? null, calories: numberField(form, "calories") ?? null,
        intensity: textField(form, "intensity") || null, date: isoField(form, "date"), notes: textField(form, "notes") || null,
      }) });
      formElement.reset(); onSaved("Atividade registrada.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível registrar a atividade.", true); }
  }
  async function remove(id: string) {
    try { await api(`/activities/${id}`, { method: "DELETE" }); onSaved("Atividade removida."); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível remover.", true); }
  }
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">TODO MOVIMENTO CONTA</div><h1>Atividades</h1><p>Registre diferentes modalidades e acompanhe seu histórico real.</p></div><div className="heading-badge"><ActivityIcon size={18} /> Registro pessoal</div></div>
    {error && <ErrorBanner>{error}</ErrorBanner>}
    <div className="content-two-col activity-layout">
      <Panel title="Registrar uma atividade">
        <form className="form-grid" onSubmit={submit}>
          <SelectField label="Modalidade" name="type" options={[
            ["Musculação", "Musculação"], ["Corrida", "Corrida"], ["Caminhada", "Caminhada"],
            ["Ciclismo", "Ciclismo"], ["Natação", "Natação"], ["Futebol", "Futebol"],
            ["Basquete", "Basquete"], ["Alongamento", "Alongamento"], ["Yoga", "Yoga"],
            ["Pilates", "Pilates"], ["HIIT", "HIIT"], ["Treinamento funcional", "Treinamento funcional"], ["Outra", "Outra modalidade"],
          ]} required />
          <Field label="Outra modalidade (se selecionada)" name="customType" placeholder="Ex.: Patinação" />
          <Field label="Duração (minutos)" name="durationMinutes" type="number" min={1} max={1440} required placeholder="45" />
          <Field label="Distância (km)" name="distanceKm" type="number" min={0} step={0.01} placeholder="Opcional" />
          <Field label="Calorias gastas" name="calories" type="number" min={0} max={10000} placeholder="Estimativa opcional" />
          <SelectField label="Intensidade" name="intensity" options={[["", "Não informada"], ["baixa", "Baixa"], ["moderada", "Moderada"], ["alta", "Alta"]]} />
          <Field label="Data e hora" name="date" type="datetime-local" required defaultValue={dateTimeLocalNow()} />
          <Field label="Observações" name="notes" placeholder="Como você se sentiu?" />
          <div className="form-note">Calorias são opcionais: registre apenas se tiver uma estimativa confiável.</div>
          <SubmitButton>Salvar atividade</SubmitButton>
        </form>
      </Panel>
      <Panel title="Seu histórico" action={<span className="subtle-chip">{data?.length ?? 0} atividades</span>}>
        {loading ? <div className="loading" role="status" aria-live="polite">Carregando...</div> : error ? null : data?.length ? <div className="simple-record-list">{data.map((item) => <div className="record-row" key={item.id}>
          <FitnessIllustration activity={item.type} imageKey={item.type} label={`Ilustração de ${item.type}`} className="activity-art-thumb" />
          <div className="record-main"><b>{item.type}</b><span>{dateText(item.date)} · {item.durationMinutes} min{item.distanceKm ? ` · ${item.distanceKm} km` : ""}{item.calories ? ` · ${item.calories} kcal` : ""}</span>{item.notes && <small>{item.notes}</small>}</div>
          <button className="icon-button danger-quiet" aria-label="Excluir atividade" onClick={() => void remove(item.id)}><Trash2 size={15} /></button>
        </div>)}</div> : <Empty>Você ainda não registrou atividades. Os dados aparecerão aqui após o primeiro registro.</Empty>}
      </Panel>
    </div>
  </div>;
}

function ProgressPage({ version, onSaved, notify }: { version: number; onSaved: (text?: string) => void; notify: (text: string, error?: boolean) => void }) {
  const { data: measurements, error: measurementsError } = useLoad<Measurement[]>("/measurements", version);
  const { data: goals, error: goalsError } = useLoad<Goal[]>("/goals", version);
  async function addMeasurement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    const data = Object.fromEntries(["weightKg", "heightCm", "bodyFatPct", "muscleMassKg", "waistCm", "chestCm", "armCm", "thighCm"].map((key) => [key, numberField(form, key) ?? null]));
    if (Object.values(data).every((value) => value === null)) return notify("Informe pelo menos uma medida corporal.", true);
    try {
      await api("/measurements", { method: "POST", body: JSON.stringify({ ...data, date: isoField(form, "date") }) });
      formElement.reset(); onSaved("Medidas registradas.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível registrar as medidas.", true); }
  }
  async function addGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    const type = textField(form, "type");
    const unit = type === "workouts" ? "treinos" : type === "distance" ? "km" : type === "activity_minutes" ? "min" : type === "hydration_ml" ? "ml" : "kcal";
    try {
      await api("/goals", { method: "POST", body: JSON.stringify({
        type, target: numberField(form, "target"), unit, period: textField(form, "period"),
      }) });
      formElement.reset(); onSaved("Meta criada.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível criar a meta.", true); }
  }
  async function deleteItem(path: string, text: string) {
    try { await api(path, { method: "DELETE" }); onSaved(text); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível excluir.", true); }
  }
  const latest = measurements?.[0];
  const weightChart = useMemo(() => [...(measurements ?? [])].reverse().filter((item) => item.weightKg).map((item) => ({ date: dateText(item.date), weight: item.weightKg })), [measurements]);
  const bmi = latest?.weightKg && (latest.heightCm || latest.heightCm === 0)
    ? Number((latest.weightKg / ((latest.heightCm / 100) ** 2)).toFixed(1)) : null;
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">EVOLUÇÃO SEM PRESSA</div><h1>Evolução e metas</h1><p>Acompanhe seus indicadores e celebre o que você está construindo.</p></div><div className="heading-badge"><TrendingUp size={18} /> Seus dados, seu ritmo</div></div>
    {(measurementsError || goalsError) && <ErrorBanner>{[measurementsError, goalsError].filter(Boolean).join(" ")}</ErrorBanner>}
    <div className="content-two-col">
      <Panel title="Registrar medidas corporais">
        <form className="form-grid" onSubmit={addMeasurement}>
          <Field label="Peso (kg)" name="weightKg" type="number" min={20} max={500} step={0.1} placeholder="Ex.: 72,5" />
          <Field label="Altura (cm)" name="heightCm" type="number" min={50} max={260} step={0.1} placeholder="Opcional" />
          <Field label="Gordura corporal (%)" name="bodyFatPct" type="number" min={0} max={80} step={0.1} placeholder="Opcional" />
          <Field label="Massa muscular (kg)" name="muscleMassKg" type="number" min={0} max={300} step={0.1} placeholder="Opcional" />
          <Field label="Cintura (cm)" name="waistCm" type="number" min={20} max={300} step={0.1} />
          <Field label="Peito (cm)" name="chestCm" type="number" min={20} max={300} step={0.1} />
          <Field label="Braço (cm)" name="armCm" type="number" min={5} max={150} step={0.1} />
          <Field label="Coxa (cm)" name="thighCm" type="number" min={10} max={200} step={0.1} />
          <Field label="Data da medição" name="date" type="datetime-local" required defaultValue={dateTimeLocalNow()} />
          <SubmitButton>Salvar medidas</SubmitButton>
        </form>
        <p className="form-note">O IMC é calculado quando peso e altura estão disponíveis. É um indicador geral e não substitui avaliação profissional.</p>
      </Panel>
      <div className="stack-panels">
        <Panel title="Seu último registro">
          {latest ? <div className="measurement-overview">
            <div className="bmi-card"><span>IMC estimado</span><b>{bmi ?? "—"}</b><small>{bmi ? "Peso ÷ altura²" : "Informe peso e altura"}</small></div>
            <div className="measurement-grid">
              <div><span>Peso</span><b>{latest.weightKg ? `${latest.weightKg} kg` : "—"}</b></div>
              <div><span>Gordura</span><b>{latest.bodyFatPct ? `${latest.bodyFatPct}%` : "—"}</b></div>
              <div><span>Cintura</span><b>{latest.waistCm ? `${latest.waistCm} cm` : "—"}</b></div>
              <div><span>Data</span><b>{dateText(latest.date)}</b></div>
            </div>
          </div> : <Empty>Registre uma medição para acompanhar sua evolução.</Empty>}
        </Panel>
        <Panel title="Evolução do peso">
          {weightChart.length > 1 ? <ResponsiveContainer width="100%" height={180}><AreaChart data={weightChart}><defs><linearGradient id="weight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#19a779" stopOpacity={0.2} /><stop offset="100%" stopColor="#19a779" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} /><YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} /><Tooltip /><Area type="monotone" dataKey="weight" name="Peso (kg)" stroke="#19a779" fill="url(#weight)" /></AreaChart></ResponsiveContainer> : <Empty>Registre duas ou mais medições de peso para ver o gráfico.</Empty>}
        </Panel>
      </div>
    </div>
    <div className="content-two-col">
      <Panel title="Criar uma meta">
        <form className="form-grid" onSubmit={addGoal}>
          <SelectField label="O que deseja acompanhar?" name="type" options={[
            ["workouts", "Treinos realizados"], ["distance", "Distância percorrida"], ["activity_minutes", "Tempo de atividade"], ["hydration_ml", "Ingestão de água"], ["calories", "Calorias ativas"],
          ]} />
          <Field label="Meta" name="target" type="number" min={1} step={0.1} required placeholder="Ex.: 3" />
          <SelectField label="Período" name="period" options={[["weekly", "Semanal"], ["daily", "Diária"], ["monthly", "Mensal"]]} />
          <SubmitButton>Adicionar meta</SubmitButton>
        </form>
      </Panel>
      <Panel title="Metas definidas" action={<span className="subtle-chip">{goals?.length ?? 0} metas</span>}>
        {goals?.length ? <div className="simple-record-list">{goals.map((goal) => <div className="record-row" key={goal.id}>
          <span className="record-icon purple"><Award size={16} /></span><div className="record-main"><b>{goal.type === "workouts" ? "Treinos" : goal.type === "distance" ? "Distância" : goal.type === "hydration_ml" ? "Hidratação" : goal.type === "activity_minutes" ? "Tempo ativo" : "Calorias"} · {goal.period === "weekly" ? "semana" : goal.period === "monthly" ? "mês" : "dia"}</b><span>Objetivo: {goal.target} {goal.unit}</span></div>
          <button className="icon-button danger-quiet" aria-label="Excluir meta" onClick={() => void deleteItem(`/goals/${goal.id}`, "Meta removida.")}><Trash2 size={15} /></button>
        </div>)}</div> : <Empty>Você ainda não definiu metas pessoais.</Empty>}
      </Panel>
    </div>
    <Panel title="Medições anteriores">
      {measurements?.length ? <div className="table-wrap"><table><thead><tr><th>Data</th><th>Peso</th><th>Gordura</th><th>Massa muscular</th><th>Cintura</th><th></th></tr></thead><tbody>{measurements.slice(0, 20).map((item) => <tr key={item.id}><td>{dateText(item.date)}</td><td>{item.weightKg ? `${item.weightKg} kg` : "—"}</td><td>{item.bodyFatPct ? `${item.bodyFatPct}%` : "—"}</td><td>{item.muscleMassKg ? `${item.muscleMassKg} kg` : "—"}</td><td>{item.waistCm ? `${item.waistCm} cm` : "—"}</td><td><button className="icon-button danger-quiet" aria-label="Excluir medição" onClick={() => void deleteItem(`/measurements/${item.id}`, "Medição removida.")}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div> : <Empty>Seu histórico de medidas aparecerá aqui.</Empty>}
    </Panel>
  </div>;
}

function CalendarPage({ version, onSaved, notify }: { version: number; onSaved: (text?: string) => void; notify: (text: string, error?: boolean) => void }) {
  const { data, loading, error } = useLoad<Scheduled[]>("/schedule", version);
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifiedReminders = useRef(new Set<string>());
  useEffect(() => {
    setNotificationsEnabled("Notification" in window && Notification.permission === "granted");
  }, []);
  useEffect(() => {
    if (!data || !notificationsEnabled) return;
    const checkReminders = () => {
      const now = Date.now();
      data.forEach((item) => {
        const scheduledAt = new Date(item.scheduledAt).getTime();
        if (item.status !== "scheduled" || scheduledAt > now || scheduledAt < now - 60_000 || notifiedReminders.current.has(item.id)) return;
        try {
          new Notification(`Hora de se movimentar: ${item.title}`, { body: `${item.type} · ${timeText(item.scheduledAt)}` });
          notifiedReminders.current.add(item.id);
        } catch {
          notify("Não foi possível exibir a notificação do navegador.", true);
        }
      });
    };
    checkReminders();
    const interval = window.setInterval(checkReminders, 30_000);
    return () => window.clearInterval(interval);
  }, [data, notificationsEnabled, notify]);
  async function enableNotifications() {
    if (!("Notification" in window)) return notify("Este navegador não oferece notificações.", true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      notify(permission === "granted" ? "Lembretes ativados enquanto o aplicativo estiver aberto." : "Permissão para notificações não concedida.", permission !== "granted");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível solicitar permissão para notificações.", true);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await api("/schedule", { method: "POST", body: JSON.stringify({ title: textField(form, "title"), type: textField(form, "type"), scheduledAt: isoField(form, "scheduledAt"), notes: textField(form, "notes") || null }) });
      formElement.reset(); onSaved("Treino agendado.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível criar o agendamento.", true); }
  }
  async function update(item: Scheduled, status: string) {
    try { await api(`/schedule/${item.id}`, { method: "PATCH", body: JSON.stringify({ status }) }); onSaved(status === "completed" ? "Treino marcado como concluído." : "Agendamento atualizado."); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível atualizar.", true); }
  }
  async function reschedule(event: FormEvent<HTMLFormElement>, item: Scheduled) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(`/schedule/${item.id}`, { method: "PATCH", body: JSON.stringify({ scheduledAt: isoField(form, "scheduledAt"), status: "scheduled" }) });
      setRescheduling(null);
      onSaved("Agendamento atualizado.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível reagendar.", true); }
  }
  async function remove(id: string) {
    try { await api(`/schedule/${id}`, { method: "DELETE" }); onSaved("Agendamento removido."); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível remover.", true); }
  }
  const grouped = useMemo(() => {
    const groups = new Map<string, Scheduled[]>();
    (data ?? []).forEach((item) => { const day = new Date(item.scheduledAt).toLocaleDateString("pt-BR"); groups.set(day, [...(groups.get(day) ?? []), item]); });
    return [...groups.entries()];
  }, [data]);
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">PLANEJE COM LEVEZA</div><h1>Agenda de treinos</h1><p>Organize sua semana e reagende quando precisar.</p></div><button className="button" onClick={() => void enableNotifications()} disabled={notificationsEnabled}><Bell size={15} /> {notificationsEnabled ? "Lembretes ativos" : "Ativar lembretes"}</button></div>
    {error && <ErrorBanner>{error}</ErrorBanner>}
    <div className="content-two-col">
      <Panel title="Programar atividade">
        <form className="form-grid" onSubmit={submit}>
          <Field label="Nome" name="title" required placeholder="Ex.: Corrida leve" />
          <SelectField label="Modalidade" name="type" options={[["Musculação", "Musculação"], ["Corrida", "Corrida"], ["Caminhada", "Caminhada"], ["Ciclismo", "Ciclismo"], ["Natação", "Natação"], ["Yoga", "Yoga"], ["Outra", "Outra"]]} />
          <Field label="Data e horário" name="scheduledAt" type="datetime-local" required defaultValue={dateTimeLocalNow()} />
          <Field label="Observações" name="notes" placeholder="Opcional" />
          <SubmitButton>Adicionar à agenda</SubmitButton>
        </form>
      </Panel>
      <Panel title="Sua programação" action={<span className="subtle-chip">{data?.filter((item) => item.status === "scheduled").length ?? 0} pendentes</span>}>
        {loading ? <div className="loading" role="status" aria-live="polite">Carregando agenda...</div> : error ? null : grouped.length ? <div className="agenda-list">{grouped.map(([day, items]) => <div className="agenda-day" key={day}>
          <div className="agenda-date"><span>{day}</span><i /></div>
          {items.map((item) => <article className={`agenda-event ${item.status}`} key={item.id}>
            <div className="event-time">{timeText(item.scheduledAt)}</div><div className="event-body"><b>{item.title}</b><span>{item.type}{item.notes ? ` · ${item.notes}` : ""}</span><span className={`event-status ${item.status}`}>{item.status === "completed" ? "Concluído" : item.status === "cancelled" ? "Cancelado" : "Programado"}</span>
              {rescheduling === item.id && <form className="reschedule-form" onSubmit={(event) => void reschedule(event, item)}><input name="scheduledAt" aria-label="Nova data e horário" type="datetime-local" required defaultValue={dateTimeLocal(item.scheduledAt)} /><button className="button primary" type="submit">Salvar</button><button className="button" type="button" onClick={() => setRescheduling(null)}>Cancelar</button></form>}
            </div>
            <div className="event-actions">{item.status === "scheduled" && <><button className="icon-button" title="Marcar como concluído" onClick={() => void update(item, "completed")}><Check size={16} /></button><button className="icon-button" title="Reagendar" onClick={() => setRescheduling(rescheduling === item.id ? null : item.id)}><CalendarDays size={15} /></button><button className="icon-button" title="Cancelar agendamento" onClick={() => void update(item, "cancelled")}><X size={16} /></button></>}<button className="icon-button danger-quiet" title="Excluir agendamento" onClick={() => void remove(item.id)}><Trash2 size={15} /></button></div>
          </article>)}
        </div>)}</div> : <Empty>Você ainda não tem atividades na agenda.</Empty>}
      </Panel>
    </div>
  </div>;
}

function NutritionPage({ version, onSaved, notify }: {
  version: number;
  onSaved: (text?: string) => void;
  notify: (text: string, error?: boolean) => void;
}) {
  const { data: meals, error: mealsError } = useLoad<Meal[]>("/meals", version);
  const { data: water, error: waterError } = useLoad<WaterEntry[]>("/water", version);
  const { data: goals, error: goalsError } = useLoad<Goal[]>("/goals", version);
  const { data: foods, error: foodsError } = useLoad<Food[]>("/foods", version);
  const today = new Date().toDateString();
  const waterToday = (water ?? []).filter((entry) => new Date(entry.recordedAt).toDateString() === today).reduce((sum, item) => sum + item.amountMl, 0);
  const waterGoal = goals?.find((goal) => goal.active && goal.type === "hydration_ml" && goal.period === "daily");
  const waterTarget = waterGoal?.target ?? 2500;
  const mealsToday = (meals ?? []).filter((meal) => new Date(meal.recordedAt).toDateString() === today);
  async function submitFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await api("/foods", { method: "POST", body: JSON.stringify({
        name: textField(form, "name"), calories: numberField(form, "calories") ?? 0,
        proteinG: numberField(form, "proteinG") ?? 0, carbsG: numberField(form, "carbsG") ?? 0,
        fatG: numberField(form, "fatG") ?? 0,
      }) });
      formElement.reset(); onSaved("Alimento salvo na sua lista pessoal.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível salvar o alimento.", true); }
  }
  async function submitMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await api("/meals", { method: "POST", body: JSON.stringify({
        name: textField(form, "name"), mealType: textField(form, "mealType"),
        foodId: textField(form, "foodId") || null, amountG: numberField(form, "amountG") ?? 100,
        calories: numberField(form, "calories") ?? 0, proteinG: numberField(form, "proteinG") ?? 0,
        carbsG: numberField(form, "carbsG") ?? 0, fatG: numberField(form, "fatG") ?? 0,
        recordedAt: isoField(form, "recordedAt"), notes: textField(form, "notes") || null,
      }) });
      formElement.reset(); onSaved("Refeição registrada.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível registrar a refeição.", true); }
  }
  async function addWater(amountMl: number) {
    try { await api("/water", { method: "POST", body: JSON.stringify({ amountMl }) }); onSaved(`${amountMl} ml de água registrados.`); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível registrar água.", true); }
  }
  async function remove(path: string, message: string) {
    try { await api(path, { method: "DELETE" }); onSaved(message); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível excluir.", true); }
  }
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">CUIDADO TAMBÉM É ROTINA</div><h1>Alimentação e água</h1><p>Registre o que consumir. Estimativas nutricionais são informadas por você.</p></div><div className="heading-badge"><Apple size={18} /> Bem-estar</div></div>
    {(mealsError || waterError || goalsError || foodsError) && <ErrorBanner>{[mealsError, waterError, goalsError, foodsError].filter(Boolean).join(" ")}</ErrorBanner>}
    <div className="nutrition-top-grid">
      <Panel title="Hidratação de hoje" className="water-panel">
        <div className="hydration-card"><div className="hydration-number">{(waterToday / 1000).toFixed(1)} <span>L</span></div><p>{waterGoal ? `Meta diária: ${waterTarget.toLocaleString("pt-BR")} ml` : "Volume registrado hoje"}</p><div className="water-progress"><div style={{ width: `${Math.min(100, waterToday / waterTarget * 100)}%` }} /></div><small>{waterGoal ? "Acompanhe o progresso da meta definida no seu perfil." : "A referência visual de 2,5 L é apenas informativa. Defina uma meta adequada às suas necessidades."}</small>
          <div className="water-buttons"><button className="button water-add" onClick={() => void addWater(250)}><Plus size={16} /> 250 ml</button><button className="button water-add" onClick={() => void addWater(500)}><Plus size={16} /> 500 ml</button></div>
        </div>
      </Panel>
      <Panel title="Resumo alimentar de hoje">
        <div className="nutrition-totals"><div><span>Calorias</span><b>{Math.round(mealsToday.reduce((sum, item) => sum + item.calories, 0))}<small> kcal</small></b></div><div><span>Proteínas</span><b>{Math.round(mealsToday.reduce((sum, item) => sum + item.proteinG, 0))}<small> g</small></b></div><div><span>Carboidratos</span><b>{Math.round(mealsToday.reduce((sum, item) => sum + item.carbsG, 0))}<small> g</small></b></div><div><span>Gorduras</span><b>{Math.round(mealsToday.reduce((sum, item) => sum + item.fatG, 0))}<small> g</small></b></div></div>
        <div className="nutrition-disclaimer"><ShieldCheck size={16} /><span>Informações registradas pelo usuário; não substituem orientação nutricional.</span></div>
      </Panel>
    </div>
    <div className="content-two-col">
      <div className="stack-panels">
        <Panel title="Minha lista de alimentos" action={<span className="subtle-chip">Nutrientes por 100 g</span>}>
          <form className="form-grid" onSubmit={submitFood}>
            <Field label="Nome do alimento" name="name" required placeholder="Ex.: Iogurte natural" />
            <Field label="Calorias (kcal)" name="calories" type="number" min={0} step={1} defaultValue={0} required />
            <Field label="Proteínas (g)" name="proteinG" type="number" min={0} step={0.1} defaultValue={0} required />
            <Field label="Carboidratos (g)" name="carbsG" type="number" min={0} step={0.1} defaultValue={0} required />
            <Field label="Gorduras (g)" name="fatG" type="number" min={0} step={0.1} defaultValue={0} required />
            <SubmitButton>Salvar alimento</SubmitButton>
          </form>
          {foods?.length ? <div className="food-list">{foods.map((food) => <div className="food-row" key={food.id}><div><b>{food.name}</b><span>{food.calories} kcal · P {food.proteinG}g · C {food.carbsG}g · G {food.fatG}g / 100 g</span></div><button className="icon-button danger-quiet" aria-label={`Excluir ${food.name}`} onClick={() => void remove(`/foods/${food.id}`, "Alimento removido da lista.")}><Trash2 size={14} /></button></div>)}</div> : <p className="form-note">Salve alimentos para calcular os nutrientes conforme a porção.</p>}
        </Panel>
        <Panel title="Registrar refeição">
          <form className="form-grid" onSubmit={submitMeal}>
            <Field label="Nome da refeição" name="name" required placeholder="Ex.: Almoço" />
            <SelectField label="Tipo" name="mealType" options={[["cafe_da_manha", "Café da manhã"], ["almoco", "Almoço"], ["jantar", "Jantar"], ["lanche", "Lanche"], ["outro", "Outro"]]} />
            <SelectField label="Alimento salvo (opcional)" name="foodId" options={[["", "Informar nutrientes manualmente"], ...(foods ?? []).map((food) => [food.id, food.name] as [string, string])]} />
            <Field label="Porção do alimento (g)" name="amountG" type="number" min={0.1} step={0.1} defaultValue={100} />
            <Field label="Calorias (kcal)" name="calories" type="number" min={0} step={1} defaultValue={0} />
            <Field label="Proteínas (g)" name="proteinG" type="number" min={0} step={0.1} defaultValue={0} />
            <Field label="Carboidratos (g)" name="carbsG" type="number" min={0} step={0.1} defaultValue={0} />
            <Field label="Gorduras (g)" name="fatG" type="number" min={0} step={0.1} defaultValue={0} />
            <Field label="Data e hora" name="recordedAt" type="datetime-local" required defaultValue={dateTimeLocalNow()} />
            <Field label="Observações" name="notes" placeholder="Opcional" />
            <div className="form-note">Ao selecionar um alimento salvo, os nutrientes são calculados pela porção informada.</div>
            <SubmitButton>Salvar refeição</SubmitButton>
          </form>
        </Panel>
      </div>
      <Panel title="Histórico alimentar" action={<span className="subtle-chip">{meals?.length ?? 0} refeições</span>}>
        {meals?.length ? <div className="simple-record-list">{meals.map((meal) => <div className="record-row" key={meal.id}><span className="record-icon orange"><Apple size={16} /></span><div className="record-main"><b>{meal.name}</b><span>{meal.mealType.replaceAll("_", " ")} · {dateText(meal.recordedAt)} · {meal.calories} kcal</span><small>P {meal.proteinG}g · C {meal.carbsG}g · G {meal.fatG}g</small></div><button className="icon-button danger-quiet" aria-label="Excluir refeição" onClick={() => void remove(`/meals/${meal.id}`, "Refeição removida.")}><Trash2 size={15} /></button></div>)}</div> : <Empty>Suas refeições registradas aparecerão aqui.</Empty>}
      </Panel>
    </div>
    <Panel title="Registros de água">
      {water?.length ? <div className="water-history">{water.slice(0, 12).map((entry) => <div className="water-entry" key={entry.id}><span className="water-icon"><Droplets size={16} /></span><b>{entry.amountMl} ml</b><span>{dateText(entry.recordedAt)} · {timeText(entry.recordedAt)}</span><button className="icon-button danger-quiet" aria-label="Excluir registro de água" onClick={() => void remove(`/water/${entry.id}`, "Registro de água removido.")}><X size={14} /></button></div>)}</div> : <Empty>Registre água pelos botões acima para acompanhar sua hidratação.</Empty>}
    </Panel>
  </div>;
}

function CalorieCalculatorPage({ version, profile }: { version: number; profile: Profile | null }) {
  const { data: meals } = useLoad<Meal[]>("/meals", version);
  const [calorieInput, setCalorieInput] = useState<CalorieCalculatorInput>(() => ({
    age: sliderValue(profile?.age, 13, 120, 30),
    heightCm: sliderValue(profile?.heightCm, 100, 250, 170),
    weightKg: sliderValue(profile?.weightKg, 30, 350, 70, 0.5),
    formulaFactor: "",
    activityLevel: "",
    goal: "maintain",
  }));
  const calorieEstimate = estimateCalories(calorieInput);
  const today = new Date().toDateString();
  const caloriesConsumedToday = Math.round((meals ?? [])
    .filter((meal) => new Date(meal.recordedAt).toDateString() === today)
    .reduce((sum, meal) => sum + meal.calories, 0));

  return <div className="page-content calorie-calculator-page">
    <div className="page-heading">
      <div>
        <div className="eyebrow">SUA REFERÊNCIA DIÁRIA</div>
        <h1>Calculadora de calorias</h1>
        <p>Preencha seus dados e receba uma estimativa personalizada, passo a passo.</p>
      </div>
      <div className="heading-badge"><Calculator aria-hidden="true" size={18} /> Para adultos</div>
    </div>
    <Panel title="1. Seus dados" action={<span className="subtle-chip">Ajuste os controles deslizantes</span>} className="calorie-calculator">
      <p className="calculator-intro">Idade, peso e altura vêm do seu perfil quando disponíveis. Arraste cada barra para ajustar; também é possível usar as setas do teclado.</p>
      <div className="calorie-calculator-layout">
        <div className="calorie-calculator-inputs">
          <label className="field">
            <span>Idade (anos)</span>
            <div className="range-value"><output htmlFor="calorie-age">{calorieInput.age} anos</output></div>
            <input className="range-input" id="calorie-age" type="range" min={13} max={120} step={1} value={calorieInput.age}
              aria-valuetext={`${calorieInput.age} anos`}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setCalorieInput((current) => ({ ...current, age: value }));
            }} />
          </label>
          <label className="field">
            <span>Peso (kg)</span>
            <div className="range-value"><output htmlFor="calorie-weight">{calorieInput.weightKg.toLocaleString("pt-BR")} kg</output></div>
            <input className="range-input" id="calorie-weight" type="range" min={30} max={350} step={0.5} value={calorieInput.weightKg}
              aria-valuetext={`${calorieInput.weightKg.toLocaleString("pt-BR")} quilogramas`}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setCalorieInput((current) => ({ ...current, weightKg: value }));
            }} />
          </label>
          <label className="field">
            <span>Altura (cm)</span>
            <div className="range-value"><output htmlFor="calorie-height">{calorieInput.heightCm} cm</output></div>
            <input className="range-input" id="calorie-height" type="range" min={100} max={250} step={1} value={calorieInput.heightCm}
              aria-valuetext={`${calorieInput.heightCm} centímetros`}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setCalorieInput((current) => ({ ...current, heightCm: value }));
            }} />
          </label>
          <label className="field">
            <span>Fator da fórmula</span>
            <select value={calorieInput.formulaFactor} onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === "female" || value === "male" || value === "") {
                setCalorieInput((current) => ({ ...current, formulaFactor: value }));
              }
            }}>
              <option value="">Selecione</option>
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
            </select>
            <small>Escolha o fator fisiológico da equação Mifflin–St Jeor que melhor se aplica a você.</small>
          </label>
          <label className="field">
            <span>Nível de atividade</span>
            <select value={calorieInput.activityLevel} onChange={(event) => {
              const value = event.currentTarget.value;
              setCalorieInput((current) => ({ ...current, activityLevel: value }));
            }}>
              <option value="">Selecione</option>
              {activityLevels.map((level) => <option value={level.value} key={level.value}>{level.label} — {level.description}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Objetivo</span>
            <select value={calorieInput.goal} onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === "lose" || value === "maintain" || value === "gain") {
                setCalorieInput((current) => ({ ...current, goal: value }));
              }
            }}>
              <option value="lose">Reduzir peso gradualmente (−300 kcal/dia)</option>
              <option value="maintain">Manter o peso</option>
              <option value="gain">Aumentar peso gradualmente (+300 kcal/dia)</option>
            </select>
          </label>
        </div>
        <section className="calorie-calculator-results" aria-labelledby="calorie-result-title">
          <h2 id="calorie-result-title">2. Sua estimativa</h2>
          {calorieEstimate ? <>
            <div className="calorie-target"><span>Referência diária para seu objetivo</span><strong>{calorieEstimate.targetCalories.toLocaleString("pt-BR")} <small>kcal</small></strong></div>
            <dl className="calorie-estimate-list">
              <div><dt>Gasto em repouso estimado</dt><dd>{calorieEstimate.restingCalories.toLocaleString("pt-BR")} kcal</dd></div>
              <div><dt>Manutenção estimada</dt><dd>{calorieEstimate.maintenanceCalories.toLocaleString("pt-BR")} kcal/dia</dd></div>
              <div><dt>IMC estimado</dt><dd>{calorieEstimate.bmi.toFixed(1)}</dd></div>
            </dl>
            <div className="macro-suggestions">
              <h3>Sugestão aproximada de macronutrientes</h3>
              <div><span>Proteínas</span><b>{calorieEstimate.proteinGrams} g</b></div>
              <div><span>Carboidratos</span><b>{calorieEstimate.carbohydrateGrams} g</b></div>
              <div><span>Gorduras</span><b>{calorieEstimate.fatGrams} g</b></div>
            </div>
            <p className="calculator-intake">Registrado hoje: <strong>{caloriesConsumedToday.toLocaleString("pt-BR")} kcal</strong> · diferença para a referência: <strong>{Math.abs(calorieEstimate.targetCalories - caloriesConsumedToday).toLocaleString("pt-BR")} kcal {calorieEstimate.targetCalories >= caloriesConsumedToday ? "restantes" : "acima"}</strong></p>
          </> : calorieInput.age < 18
            ? <p className="calculator-guidance" role="status" aria-live="polite">Esta calculadora usa uma fórmula para adultos e não calcula metas para menores de 18 anos. Procure um profissional de saúde para orientação individualizada.</p>
            : <p className="calculator-guidance" role="status" aria-live="polite">Preencha idade, peso, altura, fator da fórmula e nível de atividade para ver sua estimativa.</p>}
        </section>
      </div>
    </Panel>
    <p className="calculator-disclaimer">Estimativa baseada na equação Mifflin–St Jeor e em fatores gerais de atividade; não é avaliação clínica nem prescrição nutricional. O IMC é apenas uma referência populacional. As sugestões de macros são aproximadas. Necessidades variam entre pessoas: converse com nutricionista ou profissional de saúde antes de mudar sua alimentação. Não use esta estimativa para orientar crianças ou adolescentes.</p>
  </div>;
}

function LibraryPage({ version, onSaved, notify }: { version: number; onSaved: (text?: string) => void; notify: (text: string, error?: boolean) => void }) {
  const { data, loading, error } = useLoad<Exercise[]>("/exercises", version);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("Todos");
  const groups = useMemo(() => ["Todos", ...new Set((data ?? []).map((item) => item.muscleGroup))], [data]);
  const filtered = (data ?? []).filter((item) => (group === "Todos" || item.muscleGroup === group) && `${item.name} ${item.description} ${item.equipment ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await api("/exercises", { method: "POST", body: JSON.stringify({
        name: textField(form, "name"), muscleGroup: textField(form, "muscleGroup"),
        type: textField(form, "type"), equipment: textField(form, "equipment") || null,
        level: textField(form, "level"), modality: textField(form, "modality"),
        description: textField(form, "description"), instructions: textField(form, "instructions"),
      }) });
      formElement.reset(); onSaved("Exercício adicionado à sua biblioteca.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível adicionar o exercício.", true); }
  }
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">MOVIMENTO COM INTENÇÃO</div><h1>Biblioteca de exercícios</h1><p>Explore movimentos, grupos musculares e instruções de execução.</p></div><div className="heading-badge"><Dumbbell size={18} /> {data?.length ?? 0} exercícios</div></div>
    {error && <ErrorBanner>{error}</ErrorBanner>}
    <Panel title="Adicionar exercício personalizado">
      <form className="form-grid library-form" onSubmit={submit}>
        <Field label="Nome" name="name" required placeholder="Ex.: Agachamento goblet" /><Field label="Grupo muscular" name="muscleGroup" required placeholder="Ex.: Pernas" />
        <Field label="Tipo" name="type" required placeholder="Ex.: Composto" /><Field label="Equipamento" name="equipment" placeholder="Halteres, barra..." />
        <SelectField label="Nível" name="level" options={[["Iniciante", "Iniciante"], ["Intermediário", "Intermediário"], ["Avançado", "Avançado"]]} /><Field label="Modalidade" name="modality" defaultValue="Musculação" required />
        <Field label="Descrição" name="description" required placeholder="Breve descrição do exercício" /><Field label="Instruções" name="instructions" required placeholder="Passos principais para execução" />
        <SubmitButton>Adicionar à biblioteca</SubmitButton>
      </form>
    </Panel>
    <Panel title="Todos os exercícios" action={<label className="search-field"><Search aria-hidden="true" size={15} /><input aria-label="Buscar exercício por nome ou equipamento" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou equipamento" /></label>}>
      <div className="filter-chips">{groups.map((item) => <button key={item} type="button" aria-pressed={group === item} className={`filter-chip ${group === item ? "active" : ""}`} onClick={() => setGroup(item)}>{item}</button>)}</div>
      {loading ? <div className="loading" role="status" aria-live="polite">Carregando exercícios...</div> : error ? null : filtered.length ? <div className="exercise-grid">{filtered.map((item) => <article className="exercise-card" key={item.id}>
        <FitnessIllustration activity={`${item.name} ${item.muscleGroup} ${item.modality}`} imageKey={item.name} label={`Ilustração do exercício ${item.name}`} className="exercise-art" /><div className="exercise-meta"><span>{item.muscleGroup}</span><span>{item.level}</span></div><h3>{item.name}</h3><p>{item.description}</p><div className="exercise-instructions"><b>Execução</b><span>{item.instructions}</span></div><div className="exercise-equipment">{item.equipment || "Peso corporal"} <span>·</span> {item.modality}</div>
        {item.createdById && <button className="text-button delete-workout" onClick={() => void api(`/exercises/${item.id}`, { method: "DELETE" }).then(() => onSaved("Exercício removido.")).catch((error: unknown) => notify(error instanceof Error ? error.message : "Não foi possível remover.", true))}><Trash2 size={14} /> Excluir exercício</button>}
      </article>)}</div> : <Empty>Nenhum exercício corresponde aos filtros.</Empty>}
    </Panel>
  </div>;
}

function ReportsPage({ version, notify }: { version: number; notify: (text: string, error?: boolean) => void }) {
  const [period, setPeriod] = useState("month");
  const { data, loading, error } = useLoad<ReportData>(`/reports?period=${period}`, version);
  function exportCsv(type: string) {
    window.location.href = `/api/reports/export.csv?type=${type}`;
    notify("A exportação CSV foi iniciada.");
  }
  const activityChart = useMemo(() => {
    const buckets = new Map<string, { day: string; minutes: number; calories: number; distance: number }>();
    data?.activities.forEach((item) => {
      const day = new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      const row = buckets.get(day) ?? { day, minutes: 0, calories: 0, distance: 0 };
      row.minutes += item.durationMinutes; row.calories += item.calories ?? 0; row.distance += item.distanceKm ?? 0;
      buckets.set(day, row);
    });
    return [...buckets.values()];
  }, [data]);
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">DADOS QUE MOSTRAM SUA JORNADA</div><h1>Relatórios</h1><p>Estatísticas construídas somente com os registros que você salvou.</p></div><div className="report-actions"><label className="period-picker"><span>Período</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="week">7 dias</option><option value="month">30 dias</option><option value="year">12 meses</option></select></label><button className="button" onClick={() => window.print()}><Printer size={15} /> Salvar em PDF</button></div></div>
    {error ? <ErrorBanner>{error}</ErrorBanner> : loading || !data ? <div className="loading" role="status" aria-live="polite">Calculando seus relatórios...</div> : <>
      <div className="stats-grid report-stats">
        <div className="stat-card"><div className="stat-icon blue"><Clock3 size={19} /></div><div className="stat-label">Tempo em movimento</div><div className="stat-value">{data.totals.activityMinutes}<span>min</span></div></div>
        <div className="stat-card"><div className="stat-icon orange"><Flame size={19} /></div><div className="stat-label">Calorias registradas</div><div className="stat-value">{data.totals.caloriesBurned.toLocaleString("pt-BR")}<span>kcal</span></div></div>
        <div className="stat-card"><div className="stat-icon green"><Footprints size={19} /></div><div className="stat-label">Distância percorrida</div><div className="stat-value">{data.totals.distanceKm.toFixed(1)}<span>km</span></div></div>
        <div className="stat-card"><div className="stat-icon purple"><Dumbbell size={19} /></div><div className="stat-label">Treinos concluídos</div><div className="stat-value">{data.totals.workouts}<span>sessões</span></div></div>
      </div>
      <div className="content-two-col">
        <Panel title="Atividade registrada" action={<span className="subtle-chip">{period === "week" ? "7 dias" : period === "year" ? "12 meses" : "30 dias"}</span>}>
          {activityChart.length ? <>
            <div aria-hidden="true"><ResponsiveContainer width="100%" height={270}><AreaChart data={activityChart}><defs><linearGradient id="report" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3378ec" stopOpacity={0.2} /><stop offset="100%" stopColor="#3378ec" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} /><Tooltip /><Area type="monotone" dataKey="minutes" name="Minutos ativos" stroke="#3378ec" strokeWidth={2.5} fill="url(#report)" /></AreaChart></ResponsiveContainer></div>
            <div className="visually-hidden">
              <p>Minutos ativos por dia no período selecionado:</p>
              <ul>{activityChart.map((entry) => <li key={entry.day}>{entry.day}: {entry.minutes} minutos</li>)}</ul>
            </div>
          </> : <Empty>Registre atividades para gerar seus gráficos.</Empty>}
        </Panel>
        <Panel title="Exportar seus dados">
          <p className="muted">Baixe seus registros em CSV para guardar ou analisar em outra ferramenta.</p>
          <div className="export-list"><button className="export-row" onClick={() => exportCsv("activities")}><span className="export-icon blue"><ActivityIcon size={17} /></span><span><b>Atividades</b><small>Modalidade, duração, distância e calorias</small></span><ArrowDownToLine size={17} /></button><button className="export-row" onClick={() => exportCsv("measurements")}><span className="export-icon green"><Weight size={17} /></span><span><b>Medidas corporais</b><small>Peso, medidas e composição corporal</small></span><ArrowDownToLine size={17} /></button><button className="export-row" onClick={() => exportCsv("workouts")}><span className="export-icon purple"><Dumbbell size={17} /></span><span><b>Treinos concluídos</b><small>Histórico de sessões e duração</small></span><ArrowDownToLine size={17} /></button></div>
          <div className="form-note">A exportação inclui apenas seus próprios registros.</div>
        </Panel>
      </div>
      <Panel title="Registros do período">
        {data.activities.length || data.workouts.length ? <div className="simple-record-list">{[...data.activities.map((item) => ({ id: item.id, name: item.type, date: item.date, detail: `${item.durationMinutes} min${item.distanceKm ? ` · ${item.distanceKm} km` : ""}` })), ...data.workouts.map((item) => ({ id: item.id, name: item.name, date: item.startedAt, detail: `${item.durationMinutes} min · treino` }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12).map((item) => <div className="record-row" key={item.id}><span className="record-icon blue"><ActivityIcon size={16} /></span><div className="record-main"><b>{item.name}</b><span>{dateText(item.date)} · {item.detail}</span></div></div>)}</div> : <Empty>Nenhum registro no período selecionado.</Empty>}
      </Panel>
    </>}
  </div>;
}

function ProfilePage({ user, onUpdated, onLogout, notify, highContrast, onHighContrastChange }: {
  user: User; onUpdated: (user: User) => void; onLogout: () => void;
  notify: (text: string, error?: boolean) => void; highContrast: boolean; onHighContrastChange: (enabled: boolean) => void;
}) {
  const [theme, setTheme] = useState(user.profile?.theme ?? "light");
  const [avatarBusy, setAvatarBusy] = useState(false);
  async function saveAvatar(avatarData: string | null) {
    setAvatarBusy(true);
    try {
      const result = await api<User>("/profile", { method: "PATCH", body: JSON.stringify({ avatarData }) });
      onUpdated(result);
      notify(avatarData ? "Foto de perfil atualizada." : "Foto de perfil removida.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível atualizar a foto de perfil.", true);
    } finally {
      setAvatarBusy(false);
    }
  }
  async function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Escolha uma imagem JPEG, PNG ou WebP.");
      }
      if (file.size > 10 * 1024 * 1024) throw new Error("A imagem original deve ter no máximo 10 MB.");
      const avatarData = await resizeProfileImage(file);
      await saveAvatar(avatarData);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível preparar a imagem.", true);
    } finally {
      input.value = "";
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try {
      const result = await api<User>("/profile", { method: "PATCH", body: JSON.stringify({
        name: textField(form, "name"), age: numberField(form, "age") ?? null,
        heightCm: numberField(form, "heightCm") ?? null, weightKg: numberField(form, "weightKg") ?? null,
        goal: textField(form, "goal") || null, experience: textField(form, "experience") || null,
        preferences: textField(form, "preferences") || null, theme, isPrivate: form.get("isPrivate") === "on",
      }) });
      onUpdated(result); notify("Perfil atualizado.");
    } catch (error) { notify(error instanceof Error ? error.message : "Não foi possível atualizar o perfil.", true); }
  }
  const profile = user.profile;
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">SEU PERFIL E SUAS PREFERÊNCIAS</div><h1>Meu perfil</h1><p>Personalize sua experiência e mantenha seus dados atualizados.</p></div><div className="heading-badge"><ShieldCheck size={18} /> Conta protegida</div></div>
    <div className="profile-layout">
      <Panel title="Informações pessoais">
        <div className="profile-identity">
          <div className="avatar">{profile?.avatarData ? <img src={profile.avatarData} alt={`Foto de perfil de ${user.name}`} /> : <span aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>}</div>
          <div className="profile-identity-details"><h3>{user.name}</h3><span>{user.email}</span><small><ShieldCheck size={13} /> Dados privados</small>
            <div className="profile-photo-actions">
              <input className="visually-hidden" id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="profile-photo-help" disabled={avatarBusy} onChange={(event) => void selectAvatar(event)} />
              <label className="button profile-photo-upload" htmlFor="profile-photo" aria-disabled={avatarBusy}><Camera aria-hidden="true" size={15} />{avatarBusy ? "Enviando..." : profile?.avatarData ? "Alterar foto" : "Adicionar foto"}</label>
              {profile?.avatarData && <button className="button profile-photo-remove" type="button" disabled={avatarBusy} onClick={() => void saveAvatar(null)}><Trash2 aria-hidden="true" size={15} /> Remover</button>}
            </div>
            <span className="profile-photo-help" id="profile-photo-help">JPEG, PNG ou WebP. A imagem é redimensionada automaticamente.</span>
          </div>
        </div>
        <form className="form-grid" onSubmit={submit}>
          <Field label="Nome" name="name" required defaultValue={user.name} />
          <label className="field"><span>E-mail</span><input type="email" value={user.email} disabled /><small>O e-mail da conta não pode ser alterado aqui.</small></label>
          <Field label="Idade" name="age" type="number" min={13} max={120} defaultValue={profile?.age ?? undefined} placeholder="Opcional" />
          <Field label="Altura (cm)" name="heightCm" type="number" min={50} max={260} step={0.1} defaultValue={profile?.heightCm ?? undefined} placeholder="Opcional" />
          <Field label="Peso atual (kg)" name="weightKg" type="number" min={20} max={500} step={0.1} defaultValue={profile?.weightKg ?? undefined} placeholder="Opcional" />
          <SelectField label="Objetivo principal" name="goal" options={[["", "Selecione"], ["emagrecimento", "Emagrecimento"], ["hipertrofia", "Hipertrofia"], ["condicionamento", "Condicionamento"], ["saude", "Saúde e bem-estar"]]} defaultValue={profile?.goal ?? ""} />
          <SelectField label="Experiência" name="experience" options={[["", "Selecione"], ["iniciante", "Iniciante"], ["intermediario", "Intermediário"], ["avancado", "Avançado"]]} defaultValue={profile?.experience ?? ""} />
          <Field label="Preferências de treino" name="preferences" defaultValue={profile?.preferences ?? ""} placeholder="Dias, horários ou modalidades preferidas" />
          <label className="privacy-toggle"><input type="checkbox" name="isPrivate" defaultChecked={profile?.isPrivate ?? true} /><span><b>Manter meus dados privados</b><small>Seus dados de saúde só são visíveis para você.</small></span></label>
          <div className="theme-picker"><span><b>Aparência</b><small>Escolha o tema que prefere.</small></span><div><button type="button" aria-pressed={theme === "light"} className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")}><Sun size={15} /> Claro</button><button type="button" aria-pressed={theme === "dark"} className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}><Moon size={15} /> Escuro</button></div></div>
          <fieldset className="accessibility-settings">
            <legend>Acessibilidade</legend>
            <label><input type="checkbox" checked={highContrast} onChange={(event) => onHighContrastChange(event.target.checked)} /><span><b>Alto contraste</b><small>Aumenta o contraste de textos, bordas e elementos interativos neste navegador.</small></span></label>
          </fieldset>
          <button className="button primary submit-button" type="submit"><Settings2 size={16} /> Salvar alterações</button>
        </form>
      </Panel>
      <aside className="privacy-card"><div className="privacy-shield"><ShieldCheck size={24} /></div><h3>Seu espaço é seu</h3><p>Seus treinos, medidas, atividades e registros alimentares são associados à sua conta e protegidos por autenticação.</p><div className="privacy-check"><Check size={15} /> Senha protegida com hash seguro</div><div className="privacy-check"><Check size={15} /> Sessão segura e privada</div><div className="privacy-check"><Check size={15} /> Registros não são compartilhados</div><div className="privacy-foot">Nunca compartilhe sua senha ou token de recuperação.</div><button className="button logout-profile" onClick={onLogout}><LogOut size={15} /> Sair da conta</button></aside>
    </div>
  </div>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState<PageId>("dashboard");
  const mainContentRef = useRef<HTMLElement>(null);
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(null);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("fittrack-high-contrast") === "true");
  const [textScale, setTextScale] = useState(() => {
    const savedScale = Number(localStorage.getItem("fittrack-text-scale"));
    if (!Number.isFinite(savedScale) || savedScale < 0.8 || savedScale > 2) return 1.1;
    return savedScale === 1 ? 1.1 : savedScale;
  });
  const notify = useCallback((text: string, error = false) => {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 4200);
  }, []);
  useEffect(() => {
    api<{ user: User }>("/auth/me").then((result) => setUser(result.user)).catch((error: unknown) => {
      setUser(null);
      if (!(error instanceof ApiError && error.status === 401)) notify(error instanceof Error ? error.message : "Não foi possível verificar a sessão.");
    }).finally(() => setAuthLoading(false));
  }, [notify]);
  useEffect(() => {
    document.documentElement.dataset.theme = user?.profile?.theme ?? "light";
  }, [user?.profile?.theme]);
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
    localStorage.setItem("fittrack-high-contrast", String(highContrast));
  }, [highContrast]);
  useEffect(() => {
    document.documentElement.style.zoom = String(textScale);
    localStorage.setItem("fittrack-text-scale", String(textScale));
  }, [textScale]);
  useEffect(() => {
    mainContentRef.current?.focus();
  }, [page, user]);
  const refresh = useCallback((text?: string) => {
    setVersion((value) => value + 1);
    if (text) notify(text);
  }, [notify]);
  async function logout() {
    try { await api("/auth/logout", { method: "POST" }); setUser(null); setPage("dashboard"); }
    catch (error) { notify(error instanceof Error ? error.message : "Não foi possível encerrar a sessão.", true); }
  }
  if (authLoading) return <div className="app-loading" role="status" aria-live="polite"><div className="loader-mark"><ActivityIcon aria-hidden="true" size={22} /></div><span>Preparando seu espaço...</span></div>;
  if (!user) return <>
    <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
    <div className="auth-accessibility-tools" role="group" aria-label="Preferências de acessibilidade">
      <TextSizeControls scale={textScale} onChange={setTextScale} />
      <label className="auth-contrast-toggle"><input type="checkbox" checked={highContrast} onChange={(event) => setHighContrast(event.target.checked)} /><span>Alto contraste</span></label>
    </div>
    <AuthScreen onLogin={setUser} onNotice={notify} />
    {toast && <div className={`toast ${toast.error ? "error" : ""}`} role={toast.error ? "alert" : "status"}>{toast.text}</div>}
  </>;
  const active = navigation.find((item) => item.id === page);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><ActivityIcon size={20} /></span> fittrack<span className="brand-period">.</span></div>
      <div className="workspace-label">MENU PRINCIPAL</div>
      <nav className="side-nav" aria-label="Navegação principal">{navigation.map((item) => <button key={item.id} type="button" aria-label={item.label} aria-current={page === item.id ? "page" : undefined} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}><item.icon aria-hidden="true" size={18} strokeWidth={1.9} /><span>{item.label}</span>{item.id === "dashboard" && page === item.id && <i aria-hidden="true" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16} /></div><b>Consistência é progresso.</b><span>Um treino de cada vez, no seu ritmo.</span></div><button className="logout-button" onClick={() => void logout()}><LogOut size={17} /> Sair da conta</button></div>
    </aside>
    <main ref={mainContentRef} className="main-area" id="main-content" tabIndex={-1} aria-label={active?.label ?? "Conteúdo principal"}>
      <header className="topbar"><div className="breadcrumb"><span>FitTrack</span><span aria-hidden="true">/</span><b>{active?.label}</b></div><div className="topbar-actions"><div className="today-date"><CalendarDays aria-hidden="true" size={15} /> {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div><TextSizeControls scale={textScale} onChange={setTextScale} /><div className="topbar-divider" /><button className="profile-chip" onClick={() => setPage("profile")}><span className="avatar-small">{user.profile?.avatarData ? <img src={user.profile.avatarData} alt="" /> : user.name.slice(0, 1).toUpperCase()}</span><span><b>{user.name}</b><small>Meu perfil</small></span><ChevronDown aria-hidden="true" size={15} /></button></div></header>
      <div className="page-container">
        {page === "dashboard" && <Dashboard version={version} onNavigate={setPage} />}
        {page === "workouts" && <WorkoutsPage version={version} onSaved={refresh} notify={notify} />}
        {page === "activities" && <ActivitiesPage version={version} onSaved={refresh} notify={notify} />}
        {page === "progress" && <ProgressPage version={version} onSaved={refresh} notify={notify} />}
        {page === "calendar" && <CalendarPage version={version} onSaved={refresh} notify={notify} />}
        {page === "nutrition" && <NutritionPage version={version} onSaved={refresh} notify={notify} />}
        {page === "calories" && <CalorieCalculatorPage version={version} profile={user.profile} />}
        {page === "library" && <LibraryPage version={version} onSaved={refresh} notify={notify} />}
        {page === "reports" && <ReportsPage version={version} notify={notify} />}
        {page === "profile" && <ProfilePage user={user} onUpdated={setUser} onLogout={() => void logout()} notify={notify} highContrast={highContrast} onHighContrastChange={setHighContrast} />}
        <footer className="app-footer"><span>fittrack<span className="brand-period">.</span></span><span>Cuide do seu ritmo. Os resultados vêm com o tempo.</span></footer>
      </div>
    </main>
    <nav className="mobile-nav" aria-label="Navegação principal móvel">{navigation.map((item) => <button key={item.id} type="button" aria-label={item.label} aria-current={page === item.id ? "page" : undefined} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><item.icon aria-hidden="true" size={18} /><span>{item.label}</span></button>)}</nav>
    {toast && <div className={`toast ${toast.error ? "error" : ""}`} role={toast.error ? "alert" : "status"}>{toast.error ? <X aria-hidden="true" size={16} /> : <Check aria-hidden="true" size={16} />}{toast.text}</div>}
  </div>;
}

export default App;
