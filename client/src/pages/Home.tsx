import MarketingShell from "@/components/MarketingShell";
import GlowingFrame from "@/components/GlowingFrame";
import OrbField from "@/components/OrbField";
import CountUp from "@/components/fx/CountUp";
import Reveal from "@/components/fx/Reveal";
import { spotlightHandlers } from "@/components/fx/spotlight";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Layers3,
  MapPin,
  MoveUpRight,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

const projects = [
  {
    slug: "bostandyk",
    name: "Дом на Бостандыке",
    meta: "210 м² · Алматы · 7 месяцев",
    image: "/images/project-bostandyk.jpg",
    tag: "Премиум",
  },
  {
    slug: "panfilovo",
    name: "Семейный дом в Панфилово",
    meta: "160 м² · Алматинская обл. · 6 месяцев",
    image: "/images/project-panfilovo.jpg",
    tag: "Стандарт",
  },
  {
    slug: "predgorye",
    name: "Дом у предгорья",
    meta: "260 м² · Алматы · 9 месяцев",
    image: "/images/project-predgorye.jpg",
    tag: "Премиум",
  },
];

const testimonials = [
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
];

const process = [
  ["01", "Знакомство", "Разбираем ваши задачи, участок и желаемый образ дома."],
  [
    "02",
    "Проектирование",
    "Фиксируем архитектуру, инженерную логику и бюджетный диапазон.",
  ],
  [
    "03",
    "Строительство",
    "Ведём объект по этапам, с понятной отчётностью и контролем качества.",
  ],
  [
    "04",
    "Сдача дома",
    "Передаём готовый дом и документацию — без незакрытых вопросов.",
  ],
];

const faqs = [
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
];

export default function Home() {
  return (
    <MarketingShell dark>
      <main>
        <section className="relative isolate min-h-[650px] overflow-hidden border-b border-white/15 sm:min-h-[730px]">
          <img
            src="/images/hero.jpg"
            alt="Современный дом ARQA HOUSE у гор"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,22,21,.92)_0%,rgba(15,22,21,.68)_42%,rgba(15,22,21,.13)_78%),linear-gradient(0deg,rgba(15,22,21,.45),transparent_45%)]" />
          <OrbField />
          <div className="mx-auto flex min-h-[610px] max-w-[1360px] flex-col justify-between px-4 pb-7 pt-16 sm:min-h-[665px] sm:px-5 sm:pb-8 sm:pt-20 lg:px-9 lg:pb-10 lg:pt-28">
            <div className="motion-reveal max-w-[690px]">
              <p className="eyebrow text-[#e9a07d]">
                Частные дома под ключ · Алматы и область
              </p>
              <h1 className="display mt-5 text-[42px] font-semibold leading-[.94] tracking-[-.07em] text-white sm:text-[67px] lg:text-[86px]">
                Дом, который
                <br />
                начинается с<br />
                <span className="shiny-text">точного расчёта.</span>
              </h1>
              <p className="mt-8 max-w-md text-[16px] leading-7 text-white/76">
                ARQA HOUSE строит частные дома «под ключ» в Алматы и области с
                2016 года. Прежде чем предложить смету — мы считаем, а не
                гадаем.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <GlowingFrame className="w-full sm:w-fit" tone="dark">
                  <Link
                    href="/calculator"
                    className="btn-primary w-full sm:w-auto"
                  >
                    Рассчитать стоимость дома за 2 минуты{" "}
                    <ArrowRight size={17} />
                  </Link>
                </GlowingFrame>
                <Link href="/projects" className="btn-ghost w-full sm:w-auto">
                  Смотреть проекты <ArrowDownRight size={17} />
                </Link>
              </div>
            </div>
            <div className="motion-reveal motion-reveal--2 grid max-w-[780px] grid-cols-1 divide-y divide-white/20 border-y border-white/20 py-1 text-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-4">
              <div className="flex items-center justify-between px-2 py-3 sm:block sm:py-0">
                <div className="display text-2xl font-bold">
                  <CountUp value={9} suffix=" лет" />
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">
                  на рынке — с 2016 года
                </div>
              </div>
              <div className="flex items-center justify-between px-2 py-3 sm:block sm:px-4 sm:py-0">
                <div className="display text-2xl font-bold">
                  <CountUp value={180} suffix="+" />
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">
                  построенных домов
                </div>
              </div>
              <div className="flex items-center justify-between px-2 py-3 sm:block sm:px-4 sm:py-0">
                <div className="display text-2xl font-bold">
                  <CountUp value={6} />
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">
                  менеджеров в отделе продаж
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="site-grid bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28">
          <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[1fr_1.25fr]">
            <Reveal>
              <p className="eyebrow">С чего начинается ваш дом</p>
              <h2 className="display mt-4 max-w-md text-4xl font-semibold leading-[.98] sm:text-5xl">
                Не с обещаний.
                <br />С продуманной
                <br />
                <span className="text-[#bc5c35]">системы решений.</span>
              </h2>
            </Reveal>
            <div className="grid gap-px bg-[#18201f]/15 sm:grid-cols-2">
              {[
                [
                  Ruler,
                  "Архитектура",
                  "Дом строится вокруг привычек семьи, участка и света — не вокруг типового плана.",
                ],
                [
                  Layers3,
                  "Инженерия",
                  "Прорабатываем фундамент, конструкции и коммуникации до начала работ.",
                ],
                [
                  ShieldCheck,
                  "Контроль",
                  "Закрепляем этапы, материалы и контрольные точки в понятном договоре.",
                ],
                [
                  Clock3,
                  "Темп",
                  "Единая команда ведёт проект от эскиза до передачи ключей.",
                ],
              ].map(([Icon, title, text], i) => (
                <div
                  key={title as string}
                  className="spotlight-card bg-[#f5f3ed] p-6"
                  {...spotlightHandlers()}
                >
                  <Icon
                    className="float-soft text-[#bc5c35]"
                    size={22}
                    style={{ animationDelay: `${i * 0.6}s` }}
                  />
                  <h3 className="mt-7 text-base font-extrabold">
                    {title as string}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#64706d]">
                    {text as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eae6dc] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28">
          <div className="mx-auto max-w-[1360px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Выберите отправную точку</p>
                <h2 className="display mt-4 text-4xl font-semibold leading-[.98] sm:text-5xl">
                  Комплектация — это
                  <br />
                  уровень <span className="text-[#bc5c35]">вашей свободы.</span>
                </h2>
              </div>
              <Link
                href="/services"
                className="group flex items-center gap-2 border-b border-[#18201f] pb-2 text-xs font-extrabold"
              >
                Подробно о комплектациях{" "}
                <ChevronRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {[
                [
                  "01",
                  "Эконом",
                  "Рациональная база",
                  "Конструктив, кровля, подготовка под инженерные решения.",
                ],
                [
                  "02",
                  "Стандарт",
                  "Готово к жизни",
                  "Чистовая отделка, базовая инженерия и продуманная эргономика.",
                ],
                [
                  "03",
                  "Премиум",
                  "Под ваш образ жизни",
                  "Архитектурный сценарий, продвинутая инженерия и индивидуальные материалы.",
                ],
              ].map(([no, title, tag, text], i) => (
                <div
                  key={title}
                  className={`spotlight-card min-h-[300px] border p-7 ${i === 1 ? "spotlight-card--dark border-[#bc5c35] bg-[#202a28] text-white" : "border-[#18201f]/15 bg-[#f8f6f0]"}`}
                  {...spotlightHandlers()}
                >
                  <span
                    className={`text-[11px] font-black tracking-[.17em] ${i === 1 ? "text-[#e9a07d]" : "text-[#bc5c35]"}`}
                  >
                    {no}
                  </span>
                  <p className="mt-12 text-[11px] font-extrabold uppercase tracking-[.13em] opacity-60">
                    {tag}
                  </p>
                  <h3 className="display mt-3 text-3xl font-semibold">
                    {title}
                  </h3>
                  <p className="mt-6 max-w-xs text-sm leading-6 opacity-70">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28">
          <div className="mx-auto max-w-[1360px]">
            <Reveal>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="eyebrow">Реализованные дома</p>
                  <h2 className="display mt-4 text-4xl font-semibold sm:text-5xl">
                    Не квадратные метры.
                    <br />
                    <span className="text-[#bc5c35]">Прожитые истории.</span>
                  </h2>
                </div>
                <Link href="/projects" className="btn-outline">
                  Все проекты <MoveUpRight size={16} />
                </Link>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.name} delay={i * 90}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group block"
                  >
                    <div className="liquid-shine relative aspect-[4/3] overflow-hidden bg-[#d8d4c9]">
                      <img
                        src={project.image}
                        alt={project.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-3 top-3 bg-[#f5f3ed] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.1em]">
                        {project.tag}
                      </span>
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="display text-xl font-semibold">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#64706d]">
                          {project.meta}
                        </p>
                      </div>
                      <span className="grid h-8 w-8 place-items-center border border-[#18201f]/15 transition-colors group-hover:bg-[#bc5c35] group-hover:text-white">
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28">
          <div className="mx-auto max-w-[1360px]">
            <Reveal>
              <p className="eyebrow">Отзывы владельцев домов</p>
              <h2 className="display mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl">
                Слова тех, кто уже{" "}
                <span className="text-[#bc5c35]">прошёл этот путь.</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.author} delay={i * 110}>
                  <figure
                    className="spotlight-card flex h-full flex-col justify-between border border-[#18201f]/15 bg-[#f8f6f0] p-7"
                    {...spotlightHandlers()}
                  >
                    <blockquote className="text-[15px] leading-7">
                      «{t.quote}»
                    </blockquote>
                    <figcaption className="mt-7 border-t border-[#18201f]/10 pt-4 text-xs font-extrabold">
                      {t.author}
                      <span className="ml-2 font-bold text-[#64706d]">
                        {t.meta}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#202a28] px-5 py-20 text-[#eff1e9] lg:px-9 lg:py-28">
          <div className="mx-auto max-w-[1360px]">
            <p className="eyebrow text-[#e9a07d]">Как мы работаем</p>
            <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="display max-w-2xl text-4xl font-semibold leading-[.98] sm:text-5xl">
                Вопросы не теряются
                <br />
                между этапами.
              </h2>
              <Link href="/process" className="btn-ghost w-fit">
                Весь процесс <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-14 grid gap-7 md:grid-cols-4">
              {process.map(([no, title, text], i) => (
                <Reveal key={no} delay={i * 80}>
                  <div className="border-t border-white/20 pt-5">
                    <span className="text-[11px] font-extrabold tracking-[.16em] text-[#e9a07d]">
                      {no}
                    </span>
                    <h3 className="mt-8 text-base font-extrabold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/60">
                      {text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28">
          <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[.78fr_1.22fr]">
            <div>
              <p className="eyebrow">Ответы до первого звонка</p>
              <h2 className="display mt-4 text-4xl font-semibold leading-[.98] sm:text-5xl">
                Обсудим <span className="text-[#bc5c35]">предметно.</span>
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#64706d]">
                Сначала сориентируем по бюджету, а затем соберём решение,
                которое подойдёт именно вашему участку и семье.
              </p>
              <Link
                href="/faq"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#18201f] pb-2 text-xs font-extrabold"
              >
                Все вопросы <ArrowRight size={15} />
              </Link>
            </div>
            <div>
              {faqs.map(([q, a]) => (
                <details
                  key={q}
                  className="group border-t border-[#18201f]/15 py-5 last:border-b"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold">
                    <span>{q}</span>
                    <span className="grid h-6 w-6 place-items-center border border-[#18201f]/20 text-[#bc5c35] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="max-w-xl pt-4 text-sm leading-7 text-[#64706d]">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#bc5c35] px-5 py-16 text-white lg:px-9 lg:py-20">
          <div className="mx-auto grid max-w-[1360px] items-center gap-8 lg:grid-cols-[1.3fr_.7fr]">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.14em] text-white/65">
                <Sparkles size={15} /> С чего начать
              </div>
              <h2 className="display mt-5 max-w-2xl text-4xl font-semibold leading-[.95] sm:text-6xl">
                Получите ориентир
                <br />
                по вашему дому
                <br />
                за 2 минуты.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-sm text-sm leading-6 text-white/76">
                Калькулятор не заменит проект, но даст честный диапазон и
                поможет подготовить разговор с архитектором.
              </p>
              <Link
                href="/calculator"
                className="mt-7 inline-flex min-h-[50px] items-center gap-3 bg-[#202a28] px-5 text-[13px] font-extrabold text-white"
              >
                Рассчитать стоимость <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
