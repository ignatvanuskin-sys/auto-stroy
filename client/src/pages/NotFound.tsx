import { AlertTriangle, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#f5f3ed] flex items-center justify-center px-5 py-16 text-[#18201f]">
      <div className="card max-w-lg w-full p-8 sm:p-12 text-center">
        <div className="flex justify-center">
          <span className="grid h-14 w-14 place-items-center border border-[#18201f]/15 text-[#bc5c35]">
            <AlertTriangle size={26} />
          </span>
        </div>
        <p className="eyebrow mt-8">Ошибка 404</p>
        <h1 className="display mt-2 text-4xl font-semibold sm:text-5xl">
          Страница не найдена
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#64706d]">
          Похоже, такой страницы не существует или она была перемещена.
          Вернитесь на главную или откройте калькулятор расчёта.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="btn-primary"
          >
            <Home size={16} /> На главную
          </button>
          <Link href="/calculator" className="btn-outline">
            Калькулятор
          </Link>
        </div>
      </div>
    </div>
  );
}
