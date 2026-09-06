import MarketingShell from "@/components/MarketingShell";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link, useRoute } from "wouter";

const portfolio = [
  {
    slug: "alatau",
    title: "Дом у Алатау",
    image: "/manus-storage/project-alatau_d5607163.jpg",
    area: "186 м²",
    location: "Алматы",
    time: "5 месяцев",
    tier: "Стандарт",
    description:
      "Дом для семьи с двумя детьми: открытая гостиная, тихая мастер-спальня и терраса, которая работает круглый год.",
  },
  {
    slug: "arkas",
    title: "Резиденция Аркас",
    image: "/manus-storage/project-arkas_e2825fec.jpg",
    area: "142 м²",
    location: "Конаев",
    time: "4 месяца",
    tier: "Стандарт",
    description:
      "Компактный одноэтажный дом, где каждый метр отвечает за комфорт: естественный свет, понятные маршруты и приватный двор.",
  },
  {
    slug: "samruk",
    title: "Дом Самрук",
    image: "/manus-storage/project-samruk_7a820867.jpg",
    area: "248 м²",
    location: "Алматы",
    time: "7 месяцев",
    tier: "Премиум",
    description:
      "Просторный семейный дом с отдельным кабинетом, техническими помещениями и сценариями для приёма гостей.",
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
    <section className="border-b border-[#18201f]/15 px-5 py-16 lg:px-9 lg:py-24">
      <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[1.08fr_.62fr]">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-5 max-w-3xl text-5xl font-semibold leading-[.93] sm:text-7xl">
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
          eyebrow="Портфолио"
          title={
            <>
              Дома, которые
              <br />
              <span className="text-[#bc5c35]">живут вместе</span> с семьёй.
            </>
          }
          text="От компактных одноэтажных домов до резиденций в предгорьях. Показываем логику проекта, а не только красивый фасад."
        />
        <section className="px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] gap-y-14">
            {portfolio.map((project, index) => (
              <Link
                href={`/projects/${project.slug}`}
                key={project.slug}
                className="group grid gap-6 border-b border-[#18201f]/15 pb-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12"
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
                    <h2 className="display mt-4 text-4xl font-semibold sm:text-5xl">
                      {project.title}
                    </h2>
                    <p className="mt-6 max-w-md text-sm leading-7 text-[#64706d]">
                      {project.description}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {[
                        [Ruler, project.area],
                        [MapPin, project.location],
                        [Clock3, project.time],
                      ].map(([Icon, label]) => (
                        <span
                          key={label as string}
                          className="inline-flex items-center gap-2 border border-[#18201f]/15 px-3 py-2 text-xs font-bold"
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
              <div className="mt-7 grid gap-px bg-[#18201f]/15 sm:grid-cols-3">
                {[
                  [project.area, "площадь"],
                  [project.location, "регион"],
                  [project.time, "строительство"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#eae6dc] p-5">
                    <p className="display text-2xl font-bold">{value}</p>
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
      "Проясняем задачу",
      "Знакомимся с семьёй, участком, сроком и ожиданиями от будущего дома.",
    ],
    [
      "02",
      "Собираем проект",
      "Архитектура, планировка, конструктив и инженерные решения складываются в общую логику.",
    ],
    [
      "03",
      "Фиксируем решение",
      "Подтверждаем состав работ, контрольные этапы, график и предварительный бюджетный диапазон.",
    ],
    [
      "04",
      "Строим по этапам",
      "Фундамент, коробка, кровля, инженерия, отделка — с понятной отчётностью на каждом участке пути.",
    ],
    [
      "05",
      "Передаём дом",
      "Финальная приёмка, документы и спокойный переход к жизни в новом доме.",
    ],
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
          eyebrow="О BuildScope"
          title={
            <>
              Строим для тех,
              <br />
              кому важно <span className="text-[#bc5c35]">понимать.</span>
            </>
          }
          text="Мы соединяем внимательную архитектуру и дисциплину строительного процесса. Чтобы дом получался продуманным, а путь к нему — спокойным."
        />
        <section className="bg-[#eae6dc] px-5 py-16 lg:px-9 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div className="card-dark flex min-h-[360px] flex-col justify-between p-8">
              <span className="display text-7xl font-semibold text-[#e9a07d]">
                10
              </span>
              <p className="max-w-xs text-sm leading-7 text-white/65">
                лет мы работаем на стыке архитектуры, инженерии и частного
                строительства.
              </p>
            </div>
            <div>
              <p className="eyebrow">Наш подход</p>
              <h2 className="display mt-4 max-w-2xl text-4xl font-semibold leading-[.97]">
                Не продаём заранее готовый ответ. Сначала задаём правильные
                вопросы.
              </h2>
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
      "Он даёт ориентировочный диапазон: это честнее, чем обещать точную цифру до изучения участка и планировки. Детальный расчёт готовим после разговора.",
    ],
    [
      "Что если мой бюджет ниже ориентировочного диапазона?",
      "Мы не отбрасываем такие обращения. Менеджер разберёт, за счёт каких решений можно изменить площадь, комплектацию или этапность работ.",
    ],
    [
      "Работаете ли вы в моём регионе?",
      "Основные регионы работы — Алматы, Астана, Шымкент, Караганда и Конаев. Для других локаций отдельно оцениваем логистику и формат работы.",
    ],
    [
      "Сколько занимает строительство?",
      "Срок зависит от площади, комплектации, участка и сезона. Для большинства домов в портфолио ориентир составляет от 5 до 8 месяцев.",
    ],
    [
      "Можно прийти со своим проектом?",
      "Да. Проверим архитектурную и инженерную часть, оценим применимость решений и предложим удобный формат дальнейшей работы.",
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
                Казахстан
              </h2>
              <p className="mt-8 text-sm leading-7 text-white/62">
                Встречи по предварительной договорённости. Позвоните, чтобы
                подобрать удобное время для разговора о вашем проекте.
              </p>
              <div className="mt-10 grid gap-3 text-sm font-bold">
                <a href="tel:+77010000000">+7 701 000 00 00</a>
                <a href="mailto:hello@buildscope.kz">hello@buildscope.kz</a>
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
