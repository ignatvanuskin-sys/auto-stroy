import { ArrowUpRight, Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const nav = [
  ["Услуги", "/services"],
  ["Проекты", "/projects"],
  ["Процесс", "/process"],
  ["О нас", "/about"],
  ["FAQ", "/faq"],
];

export default function MarketingShell({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  return (
    <div
      className={
        dark
          ? "bg-[#202a28] text-[#eff1e9] min-h-screen"
          : "bg-[#f5f3ed] text-[#18201f] min-h-screen"
      }
    >
      <header className="relative z-30 border-b border-current/15">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-9">
          <Link
            href="/"
            className="min-w-0 flex items-center gap-2.5 sm:gap-3"
            aria-label="ARQA HOUSE"
          >
            <img
              src="/images/arqa-house-mark.jpg"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 object-cover sm:h-9 sm:w-9"
            />
            <div className="min-w-0 leading-none">
              <strong className="display block truncate text-[15px] font-bold tracking-[.02em] sm:text-[17px]">
                ARQA HOUSE
              </strong>
              <span className="mt-1 hidden text-[8px] font-extrabold uppercase tracking-[.18em] opacity-60 sm:block">
                дома под ключ · алматы
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`text-[12px] font-bold transition-opacity hover:opacity-60 ${location === href ? "opacity-100" : "opacity-70"}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/crm/dashboard"
              className="text-[12px] font-bold opacity-70 transition-opacity hover:opacity-100"
            >
              CRM
            </Link>
          </nav>
          <Link
            href="/calculator"
            className="btn-primary hidden min-h-[42px] px-4 text-[12px] md:inline-flex"
          >
            Рассчитать проект <ArrowUpRight size={15} />
          </Link>
          <button
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            className="grid h-10 w-10 shrink-0 place-items-center border border-current/20 lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={18} /> : <Menu size={19} />}
          </button>
        </div>
        <div
          aria-hidden={!open}
          className={`absolute left-0 top-full w-full border-b border-current/15 bg-inherit p-5 transition duration-200 lg:hidden ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
        >
          <div className="mx-auto grid max-w-[1360px] gap-1">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="border-b border-current/10 py-4 text-sm font-bold"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/crm/dashboard"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="border-b border-current/10 py-4 text-sm font-bold"
            >
              CRM / demo
            </Link>
            <Link
              href="/calculator"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="btn-primary mt-4"
            >
              Рассчитать проект <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-current/15 px-5 py-10 lg:px-9">
        <div className="mx-auto grid max-w-[1360px] gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/arqa-house-mark.jpg"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 object-cover"
              />
              <strong className="display text-lg">ARQA HOUSE</strong>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-6 opacity-65">
              Строим частные дома под ключ в Алматы и Алматинской области. Дом,
              который начинается с точного расчёта.
            </p>
          </div>
          <div>
            <p className="eyebrow">Навигация</p>
            <div className="mt-4 grid gap-2 text-xs font-bold opacity-80">
              {nav.slice(0, 4).map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Контакты</p>
            <div className="mt-4 grid gap-2 text-xs font-bold opacity-80">
              <a href="tel:+77270000000">+7 (727) 000-00-00</a>
              <a href="mailto:info@arqahouse.kz">info@arqahouse.kz</a>
              <Link href="/contacts">Алматы, Бостандыкский р-н</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1360px] items-center justify-between border-t border-current/15 pt-5 text-[10px] font-bold uppercase tracking-[.12em] opacity-45">
          <span>© 2026 ARQA HOUSE</span>
          <span className="flex items-center gap-1">
            <Compass size={12} /> Powered by BuildScope AI
          </span>
        </div>
      </footer>
    </div>
  );
}
