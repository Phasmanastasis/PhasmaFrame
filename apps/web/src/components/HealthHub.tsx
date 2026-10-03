import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';

type View = 'home' | 'patients' | 'transfer' | 'summary';
type Role = 'BHW' | 'Patient / caregiver';
type Reading = {
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  measuredBy: string;
  enteredBy: string;
  note?: string;
  source: string;
};

const localDateTimeNow = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const initialReadings: Reading[] = [
  { date: 'Today', time: '8:42 AM', systolic: 132, diastolic: 84, measuredBy: 'Lina Reyes', enteredBy: 'Lina Reyes', source: 'Patient record' },
  { date: 'Oct 01', time: '7:15 PM', systolic: 128, diastolic: 82, measuredBy: 'Lina Reyes', enteredBy: 'Lina Reyes', source: 'Patient record' },
  { date: 'Sep 28', time: '9:10 AM', systolic: 136, diastolic: 86, measuredBy: 'BHW Ana Cruz', enteredBy: 'BHW Ana Cruz', source: 'BHW visit' },
];

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></>,
    swap: <><path d="M4 7h15l-3-3M20 17H5l3 3"/><path d="M19 7v4M5 17v-4"/></>,
    note: <><path d="M7 3h8l4 4v14H5V3z"/><path d="M14 3v5h5M8 13h8M8 17h6"/></>,
    add: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    back: <><path d="m15 18-6-6 6-6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    wifi: <><path d="M5 12.5a11 11 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0M12 20h.01"/><path d="m3 8 1.2 1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/></>,
    heart: <><path d="M20.8 8.6c0 5.1-8.8 10.2-8.8 10.2S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"/><path d="M12 8v6M9 11h6"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.note}</svg>;
};

function ActionButton({ children, onClick, secondary = false, icon }: { children: ReactNode; onClick: () => void; secondary?: boolean; icon?: string }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28675c] ${secondary ? 'border border-[#747a73]/30 bg-white text-[#303631] hover:bg-[#f3f5f0]' : 'bg-[#366b60] text-white hover:bg-[#28594f]'}`}>{icon && <Icon name={icon} size={18} />}{children}</button>;
}

function ReadingRow({ reading }: { reading: Reading }) {
  return <article className="flex items-center justify-between gap-3 border-b border-[#e5e8e1] py-4 last:border-0">
    <div className="min-w-0"><div className="flex items-center gap-2 text-sm font-semibold text-[#303631]"><span>{reading.date}</span><span className="text-[#858a83]">·</span><span className="font-medium text-[#656b64]">{reading.time}</span></div><p className="mt-1 truncate text-xs text-[#70766f]">Measured by {reading.measuredBy} · entered by {reading.enteredBy}</p>{reading.note && <p className="mb-0 mt-1 truncate text-xs italic text-[#858a83]">{reading.note}</p>}</div>
    <div className="shrink-0 text-right"><p className="text-lg font-semibold tracking-tight text-[#263e38]">{reading.systolic}<span className="px-1 text-[#90968f]">/</span>{reading.diastolic}</p><p className="text-[11px] text-[#727870]">mmHg</p></div>
  </article>;
}

export default function HealthHub() {
  const [view, setView] = useState<View>('home');
  const [role, setRole] = useState<Role>('BHW');
  const [readings, setReadings] = useState(initialReadings);
  const [showEntry, setShowEntry] = useState(false);
  const [transferStage, setTransferStage] = useState<'ready' | 'review' | 'complete' | 'retry' | 'cancelled'>('ready');
  const [importConfirmed, setImportConfirmed] = useState(false);
  const [visitNote, setVisitNote] = useState('');
  const [savedNote, setSavedNote] = useState('Follow-up completed. Patient brought home readings for review.');
  const [localDataReady, setLocalDataReady] = useState(false);
  const [form, setForm] = useState({ systolic: '', diastolic: '', measuredAt: localDateTimeNow(), measuredBy: '', enteredBy: '', note: '' });
  const latest = readings[0];
  const latestDate = useMemo(() => new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('alaga-demo-record');
      if (stored) {
        const parsed = JSON.parse(stored) as { readings?: Reading[]; savedNote?: string };
        if (Array.isArray(parsed.readings)) setReadings(parsed.readings);
        if (typeof parsed.savedNote === 'string') setSavedNote(parsed.savedNote);
      }
    } catch {
      try {
        localStorage.removeItem('alaga-demo-record');
      } catch {
        // The demo can still run for this session if storage is unavailable.
      }
    }
    setLocalDataReady(true);
  }, []);

  useEffect(() => {
    if (!localDataReady) return;
    try {
      localStorage.setItem('alaga-demo-record', JSON.stringify({ readings, savedNote }));
    } catch {
      // Keep the current session usable when local storage is unavailable.
    }
  }, [readings, savedNote, localDataReady]);

  const saveReading = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    if (!systolic || !diastolic || !form.measuredBy.trim() || !form.enteredBy.trim()) return;
    const measuredAt = form.measuredAt ? new Date(form.measuredAt) : new Date();
    const today = new Date().toDateString() === measuredAt.toDateString();
    setReadings(current => [{ date: today ? 'Today' : measuredAt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), time: measuredAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), systolic, diastolic, measuredBy: form.measuredBy.trim(), enteredBy: form.enteredBy.trim(), note: form.note.trim() || undefined, source: role === 'BHW' ? 'BHW visit' : 'Patient record' }, ...current]);
    setForm({ systolic: '', diastolic: '', measuredAt: localDateTimeNow(), measuredBy: '', enteredBy: '', note: '' });
    setShowEntry(false);
  };

  const title = view === 'home' ? role === 'BHW' ? 'Good morning, Ana' : 'Welcome, Lina' : view === 'patients' ? role === 'BHW' ? 'Patient record' : 'My record' : view === 'transfer' ? 'Record transfer' : 'Visit summary';
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' }, { id: 'patients', label: 'Patients', icon: 'people' },
    { id: 'transfer', label: 'Transfer', icon: 'swap' }, { id: 'summary', label: 'Summary', icon: 'note' },
  ];
  const nav = navItems.filter(item => role === 'BHW' || item.id !== 'summary').map(item => ({ ...item, label: role === 'BHW' || item.id !== 'patients' ? item.label : 'My record' }));

  return <main className="min-h-dvh bg-[#f2f4ef] text-[#202522]">
    <div className="mx-auto min-h-dvh max-w-[1440px] md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#e3e7df] bg-[#f8f9f5] px-5 py-7 md:flex md:flex-col">
        <a href="#home" onClick={event => { event.preventDefault(); setView('home'); }} className="mb-10 flex items-center gap-3 rounded-2xl px-2 text-[#295d52] no-underline">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#dcece4]"><Icon name="heart" size={22} /></span><span><span className="block text-[15px] font-bold tracking-tight">Alaga</span><span className="block text-xs text-[#747b74]">BHW health follow-up</span></span>
        </a>
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#8b9188]">Workspace</p>
        <nav aria-label="Main navigation" className="space-y-1">{nav.map(item => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-current={view === item.id ? 'page' : undefined} className={`flex min-h-12 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-semibold transition ${view === item.id ? 'bg-[#dcece4] text-[#24584d]' : 'text-[#555d56] hover:bg-[#edf0ea]'}`}><Icon name={item.icon} size={19} />{item.label}</button>)}</nav>
        <div className="mt-auto rounded-2xl border border-[#e2e8e0] bg-white p-4"><div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-[#3d806d]" />Saved on this device</div><p className="mb-0 mt-2 text-xs leading-5 text-[#70766f]">Records stay available offline. No internet connection needed for this demo.</p></div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between border-b border-[#e3e7df] bg-[#f8f9f5]/95 px-5 backdrop-blur md:px-10">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#dcece4] text-[#295d52] md:hidden"><Icon name="heart" size={19} /></span><div><p className="mb-0 text-[11px] font-medium text-[#7a8179]">Barangay San Isidro <span className="px-1">·</span> {latestDate}</p><h1 className="mb-0 mt-0.5 text-[17px] font-semibold tracking-tight text-[#242a26] md:text-lg">{title}</h1></div></div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full bg-[#e4f1e9] px-3 py-1.5 text-xs font-semibold text-[#376b55] sm:inline-flex"><Icon name="check" size={15} />On this device</span><button type="button" onClick={() => setRole(role === 'BHW' ? 'Patient / caregiver' : 'BHW')} className="min-h-10 rounded-full border border-[#dce0d8] bg-white px-3 text-xs font-semibold text-[#465049] hover:bg-[#f5f6f2]" aria-label="Switch demo role">{role === 'BHW' ? 'BHW Ana · switch role' : 'Lina · switch role'}</button></div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-7 md:px-10 md:pb-12 md:pt-9">
          {view === 'home' && <>
            <section className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="relative overflow-hidden rounded-[28px] bg-[#dcece4] p-6 sm:p-8"><div className="relative z-[1] max-w-lg"><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#477363]">{role === 'BHW' ? "Today's follow-up" : 'Your health record'}</p><h2 className="mb-2 max-w-md text-2xl font-semibold leading-tight tracking-tight text-[#243e35] sm:text-[30px]">{role === 'BHW' ? 'Care is easier when every reading is in one place.' : 'Your readings stay with you, even when you are offline.'}</h2><p className="mb-6 max-w-md text-sm leading-6 text-[#52665b]">{role === 'BHW' ? 'Review Lina Reyes’s home readings and keep her follow-up record up to date.' : 'Keep your measured blood pressure readings together and ready to share during a visit.'}</p><ActionButton onClick={() => setView('patients')} icon="arrow">{role === 'BHW' ? 'Open patient record' : 'View my record'}</ActionButton></div><div aria-hidden="true" className="absolute -bottom-16 -right-8 hidden size-64 rounded-full border-[32px] border-[#c5e0d2] opacity-70 sm:block" /></div>
              <div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><p className="mb-0 text-sm font-semibold text-[#555e56]">Device storage</p><span className="rounded-full bg-[#edf3ee] px-2.5 py-1 text-[11px] font-semibold text-[#41725e]">Available offline</span></div><div className="mt-6 flex items-end justify-between"><div><p className="mb-1 text-3xl font-semibold tracking-tight text-[#293b33]">1 <span className="text-sm font-medium text-[#758077]">patient</span></p><p className="mb-0 text-xs text-[#7d847c]">3 readings saved locally</p></div><div className="grid size-12 place-items-center rounded-2xl bg-[#f0f4ee] text-[#547366]"><Icon name="people" size={23} /></div></div><div className="mt-5 h-1.5 rounded-full bg-[#edf0e9]"><div className="h-1.5 w-[18%] rounded-full bg-[#6a9b83]" /></div><p className="mb-0 mt-2 text-[11px] text-[#8a9089]">This demo contains sample information</p></div>
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <button type="button" onClick={() => setView('patients')} className="group flex min-h-[100px] items-center gap-4 rounded-[24px] border border-[#e4e7e1] bg-white p-5 text-left transition hover:border-[#b7cfc1] hover:shadow-sm"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e5f1e9] text-[#386b56]"><Icon name="people" size={21} /></span><span className="min-w-0"><strong className="block text-sm text-[#313832]">Patient record</strong><span className="mt-1 block text-xs leading-5 text-[#798078]">Review readings and notes</span></span><span className="ml-auto text-[#78847b]"><Icon name="arrow" size={18} /></span></button>
              <button type="button" onClick={() => setShowEntry(true)} className="group flex min-h-[100px] items-center gap-4 rounded-[24px] border border-[#e4e7e1] bg-white p-5 text-left transition hover:border-[#b7cfc1] hover:shadow-sm"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf0fb] text-[#59668e]"><Icon name="add" size={21} /></span><span className="min-w-0"><strong className="block text-sm text-[#313832]">Add a reading</strong><span className="mt-1 block text-xs leading-5 text-[#798078]">Save a measured BP value</span></span><span className="ml-auto text-[#78847b]"><Icon name="arrow" size={18} /></span></button>
              <button type="button" onClick={() => { setTransferStage('ready'); setView('transfer'); }} className="group flex min-h-[100px] items-center gap-4 rounded-[24px] border border-[#e4e7e1] bg-white p-5 text-left transition hover:border-[#b7cfc1] hover:shadow-sm"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f6eee0] text-[#866943]"><Icon name="swap" size={21} /></span><span className="min-w-0"><strong className="block text-sm text-[#313832]">Send or receive</strong><span className="mt-1 block text-xs leading-5 text-[#798078]">Transfer without internet</span></span><span className="ml-auto text-[#78847b]"><Icon name="arrow" size={18} /></span></button>
            </section>

            <section className="rounded-[28px] border border-[#e4e7e1] bg-white px-5 py-4 sm:px-7"><div className="flex items-center justify-between border-b border-[#e7e9e4] pb-4"><div><h2 className="mb-1 text-base font-semibold text-[#303731]">Recent readings</h2><p className="mb-0 text-xs text-[#7d847c]">Lina Reyes · Patient record</p></div><button type="button" onClick={() => setView('patients')} className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#386b5c] hover:bg-[#f0f4ef]">View history <Icon name="arrow" size={15} /></button></div>{readings.slice(0, 2).map((reading, index) => <ReadingRow key={`${reading.date}-${reading.time}-${index}`} reading={reading} />)}</section>
          </>}

          {view === 'patients' && <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.75fr)]">
            <section className="space-y-5">
              <div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full bg-[#f2e9dd] text-lg font-semibold text-[#785d40]">LR</div><div><h2 className="mb-1 text-xl font-semibold tracking-tight">Lina Reyes</h2><p className="mb-0 text-sm text-[#717970]">Patient code <span className="font-semibold text-[#444c45]">SI-0042</span> · Age 58</p></div></div><span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#47735f]">Follow-up record</span></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5f6f2] p-4"><p className="mb-1 text-xs text-[#747b73]">Latest reading</p><p className="mb-0 text-xl font-semibold text-[#293d34]">{latest.systolic}/{latest.diastolic} <span className="text-xs font-medium text-[#7c837c]">mmHg</span></p></div><div className="rounded-2xl bg-[#f5f6f2] p-4"><p className="mb-1 text-xs text-[#747b73]">Recorded</p><p className="mb-0 text-sm font-semibold text-[#384039]">{latest.date}, {latest.time}</p></div><div className="col-span-2 rounded-2xl bg-[#f5f6f2] p-4 sm:col-span-1"><p className="mb-1 text-xs text-[#747b73]">Readings on file</p><p className="mb-0 text-sm font-semibold text-[#384039]">{readings.length} entries</p></div></div><div className="mt-5 flex flex-wrap gap-2"><ActionButton onClick={() => setShowEntry(true)} icon="add">Add reading</ActionButton><ActionButton secondary onClick={() => { setTransferStage('ready'); setView('transfer'); }} icon="swap">Transfer record</ActionButton></div></div>
              <div className="rounded-[28px] border border-[#e4e7e1] bg-white px-5 py-2 sm:px-7"><div className="flex items-center justify-between border-b border-[#e7e9e4] py-4"><div><h2 className="mb-1 text-base font-semibold">Blood pressure history</h2><p className="mb-0 text-xs text-[#7d847c]">Values entered from an external monitor</p></div><span className="rounded-full bg-[#f1f3ef] px-2.5 py-1 text-[11px] font-medium text-[#717970]">{readings.length} total</span></div>{readings.map((reading, index) => <ReadingRow key={`${reading.date}-${reading.time}-${index}`} reading={reading} />)}</div>
            </section>
            <aside className="space-y-5"><div className="rounded-[28px] bg-[#e8eee7] p-5 sm:p-6"><div className="flex items-center gap-2 text-sm font-semibold text-[#394d41]"><Icon name="clock" size={18} />Visit note</div>{savedNote ? <p className="mb-0 mt-4 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-[#59635a]">{savedNote}<span className="mt-2 block text-[11px] text-[#868e85]">Today · BHW Ana Cruz</span></p> : <p className="mb-0 mt-4 text-sm leading-6 text-[#647067]">No visit note yet. Add context from today's follow-up.</p>}<button type="button" onClick={() => setView('summary')} className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#3a6855] hover:bg-white/50">Add or edit note <Icon name="arrow" size={15} /></button></div><div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-6"><p className="mb-2 text-sm font-semibold">Record details</p><dl className="space-y-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-[#788078]">Patient code</dt><dd className="m-0 font-semibold">SI-0042</dd></div><div className="flex justify-between gap-3"><dt className="text-[#788078]">Care area</dt><dd className="m-0 font-semibold">San Isidro</dd></div><div className="flex justify-between gap-3"><dt className="text-[#788078]">Last updated</dt><dd className="m-0 font-semibold">Today on this device</dd></div></dl><p className="mb-0 mt-4 border-t border-[#e9ebe7] pt-4 text-[11px] leading-5 text-[#81887f]">No national identifier is stored in this demo.</p></div></aside>
          </div>}

          {view === 'transfer' && <div className="mx-auto max-w-3xl space-y-5">
            <div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f4eddd] text-[#806948]"><Icon name="swap" size={22} /></span><div><p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-[#7f745f]">One patient at a time</p><h2 className="mb-2 text-xl font-semibold tracking-tight sm:text-2xl">Share a record nearby</h2><p className="mb-0 max-w-xl text-sm leading-6 text-[#70776f]">Move Lina Reyes’s selected readings directly between devices. Both people review the record before it is imported.</p></div></div>
              <div className="my-7 grid gap-3 sm:grid-cols-3">{[['1', 'Choose devices', 'Sender and receiver are together'], ['2', 'Review the record', 'Check patient code and entry count'], ['3', 'Confirm import', 'The receiver approves before saving']].map(([number, heading, copy]) => <div key={number} className="rounded-2xl bg-[#f5f6f2] p-4"><span className="grid size-7 place-items-center rounded-full bg-[#dcece4] text-xs font-bold text-[#356254]">{number}</span><p className="mb-1 mt-3 text-sm font-semibold">{heading}</p><p className="mb-0 text-xs leading-5 text-[#747b73]">{copy}</p></div>)}</div>
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#cdd5ca] bg-[#fafbf8] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-white text-[#596c60]"><Icon name="people" size={20} /></span><div><p className="mb-0 text-sm font-semibold">Patient SI-0042 · Lina Reyes</p><p className="mb-0 mt-1 text-xs text-[#7e857d]">{readings.length} readings · updated today</p></div></div><span className="w-fit rounded-full bg-[#e4f1e9] px-3 py-1 text-[11px] font-semibold text-[#40705b]">Ready to share</span></div>
              {transferStage === 'ready' && <div className="flex flex-wrap gap-3 pt-2">{role !== 'BHW' && <ActionButton onClick={() => { setImportConfirmed(false); setTransferStage('review'); }} icon="swap">Start sending</ActionButton>}{role === 'BHW' && <ActionButton secondary onClick={() => { setImportConfirmed(false); setTransferStage('review'); }} icon="people">Receive a record</ActionButton>}</div>}
              {transferStage === 'review' && <div className="mt-5 rounded-2xl border border-[#e5e8e2] bg-[#f8f9f6] p-5"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#e4f1e9] text-[#3c745d]"><Icon name="check" size={19} /></span><div><h3 className="mb-1 text-sm font-semibold">Review before {role === 'BHW' ? 'import' : 'sending'}</h3><p className="mb-4 text-sm leading-6 text-[#6e766e]">Patient code SI-0042 · Lina Reyes · {readings.length} readings. {role === 'BHW' ? 'Existing entries stay unchanged; repeated entry IDs are skipped.' : 'Only this patient record is included in the handoff.'}</p><label className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-3 text-sm text-[#4f584f]"><input type="checkbox" checked={importConfirmed} onChange={event => setImportConfirmed(event.target.checked)} className="size-5 accent-[#366b60]" />I checked the patient code and want to {role === 'BHW' ? 'import' : 'send'} this record.</label></div></div><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!importConfirmed} onClick={() => setTransferStage('complete')} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#366b60] px-5 text-sm font-semibold text-white enabled:hover:bg-[#28594f] disabled:cursor-not-allowed disabled:opacity-45">{role === 'BHW' ? 'Confirm import' : 'Confirm send'}</button><ActionButton secondary onClick={() => setTransferStage('cancelled')} icon="close">Cancel</ActionButton><button type="button" onClick={() => setTransferStage('retry')} className="min-h-12 rounded-full px-4 text-sm font-semibold text-[#58675d] hover:bg-[#edf0ea]">Simulate connection issue</button></div><p className="mb-0 mt-3 text-[11px] text-[#818880]">Demo interaction only. Devices are not connected.</p></div>}
              {transferStage === 'complete' && <div role="status" className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#e4f1e9] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#315b49]"><Icon name="check" size={18} />Transfer complete</p><p className="mb-0 text-sm text-[#557060]">{role === 'BHW' ? `${readings.length} readings imported. 0 duplicates skipped.` : `${readings.length} readings ready for the BHW to review.`}</p></div><ActionButton secondary onClick={() => setView('patients')}>View patient record</ActionButton></div>}
              {transferStage === 'cancelled' && <div role="status" className="mt-5 rounded-2xl bg-[#f4f1e9] p-5"><p className="mb-1 text-sm font-semibold">Transfer cancelled</p><p className="mb-4 text-sm text-[#72766d]">No record was imported. Your existing data is unchanged.</p><ActionButton secondary onClick={() => setTransferStage('ready')}>Start again</ActionButton></div>}
              {transferStage === 'retry' && <div role="status" className="mt-5 rounded-2xl bg-[#f8ebe1] p-5"><p className="mb-1 text-sm font-semibold">Could not connect</p><p className="mb-4 text-sm text-[#786b5d]">Keep both devices nearby and retry. Existing records remain unchanged.</p><ActionButton onClick={() => setTransferStage('review')}>Retry transfer</ActionButton></div>}
            </div>
            <div className="rounded-2xl border border-[#e4e7e1] bg-[#f8f9f5] p-4"><p className="mb-0 text-xs leading-5 text-[#777f76]">This prototype shows the handoff steps. Nearby device discovery and encrypted transport are not connected yet.</p></div>
          </div>}

          {view === 'summary' && <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8ebe5] pb-5"><div><p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-[#7d847a]">For the next RHU / YAKAP visit</p><h2 className="mb-1 text-2xl font-semibold tracking-tight">Patient follow-up summary</h2><p className="mb-0 text-sm text-[#747b73]">Prepared by BHW Ana Cruz · {latestDate}</p></div><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dce0d8] px-4 text-sm font-semibold text-[#3e4840] hover:bg-[#f5f6f2]"><Icon name="print" size={17} />Print</button></div>
              <div className="grid gap-4 py-5 sm:grid-cols-2"><div><p className="mb-1 text-xs text-[#7d847a]">Patient</p><p className="mb-0 text-sm font-semibold">Lina Reyes <span className="font-normal text-[#727970]">· SI-0042</span></p></div><div><p className="mb-1 text-xs text-[#7d847a]">Record contains</p><p className="mb-0 text-sm font-semibold">{readings.length} blood pressure readings</p></div><div><p className="mb-1 text-xs text-[#7d847a]">Most recent value</p><p className="mb-0 text-sm font-semibold">{latest.systolic}/{latest.diastolic} mmHg <span className="font-normal text-[#727970]">· {latest.date}, {latest.time}</span></p></div><div><p className="mb-1 text-xs text-[#7d847a]">Information source</p><p className="mb-0 text-sm font-semibold">Patient and BHW entries</p></div></div>
              <div className="rounded-2xl bg-[#f5f6f2] p-4"><p className="mb-1 text-xs font-semibold text-[#6b736a]">Visit note</p>{savedNote ? <p className="mb-0 text-sm leading-6 text-[#404841]">{savedNote}</p> : <p className="mb-0 text-sm text-[#7c837a]">No note added.</p>}</div><div className="mt-5"><p className="mb-2 text-sm font-semibold">Reading history</p>{readings.slice(0, 4).map((reading, index) => <ReadingRow key={`${reading.date}-${reading.time}-${index}`} reading={reading} />)}</div><p className="mb-0 mt-4 text-[11px] leading-5 text-[#868d84]">This summary organizes recorded information for discussion with a health professional. It does not provide a diagnosis or treatment advice.</p>
            </section>
            <aside className="h-fit rounded-[28px] bg-[#e8eee7] p-5 sm:p-6"><h3 className="mb-2 text-base font-semibold">Add a visit note</h3><p className="mb-4 text-xs leading-5 text-[#68746a]">Record brief context from today's follow-up.</p><label htmlFor="visit-note" className="sr-only">Visit note</label><textarea id="visit-note" value={visitNote} onChange={event => setVisitNote(event.target.value)} placeholder="What should the next health worker know?" rows={5} className="w-full resize-y rounded-2xl border border-[#d5ddd4] bg-white p-3 text-sm leading-6 text-[#303731] outline-none placeholder:text-[#9aa097] focus:border-[#548273] focus:ring-2 focus:ring-[#9dc3b1]" /><ActionButton onClick={() => { if (visitNote.trim()) { setSavedNote(visitNote.trim()); setVisitNote(''); } }} icon="check">Save note</ActionButton><p className="mb-0 mt-3 text-[11px] leading-5 text-[#7d857c]">Saved to this device in the demo.</p></aside>
          </div>}
        </div>
      </div>
    </div>

    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-[#e1e5de] bg-[#f8f9f5]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">{nav.map(item => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-current={view === item.id ? 'page' : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold ${view === item.id ? 'text-[#285d50]' : 'text-[#747a73]'}`}><span className={`grid h-8 min-w-14 place-items-center rounded-full ${view === item.id ? 'bg-[#dcece4]' : ''}`}><Icon name={item.icon} size={19} /></span>{item.label}</button>)}</nav>

    {showEntry && <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#18211d]/40 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowEntry(false); }}><section role="dialog" aria-modal="true" aria-labelledby="entry-title" className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-[#f8f9f5] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[28px] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-[#668071]">Lina Reyes · SI-0042</p><h2 id="entry-title" className="mb-0 text-xl font-semibold">Add a blood pressure reading</h2></div><button type="button" aria-label="Close" onClick={() => setShowEntry(false)} className="grid size-10 shrink-0 place-items-center rounded-full text-[#666f67] hover:bg-[#ebeee8]"><Icon name="close" /></button></div><p className="mb-5 mt-2 text-sm leading-6 text-[#737a72]">Enter values from an external monitor. This record works offline.</p><form onSubmit={saveReading} className="space-y-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-[#5a625a]">Systolic <span className="font-normal text-[#898f87]">mmHg</span><input required type="number" min="50" max="300" inputMode="numeric" value={form.systolic} onChange={event => setForm({ ...form, systolic: event.target.value })} placeholder="e.g. 120" className="mt-2 min-h-14 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-lg font-semibold text-[#293a31] outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label><label className="text-xs font-semibold text-[#5a625a]">Diastolic <span className="font-normal text-[#898f87]">mmHg</span><input required type="number" min="30" max="200" inputMode="numeric" value={form.diastolic} onChange={event => setForm({ ...form, diastolic: event.target.value })} placeholder="e.g. 80" className="mt-2 min-h-14 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-lg font-semibold text-[#293a31] outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label></div><label className="block text-xs font-semibold text-[#5a625a]">Measurement date and time<input required type="datetime-local" value={form.measuredAt} onChange={event => setForm({ ...form, measuredAt: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label><label className="block text-xs font-semibold text-[#5a625a]">Who measured it?<input required value={form.measuredBy} onChange={event => setForm({ ...form, measuredBy: event.target.value })} placeholder="Name of the person using the monitor" className="mt-2 min-h-12 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label><label className="block text-xs font-semibold text-[#5a625a]">Who entered it?<input required value={form.enteredBy} onChange={event => setForm({ ...form, enteredBy: event.target.value })} placeholder="Name of the person entering this" className="mt-2 min-h-12 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label><label className="block text-xs font-semibold text-[#5a625a]">Optional note<textarea value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} rows={2} placeholder="Add context if needed" className="mt-2 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label><div className="flex flex-col-reverse gap-2 border-t border-[#e2e6df] pt-4 sm:flex-row sm:justify-end"><ActionButton secondary onClick={() => setShowEntry(false)}>Cancel</ActionButton><button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#366b60] px-5 text-sm font-semibold text-white hover:bg-[#28594f]"><Icon name="check" size={18} />Save reading</button></div></form></section></div>}
  </main>;
}
