import MarketingShell from "@/components/MarketingShell";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Home,
  LandPlot,
  Phone,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type Tier = "economy" | "standard" | "premium";

const steps = [
  "Объект",
  "Параметры",
  "Материал",
  "Дополнительно",
  "Сроки",
  "Контакты",
];
const regions = ["Алматы", "Астана", "Шымкент", "Караганда", "Конаев"];
const tiers: { id: Tier; title: string; hint: string }[] = [
  { id: "economy", title: "Эконом", hint: "Конструктив и подготовка" },
  { id: "standard", title: "Стандарт", hint: "Готово к жизни" },
  { id: "premium", title: "Премиум", hint: "Индивидуальный сценарий" },
];

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState("Дом");
  const [floors, setFloors] = useState(2);
  const [areaM2, setAreaM2] = useState(180);
  const [region, setRegion] = useState("Алматы");
  const [material, setMaterial] = useState("Кирпич");
  const [finishTier, setFinishTier] = useState<Tier>("standard");
  const [foundation, setFoundation] = useState("Плитный");
  const [engineering, setEngineering] = useState<string[]>([
    "Отопление",
    "Вода",
    "Канализация",
    "Электрика",
  ]);
  const [hasLand, setHasLand] = useState(true);
  const [desiredStart, setDesiredStart] = useState("3–6 мес");
  const [budgetRange, setBudgetRange] = useState("35–40 млн ₸");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<
    "Звонок" | "WhatsApp" | "Telegram"
  >("Telegram");
  const [rawNotes, setRawNotes] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<null | {
    leadId: number;
    estimate: { formattedRange: string };
    score: { score: number; band: string; reasons: string[] };
    aiSummary: string;
    notificationQueued: boolean;
    needsManualReview: boolean;
  }>(null);

  const previewInput = useMemo(
    () => ({
      areaM2,
      floors,
      region,
      projectType,
      material,
      finishTier,
      foundation,
      engineering,
      hasLand,
    }),
    [
      areaM2,
      floors,
      region,
      projectType,
      material,
      finishTier,
      foundation,
      engineering,
      hasLand,
    ]
  );
  const preview = trpc.calculator.preview.useQuery(previewInput, {
    enabled: step >= 2,
  });
  const submit = trpc.calculator.submitLead.useMutation({
    onSuccess: data => {
      setResult(data);
      setStep(7);
    },
    onError: error =>
      toast.error(
        error.message || "Не удалось отправить заявку. Попробуйте ещё раз."
      ),
  });

  const telegramUsernameValid =
    telegramUsername.trim() === "" ||
    /^@?[a-zA-Z0-9_]{4,32}$/.test(telegramUsername.trim());

  const canMove = () => {
    if (step === 6 && (!name.trim() || !phone.trim() || !consent)) {
      toast.error("Укажите имя, телефон и подтвердите согласие.");
      return false;
    }
    if (step === 6 && !telegramUsernameValid) {
      toast.error(
        "Telegram-username должен начинаться с @ и содержать 4–32 символа: буквы, цифры и _"
      );
      return false;
    }
    return true;
  };
  const next = () => {
    if (canMove())
      step === 6
        ? submit.mutate({
            ...previewInput,
            name,
            phone,
            preferredChannel,
            telegramUsername:
              preferredChannel === "Telegram" && telegramUsername.trim()
                ? telegramUsername.trim()
                : null,
            rawNotes: rawNotes || null,
            budgetRange,
            desiredStart,
            consent: true,
            honeypot: "",
          })
        : setStep(s => Math.min(6, s + 1));
  };
  const toggleEngineering = (item: string) =>
    setEngineering(current =>
      current.includes(item)
        ? current.filter(value => value !== item)
        : [...current, item]
    );

  if (result)
    return (
      <MarketingShell dark>
        <main className="px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="border border-white/15 bg-white/5 p-6 sm:p-10">
              <div className="grid h-12 w-12 place-items-center bg-[#bc5c35]">
                <Check size={24} />
              </div>
              <p className="eyebrow mt-8 text-[#e9a07d]">Заявка принята</p>
              <h1 className="display mt-4 text-4xl font-semibold leading-[.97] sm:text-6xl">
                Ваш ориентир:
                <br />
                <span className="text-[#e9a07d]">
                  {result.estimate.formattedRange}
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-sm leading-7 text-white/70">
                Это предварительная оценка. Точный расчёт менеджер подготовит
                после уточнения деталей участка и проекта.
              </p>
              <div className="mt-9 grid gap-4 border-y border-white/15 py-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-white/45">
                    Приоритет заявки
                  </p>
                  <p className="display mt-2 text-3xl font-bold">
                    {result.score.score}/100
                  </p>
                  <p className="mt-2 text-xs text-white/60">
                    {result.score.reasons.slice(0, 2).join(" · ")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-white/45">
                    Что происходит дальше
                  </p>
                  <p className="mt-2 text-sm font-extrabold">
                    Менеджер получил структурированную заявку и свяжется с вами
                    в выбранном канале.
                  </p>
                  {result.notificationQueued && (
                    <p className="mt-2 text-xs text-[#e9a07d]">
                      Уведомление менеджеру уже поставлено в очередь.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-7 rounded-none border border-[#e9a07d]/30 bg-[#e9a07d]/10 p-5">
                <p className="flex items-center gap-2 text-xs font-extrabold">
                  <Sparkles size={15} className="text-[#e9a07d]" /> Резюме для
                  команды
                </p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  {result.aiSummary}
                </p>
              </div>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="btn-primary">
                  Вернуться на сайт <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/crm/leads/${result.leadId}`}
                  className="btn-ghost"
                >
                  Открыть CRM demo <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </MarketingShell>
    );

  const choice = (
    title: string,
    selected: boolean,
    onClick: () => void,
    hint?: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`choice ${selected ? "is-selected" : ""}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <strong className="block text-sm">{title}</strong>
          {hint && (
            <small className="mt-1 block text-xs leading-5 text-[#64706d]">
              {hint}
            </small>
          )}
        </span>
        {selected && <Check size={16} className="shrink-0 text-[#bc5c35]" />}
      </span>
    </button>
  );

  return (
    <MarketingShell>
      <main className="min-h-[calc(100vh-80px)] bg-[#f5f3ed] px-5 py-8 text-[#18201f] lg:px-9 lg:py-12">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-9 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#64706d] hover:text-[#18201f]"
            >
              <ArrowLeft size={15} /> На главную
            </Link>
            <div className="hidden text-[11px] font-extrabold uppercase tracking-[.12em] text-[#64706d] sm:block">
              Предварительный расчёт · 2 минуты
            </div>
          </div>
          <div className="grid gap-7 lg:grid-cols-[1.2fr_.62fr]">
            <section className="card min-h-[590px] p-5 sm:p-9">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Шаг {step} из 6</p>
                  <h1 className="display mt-2 text-3xl font-semibold sm:text-4xl">
                    {steps[step - 1]}
                  </h1>
                </div>
                <span className="grid h-11 w-11 place-items-center border border-[#18201f]/15 text-[#bc5c35]">
                  {step === 1 ? (
                    <Home size={20} />
                  ) : step === 4 ? (
                    <LandPlot size={20} />
                  ) : (
                    <Sparkles size={19} />
                  )}
                </span>
              </div>
              <div className="mt-7 h-1 bg-[#e4e1d8]">
                <div
                  className="h-full bg-[#bc5c35] transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                />
              </div>
              <p className="mt-7 text-sm leading-6 text-[#64706d]">
                {
                  [
                    "Выберите тип дома и этажность — это влияет на конструктив.",
                    "Укажите площадь и регион, чтобы увидеть первый честный ориентир.",
                    "Выберите материал стен и желаемый уровень готовности.",
                    "Дополнительные вводные уточнят расчёт, но не блокируют его.",
                    "Срок и бюджет помогают команде подготовиться к разговору.",
                    "Оставьте контакт — менеджер получит уже структурированную заявку.",
                  ][step - 1]
                }
              </p>

              <div className="mt-8">
                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {["Дом", "Коттедж", "Дача"].map(item =>
                      choice(
                        item,
                        projectType === item,
                        () => setProjectType(item),
                        item === "Дом"
                          ? "Для постоянной жизни"
                          : item === "Коттедж"
                            ? "Больше пространства"
                            : "Для отдыха"
                      )
                    )}
                    <div className="sm:col-span-3 mt-3">
                      <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                        Этажность
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(item =>
                          choice(
                            `${item} ${item === 1 ? "этаж" : "этажа"}`,
                            floors === item,
                            () => setFloors(item)
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Площадь дома{" "}
                      <span className="ml-2 text-[#bc5c35]">{areaM2} м²</span>
                    </label>
                    <input
                      aria-label="Площадь дома"
                      type="range"
                      min="80"
                      max="350"
                      step="5"
                      value={areaM2}
                      onChange={e => setAreaM2(Number(e.target.value))}
                      className="mt-5 w-full accent-[#bc5c35]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-[#64706d]">
                      <span>80 м²</span>
                      <span>350 м²</span>
                    </div>
                    <label className="mt-9 block text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Город / регион
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {regions.map(item =>
                        choice(item, region === item, () => setRegion(item))
                      )}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Материал стен
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        ["Кирпич", "Тишина и основательность"],
                        ["Газоблок", "Баланс тепла и бюджета"],
                        ["Каркас", "Скорость и эффективность"],
                        ["Брус", "Тактильность натурального материала"],
                        ["Не уверен", "Поможем определиться"],
                      ].map(([title, hint]) =>
                        choice(
                          title,
                          material === title,
                          () => setMaterial(title),
                          hint
                        )
                      )}
                    </div>
                    <p className="mt-8 text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Уровень комплектации
                    </p>
                    <div className="mt-3 grid gap-3">
                      {tiers.map(item =>
                        choice(
                          item.title,
                          finishTier === item.id,
                          () => setFinishTier(item.id),
                          item.hint
                        )
                      )}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Фундамент
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {["Плитный", "Ленточный", "Свайный", "Не знаю"].map(
                        item =>
                          choice(item, foundation === item, () =>
                            setFoundation(item)
                          )
                      )}
                    </div>
                    <p className="mt-8 text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Инженерные системы
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[
                        "Отопление",
                        "Вода",
                        "Канализация",
                        "Электрика",
                        "Тёплый пол",
                      ].map(item =>
                        choice(item, engineering.includes(item), () =>
                          toggleEngineering(item)
                        )
                      )}
                    </div>
                    <p className="mt-8 text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Участок
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {choice("Участок уже есть", hasLand, () =>
                        setHasLand(true)
                      )}
                      {choice("Нужно подобрать", !hasLand, () =>
                        setHasLand(false)
                      )}
                    </div>
                  </div>
                )}
                {step === 5 && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Когда хотите начать?
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {["ASAP", "3–6 мес", "6–12 мес", "Изучаю рынок"].map(
                        item =>
                          choice(item, desiredStart === item, () =>
                            setDesiredStart(item)
                          )
                      )}
                    </div>
                    <p className="mt-8 text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      Ваш ориентир по бюджету
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        "До 25 млн ₸",
                        "25–35 млн ₸",
                        "35–40 млн ₸",
                        "40–55 млн ₸",
                        "55–80 млн ₸",
                        "80+ млн ₸",
                        "Не готов озвучивать",
                      ].map(item =>
                        choice(item, budgetRange === item, () =>
                          setBudgetRange(item)
                        )
                      )}
                    </div>
                  </div>
                )}
                {step === 6 && (
                  <div className="grid gap-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                          Ваше имя
                        </label>
                        <input
                          className="field mt-2"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Данияр"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                          Телефон
                        </label>
                        <input
                          className="field mt-2"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+7 701 000 00 00"
                          inputMode="tel"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                        Удобный канал связи
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {(["Звонок", "WhatsApp", "Telegram"] as const).map(
                          item =>
                            choice(item, preferredChannel === item, () =>
                              setPreferredChannel(item)
                            )
                        )}
                      </div>
                    </div>
                    {preferredChannel === "Telegram" && (
                      <div>
                        <label className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                          Ваш Telegram-username{" "}
                          <span className="normal-case opacity-65">
                            (чтобы менеджер написал вам быстрее)
                          </span>
                        </label>
                        <input
                          className={`field mt-2 ${telegramUsername.trim() && !telegramUsernameValid ? "border-[#bc5c35] border-2" : ""}`}
                          value={telegramUsername}
                          onChange={e => setTelegramUsername(e.target.value)}
                          placeholder="@username"
                          autoCapitalize="off"
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <p
                          className={`mt-2 text-[11px] font-bold ${telegramUsername.trim() && !telegramUsernameValid ? "text-[#bc5c35]" : "text-[#64706d]"}`}
                        >
                          Начинается с @, 4–32 символа: латинские буквы, цифры и
                          _ — как в Telegram.
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                        Комментарий для менеджера{" "}
                        <span className="normal-case opacity-65">
                          (необязательно)
                        </span>
                      </label>
                      <textarea
                        className="field mt-2"
                        value={rawNotes}
                        onChange={e => setRawNotes(e.target.value)}
                        placeholder="Например: участок в предгорьях, важна тёплая терраса и панорамный вид."
                      />
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#64706d]">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={e => setConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#bc5c35]"
                      />
                      <span>
                        Согласен на обработку контактных данных для подготовки
                        предварительного расчёта.
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-9 flex items-center justify-between border-t border-[#18201f]/15 pt-6">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-[#64706d] disabled:opacity-30"
                  disabled={step === 1}
                  onClick={() => setStep(s => s - 1)}
                >
                  <ArrowLeft size={16} /> Назад
                </button>
                <button
                  type="button"
                  className="btn-primary min-w-[160px]"
                  onClick={next}
                  disabled={submit.isPending}
                >
                  {submit.isPending ? (
                    "Отправляем…"
                  ) : step === 6 ? (
                    "Получить расчёт"
                  ) : (
                    <>
                      Продолжить <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </section>
            <aside className="card h-fit overflow-hidden lg:sticky lg:top-7">
              <div className="bg-[#202a28] p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-white/55">
                    Предварительный ориентир
                  </span>
                  <Sparkles size={16} className="text-[#e9a07d]" />
                </div>
                <div className="display mt-7 text-3xl font-semibold leading-none">
                  {preview.isFetching
                    ? "Считаем…"
                    : preview.isError
                      ? "Расчёт недоступен"
                      : (preview.data?.formattedRange ?? "Укажите параметры")}
                </div>
                <p className="mt-4 text-xs leading-5 text-white/55">
                  {preview.isError
                    ? "Сервис расчёта временно недоступен. Попробуйте обновить страницу позже."
                    : "Расчёт обновляется по площади, региону, материалу и комплектации."}
                </p>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-[#64706d]">
                  Ваши вводные
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64706d]">Объект</span>
                    <strong>
                      {projectType}, {floors} эт.
                    </strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64706d]">Площадь</span>
                    <strong>{areaM2} м²</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64706d]">Регион</span>
                    <strong>{region}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64706d]">Комплектация</span>
                    <strong>
                      {tiers.find(item => item.id === finishTier)?.title}
                    </strong>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 border-t border-[#18201f]/15 pt-5">
                  <CircleAlert size={16} className="shrink-0 text-[#bc5c35]" />
                  <p className="text-[11px] leading-5 text-[#64706d]">
                    Это не фиксированная смета. Точный расчёт зависит от участка
                    и проекта.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
