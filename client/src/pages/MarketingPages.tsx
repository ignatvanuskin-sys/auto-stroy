import MarketingShell from "@/components/MarketingShell";
import { spotlightHandlers } from "@/components/fx/spotlight";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  Layers3,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link, useRoute } from "wouter";

export const reviews = [
  {
    quote:
      "Понравилось, что ещё до звонка менеджеру я примерно понимал порядок цен — не нужно было гадать, по карману ли нам это вообще.",
    author: "Данияр К.",
    meta: "дом 190 м², Алматы",
  },
  {
    quote:
      "КП пришло на следующий день после заявки, со всеми расчётами. Сравнивали с двумя другими компаниями — у них ответ шёл неделю.",
    author: "Айгуль С.",
    meta: "дом 150 м², Талгар",
  },
  {
    quote:
      "Раньше расчёт делал лично я или главный менеджер по вечерам. Сейчас клиент получает ориентир сразу, а мы тратим время на тех, кто реально готов строить.",
    author: "Ерлан М.",
    meta: "владелец ARQA HOUSE",
  },
];

const portfolio = [
  {
    slug: "bostandyk",
    title: "Дом на Бостандыке",
    image: "/images/project-bostandyk.jpg",
    area: "210 м²",
    location: "Алматы",
    time: "7 месяцев",
    tier: "Премиум",
    material: "Кирпич",
    description:
      "Панорамное остекление второго света и сложный рельеф участка: дом построен каскадом уровней, каждый этаж получает свой вид на город.",
  },
  {
    slug: "panfilovo",
    title: "Семейный дом в Панфилово",
    image: "/images/project-panfilovo.jpg",
    area: "160 м²",
    location: "Алматинская обл.",
    time: "6 месяцев",
    tier: "Стандарт",
    material: "Газоблок",
    description:
      "Типовой проект, адаптированный под участок 8 соток: хозяйственная зона, сад и терраса выстроены вокруг семейного сценария дня.",
  },
  {
    slug: "talgar",
    title: "Дом для большой семьи",
    image: "/images/project-talgar.jpg",
    area: "240 м²",
    location: "Талгар",
    time: "8 месяцев",
    tier: "Премиум",
    material: "Кирпич",
    description:
      "Дом с гостевым флигелем: две автономные зоны под одной крышей — для старшего поколения и для семьи с детьми.",
  },
  {
    slug: "kompaktny",
    title: "Компактный дом",
    image: "/images/project-kompaktny.jpg",
    area: "120 м²",
    location: "Алматы",
    time: "4 месяца",
    tier: "Эконом",
    material: "Каркас",
    description:
      "Участок 6 соток и минимальный след застройки: быстрый каркасный дом без потери в свете и высоте потолков.",
  },
  {
    slug: "kaskelen",
    title: "Дом с мастерской",
    image: "/images/project-kaskelen.jpg",
    area: "180 м²",
    location: "Каскелен",
    time: "6 месяцев",
    tier: "Стандарт",
    material: "Газоблок",
    description:
      "Отдельная мастерская для хозяина с собственным входом и шумоизоляцией — рабочая зона не пересекается с жилой.",
  },
  {
    slug: "predgorye",
    title: "Дом у предгорья",
    image: "/images/project-predgorye.jpg",
    area: "260 м²",
    location: "Алматы",
    time: "9 месяцев",
    tier: "Премиум",
    material: "Монолит",
    description:
      "Сложный грунт потребовал монолитного фундамента: дом рассчитан на рельеф предгорий и тяжелые снеговые нагрузки.",
  },
];

function PageIntro({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#18201f]/15 px-4 py-12 sm:px-5 sm:py-16 lg:px-9 lg:py-24">
      <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[1.08fr_.62fr]">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-5 max-w-3xl text-[42px] font-semibold leading-[.93] sm:text-7xl">
            {title}
          </h1>
        </div>
        <div className="self-end">
          <p className="max-w-md text-[15px] leading-7 text-[#64706d]">
            {text}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}

const CTA = () => (
  <section className="bg-[#202a28] px-5 py-16 text-white lg:px-9">
    <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-7 md:flex-row md:items-center">
      <div>
        <p className="eyebrow text-[#e9a07d]">Ваш следующий шаг</p>
        <h2 className="display mt-3 text-3xl font-semibold">
          Проверьте идею вашего дома
          <br />
          на языке понятных решений.
        </h2>
      </div>
      <Link href="/calculator" className="btn-primary shrink-0">
        Рассчитать стоимость <ArrowRight size={16} />
      </Link>
    </div>
  </section>
);

export function ServicesPage() {
  const services = [
    [
      "Эконом",
      "Рациональная основа",
      "Конструктив, кровля, подготовка к инженерным системам. Подходит, если важны надёжная база и свобода завершить интерьер позже.",
      "От 180 000 ₸ / м²",
    ],
    [
      "Стандарт",
      "Дом, готовый к жизни",
      "Чистовая отделка, базовые инженерные системы, продуманная функциональность. Самый частый выбор для постоянного проживания.",
      "От 260 000 ₸ / м²",
    ],
    [
      "Премиум",
      "Индивидуальная среда",
      "Архитектурный сценарий, расширенная инженерия, материалы и детали, которые подбираются под вашу семью.",
      "От 380 000 ₸ / м²",
    ],
  ];
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="Комплектации"
          title={
            <>
              Строим не «квадраты».
              <br />
              <span className="text-[#bc5c35]">Строим ваш уклад.</span>
            </>
          }
          text="Каждая комплектация — это отправная точка для разговора о доме, а не пакет с мелким шрифтом. Финальный состав работ фиксируем после обсуждения участка и задач семьи."
        />
        <section className="bg-[#eae6dc] px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto max-w-[1360px]">
            <div className="grid gap-4 lg:grid-cols-3">
              {services.map(([name, tag, description, price], i) => (
                <article
                  key={name}
                  className={`min-h-[385px] border p-7 ${i === 1 ? "border-[#bc5c35] bg-[#202a28] text-white" : "border-[#18201f]/15 bg-[#f8f6f0]"}`}
                >
                  <p
                    className={`text-[11px] font-extrabold uppercase tracking-[.13em] ${i === 1 ? "text-[#e9a07d]" : "text-[#bc5c35]"}`}
                  >
                    0{i + 1} · {tag}
                  </p>
                  <h2 className="display mt-10 text-4xl font-semibold">
                    {name}
                  </h2>
                  <p className="mt-5 max-w-sm text-sm leading-7 opacity-70">
                    {description}
                  </p>
                  <p className="mt-10 border-t border-current/20 pt-4 text-sm font-extrabold">
                    {price}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-12 grid gap-px bg-[#18201f]/15 md:grid-cols-3">
              {[
                [
                  Ruler,
                  "Архитектурная логика",
                  "Планировка учитывает участок, свет и маршруты семьи.",
                ],
                [
                  ShieldCheck,
                  "Инженерный контур",
                  "Конструкции и коммуникации продумываются до старта работ.",
                ],
                [
                  FileText,
                  "Прозрачная фиксация",
                  "Состав работ и контрольные этапы закрепляются в договоре.",
                ],
              ].map(([Icon, title, text]) => (
                <div key={title as string} className="bg-[#eae6dc] p-6">
                  <Icon size={22} className="text-[#bc5c35]" />
                  <h3 className="mt-5 font-extrabold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#64706d]">
                    {text as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function ProjectsPage() {
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="Портфолио · 180+ домов с 2016 года"
          title={
            <>
              Дома, которые
              <br />
              <span className="text-[#bc5c35]">живут вместе</span> с семьёй.
            </>
          }
          text="От компактных каркасных домов до монолитных резиденций в предгорьях. Показываем логику проекта, а не только красивый фасад."
        />
        <section className="px-4 py-12 sm:px-5 sm:py-16 lg:px-9 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] gap-y-14">
            {portfolio.map((project, index) => (
              <Link
                href={`/projects/${project.slug}`}
                key={project.slug}
                className="group grid gap-5 border-b border-[#18201f]/15 pb-8 sm:gap-6 sm:pb-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#dfdbd1]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="flex flex-col justify-between py-2">
                  <div>
                    <p className="eyebrow">
                      0{index + 1} · {project.tier}
                    </p>
                    <h2 className="display mt-4 text-3xl font-semibold sm:text-5xl">
                      {project.title}
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-7 text-[#64706d] sm:mt-6">
                      {project.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
                      {[
                        [Ruler, project.area],
                        [MapPin, project.location],
                        [Clock3, project.time],
                        [Layers3, project.material],
                      ].map(([Icon, label]) => (
                        <span
                          key={label as string}
                          className="inline-flex min-h-9 items-center gap-2 border border-[#18201f]/15 px-2.5 py-2 text-[11px] font-bold sm:px-3 sm:text-xs"
                        >
                          <Icon size={14} />
                          {label as string}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-xs font-extrabold">
                    Открыть проект{" "}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function ProjectDetailPage() {
  const [, params] = useRoute("/projects/:slug");
  const project =
    portfolio.find(item => item.slug === params?.slug) ?? portfolio[0];
  return (
    <MarketingShell>
      <main>
        <section className="px-5 pb-10 pt-8 lg:px-9">
          <div className="mx-auto max-w-[1360px]">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#64706d]"
            >
              <ArrowLeft size={15} /> Все проекты
            </Link>
            <div className="mt-8 grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div>
                <p className="eyebrow">{project.tier} · Реализованный проект</p>
                <h1 className="display mt-5 text-5xl font-semibold leading-[.92] sm:text-7xl">
                  {project.title}
                </h1>
              </div>
              <p className="text-[15px] leading-7 text-[#64706d]">
                {project.description}
              </p>
            </div>
            <img
              src={project.image}
              alt={project.title}
              className="mt-10 aspect-[16/8] w-full object-cover"
            />
          </div>
        </section>
        <section className="bg-[#eae6dc] px-5 py-16 lg:px-9">
          <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Проект в цифрах</p>
              <div className="mt-7 grid gap-px bg-[#18201f]/15 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [project.area, "площадь"],
                  [project.location, "регион"],
                  [project.time, "строительство"],
                  [project.material, "материал"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="min-w-0 bg-[#eae6dc] p-5"
                  >
                    <p
                      className={`display break-words font-bold leading-snug ${value.length > 10 ? "text-xl" : "text-2xl"}`}
                    >
                      {value}
                    </p>
                    <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow">Задача семьи</p>
              <h2 className="display mt-4 text-3xl font-semibold">
                Создать дом, который не требует компромиссов в повседневной
                жизни.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#64706d]">
                В начале работы мы согласовали сценарии для общих и приватных
                зон, логистику на участке и инженерный контур. Это позволило
                избежать изменений на стройке и сохранить спокойный темп
                реализации.
              </p>
              <div className="mt-7 grid gap-3">
                {[
                  "Участок и посадка дома проработаны до начала работ",
                  "Состав комплектации зафиксирован по этапам",
                  "Ключевые технические решения согласованы с семьёй",
                ].map(item => (
                  <p
                    key={item}
                    className="flex items-start gap-3 text-sm font-bold"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-[#bc5c35]"
                    />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function ProcessPage() {
  const phases = [
    [
      "01",
      "Проектирование",
      "Подбор или адаптация проекта под участок и бюджет.",
    ],
    ["02", "Фундамент", "Геологические особенности участка определяют тип."],
    ["03", "Коробка", "Стены, перекрытия, кровельная система."],
    ["04", "Кровля", "Монтаж и утепление."],
    ["05", "Инженерия", "Электрика, вода, отопление, канализация."],
    ["06", "Отделка и сдача", "Чистовая отделка, приёмка, передача ключей."],
  ];
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="Процесс"
          title={
            <>
              Всё сложное
              <br />
              становится <span className="text-[#bc5c35]">понятным.</span>
            </>
          }
          text="Стройка не обязана быть чередой сюрпризов. Мы заранее определяем логику решений, точки контроля и формат коммуникации."
        />
        <section className="bg-[#202a28] px-5 py-16 text-white lg:px-9 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            {phases.map(([no, title, text], i) => (
              <div
                key={no}
                className="grid gap-5 border-t border-white/20 py-8 md:grid-cols-[110px_1fr_.8fr] md:items-start"
              >
                <span className="text-[11px] font-black tracking-[.15em] text-[#e9a07d]">
                  {no}
                </span>
                <h2 className="display text-3xl font-semibold">{title}</h2>
                <p className="text-sm leading-7 text-white/62">{text}</p>
                {i === phases.length - 1 && null}
              </div>
            ))}
          </div>
        </section>
        <section className="px-5 py-16 lg:px-9">
          <div className="mx-auto grid max-w-[1360px] gap-4 md:grid-cols-3">
            {[
              [
                "Один менеджер проекта",
                "Вы знаете, к кому обратиться по любому вопросу.",
              ],
              [
                "Контрольные точки",
                "Обсуждаем результат этапа до перехода к следующему.",
              ],
              [
                "Понятная документация",
                "Решения фиксируются, а не остаются в переписке.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="card p-6">
                <p className="eyebrow">Принцип</p>
                <h3 className="display mt-7 text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#64706d]">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function AboutPage() {
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="О ARQA HOUSE"
          title={
            <>
              Дом, который начинается
              <br />с <span className="text-[#bc5c35]">точного расчёта.</span>
            </>
          }
          text="Мы начинали как бригада из четырёх человек, строившая дома для друзей и знакомых в пригороде Алматы. За девять лет выросли в компанию полного цикла."
        />
        <section className="bg-[#eae6dc] px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div className="card-dark flex min-h-[360px] flex-col justify-between p-8">
              <span className="display text-7xl font-semibold text-[#e9a07d]">
                9
              </span>
              <p className="max-w-xs text-sm leading-7 text-white/65">
                лет на рынке: от бригады из четырёх человек до компании полного
                цикла с собственными монтажными бригадами. 180+ построенных
                домов.
              </p>
            </div>
            <div>
              <p className="eyebrow">Наша история</p>
              <h2 className="display mt-4 max-w-2xl text-4xl font-semibold leading-[.97]">
                Мы одинаково внимательно относимся и к дому за 20 миллионов, и к
                дому за 60.
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#64706d]">
                Мы начинали как бригада из четырёх человек, строившая дома для
                друзей и знакомых в пригороде Алматы. За девять лет выросли в
                компанию полного цикла: от архитектурного проекта до сдачи
                ключей, с собственными монтажными бригадами и контролем каждого
                этапа. Сегодня к нам ежемесячно обращаются десятки семей.
              </p>
              <div className="mt-10 grid gap-px bg-[#18201f]/15 sm:grid-cols-2">
                {[
                  [
                    UsersRound,
                    "Слушать",
                    "Учитывать образ жизни семьи, а не только число комнат.",
                  ],
                  [
                    Compass,
                    "Продумывать",
                    "Сопоставлять архитектуру, участок, инженерные решения и бюджет.",
                  ],
                  [
                    ShieldCheck,
                    "Отвечать",
                    "Фиксировать договорённости и показывать прогресс по этапам.",
                  ],
                  [
                    MessageCircle,
                    "Объяснять",
                    "Говорить человеческим языком о том, что влияет на дом и сроки.",
                  ],
                ].map(([Icon, title, text]) => (
                  <div key={title as string} className="bg-[#eae6dc] p-5">
                    <Icon size={20} className="text-[#bc5c35]" />
                    <h3 className="mt-6 font-extrabold">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#64706d]">
                      {text as string}
                    </p>
                  </div>
                ))}
              </div>
              <figure className="mt-10 border border-[#18201f]/15 bg-[#f8f6f0] p-7">
                <blockquote className="text-[15px] leading-7">
                  «Раньше расчёт делал лично я или главный менеджер по вечерам.
                  Сейчас клиент получает ориентир сразу, а мы тратим время на
                  тех, кто реально готов строить.»
                </blockquote>
                <figcaption className="mt-5 border-t border-[#18201f]/10 pt-4 text-xs font-extrabold">
                  Ерлан М.
                  <span className="ml-2 font-bold text-[#64706d]">
                    владелец ARQA HOUSE
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function FaqPage() {
  const items = [
    [
      "Расчёт на сайте точный?",
      "Это предварительный ориентир по вашим параметрам. Точную смету готовим после уточнения деталей и, при необходимости, выезда на участок.",
    ],
    [
      "Что если бюджет меньше диапазона?",
      "Обсудим, что можно оптимизировать — материал, комплектацию, этапность — без потери качества.",
    ],
    [
      "Работаете ли в моём регионе?",
      "Строим в Алматы и Алматинской области, по другим регионам — обсуждаем индивидуально.",
    ],
    [
      "Сколько строится дом 150–200 м²?",
      "В среднем 5–8 месяцев в зависимости от комплектации и сезона старта.",
    ],
    [
      "Можно начать без готового проекта?",
      "Да, поможем подобрать типовой или адаптировать ваш под площадь и бюджет.",
    ],
    [
      "Что происходит после отправки калькулятора?",
      "Менеджер получает структурированную заявку с параметрами дома и расчётным диапазоном. Затем связывается в выбранном вами канале, чтобы уточнить детали.",
    ],
  ];
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="FAQ"
          title={
            <>
              Вопросы, на которые
              <br />
              важно ответить <span className="text-[#bc5c35]">сразу.</span>
            </>
          }
          text="Собрали то, о чём обычно спрашивают до первого разговора. Если вашего вопроса нет — просто напишите нам."
        />
        <section className="px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto max-w-[920px]">
            {items.map(([question, answer], i) => (
              <details
                key={question}
                className="group border-t border-[#18201f]/15 py-6 last:border-b"
              >
                <summary className="flex cursor-pointer list-none items-center gap-6">
                  <span className="w-8 text-xs font-extrabold text-[#bc5c35]">
                    0{i + 1}
                  </span>
                  <span className="flex-1 text-[15px] font-extrabold">
                    {question}
                  </span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center border border-[#18201f]/20 text-[#bc5c35] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="ml-14 mt-4 max-w-2xl text-sm leading-7 text-[#64706d]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function ReviewsPage() {
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="Отзывы"
          title={
            <>
              Слова тех, кто уже
              <br />
              <span className="text-[#bc5c35]">прошёл этот путь.</span>
            </>
          }
          text="Владельцы домов — о расчёте до звонка, скорости коммерческого предложения и работе команды. Хотите так же — начните с калькулятора."
        />
        <section className="px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] gap-5 md:grid-cols-2">
            {reviews.map((review, i) => (
              <figure
                key={review.author}
                className={`spotlight-card flex flex-col justify-between border border-[#18201f]/15 bg-[#f8f6f0] p-7 ${i === 0 ? "md:col-span-2 md:p-10" : ""}`}
                {...spotlightHandlers()}
              >
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#bc5c35]">
                    Отзыв 0{i + 1}
                  </p>
                  <blockquote
                    className={`mt-4 leading-7 ${i === 0 ? "display text-2xl font-semibold sm:text-3xl" : "text-[15px]"}`}
                  >
                    «{review.quote}»
                  </blockquote>
                </div>
                <figcaption className="mt-7 border-t border-[#18201f]/10 pt-4 text-xs font-extrabold">
                  {review.author}
                  <span className="ml-2 font-bold text-[#64706d]">
                    {review.meta}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <CTA />
      </main>
    </MarketingShell>
  );
}

export function ContactsPage() {
  return (
    <MarketingShell>
      <main>
        <PageIntro
          eyebrow="Контакты"
          title={
            <>
              Обсудим дом,
              <br />
              который будет <span className="text-[#bc5c35]">вашим.</span>
            </>
          }
          text="Напишите или позвоните — подскажем, с чего лучше начать. Для ориентировочного диапазона можно сразу пройти короткий калькулятор."
          children={
            <Link href="/calculator" className="btn-primary mt-7">
              Открыть калькулятор <ArrowRight size={16} />
            </Link>
          }
        />
        <section className="bg-[#eae6dc] px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] gap-4 lg:grid-cols-[.9fr_1.1fr]">
            <div className="card-dark p-8">
              <p className="eyebrow text-[#e9a07d]">Офис</p>
              <h2 className="display mt-5 text-4xl font-semibold">
                Алматы,
                <br />
                Бостандыкский р-н
              </h2>
              <p className="mt-8 text-sm leading-7 text-white/62">
                Встречи по предварительной договорённости. Позвоните, чтобы
                подобрать удобное время для разговора о вашем проекте.
              </p>
              <div className="mt-10 grid gap-3 text-sm font-bold">
                <a href="tel:+77270000000">+7 (727) 000-00-00</a>
                <a href="mailto:info@arqahouse.kz">
                  info@arqahouse.kz
                </a>
                <a href="#">Telegram</a>
              </div>
            </div>
            <div className="border border-[#18201f]/15 bg-[#d6d2c7] p-7 sm:p-10">
              <p className="eyebrow">Первый разговор</p>
              <h2 className="display mt-4 max-w-lg text-4xl font-semibold">
                Расскажите о доме — мы подскажем следующий шаг.
              </h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  ["1", "Где планируете строить?"],
                  ["2", "Какая площадь вам близка?"],
                  ["3", "Участок уже есть?"],
                  ["4", "Когда хотите начать?"],
                ].map(([number, text]) => (
                  <div
                    key={number}
                    className="border-t border-[#18201f]/20 pt-3"
                  >
                    <span className="text-xs font-extrabold text-[#bc5c35]">
                      {number}
                    </span>
                    <p className="mt-5 text-sm font-extrabold">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
