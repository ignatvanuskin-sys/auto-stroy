import { Bell, Building2, ChartNoAxesCombined, ChevronLeft, ClipboardList, FileText, LayoutDashboard, ListChecks, Settings2, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";

const navigation = [
  [LayoutDashboard, "Обзор", "/crm/dashboard"],
  [UsersRound, "Лиды", "/crm/leads"],
  [FileText, "Предложения", "/crm/proposals"],
  [ListChecks, "Задачи", "/crm/tasks"],
  [ChartNoAxesCombined, "Аналитика", "/crm/analytics"],
  [Settings2, "Настройки", "/crm/settings"],
];

export default function CrmShell({ children, title, action }: { children: React.ReactNode; title: string; action?: React.ReactNode }) {
  const [location] = useLocation();
  return <div className="crm-shell flex min-h-screen">
    <aside className="crm-sidebar fixed inset-y-0 left-0 z-20 hidden w-[238px] flex-col border-r border-white/10 lg:flex">
      <div className="flex h-[75px] items-center gap-3 border-b border-white/10 px-6"><span className="grid h-8 w-8 place-items-center bg-[#bc5c35] text-sm font-black text-white">B</span><div className="leading-none"><strong className="display text-[18px] font-bold tracking-[-.06em] text-white">BuildScope</strong><span className="mt-1 block text-[8px] font-extrabold uppercase tracking-[.15em] text-[#aeb9b2]">CRM workspace</span></div></div>
      <div className="px-4 py-5"><p className="mb-3 px-2 text-[9px] font-black uppercase tracking-[.15em] text-[#7f8d85]">Продажи</p><nav className="grid gap-1">{navigation.map(([Icon,label,href]) => <Link key={href as string} href={href as string} className={`crm-nav ${location.startsWith(href as string) ? "active" : ""}`}><Icon size={17}/><span>{label as string}</span></Link>)}</nav></div>
      <div className="mt-auto border-t border-white/10 p-4"><div className="border border-white/10 bg-white/5 p-3"><p className="text-[9px] font-black uppercase tracking-[.13em] text-[#e9a07d]">Demo workspace</p><p className="mt-2 text-xs leading-5 text-[#aeb9b2]">Alatau Build<br/>Алматы, Казахстан</p></div><Link href="/" className="mt-4 flex items-center gap-2 px-2 text-xs font-bold text-[#aeb9b2] hover:text-white"><ChevronLeft size={15}/> На публичный сайт</Link></div>
    </aside>
    <main className="min-w-0 flex-1 lg:ml-[238px]"><header className="sticky top-0 z-10 flex h-[75px] items-center justify-between border-b border-[#18201f]/10 bg-[#f1f0eb]/95 px-5 backdrop-blur lg:px-8"><div className="flex items-center gap-3 lg:hidden"><span className="grid h-8 w-8 place-items-center bg-[#bc5c35] text-sm font-black text-white">B</span><span className="display text-lg font-bold">BuildScope</span></div><h1 className="display hidden text-2xl font-semibold lg:block">{title}</h1><div className="ml-auto flex items-center gap-3">{action}<button aria-label="Уведомления" className="relative grid h-9 w-9 place-items-center border border-[#18201f]/15"><Bell size={17}/><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#bc5c35]"/></button><div className="hidden items-center gap-2 border-l border-[#18201f]/15 pl-3 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d7d9cf] text-[10px] font-extrabold">АK</span><div className="text-xs"><strong className="block">Айгерим К.</strong><span className="text-[#64706d]">Менеджер</span></div></div></div></header><div className="lg:hidden"><div className="flex overflow-x-auto border-b border-[#18201f]/10 bg-[#f1f0eb] px-3">{navigation.slice(0,5).map(([Icon,label,href])=><Link key={href as string} href={href as string} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-[10px] font-extrabold ${location.startsWith(href as string)?"border-[#bc5c35] text-[#bc5c35]":"border-transparent text-[#64706d]"}`}><Icon size={13}/>{label as string}</Link>)}</div></div><div className="p-5 lg:p-8">{children}</div></main>
  </div>;
}
