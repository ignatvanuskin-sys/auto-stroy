import MarketingShell from "@/components/MarketingShell";
import GlowingFrame from "@/components/GlowingFrame";
import OrbField from "@/components/OrbField";
import { ArrowDownRight, ArrowRight, Check, ChevronRight, Clock3, Layers3, MapPin, MoveUpRight, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";

const projects = [
  { name: "Дом у Алатау", meta: "186 м² · Алматы · 5 месяцев", image: "/manus-storage/project-alatau_d5607163.jpg", tag: "Стандарт" },
  { name: "Резиденция Аркас", meta: "142 м² · Конаев · 4 месяца", image: "/manus-storage/project-arkas_e2825fec.jpg", tag: "Стандарт" },
  { name: "Дом Самрук", meta: "248 м² · Алматы · 7 месяцев", image: "/manus-storage/project-samruk_7a820867.jpg", tag: "Премиум" },
];

const process = [
  ["01", "Знакомство", "Разбираем ваши задачи, участок и желаемый образ дома."],
  ["02", "Проектирование", "Фиксируем архитектуру, инженерную логику и бюджетный диапазон."],
  ["03", "Строительство", "Ведём объект по этапам, с понятной отчётностью и контролем качества."],
  ["04", "Сдача дома", "Передаём готовый дом и документацию — без незакрытых вопросов."],
];

const faqs = [
  ["Насколько точен расчёт на сайте?", "Он показывает честный ориентировочный диапазон по площади, региону и комплектации. Точную смету готовим после уточнения участка и проекта."],
  ["Можно строить, если участка ещё нет?", "Да. Поможем определить требования к участку и заранее спланировать будущий дом без привязки к случайной локации."],
  ["Что входит в комплектацию «Стандарт»?", "Конструктив, кровля, базовые инженерные системы и чистовая отделка. Полный состав фиксируем в коммерческом предложении."],
  ["В каких регионах вы работаете?", "В Алматы, Астане, Шымкенте, Караганде и Конаеве. Для других локаций оцениваем логистику индивидуально."],
];

export default function Home() {
  return <MarketingShell dark>
    <main>
      <section className="relative isolate min-h-[730px] overflow-hidden border-b border-white/15">
        <img src="/manus-storage/hero-house_0c10fe95.jpg" alt="Современный дом BuildScope у гор" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,22,21,.92)_0%,rgba(15,22,21,.68)_42%,rgba(15,22,21,.13)_78%),linear-gradient(0deg,rgba(15,22,21,.45),transparent_45%)]" />
        <OrbField />
        <div className="mx-auto flex min-h-[665px] max-w-[1360px] flex-col justify-between px-5 pb-8 pt-20 lg:px-9 lg:pb-10 lg:pt-28">
          <div className="motion-reveal max-w-[690px]">
            <p className="eyebrow text-[#e9a07d]">Частные дома под ключ · Казахстан</p>
            <h1 className="display mt-5 text-[48px] font-semibold leading-[.94] tracking-[-.07em] text-white sm:text-[67px] lg:text-[86px]">Дом, который<br />начинается с<br /><span className="text-[#e9a07d]">ясности.</span></h1>
            <p className="mt-8 max-w-md text-[16px] leading-7 text-white/76">Проектируем и строим современные дома — с прозрачным процессом, инженерной точностью и комфортом для вашей семьи.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><GlowingFrame className="w-fit" tone="dark"><Link href="/calculator" className="btn-primary">Рассчитать стоимость дома <ArrowRight size={17} /></Link></GlowingFrame><Link href="/projects" className="btn-ghost">Смотреть проекты <ArrowDownRight size={17} /></Link></div>
          </div>
          <div className="motion-reveal motion-reveal--2 grid max-w-[780px] grid-cols-3 divide-x divide-white/20 border-y border-white/20 py-4 text-white"><div className="px-2"><div className="display text-2xl font-bold">10 лет</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">в частном строительстве</div></div><div className="px-4"><div className="display text-2xl font-bold">47</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">реализованных домов</div></div><div className="px-4"><div className="display text-2xl font-bold">5–8 мес.</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">типовой срок строительства</div></div></div>
        </div>
      </section>

      <section className="site-grid bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28"><div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[1fr_1.25fr]"><div><p className="eyebrow">С чего начинается ваш дом</p><h2 className="display mt-4 max-w-md text-4xl font-semibold leading-[.98] sm:text-5xl">Не с обещаний.<br />С продуманной<br /><span className="text-[#bc5c35]">системы решений.</span></h2></div><div className="grid gap-px bg-[#18201f]/15 sm:grid-cols-2">{[[Ruler,"Архитектура","Дом строится вокруг привычек семьи, участка и света — не вокруг типового плана."],[Layers3,"Инженерия","Прорабатываем фундамент, конструкции и коммуникации до начала работ."],[ShieldCheck,"Контроль","Закрепляем этапы, материалы и контрольные точки в понятном договоре."],[Clock3,"Темп","Единая команда ведёт проект от эскиза до передачи ключей."]].map(([Icon,title,text]) => <div key={title as string} className="bg-[#f5f3ed] p-6"><Icon className="text-[#bc5c35]" size={22}/><h3 className="mt-7 text-base font-extrabold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[#64706d]">{text as string}</p></div>)}</div></div></section>

      <section className="bg-[#eae6dc] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28"><div className="mx-auto max-w-[1360px]"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Выберите отправную точку</p><h2 className="display mt-4 text-4xl font-semibold leading-[.98] sm:text-5xl">Комплектация — это<br />уровень <span className="text-[#bc5c35]">вашей свободы.</span></h2></div><Link href="/services" className="group flex items-center gap-2 border-b border-[#18201f] pb-2 text-xs font-extrabold">Подробно о комплектациях <ChevronRight size={15} className="transition-transform group-hover:translate-x-1"/></Link></div><div className="mt-12 grid gap-4 lg:grid-cols-3">{[["01","Эконом","Рациональная база","Конструктив, кровля, подготовка под инженерные решения."],["02","Стандарт","Готово к жизни","Чистовая отделка, базовая инженерия и продуманная эргономика."],["03","Премиум","Под ваш образ жизни","Архитектурный сценарий, продвинутая инженерия и индивидуальные материалы."]].map(([no,title,tag,text], i) => <div key={title} className={`min-h-[300px] border p-7 ${i===1 ? "border-[#bc5c35] bg-[#202a28] text-white" : "border-[#18201f]/15 bg-[#f8f6f0]"}`}><span className={`text-[11px] font-black tracking-[.17em] ${i===1 ? "text-[#e9a07d]" : "text-[#bc5c35]"}`}>{no}</span><p className="mt-12 text-[11px] font-extrabold uppercase tracking-[.13em] opacity-60">{tag}</p><h3 className="display mt-3 text-3xl font-semibold">{title}</h3><p className="mt-6 max-w-xs text-sm leading-6 opacity-70">{text}</p></div>)}</div></div></section>

      <section className="bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28"><div className="mx-auto max-w-[1360px]"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow">Реализованные дома</p><h2 className="display mt-4 text-4xl font-semibold sm:text-5xl">Не квадратные метры.<br /><span className="text-[#bc5c35]">Прожитые истории.</span></h2></div><Link href="/projects" className="btn-outline">Все проекты <MoveUpRight size={16}/></Link></div><div className="mt-12 grid gap-5 md:grid-cols-3">{projects.map((project, i) => <Link href={`/projects/${i===0?"alatau":i===1?"arkas":"samruk"}`} key={project.name} className="group motion-reveal" style={{ animationDelay: `${i * 70}ms` }}><div className="liquid-shine relative aspect-[4/3] overflow-hidden bg-[#d8d4c9]"><img src={project.image} alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/><span className="absolute left-3 top-3 bg-[#f5f3ed] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.1em]">{project.tag}</span></div><div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="display text-xl font-semibold">{project.name}</h3><p className="mt-1 text-xs text-[#64706d]">{project.meta}</p></div><span className="grid h-8 w-8 place-items-center border border-[#18201f]/15 transition-colors group-hover:bg-[#bc5c35] group-hover:text-white"><ArrowRight size={15}/></span></div></Link>)}</div></div></section>

      <section className="bg-[#202a28] px-5 py-20 text-[#eff1e9] lg:px-9 lg:py-28"><div className="mx-auto max-w-[1360px]"><p className="eyebrow text-[#e9a07d]">Как мы работаем</p><div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><h2 className="display max-w-2xl text-4xl font-semibold leading-[.98] sm:text-5xl">Вопросы не теряются<br />между этапами.</h2><Link href="/process" className="btn-ghost w-fit">Весь процесс <ArrowRight size={16}/></Link></div><div className="mt-14 grid gap-7 md:grid-cols-4">{process.map(([no,title,text]) => <div key={no} className="border-t border-white/20 pt-5"><span className="text-[11px] font-extrabold tracking-[.16em] text-[#e9a07d]">{no}</span><h3 className="mt-8 text-base font-extrabold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{text}</p></div>)}</div></div></section>

      <section className="bg-[#f5f3ed] px-5 py-20 text-[#18201f] lg:px-9 lg:py-28"><div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[.78fr_1.22fr]"><div><p className="eyebrow">Ответы до первого звонка</p><h2 className="display mt-4 text-4xl font-semibold leading-[.98] sm:text-5xl">Обсудим <span className="text-[#bc5c35]">предметно.</span></h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#64706d]">Сначала сориентируем по бюджету, а затем соберём решение, которое подойдёт именно вашему участку и семье.</p><Link href="/faq" className="mt-8 inline-flex items-center gap-2 border-b border-[#18201f] pb-2 text-xs font-extrabold">Все вопросы <ArrowRight size={15}/></Link></div><div>{faqs.map(([q,a]) => <details key={q} className="group border-t border-[#18201f]/15 py-5 last:border-b"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold"><span>{q}</span><span className="grid h-6 w-6 place-items-center border border-[#18201f]/20 text-[#bc5c35] transition-transform group-open:rotate-45">+</span></summary><p className="max-w-xl pt-4 text-sm leading-7 text-[#64706d]">{a}</p></details>)}</div></div></section>

      <section className="bg-[#bc5c35] px-5 py-16 text-white lg:px-9 lg:py-20"><div className="mx-auto grid max-w-[1360px] items-center gap-8 lg:grid-cols-[1.3fr_.7fr]"><div><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.14em] text-white/65"><Sparkles size={15}/> С чего начать</div><h2 className="display mt-5 max-w-2xl text-4xl font-semibold leading-[.95] sm:text-6xl">Получите ориентир<br />по вашему дому<br />за 2 минуты.</h2></div><div className="lg:justify-self-end"><p className="max-w-sm text-sm leading-6 text-white/76">Калькулятор не заменит проект, но даст честный диапазон и поможет подготовить разговор с архитектором.</p><Link href="/calculator" className="mt-7 inline-flex min-h-[50px] items-center gap-3 bg-[#202a28] px-5 text-[13px] font-extrabold text-white">Рассчитать стоимость <ArrowRight size={17}/></Link></div></div></section>
    </main>
  </MarketingShell>;
}
