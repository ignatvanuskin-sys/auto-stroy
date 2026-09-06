import CrmShell from "@/components/CrmShell";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Filter,
  Flame,
  KanbanSquare,
  List,
  Loader2,
  MessageSquareText,
  Plus,
  Send,
  Sparkles,
  Target,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react";
import { useMemo, useState, type ElementType } from "react";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";

const pipeline = [
  "New",
  "Qualified",
  "Contacted",
  "Site Visit",
  "Estimate Sent",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
] as const;
const displayStatus: Record<string, string> = {
  New: "Новые",
  Qualified: "Квалифицированы",
  Contacted: "Связались",
  "Site Visit": "Встреча",
  "Estimate Sent": "Расчёт",
  "Proposal Sent": "КП",
  Negotiation: "Переговоры",
  Won: "Выиграны",
  Lost: "Закрыты",
};
const displayBand: Record<string, string> = {
  cold: "Cold",
  warm: "Warm",
  hot: "Hot",
  very_hot: "Very hot",
};
const money = (amount: number) =>
  `${(amount / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млн ₸`;
const date = (value: Date | string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
      })
    : "—";

function Score({ score, band }: { score: number; band: string }) {
  return (
    <span className={`score-pill score-${band}`}>
      <span className="status-dot bg-current opacity-75" />
      {score}/100 · {displayBand[band]}
    </span>
  );
}
function Loading() {
  return (
    <div className="grid min-h-[340px] place-items-center text-[#64706d]">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );
}
function LeadCard({ lead }: { lead: any }) {
  return (
    <Link href={`/crm/leads/${lead.id}`} className="lead-card block">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold">{lead.name}</h3>
          <p className="mt-1 text-[11px] text-[#64706d]">
            {lead.projectType} · {lead.areaM2} м² · {lead.region}
          </p>
        </div>
        <Score score={lead.score} band={lead.scoreBand} />
      </div>
      <p className="mt-4 text-xs font-bold">
        {lead.budgetRange || "Бюджет уточняется"}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-[#18201f]/10 pt-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#64706d]">
        <span>{lead.source}</span>
        <span>{date(lead.createdAt)}</span>
      </div>
    </Link>
  );
}

export function CrmDashboard() {
  const overview = trpc.crm.overview.useQuery();
  const notifications = trpc.crm.notifications.useQuery();
  if (overview.isLoading)
    return (
      <CrmShell title="Обзор">
        <Loading />
      </CrmShell>
    );
  const data = overview.data;
  return (
    <CrmShell
      title="Обзор"
      action={
        <Link
          href="/crm/leads"
          className="btn-primary hidden min-h-[38px] px-3 text-[11px] sm:inline-flex"
        >
          Открыть лиды <ArrowRight size={14} />
        </Link>
      }
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Алматы · Неделя 36</p>
            <h2 className="display mt-2 text-3xl font-semibold">
              Продажи в фокусе.
            </h2>
          </div>
          <p className="text-xs leading-5 text-[#64706d]">
            Сводка по входящим заявкам и активным сделкам команды ARQA HOUSE.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Всего лидов", data?.total ?? 0, "за 30 дней", UsersIcon],
            [
              "Hot / Very Hot",
              data?.hotCount ?? 0,
              "требуют быстрого контакта",
              Flame,
            ],
            [
              "Pipeline",
              money(data?.totalPipeline ?? 0),
              "ориентировочная стоимость",
              Target,
            ],
            [
              "Первый ответ",
              data?.responseTime ?? "—",
              "среднее время менеджера",
              BarChart3,
            ],
          ].map(([label, value, hint, Icon]) => {
            const MetricIcon = Icon as ElementType;
            return (
              <div key={label as string} className="kpi">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#64706d]">
                    {label as string}
                  </span>
                  <MetricIcon size={17} className="text-[#bc5c35]" />
                </div>
                <p className="display mt-7 text-3xl font-semibold">
                  {value as string | number}
                </p>
                <p className="mt-2 text-[11px] text-[#64706d]">
                  {hint as string}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold">Воронка сделок</p>
                <p className="mt-1 text-xs text-[#64706d]">
                  Текущая картина по всем статусам
                </p>
              </div>
              <Link
                href="/crm/analytics"
                className="text-xs font-extrabold text-[#bc5c35]"
              >
                Детали
              </Link>
            </div>
            <div className="mt-7 space-y-3">
              {data?.byStatus
                .filter(item => !["Lost"].includes(item.status))
                .slice(0, 7)
                .map((item, index) => (
                  <div
                    key={item.status}
                    className="grid grid-cols-[118px_1fr_28px] items-center gap-3"
                  >
                    <span className="text-[11px] font-bold text-[#64706d]">
                      {displayStatus[item.status]}
                    </span>
                    <div className="h-2 overflow-hidden bg-[#e7e5de]">
                      <div
                        className="h-full bg-[#bc5c35]"
                        style={{
                          width: `${Math.max(7, (item.count / Math.max(data.total, 1)) * 100)}%`,
                          opacity: 1 - index * 0.09,
                        }}
                      />
                    </div>
                    <strong className="text-right text-xs">{item.count}</strong>
                  </div>
                ))}
            </div>
            <div className="mt-8 grid grid-cols-3 divide-x divide-[#18201f]/10 border-t border-[#18201f]/10 pt-5">
              <div>
                <p className="display text-xl font-bold">
                  {data?.proposalCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#64706d]">
                  отправлено КП
                </p>
              </div>
              <div className="px-4">
                <p className="display text-xl font-bold">{data?.wonCount}</p>
                <p className="mt-1 text-[10px] font-bold text-[#64706d]">
                  выиграно
                </p>
              </div>
              <div className="px-4">
                <p className="display text-xl font-bold">
                  {data?.total
                    ? Math.round(((data.wonCount || 0) / data.total) * 100)
                    : 0}
                  %
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#64706d]">
                  конверсия
                </p>
              </div>
            </div>
          </section>
          <section className="card overflow-hidden">
            <div className="border-b border-[#18201f]/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold">Telegram — входящие</p>
                  <p className="mt-1 text-xs text-[#64706d]">
                    Очередь уведомлений команды
                  </p>
                </div>
                <MessageSquareText size={19} className="text-[#bc5c35]" />
              </div>
            </div>
            <div className="divide-y divide-[#18201f]/10">
              {notifications.data?.slice(0, 3).map((notice: any) => (
                <div key={notice.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#bc5c35]">
                      {notice.channel}
                    </span>
                    <span className="text-[10px] font-bold text-[#64706d]">
                      {notice.status === "queued"
                        ? "готово к отправке"
                        : notice.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold">
                    {(notice.payload as any)?.title || "Новое уведомление"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#64706d]">
                    {(notice.payload as any)?.text || ""}
                  </p>
                </div>
              )) || (
                <p className="p-5 text-sm text-[#64706d]">
                  Нет новых уведомлений.
                </p>
              )}
            </div>
          </section>
        </div>
        <section className="mt-5 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold">Источники заявок</p>
              <p className="mt-1 text-xs text-[#64706d]">
                Откуда приходят потенциальные клиенты
              </p>
            </div>
            <Filter size={18} className="text-[#64706d]" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {data?.bySource.map(item => (
              <div
                key={item.source}
                className="border-l-2 border-[#bc5c35] bg-[#f4f2eb] p-4"
              >
                <p className="display text-2xl font-bold">{item.count}</p>
                <p className="mt-2 text-[11px] font-bold text-[#64706d]">
                  {item.source}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CrmShell>
  );
}
const UsersIcon = UserRoundCheck;

export function CrmLeads() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [band, setBand] = useState<string | undefined>();
  const leads = trpc.crm.listLeads.useQuery(
    band
      ? { scoreBand: band as "cold" | "warm" | "hot" | "very_hot" }
      : undefined
  );
  const columns = [
    "New",
    "Qualified",
    "Contacted",
    "Estimate Sent",
    "Proposal Sent",
    "Negotiation",
  ] as const;
  return (
    <CrmShell
      title="Лиды"
      action={
        <Link
          href="/calculator"
          className="btn-primary hidden min-h-[38px] px-3 text-[11px] sm:inline-flex"
        >
          Создать через сайт <Plus size={14} />
        </Link>
      }
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("kanban")}
              className={`flex h-9 items-center gap-2 border px-3 text-xs font-extrabold ${view === "kanban" ? "border-[#bc5c35] bg-[#f4e4dc]" : "border-[#18201f]/15"}`}
            >
              <KanbanSquare size={15} /> Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex h-9 items-center gap-2 border px-3 text-xs font-extrabold ${view === "table" ? "border-[#bc5c35] bg-[#f4e4dc]" : "border-[#18201f]/15"}`}
            >
              <List size={15} /> Таблица
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#64706d]">Score:</span>
            {[undefined, "very_hot", "hot", "warm", "cold"].map(value => (
              <button
                key={value || "all"}
                onClick={() => setBand(value)}
                className={`border px-2.5 py-2 text-[10px] font-extrabold uppercase ${band === value ? "border-[#bc5c35] bg-[#bc5c35] text-white" : "border-[#18201f]/15 bg-[#fffefa]"}`}
              >
                {value ? displayBand[value] : "Все"}
              </button>
            ))}
          </div>
        </div>
        {leads.isLoading ? (
          <Loading />
        ) : view === "kanban" ? (
          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-6 lg:-mx-8 lg:px-8">
            {columns.map(status => {
              const items =
                leads.data?.filter(lead => lead.status === status) || [];
              return (
                <section key={status} className="kanban-column shrink-0">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-[.08em]">
                      {displayStatus[status]}
                    </span>
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#dadbd3] px-1 text-[10px] font-black">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {items.map(lead => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                    {items.length === 0 && (
                      <div className="border border-dashed border-[#18201f]/20 p-4 text-xs text-[#64706d]">
                        Пока нет лидов
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-[#18201f]/10 bg-[#f4f2eb] text-[10px] font-extrabold uppercase tracking-[.1em] text-[#64706d]">
                <tr>
                  {[
                    "Лид",
                    "Проект",
                    "Приоритет",
                    "Статус",
                    "Источник",
                    "Дата",
                  ].map(head => (
                    <th key={head} className="px-5 py-4">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.data?.map(lead => (
                  <tr
                    key={lead.id}
                    className="border-b border-[#18201f]/10 hover:bg-[#f8f7f2]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/crm/leads/${lead.id}`}
                        className="font-extrabold hover:text-[#bc5c35]"
                      >
                        {lead.name}
                      </Link>
                      <p className="mt-1 text-xs text-[#64706d]">
                        {lead.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <strong>
                        {lead.projectType} {lead.areaM2} м²
                      </strong>
                      <p className="mt-1 text-xs text-[#64706d]">
                        {lead.region}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Score score={lead.score} band={lead.scoreBand} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="border border-[#18201f]/15 px-2 py-1 text-xs font-bold">
                        {displayStatus[lead.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold">
                      {lead.source}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#64706d]">
                      {date(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CrmShell>
  );
}

export function CrmLeadDetail() {
  const [, params] = useRoute("/crm/leads/:id");
  const id = Number(params?.id || 1);
  const leadData = trpc.crm.getLead.useQuery({ id });
  const utils = trpc.useUtils();
  const [proposal, setProposal] = useState<null | {
    proposalNumber: string;
    pdfBase64: string;
    preview: { title: string; range: string; disclaimer: string };
  }>(null);
  const update = trpc.crm.updateStatus.useMutation({
    onSuccess: () => {
      utils.crm.getLead.invalidate({ id });
      utils.crm.listLeads.invalidate();
      utils.crm.overview.invalidate();
      toast.success("Статус обновлён");
    },
  });
  const createProposal = trpc.crm.generateProposal.useMutation({
    onSuccess: data => {
      setProposal(data);
      utils.crm.getLead.invalidate({ id });
      toast.success(
        "Черновик КП создан. Отправка клиенту требует подтверждения."
      );
    },
    onError: e => toast.error(e.message),
  });
  const createTask = trpc.crm.createTask.useMutation({
    onSuccess: () => {
      utils.crm.getLead.invalidate({ id });
      toast.success("Задача добавлена");
    },
  });
  const download = () => {
    if (!proposal) return;
    const binary = atob(proposal.pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${proposal.proposalNumber}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  if (leadData.isLoading)
    return (
      <CrmShell title="Карточка лида">
        <Loading />
      </CrmShell>
    );
  if (!leadData.data)
    return (
      <CrmShell title="Карточка лида">
        <p>Лид не найден.</p>
      </CrmShell>
    );
  const { lead, activities, estimates, tasks, followups, proposals } =
    leadData.data;
  const currentEstimate = estimates[0];
  return (
    <CrmShell
      title="Карточка лида"
      action={
        <Link
          href="/crm/leads"
          className="btn-outline hidden min-h-[38px] px-3 text-[11px] sm:inline-flex"
        >
          <ArrowLeft size={14} /> К списку
        </Link>
      }
    >
      <div className="mx-auto max-w-[1440px]">
        <Link
          href="/crm/leads"
          className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#64706d] sm:hidden"
        >
          <ArrowLeft size={15} /> Все лиды
        </Link>
        <div className="flex flex-col justify-between gap-5 border-b border-[#18201f]/12 pb-6 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Score score={lead.score} band={lead.scoreBand} />
              <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-[#64706d]">
                {lead.source} · {date(lead.createdAt)}
              </span>
            </div>
            <h2 className="display mt-4 text-4xl font-semibold">{lead.name}</h2>
            <p className="mt-2 text-sm text-[#64706d]">
              {lead.phone} · {lead.preferredChannel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-[40px] border border-[#18201f]/15 bg-[#fffefa] px-3 text-xs font-extrabold"
              value={lead.status}
              onChange={e =>
                update.mutate({ id, status: e.target.value as any })
              }
            >
              {pipeline.map(status => (
                <option key={status} value={status}>
                  {displayStatus[status]}
                </option>
              ))}
            </select>
            <button
              onClick={() => createProposal.mutate({ leadId: id })}
              className="btn-primary min-h-[40px] px-3 text-[11px]"
              disabled={createProposal.isPending}
            >
              {createProposal.isPending ? (
                "Создаём…"
              ) : (
                <>
                  Сгенерировать КП <FileText size={14} />
                </>
              )}
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-[1.23fr_.77fr]">
          <div className="grid gap-5">
            <section className="card p-5 sm:p-6">
              <p className="eyebrow">Параметры проекта</p>
              <div className="mt-5 grid gap-px bg-[#18201f]/12 sm:grid-cols-2">
                {[
                  ["Объект", `${lead.projectType}, ${lead.areaM2} м²`],
                  ["Регион", lead.region],
                  ["Этажность", `${lead.floors} этажа`],
                  ["Материал", lead.material],
                  [
                    "Комплектация",
                    lead.finishTier === "standard"
                      ? "Стандарт"
                      : lead.finishTier === "premium"
                        ? "Премиум"
                        : "Эконом",
                  ],
                  ["Участок", lead.hasLand ? "Уже есть" : "Нужно подобрать"],
                  ["Срок", lead.desiredStart || "Уточняется"],
                  ["Бюджет", lead.budgetRange || "Не указан"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#fffefa] p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#64706d]">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-extrabold">{value}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">AI qualification</p>
                  <h3 className="mt-2 text-base font-extrabold">
                    Сводка для менеджера
                  </h3>
                </div>
                <Sparkles size={19} className="text-[#bc5c35]" />
              </div>
              <p className="mt-5 border-l-2 border-[#bc5c35] pl-4 text-sm leading-7 text-[#45504c]">
                {lead.aiSummary ||
                  "AI-резюме отсутствует — нужна ручная проверка."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {lead.needsManualReview && (
                  <span className="inline-flex items-center gap-1 border border-[#d9a582] bg-[#fff0e7] px-2 py-1 text-[10px] font-extrabold text-[#91441e]">
                    <TriangleAlert size={13} /> ручная проверка
                  </span>
                )}
                <span className="border border-[#18201f]/15 px-2 py-1 text-[10px] font-extrabold">
                  Intent: {lead.aiIntent || "—"}
                </span>
                <span className="border border-[#18201f]/15 px-2 py-1 text-[10px] font-extrabold">
                  Confidence: {lead.aiConfidence ?? 0}%
                </span>
              </div>
            </section>
            <section className="card p-5 sm:p-6">
              <p className="eyebrow">История</p>
              <div className="mt-6 grid gap-6">
                {activities.map(activity => (
                  <div key={activity.id} className="timeline-line">
                    <p className="text-sm font-extrabold">
                      {activity.type === "lead_created"
                        ? "Заявка создана"
                        : activity.type === "qualification_completed"
                          ? "AI-квалификация завершена"
                          : activity.type === "score_calculated"
                            ? "Lead Score рассчитан"
                            : activity.type === "proposal_generated"
                              ? "Черновик КП сформирован"
                              : activity.type === "status_changed"
                                ? "Статус обновлён"
                                : activity.type === "task_created"
                                  ? "Задача добавлена"
                                  : activity.type}
                    </p>
                    <p className="mt-1 text-xs text-[#64706d]">
                      {date(activity.createdAt)} ·{" "}
                      {activity.actorType === "ai"
                        ? "AI"
                        : activity.actorType === "system"
                          ? "Система"
                          : "Менеджер"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="grid h-fit gap-5">
            <section className="card-dark p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-[#b9c3bd]">
                Предварительный расчёт
              </p>
              <p className="display mt-6 text-4xl font-semibold">
                {currentEstimate
                  ? `${money(currentEstimate.lowAmount)} — ${money(currentEstimate.highAmount)}`
                  : "—"}
              </p>
              <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-5 text-white/57">
                Диапазон рассчитан детерминированным движком. AI не участвует в
                формировании суммы.
              </p>
            </section>
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold">Задачи</p>
                  <p className="mt-1 text-xs text-[#64706d]">
                    Следующие действия
                  </p>
                </div>
                <button
                  onClick={() =>
                    createTask.mutate({
                      leadId: id,
                      title: "Связаться с клиентом и уточнить детали",
                    })
                  }
                  className="grid h-8 w-8 place-items-center border border-[#18201f]/15"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex gap-3 border-t border-[#18201f]/10 pt-3"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center border border-[#bc5c35] text-[#bc5c35]">
                      <Check size={10} />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold">{task.title}</p>
                      <p className="mt-1 text-[10px] text-[#64706d]">
                        до {date(task.dueAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-xs text-[#64706d]">Нет активных задач.</p>
                )}
              </div>
            </section>
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold">Follow-up</p>
                  <p className="mt-1 text-xs text-[#64706d]">
                    Только черновики до подтверждения
                  </p>
                </div>
                <Send size={17} className="text-[#bc5c35]" />
              </div>
              <div className="mt-5 grid gap-3">
                {followups.map(item => (
                  <div
                    key={item.id}
                    className="border-l-2 border-[#bc5c35] pl-3"
                  >
                    <p className="text-xs font-extrabold">
                      День {item.type.replace("day_", "")}
                    </p>
                    <p className="mt-1 text-[10px] text-[#64706d]">
                      {date(item.scheduledAt)} ·{" "}
                      {item.status === "pending"
                        ? "ожидает подтверждения"
                        : item.status}
                    </p>
                  </div>
                ))}
                {followups.length === 0 && (
                  <p className="text-xs text-[#64706d]">
                    Будут предложены после генерации КП.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
        {proposal && (
          <section className="mt-5 border border-[#bc5c35] bg-[#f4e4dc] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="eyebrow">PDF готов</p>
                <h3 className="display mt-2 text-2xl font-semibold">
                  {proposal.preview.title}
                </h3>
                <p className="mt-2 text-sm text-[#64706d]">
                  {proposal.preview.range} · {proposal.preview.disclaimer}
                </p>
              </div>
              <button onClick={download} className="btn-primary">
                <Download size={16} /> Скачать PDF
              </button>
            </div>
          </section>
        )}
      </div>
    </CrmShell>
  );
}

export function CrmTasks() {
  const tasks = trpc.crm.listTasks.useQuery();
  return (
    <CrmShell title="Задачи">
      <div className="mx-auto max-w-[1150px]">
        <div className="mb-7">
          <p className="eyebrow">Операционный ритм</p>
          <h2 className="display mt-2 text-3xl font-semibold">
            Следующие действия.
          </h2>
        </div>
        {tasks.isLoading ? (
          <Loading />
        ) : (
          <div className="card divide-y divide-[#18201f]/10">
            {tasks.data?.map(task => (
              <div
                key={task.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <span className="grid h-9 w-9 place-items-center border border-[#bc5c35] text-[#bc5c35]">
                  <ClipboardCheck size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold">{task.title}</p>
                  <p className="mt-1 text-xs text-[#64706d]">
                    Связано с лидом #{task.leadId || "—"} · срок:{" "}
                    {date(task.dueAt)}
                  </p>
                </div>
                <span className="w-fit border border-[#18201f]/15 px-2 py-1 text-[10px] font-extrabold uppercase">
                  {task.status === "open" ? "Открыта" : "Готово"}
                </span>
              </div>
            ))}
            {tasks.data?.length === 0 && (
              <p className="p-8 text-sm text-[#64706d]">Пока нет задач.</p>
            )}
          </div>
        )}
      </div>
    </CrmShell>
  );
}

export function CrmProposals() {
  const leads = trpc.crm.listLeads.useQuery();
  const rows =
    leads.data?.filter(lead =>
      ["Proposal Sent", "Negotiation", "Won"].includes(lead.status)
    ) || [];
  return (
    <CrmShell title="Предложения">
      <div className="mx-auto max-w-[1150px]">
        <div className="mb-7">
          <p className="eyebrow">Коммерческие предложения</p>
          <h2 className="display mt-2 text-3xl font-semibold">
            Предложения в работе.
          </h2>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-[#18201f]/10 bg-[#f4f2eb] text-[10px] font-extrabold uppercase tracking-[.1em] text-[#64706d]">
              <tr>
                {["Клиент", "Проект", "Диапазон", "Статус", "Действие"].map(
                  item => (
                    <th key={item} className="px-5 py-4">
                      {item}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(lead => (
                <tr key={lead.id} className="border-b border-[#18201f]/10">
                  <td className="px-5 py-4 text-sm font-extrabold">
                    {lead.name}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {lead.projectType} {lead.areaM2} м²
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {lead.budgetRange || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="border border-[#18201f]/15 px-2 py-1 text-xs font-bold">
                      {displayStatus[lead.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#bc5c35]"
                    >
                      Открыть <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-sm text-[#64706d]">
                    Пока нет сформированных предложений.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CrmShell>
  );
}

export function CrmAnalytics() {
  const overview = trpc.crm.overview.useQuery();
  if (overview.isLoading)
    return (
      <CrmShell title="Аналитика">
        <Loading />
      </CrmShell>
    );
  const data = overview.data;
  return (
    <CrmShell title="Аналитика">
      <div className="mx-auto max-w-[1150px]">
        <div className="mb-7">
          <p className="eyebrow">Business intelligence · базовый уровень</p>
          <h2 className="display mt-2 text-3xl font-semibold">
            Что приносит
            <br />
            качественные сделки.
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="card p-6">
            <p className="text-sm font-extrabold">Конверсия по воронке</p>
            <p className="mt-1 text-xs text-[#64706d]">
              Доля лидов на каждом этапе
            </p>
            <div className="mt-9 space-y-5">
              {data?.byStatus.map((row, index) => (
                <div key={row.status}>
                  <div className="flex justify-between text-xs">
                    <span className="font-extrabold">
                      {displayStatus[row.status]}
                    </span>
                    <span className="text-[#64706d]">{row.count} лидов</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden bg-[#e7e5de]">
                    <div
                      className="h-full bg-[#bc5c35]"
                      style={{
                        width: `${Math.max(3, (row.count / Math.max(data.total, 1)) * 100)}%`,
                        opacity: 1 - index * 0.07,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="card p-6">
            <p className="text-sm font-extrabold">Ключевые показатели</p>
            <div className="mt-6 grid gap-5">
              {[
                ["Среднее время первого ответа", data?.responseTime],
                [
                  "Квалифицированные лиды",
                  `${data?.hotCount} / ${data?.total}`,
                ],
                ["Выиграно", `${data?.wonCount} сделок`],
                ["КП сформировано", `${data?.proposalCount} документов`],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="border-l-2 border-[#bc5c35] pl-4"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-[#64706d]">
                    {label as string}
                  </p>
                  <p className="display mt-2 text-2xl font-bold">
                    {value as string | number}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="mt-5 card p-6">
          <p className="text-sm font-extrabold">Качество источников</p>
          <p className="mt-1 text-xs text-[#64706d]">
            Входящие обращения по каналам — без неподтверждённых ROI-выводов.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-5">
            {data?.bySource.map((row, index) => (
              <div key={row.source} className="border border-[#18201f]/12 p-4">
                <p className="display text-3xl font-bold text-[#bc5c35]">
                  {row.count}
                </p>
                <p className="mt-6 text-xs font-extrabold">{row.source}</p>
                <p className="mt-2 text-[10px] text-[#64706d]">
                  {data.total ? Math.round((row.count / data.total) * 100) : 0}%
                  потока
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CrmShell>
  );
}

export function CrmSettings() {
  const rates = trpc.crm.rates.useQuery();
  const utils = trpc.useUtils();
  const update = trpc.crm.updateRate.useMutation({
    onSuccess: data => {
      utils.crm.rates.invalidate();
      toast.success(`Создана версия тарифов ${data.version}`);
    },
    onError: e => toast.error(e.message),
  });
  const shortlist = useMemo(
    () =>
      rates.data?.filter(
        row => row.region === "Алматы" && row.material !== "Не уверен"
      ) || [],
    [rates.data]
  );
  return (
    <CrmShell title="Настройки">
      <div className="mx-auto max-w-[1150px]">
        <div className="mb-7">
          <p className="eyebrow">Admin Panel · owner access</p>
          <h2 className="display mt-2 text-3xl font-semibold">
            Тарифы и профиль
            <br />
            компании.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#64706d]">
            Изменение создаёт новую версию тарифной записи; старые расчёты
            остаются объяснимыми по зафиксированной версии.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#18201f]/10 p-5">
              <div>
                <p className="text-sm font-extrabold">Rate Tables</p>
                <p className="mt-1 text-xs text-[#64706d]">
                  Алматы · базовые тарифы за м²
                </p>
              </div>
              <span className="border border-[#18201f]/15 px-2 py-1 text-[10px] font-extrabold">
                v1 active
              </span>
            </div>
            {rates.isLoading ? (
              <Loading />
            ) : (
              <div className="divide-y divide-[#18201f]/10">
                {shortlist.map(row => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_130px_auto] items-center gap-3 p-4"
                  >
                    <div>
                      <p className="text-sm font-extrabold">
                        {row.material} ·{" "}
                        {row.finishTier === "standard"
                          ? "Стандарт"
                          : row.finishTier === "premium"
                            ? "Премиум"
                            : "Эконом"}
                      </p>
                      <p className="mt-1 text-[10px] text-[#64706d]">
                        Версия {row.version} · действует с{" "}
                        {date(row.effectiveFrom)}
                      </p>
                    </div>
                    <input
                      defaultValue={row.baseRatePerM2}
                      inputMode="numeric"
                      onBlur={e => {
                        const value = Number(e.currentTarget.value);
                        if (value !== row.baseRatePerM2 && value > 0)
                          update.mutate({ id: row.id, baseRatePerM2: value });
                      }}
                      className="h-9 border border-[#18201f]/15 bg-[#fffefa] px-2 text-right text-xs font-extrabold"
                    />
                    <span className="text-[10px] font-bold text-[#64706d]">
                      ₸ / м²
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <aside className="grid h-fit gap-5">
            <section className="card-dark p-6">
              <p className="eyebrow text-[#e9a07d]">Company Profile</p>
              <h3 className="display mt-4 text-3xl font-semibold">
                ARQA HOUSE
              </h3>
              <p className="mt-5 text-sm leading-6 text-white/60">
                Частное домостроение под ключ · Алматы, Бостандыкский р-н
              </p>
              <div className="mt-7 border-t border-white/15 pt-5 text-xs leading-6 text-white/75">
                <p>info@arqahouse-demo.kz · +7 (700) 000-00-00 (demo)</p>
                <p className="mt-3">
                  С 2016 года · 180+ домов · собственные монтажные бригады.
                </p>
                <p className="mt-3">Акцентный цвет: терракотовый.</p>
              </div>
            </section>
            <section className="card p-5">
              <p className="text-sm font-extrabold">Интеграции</p>
              <div className="mt-5 grid gap-3">
                {[
                  ["Telegram", "Уведомления Hot / Very Hot", "Ожидает токен"],
                  ["Email", "Резервный дайджест", "Не подключено"],
                  ["Follow-up", "Ручное подтверждение", "Включено"],
                ].map(([name, caption, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3 border-t border-[#18201f]/10 pt-3"
                  >
                    <div>
                      <p className="text-xs font-extrabold">{name}</p>
                      <p className="mt-1 text-[10px] text-[#64706d]">
                        {caption}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#bc5c35]">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </CrmShell>
  );
}
