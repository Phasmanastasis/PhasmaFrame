import { useEffect, useMemo, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import PatientFlow from './PatientFlow';
import { ROUTES } from '../lib/routes';

// Navigate between the role routes. Guarded so the component is still safe to
// render during SSR/static build, where `window` is undefined.
const navigateTo = (path: string) => {
  if (typeof window !== 'undefined') window.location.assign(path);
};

type View = 'home' | 'patients' | 'record' | 'note' | 'summary' | 'receive';
type Reading = {
  id: string;
  measuredAt: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  measuredBy: string;
  enteredBy: string;
  source: 'Patient app' | 'BHW visit';
  note?: string;
};
type Patient = {
  id: string;
  name: string;
  age: number;
  area: string;
  followUp: string;
  note: string;
  readings: Reading[];
};
type ReceiveStage = 'ready' | 'review' | 'complete' | 'retry' | 'invalid';
type IncomingVariant = 'valid' | 'empty' | 'local';

const seededPatients: Patient[] = [
  {
    id: 'SI-0042', name: 'Lina Reyes', age: 58, area: 'Purok 3 · San Isidro', followUp: 'Today',
    note: 'Follow-up completed. Patient brought home readings for review.',
    readings: [
      { id: 'bp-0042-3', measuredAt: '2026-10-04T08:42:00+08:00', systolic: 132, diastolic: 84, heartRate: 76, measuredBy: 'Lina Reyes', enteredBy: 'Lina Reyes', source: 'Patient app' },
      { id: 'bp-0042-2', measuredAt: '2026-10-01T19:15:00+08:00', systolic: 128, diastolic: 82, heartRate: 74, measuredBy: 'Lina Reyes', enteredBy: 'Lina Reyes', source: 'Patient app' },
      { id: 'bp-0042-1', measuredAt: '2026-09-28T09:10:00+08:00', systolic: 136, diastolic: 86, heartRate: 78, measuredBy: 'Lina Reyes', enteredBy: 'Ana Cruz', source: 'BHW visit' },
    ],
  },
  {
    id: 'SI-0031', name: 'Ramon Santos', age: 64, area: 'Purok 1 · San Isidro', followUp: 'Due this week', note: '',
    readings: [
      { id: 'bp-0031-2', measuredAt: '2026-10-02T07:30:00+08:00', systolic: 142, diastolic: 90, heartRate: 82, measuredBy: 'Ramon Santos', enteredBy: 'Ramon Santos', source: 'Patient app' },
      { id: 'bp-0031-1', measuredAt: '2026-09-26T08:00:00+08:00', systolic: 138, diastolic: 88, heartRate: 79, measuredBy: 'Ramon Santos', enteredBy: 'Ana Cruz', source: 'BHW visit' },
    ],
  },
  {
    id: 'SI-0056', name: 'Marta Dizon', age: 51, area: 'Purok 5 · San Isidro', followUp: 'Due Oct 10', note: '',
    readings: [
      { id: 'bp-0056-1', measuredAt: '2026-09-30T18:05:00+08:00', systolic: 124, diastolic: 80, heartRate: 72, measuredBy: 'Marta Dizon', enteredBy: 'Marta Dizon', source: 'Patient app' },
    ],
  },
];

const incomingBundle: Patient = {
  id: 'SI-0074', name: 'Elena Villanueva', age: 47, area: 'Purok 2 · San Isidro', followUp: 'New record', note: '',
  readings: [
    { id: 'bp-0074-2', measuredAt: '2026-10-03T07:50:00+08:00', systolic: 126, diastolic: 81, heartRate: 75, measuredBy: 'Elena Villanueva', enteredBy: 'Elena Villanueva', source: 'Patient app' },
    { id: 'bp-0074-1', measuredAt: '2026-09-29T18:20:00+08:00', systolic: 130, diastolic: 83, heartRate: 77, measuredBy: 'Elena Villanueva', enteredBy: 'Elena Villanueva', source: 'Patient app' },
  ],
};

const localDateTimeNow = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};
const formatDate = (value: string) => new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (value: string) => new Date(value).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></>,
    note: <><path d="M7 3h8l4 4v14H5V3z"/><path d="M14 3v5h5M8 13h8M8 17h6"/></>,
    add: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    back: <><path d="m15 18-6-6 6-6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v4h16v-4"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    heart: <><path d="M20.8 8.6c0 5.1-8.8 10.2-8.8 10.2S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"/><path d="M12 8v6M9 11h6"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.note}</svg>;
};

function ActionButton({ children, onClick, secondary = false, icon, type = 'button' }: { children: ReactNode; onClick?: () => void; secondary?: boolean; icon?: string; type?: 'button' | 'submit' }) {
  return <button type={type} onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28675c] ${secondary ? 'border border-[#747a73]/30 bg-white text-[#303631] hover:bg-[#f3f5f0]' : 'bg-[#366b60] text-white hover:bg-[#28594f]'}`}>{icon && <Icon name={icon} size={18} />}{children}</button>;
}

function ReadingRow({ reading }: { reading: Reading }) {
  return <article className="grid gap-3 border-b border-[#e5e8e1] py-4 last:border-0 sm:grid-cols-[minmax(150px,.7fr)_minmax(0,1.5fr)_auto] sm:items-center">
    <div><div className="flex items-center gap-2 text-sm font-semibold text-[#303631]"><span>{formatDate(reading.measuredAt)}</span><span className="text-[#858a83]">·</span><span className="font-medium text-[#656b64]">{formatTime(reading.measuredAt)}</span></div><span className="mt-1 inline-flex rounded-full bg-[#f1f3ef] px-2.5 py-1 text-xs font-medium text-[#58645b]">{reading.source}</span></div>
    <p className="mb-0 text-xs leading-5 text-[#70766f]">Measured by <strong className="font-semibold text-[#454d46]">{reading.measuredBy}</strong><br/>Entered by <strong className="font-semibold text-[#454d46]">{reading.enteredBy}</strong>{reading.note && <><br/><span className="italic">{reading.note}</span></>}</p>
    <div className="text-left sm:text-right"><p className="mb-0 text-lg font-semibold tabular-nums tracking-tight text-[#263e38]">{reading.systolic}<span className="px-1 text-[#90968f]">/</span>{reading.diastolic} <span className="text-xs font-medium text-[#727870]">mmHg</span></p><p className="mb-0 mt-1 text-sm font-semibold tabular-nums text-[#505e54]">{reading.heartRate ? `Heart rate ${reading.heartRate} bpm` : 'Heart rate not recorded'}</p></div>
  </article>;
}

type HealthHubProps = { initialWorkspace?: 'patient' | 'bhw' };

export default function HealthHub({ initialWorkspace }: HealthHubProps = {}) {
  const entryDialogRef = useRef<HTMLElement>(null);
  // Role is fixed by the page that mounts this component (chooser at `/`,
  // patient at `/patient`, BHW at `/bhw`); role changes navigate between pages.
  const [workspace] = useState<'choose' | 'patient' | 'bhw'>(initialWorkspace ?? 'choose');
  const [view, setView] = useState<View>('home');
  const [patients, setPatients] = useState(seededPatients);
  const [selectedId, setSelectedId] = useState(seededPatients[0].id);
  const [search, setSearch] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [showEntry, setShowEntry] = useState(false);
  const [receiveStage, setReceiveStage] = useState<ReceiveStage>('ready');
  const [receiveResult, setReceiveResult] = useState({ imported: 0, skipped: 0 });
  const [incomingVariant, setIncomingVariant] = useState<IncomingVariant>('valid');
  const [localIncoming, setLocalIncoming] = useState<Patient | null>(null);
  const [receiveError, setReceiveError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [readingError, setReadingError] = useState('');
  const [removeNoteConfirm, setRemoveNoteConfirm] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ systolic: '', diastolic: '', measuredAt: localDateTimeNow(), measuredBy: '', note: '' });
  const selected = patients.find(patient => patient.id === selectedId) ?? patients[0];
  const latest = selected.readings[0] ?? null;
  const activeBundle = incomingVariant === 'local' && localIncoming ? localIncoming : incomingVariant === 'empty' ? { ...incomingBundle, readings: [] } : incomingBundle;
  const dayLabel = useMemo(() => new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }), []);
  const filteredPatients = patients.filter(patient => `${patient.name} ${patient.id} ${patient.area}`.toLowerCase().includes(search.trim().toLowerCase()));
  const recentReadings = patients.flatMap(patient => patient.readings.slice(0, 1).map(reading => ({ patient, reading }))).sort((a, b) => b.reading.measuredAt.localeCompare(a.reading.measuredAt)).slice(0, 3);
  const activeNav: View = view === 'record' || view === 'note' ? 'patients' : view;
  const titles: Record<View, string> = { home: 'Good morning, Ana', patients: 'Patients', record: selected.name, note: 'Visit note', summary: 'RHU / YAKAP summary', receive: 'Receive patient record' };
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' }, { id: 'patients', label: 'Patients', icon: 'people' },
    { id: 'receive', label: 'Receive record', icon: 'download' }, { id: 'summary', label: 'Summary', icon: 'note' },
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('alaga-bhw-demo');
      if (stored) {
        const parsed = JSON.parse(stored) as { patients?: Patient[]; selectedId?: string };
        if (Array.isArray(parsed.patients) && parsed.patients.length > 0 && parsed.patients.every(patient => Array.isArray(patient.readings))) setPatients(parsed.patients);
        if (typeof parsed.selectedId === 'string') setSelectedId(parsed.selectedId);
      }
    } catch {
      try { localStorage.removeItem('alaga-bhw-demo'); } catch { /* Keep this session usable when storage is unavailable. */ }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('alaga-bhw-demo', JSON.stringify({ patients, selectedId })); } catch { /* Keep this session usable when storage is unavailable. */ }
  }, [patients, selectedId, ready]);

  useEffect(() => {
    if (!showEntry) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = entryDialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, input, textarea, select, [tabindex]:not([tabindex="-1"])') ?? []).filter(element => !element.hasAttribute('disabled'));
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowEntry(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items[items.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
        event.preventDefault();
        items[0].focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [showEntry]);

  useEffect(() => {
    if (workspace !== 'bhw' || view !== 'receive') return;
    try {
      const stored = localStorage.getItem('alaga-pending-transfer');
      if (stored) {
        const parsed = JSON.parse(stored) as Patient;
        if (parsed.id && parsed.name && Array.isArray(parsed.readings)) {
          setLocalIncoming(parsed);
          setIncomingVariant('local');
          setReceiveStage('ready');
          setReceiveError('');
        }
      }
    } catch { /* The static sample packet remains available if the local draft cannot be read. */ }
  }, [workspace, view]);

  const openPatient = (id: string) => { setSelectedId(id); setView('record'); };
  const updateSelected = (update: (patient: Patient) => Patient) => setPatients(current => current.map(patient => patient.id === selectedId ? update(patient) : patient));
  const saveReading = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    if (!form.systolic || !form.diastolic || !form.measuredAt || !form.measuredBy.trim()) {
      setReadingError('Enter both pressure values, the measurement time, and who measured it.');
      return;
    }
    if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) {
      setReadingError('Enter systolic from 50 to 300 and diastolic from 30 to 200 mmHg.');
      return;
    }
    const measuredAtDate = form.measuredAt ? new Date(form.measuredAt) : new Date();
    if (!Number.isFinite(measuredAtDate.getTime())) {
      setReadingError('Enter a valid measurement date and time.');
      return;
    }
    const measuredAt = measuredAtDate.toISOString();
    const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `bp-${Date.now()}`;
    updateSelected(patient => ({ ...patient, readings: [{ id, measuredAt, systolic, diastolic, measuredBy: form.measuredBy.trim(), enteredBy: 'Ana Cruz', source: 'BHW visit', note: form.note.trim() || undefined }, ...patient.readings] }));
    setForm({ systolic: '', diastolic: '', measuredAt: localDateTimeNow(), measuredBy: '', note: '' });
    setReadingError('');
    setShowEntry(false);
  };
  const saveVisitNote = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteDraft.trim()) {
      setNoteError('Add a short note before saving, or cancel to keep the current note.');
      return;
    }
    updateSelected(patient => ({ ...patient, note: noteDraft.trim() }));
    setNoteDraft('');
    setNoteError('');
    setRemoveNoteConfirm(false);
    setView('record');
  };
  const downloadCsv = () => {
            const rows = [['Patient', selected.name], ['Patient code', selected.id], ['Age', String(selected.age)], ['Care area', selected.area], ['Visit note', selected.note], [], ['Date', 'Time', 'Systolic mmHg', 'Diastolic mmHg', 'Heart rate bpm', 'Measured by', 'Entered by', 'Source', 'Note'], ...selected.readings.map(reading => [formatDate(reading.measuredAt), formatTime(reading.measuredAt), String(reading.systolic), String(reading.diastolic), reading.heartRate ? String(reading.heartRate) : '', reading.measuredBy, reading.enteredBy, reading.source, reading.note ?? ''])];
    const csv = rows.map(row => row.map(value => {
      const normalized = String(value ?? '');
      const safe = /^[=+\-@\t\r]/.test(normalized) ? `'${normalized}` : normalized;
      return `"${safe.replaceAll('"', '""')}"`;
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    const filename = `${selected.id.toLowerCase()}-rhu-summary.csv`;
    link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportMessage(`Download started: ${filename}. Check your Downloads folder.`);
  };
  const confirmReceive = () => {
    const ids = new Set(activeBundle.readings.map(reading => reading.id));
    const isValid = Boolean(activeBundle.id.trim() && activeBundle.name.trim()) && activeBundle.readings.length > 0 && ids.size === activeBundle.readings.length && activeBundle.readings.every(reading => Number.isFinite(reading.systolic) && reading.systolic >= 50 && reading.systolic <= 300 && Number.isFinite(reading.diastolic) && reading.diastolic >= 30 && reading.diastolic <= 200 && typeof reading.heartRate === 'number' && Number.isFinite(reading.heartRate) && reading.heartRate >= 20 && reading.heartRate <= 250 && Number.isFinite(Date.parse(reading.measuredAt)) && Boolean(reading.measuredBy.trim() && reading.enteredBy.trim()));
    if (!isValid) {
      setReceiveError('This sample has no readings to import. Select the valid sample packet and try again.');
      setReceiveStage('invalid');
      return;
    }
    const existing = patients.find(patient => patient.id === activeBundle.id);
    if (existing && existing.name.trim().toLowerCase() !== activeBundle.name.trim().toLowerCase()) {
      setReceiveError(`Patient code ${activeBundle.id} is already assigned to a different name. Check the code before importing.`);
      setReceiveStage('invalid');
      return;
    }
    const existingIds = new Set(existing?.readings.map(reading => reading.id) ?? []);
    const additions = activeBundle.readings.filter(reading => !existingIds.has(reading.id));
    const skipped = activeBundle.readings.length - additions.length;
    if (existing) {
      setPatients(current => current.map(patient => patient.id === activeBundle.id ? { ...patient, readings: [...additions, ...patient.readings] } : patient));
    } else {
      setPatients(current => [...current, activeBundle]);
    }
    setSelectedId(activeBundle.id);
    setReceiveResult({ imported: additions.length, skipped });
    setReceiveError('');
    setReceiveStage('complete');
  };
  const removeVisitNote = () => {
    updateSelected(patient => ({ ...patient, note: '' }));
    setNoteDraft('');
    setNoteError('');
    setRemoveNoteConfirm(false);
    setView('record');
  };

  if (workspace === 'patient') return <PatientFlow onChangeRole={() => navigateTo(ROUTES.chooser)} />;
  if (workspace === 'choose') return <main className="min-h-screen bg-[#f2f4ef] px-4 py-10 text-[#202522] sm:px-8"><div className="mx-auto max-w-4xl"><div className="mb-9"><p className="mb-2 text-base font-semibold text-[#386b5c]">Alaga · Offline BP follow-up</p><h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#243e35] sm:text-4xl">How will you use this app?</h1><p className="mb-0 max-w-[60ch] text-base leading-7 text-[#526158]">Choose the view that fits you. You can change roles at any time.</p></div><div className="grid gap-5 sm:grid-cols-2"><button type="button" onClick={() => navigateTo(ROUTES.patient)} className="min-h-52 rounded-3xl bg-white p-6 text-left transition hover:bg-[#f8faf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28675c] sm:p-8"><span className="mb-6 grid size-12 place-items-center rounded-2xl bg-[#dcece4] text-[#285d50]"><Icon name="heart" size={24}/></span><span className="block text-xl font-semibold text-[#293b33]">I’m a patient or caregiver</span><span className="mt-2 block text-base leading-7 text-[#59645c]">Record blood pressure and heart rate, review saved readings, and prepare your record for a BHW.</span></button><button type="button" onClick={() => navigateTo(ROUTES.bhw)} className="min-h-52 rounded-3xl bg-[#dcece4] p-6 text-left transition hover:bg-[#d2e5da] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28675c] sm:p-8"><span className="mb-6 grid size-12 place-items-center rounded-2xl bg-white text-[#285d50]"><Icon name="people" size={24}/></span><span className="block text-xl font-semibold text-[#293b33]">I’m a barangay health worker</span><span className="mt-2 block text-base leading-7 text-[#405d4b]">Review patient records, receive a prepared record, add visit notes, and export a summary.</span></button></div><p className="mb-0 mt-7 max-w-[60ch] text-sm leading-6 text-[#626a62]">All information is synthetic demo data. The prototype saves in this browser and does not send records to another device.</p></div></main>;

  return <main className="min-h-screen bg-[#f2f4ef] text-[#202522]">
    <div className="mx-auto min-h-screen max-w-[1440px] md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#e3e7df] bg-[#f8f9f5] px-5 py-7 md:flex md:flex-col print:hidden">
        <a href="#home" onClick={event => { event.preventDefault(); setView('home'); }} className="mb-10 flex items-center gap-3 rounded-2xl px-2 text-[#295d52] no-underline">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#dcece4]"><Icon name="heart" size={22} /></span><span><span className="block text-[15px] font-bold tracking-tight">Alaga</span><span className="block text-xs text-[#747b74]">BHW follow-up</span></span>
        </a>
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#626a62]">Workspace</p>
        <nav aria-label="Main navigation" className="space-y-1">{navItems.map(item => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-current={activeNav === item.id ? 'page' : undefined} className={`flex min-h-12 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-semibold transition ${activeNav === item.id ? 'bg-[#dcece4] text-[#24584d]' : 'text-[#555d56] hover:bg-[#edf0ea]'}`}><Icon name={item.icon} size={19} />{item.label}</button>)}</nav>
        <div className="mt-auto rounded-2xl border border-[#e2e8e0] bg-white p-4"><div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-[#3d806d]" />Saved on this device</div><p className="mb-0 mt-2 text-xs leading-5 text-[#70766f]">Demo records stay available offline in this browser.</p></div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between border-b border-[#e3e7df] bg-[#f8f9f5] px-5 md:px-10 print:hidden">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#dcece4] text-[#295d52] md:hidden"><Icon name="heart" size={19} /></span><div><p className="mb-0 text-xs font-medium text-[#606a62]">Barangay San Isidro <span className="px-1">·</span> {dayLabel}</p><h1 className="mb-0 mt-0.5 text-[17px] font-semibold tracking-tight text-[#242a26] md:text-lg">{titles[view]}</h1></div></div>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-full bg-[#e4f1e9] px-3 py-1.5 text-xs font-semibold text-[#376b55] sm:inline-flex"><Icon name="check" size={15} />On this device</span><span className="grid size-9 place-items-center rounded-full bg-[#e8eee7] text-xs font-bold text-[#425e4e]">AC</span><span className="hidden text-sm font-semibold text-[#424a43] sm:block">Ana Cruz</span><button type="button" onClick={() => navigateTo(ROUTES.chooser)} className="min-h-10 rounded-full px-3 text-sm font-semibold text-[#285d50] underline underline-offset-4">Change role</button></div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-7 md:px-10 md:pb-12 md:pt-9">
          {view === 'home' && <>
            <section className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="relative overflow-hidden rounded-[28px] bg-[#dcece4] p-6 sm:p-8"><div className="relative z-[1] max-w-lg"><h2 className="mb-2 max-w-md text-2xl font-semibold leading-tight tracking-tight text-[#243e35] sm:text-[30px]">Today’s readings, ready for the next follow-up.</h2><p className="mb-6 max-w-md text-sm leading-6 text-[#52665b]">Review patient readings, add visit context, and prepare a summary for the next RHU / YAKAP visit.</p><ActionButton onClick={() => setView('patients')} icon="arrow">Open patient list</ActionButton></div></div>
              <div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><p className="mb-0 text-sm font-semibold text-[#555e56]">Follow-up list</p><span className="text-xs font-medium text-[#41725e]">Synthetic sample data</span></div><div className="mt-6 flex items-end justify-between"><div><p className="mb-1 text-3xl font-semibold tracking-tight text-[#293b33]">{patients.length} <span className="text-sm font-medium text-[#758077]">patients</span></p><p className="mb-0 text-xs text-[#626a62]">{patients.reduce((count, patient) => count + patient.readings.length, 0)} readings on this device</p></div></div><button type="button" onClick={() => setView('patients')} className="mt-5 inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#386b5c] hover:bg-[#f0f4ef]">View follow-up list <Icon name="arrow" size={15}/></button></div>
            </section>
            <section className="mb-6 grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => setView('patients')} className="group flex min-h-[100px] items-center gap-4 rounded-[24px] border border-[#e4e7e1] bg-white p-5 text-left transition hover:border-[#b7cfc1] hover:shadow-sm"><span className="grid size-12 shrink-0 place-items-center text-[#386b56]"><Icon name="people" size={21}/></span><span><strong className="block text-sm text-[#313832]">Find a patient</strong><span className="mt-1 block text-xs leading-5 text-[#798078]">Open a record and its reading history</span></span><span className="ml-auto text-[#78847b]"><Icon name="arrow" size={18}/></span></button><button type="button" onClick={() => { setReceiveStage('ready'); setView('receive'); }} className="group flex min-h-[100px] items-center gap-4 rounded-[24px] border border-[#e4e7e1] bg-white p-5 text-left transition hover:border-[#b7cfc1] hover:shadow-sm"><span className="grid size-12 shrink-0 place-items-center text-[#866943]"><Icon name="download" size={21}/></span><span><strong className="block text-sm text-[#313832]">Receive a patient record</strong><span className="mt-1 block text-xs leading-5 text-[#798078]">Review before adding sample readings</span></span><span className="ml-auto text-[#78847b]"><Icon name="arrow" size={18}/></span></button></section>
            <section className="rounded-[28px] border border-[#e4e7e1] bg-white px-5 py-4 sm:px-7"><div className="flex items-center justify-between border-b border-[#e7e9e4] pb-4"><div><h2 className="mb-1 text-base font-semibold text-[#303731]">Recent readings</h2><p className="mb-0 text-xs text-[#626a62]">Across your follow-up list</p></div><button type="button" onClick={() => setView('patients')} className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#386b5c] hover:bg-[#f0f4ef]">View patients <Icon name="arrow" size={15}/></button></div>{recentReadings.map(({ patient, reading }) => <div key={reading.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8e1] last:border-0"><button type="button" onClick={() => openPatient(patient.id)} className="min-h-12 py-3 text-left"><span className="block text-sm font-semibold text-[#303731]">{patient.name} <span className="font-normal text-[#747b73]">· {patient.id}</span></span><span className="mt-1 block text-xs text-[#70766f]">{formatDate(reading.measuredAt)} · {formatTime(reading.measuredAt)} · {reading.source}</span></button><span className="text-sm font-semibold tabular-nums text-[#263e38]">{reading.systolic}/{reading.diastolic} mmHg</span></div>)}{recentReadings.length === 0 && <p className="mb-0 py-6 text-sm text-[#626a62]">No readings yet. Open a patient record to add a visit reading.</p>}</section>
          </>}

          {view === 'patients' && <section className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e8ebe5] pb-5"><div><h2 className="mb-1 text-xl font-semibold tracking-tight">Patient follow-up</h2><p className="mb-0 text-sm text-[#747b73]">Synthetic demo records · {patients.length} patients in Barangay San Isidro</p></div><label className="relative block w-full max-w-sm"><span className="sr-only">Search patients</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#788078]"><Icon name="search" size={18}/></span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, code, or purok" className="min-h-11 w-full rounded-full border border-[#dce0d8] bg-[#fbfcf9] pl-10 pr-4 text-sm outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]" /></label></div><div className="divide-y divide-[#e8ebe5]">{filteredPatients.map(patient => { const recent = patient.readings[0] ?? null; return <button key={patient.id} type="button" onClick={() => openPatient(patient.id)} className="grid min-h-[94px] w-full gap-3 py-4 text-left transition hover:bg-[#fafbf8] sm:grid-cols-[minmax(210px,1fr)_minmax(180px,1fr)_auto] sm:items-center"><span className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f2e9dd] text-sm font-semibold text-[#785d40]">{patient.name.split(' ').map(part => part[0]).join('')}</span><span><strong className="block text-sm text-[#313832]">{patient.name}</strong><span className="mt-1 block text-xs text-[#747b73]">{patient.id} · Age {patient.age}</span></span></span><span><span className="block text-xs text-[#747b73]">Latest reading</span><strong className="mt-1 block text-sm tabular-nums text-[#293d34]">{recent ? <>{recent.systolic}/{recent.diastolic} mmHg <span className="font-normal text-[#777f76]">· {formatDate(recent.measuredAt)}</span></> : <span className="font-normal text-[#626a62]">No readings yet</span>}</strong></span><span className="flex items-center justify-between gap-4 sm:justify-end"><span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#47735f]">{patient.followUp}</span><Icon name="arrow" size={18}/></span></button>; })}{filteredPatients.length === 0 && <div className="py-10 text-center"><p className="mb-1 text-sm font-semibold text-[#414a42]">No patients match “{search.trim()}”.</p><p className="mb-3 text-sm text-[#626a62]">Try a name, patient code, or purok.</p><button type="button" onClick={() => setSearch("")} className="min-h-11 rounded-full px-4 text-sm font-semibold text-[#315f52] hover:bg-[#f0f4ef]">Clear search</button></div>}</div></section>}

          {view === 'record' && <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.75fr)]">
            <section className="space-y-5"><button type="button" onClick={() => setView('patients')} className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#386b5c] hover:bg-[#e8eee7]"><Icon name="back" size={16}/>All patients</button>
              <div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full bg-[#f2e9dd] text-lg font-semibold text-[#785d40]">{selected.name.split(' ').map(part => part[0]).join('')}</div><div><h2 className="mb-1 text-xl font-semibold tracking-tight">{selected.name}</h2><p className="mb-0 text-sm text-[#717970]">Patient code <span className="font-semibold text-[#444c45]">{selected.id}</span> · Age {selected.age}</p><p className="mb-0 mt-1 text-xs text-[#7b827a]">{selected.area}</p></div></div><span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#47735f]">{selected.followUp}</span></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5f6f2] p-4"><p className="mb-1 text-xs text-[#747b73]">Latest reading</p><p className="mb-0 text-xl font-semibold tabular-nums text-[#293d34]">{latest ? <>{latest.systolic}/{latest.diastolic} <span className="text-xs font-medium text-[#7c837c]">mmHg</span></> : <span className="text-sm font-medium text-[#626a62]">No reading yet</span>}</p></div><div className="rounded-2xl bg-[#f5f6f2] p-4"><p className="mb-1 text-xs text-[#747b73]">Measured</p><p className="mb-0 text-sm font-semibold text-[#384039]">{latest ? formatDate(latest.measuredAt) : '—'}</p><span className="text-xs text-[#747b73]">{latest ? formatTime(latest.measuredAt) : 'Add a measured value to start history'}</span></div><div className="col-span-2 rounded-2xl bg-[#f5f6f2] p-4 sm:col-span-1"><p className="mb-1 text-xs text-[#747b73]">Readings on file</p><p className="mb-0 text-sm font-semibold text-[#384039]">{selected.readings.length} entries</p></div></div><div className="mt-5 flex flex-wrap gap-2"><ActionButton onClick={() => setShowEntry(true)} icon="add">Add visit reading</ActionButton><ActionButton secondary onClick={() => { setNoteDraft(selected.note); setNoteError(''); setRemoveNoteConfirm(false); setView('note'); }} icon="note">{selected.note ? 'Edit visit note' : 'Add visit note'}</ActionButton><ActionButton secondary onClick={() => setView('summary')}>RHU summary</ActionButton></div></div>
              <div className="rounded-[28px] border border-[#e4e7e1] bg-white px-5 py-2 sm:px-7"><div className="flex items-center justify-between border-b border-[#e7e9e4] py-4"><div><h2 className="mb-1 text-base font-semibold">Blood pressure history</h2><p className="mb-0 text-xs text-[#626a62]">Each entry keeps its measurement and entry source.</p></div><span className="rounded-full bg-[#f1f3ef] px-2.5 py-1 text-xs font-medium text-[#717970]">{selected.readings.length} total</span></div>{selected.readings.length ? selected.readings.map(reading => <ReadingRow key={reading.id} reading={reading}/>) : <p className="mb-0 py-6 text-sm text-[#626a62]">No readings are saved. Add a measured value when the patient is present.</p>}</div>
            </section>
            <aside className="space-y-5"><div className="rounded-[28px] bg-[#e8eee7] p-5 sm:p-6"><div className="flex items-center gap-2 text-sm font-semibold text-[#394d41]"><Icon name="clock" size={18}/>Visit note</div>{selected.note ? <p className="mb-0 mt-4 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-[#59635a]">{selected.note}<span className="mt-2 block text-xs text-[#68746a]">Today · BHW Ana Cruz</span></p> : <p className="mb-0 mt-4 text-sm leading-6 text-[#647067]">No visit note yet. Add context from today's follow-up.</p>}<button type="button" onClick={() => { setNoteDraft(selected.note); setNoteError(''); setRemoveNoteConfirm(false); setView('note'); }} className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#3a6855] hover:bg-white/50">Add or edit note <Icon name="arrow" size={15}/></button></div><div className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-6"><h3 className="mb-3 text-sm font-semibold">Record details</h3><dl className="space-y-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-[#788078]">Patient code</dt><dd className="m-0 font-semibold">{selected.id}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#788078]">Care area</dt><dd className="m-0 text-right font-semibold">{selected.area}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#788078]">Updated</dt><dd className="m-0 font-semibold">This device</dd></div></dl><p className="mb-0 mt-4 border-t border-[#e9ebe7] pt-4 text-xs leading-5 text-[#81887f]">Synthetic sample only. No national identifier is stored.</p></div></aside>
          </div>}

          {view === 'note' && <section className="mx-auto max-w-3xl rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-8"><button type="button" onClick={() => setView('record')} className="mb-5 inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#386b5c] hover:bg-[#f0f4ef]"><Icon name="back" size={16}/>Back to {selected.name}</button><div className="border-b border-[#e8ebe5] pb-5"><h2 className="mb-1 text-xl font-semibold">Visit note for {selected.name}</h2><p className="mb-0 text-sm text-[#747b73]">{selected.id} · {dayLabel} · BHW Ana Cruz</p></div><form onSubmit={saveVisitNote} className="pt-5"><label htmlFor="visit-note" className="mb-2 block text-sm font-semibold text-[#414a42]">Follow-up context</label><p className="mb-3 text-xs leading-5 text-[#747b73]">Write an observation for the next BHW or RHU visit. Keep to information shared during this follow-up.</p><textarea id="visit-note" required maxLength={500} aria-invalid={Boolean(noteError)} aria-describedby={noteError ? "visit-note-error" : "visit-note-count"} value={noteDraft} onChange={event => { setNoteDraft(event.target.value); if (event.target.value.trim()) setNoteError(""); }} placeholder="What did you review together? What should the next visit know?" rows={7} className="w-full resize-y rounded-2xl border border-[#d5ddd4] bg-[#fbfcf9] p-4 text-sm leading-6 text-[#303731] outline-none placeholder:text-[#929a91] focus:border-[#548273] focus:ring-2 focus:ring-[#9dc3b1]"/><div className="mt-2 flex items-start justify-between gap-3"><span id="visit-note-error" role="alert" className="text-xs font-medium text-[#8b3f32]">{noteError}</span><span id="visit-note-count" className="text-xs text-[#626a62]">{noteDraft.length}/500</span></div><div className="mt-4 flex flex-wrap gap-3"><ActionButton type="submit" icon="check">Save visit note</ActionButton><ActionButton secondary onClick={() => { setRemoveNoteConfirm(false); setView('record'); }}>Cancel</ActionButton>{selected.note && <ActionButton secondary onClick={() => setRemoveNoteConfirm(true)}>Remove saved note</ActionButton>}</div>{removeNoteConfirm && <div role="alert" className="mt-4 border-t border-[#e8ebe5] pt-4"><p className="mb-3 text-sm text-[#414a42]">Remove the saved note from {selected.name}’s record?</p><div className="flex flex-wrap gap-3"><button type="button" onClick={removeVisitNote} className="min-h-12 rounded-full bg-[#8b3f32] px-5 text-sm font-semibold text-white hover:bg-[#733327]">Remove note</button><ActionButton secondary onClick={() => setRemoveNoteConfirm(false)}>Keep note</ActionButton></div></div>}<p className="mb-0 mt-4 text-xs text-[#7d857c]">Saved to this device in the demo.</p></form></section>}

          {view === 'summary' && <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><section className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8ebe5] pb-5"><div><p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-[#7d847a]">For the next RHU / YAKAP visit</p><h2 className="mb-1 text-2xl font-semibold tracking-tight">Patient follow-up summary</h2><p className="mb-0 text-sm text-[#747b73]">Prepared by BHW Ana Cruz · {dayLabel}</p></div><div className="flex flex-wrap gap-2 print:hidden"><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dce0d8] px-4 text-sm font-semibold text-[#3e4840] hover:bg-[#f5f6f2]"><Icon name="print" size={17}/>Print</button><button type="button" onClick={downloadCsv} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#366b60] px-4 text-sm font-semibold text-white hover:bg-[#28594f]"><Icon name="download" size={17}/>Export CSV</button></div>{exportMessage && <p role="status" aria-live="polite" className="mb-0 mt-3 text-xs text-[#315f52]">{exportMessage}</p>}</div><div className="grid gap-4 py-5 sm:grid-cols-2"><div><p className="mb-1 text-xs text-[#7d847a]">Patient</p><p className="mb-0 text-sm font-semibold">{selected.name} <span className="font-normal text-[#727970]">· {selected.id}</span></p></div><div><p className="mb-1 text-xs text-[#7d847a]">Record contains</p><p className="mb-0 text-sm font-semibold">{selected.readings.length} blood pressure readings</p></div><div><p className="mb-1 text-xs text-[#7d847a]">Most recent value</p><p className="mb-0 text-sm font-semibold">{latest ? <>{latest.systolic}/{latest.diastolic} mmHg <span className="font-normal text-[#727970]">· {latest.heartRate ? `${latest.heartRate} bpm · ` : ""}{formatDate(latest.measuredAt)}, {formatTime(latest.measuredAt)}</span></> : 'No reading on file'}</p></div><div><p className="mb-1 text-xs text-[#7d847a]">Information source</p><p className="mb-0 text-sm font-semibold">Patient app and BHW visit entries</p></div></div><div className="rounded-2xl bg-[#f5f6f2] p-4"><p className="mb-1 text-xs font-semibold text-[#6b736a]">Visit note</p>{selected.note ? <p className="mb-0 text-sm leading-6 text-[#404841]">{selected.note}</p> : <p className="mb-0 text-sm text-[#7c837a]">No note added.</p>}</div><div className="mt-5"><h3 className="mb-2 text-sm font-semibold">Reading history</h3>{selected.readings.length ? selected.readings.map(reading => <ReadingRow key={reading.id} reading={reading}/>) : <p className="mb-0 py-6 text-sm text-[#626a62]">No readings are saved. Add a measured value when the patient is present.</p>}</div><p className="mb-0 mt-4 text-xs leading-5 text-[#868d84]">This summary organizes recorded information for discussion with a health professional. It does not provide diagnosis or treatment advice. Direct digital transfer to the RHU is not available in this demo.</p></section><aside className="h-fit rounded-[28px] bg-[#e8eee7] p-5 sm:p-6 print:hidden"><h3 className="mb-2 text-base font-semibold">Summary details</h3><p className="mb-4 text-xs leading-5 text-[#68746a]">Print this page or export a CSV to use with the RHU's existing process.</p><dl className="space-y-3 border-t border-[#d5ded4] pt-4 text-xs"><div className="flex justify-between gap-3"><dt className="text-[#68746a]">Patient code</dt><dd className="m-0 font-semibold">{selected.id}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#68746a]">Care area</dt><dd className="m-0 text-right font-semibold">{selected.area}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#68746a]">Prepared</dt><dd className="m-0 font-semibold">{formatDate(new Date().toISOString())}</dd></div></dl><button type="button" onClick={() => setView('patients')} className="mt-5 inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-[#3a6855] hover:bg-white/50">Choose another patient <Icon name="arrow" size={15}/></button></aside></div>}

          {view === 'receive' && <div className="mx-auto max-w-3xl space-y-5">
            <section className="rounded-[28px] border border-[#e4e7e1] bg-white p-5 sm:p-8">
              <div className="border-b border-[#e8ebe5] pb-5">
                <h2 className="mb-1 text-xl font-semibold tracking-tight">Incoming record from the patient app</h2>
                <p className="mb-0 text-sm leading-6 text-[#626a62]">Check the patient code and readings, then confirm. The demo merges matching reading IDs and skips duplicates.</p>
              </div>
              {receiveStage === 'ready' && <label className="mt-5 block max-w-sm text-xs font-semibold text-[#414a42]" htmlFor="demo-packet">Record to review<select id="demo-packet" value={incomingVariant} onChange={event => { setIncomingVariant(event.target.value as IncomingVariant); setReceiveError(''); }} className="mt-2 min-h-12 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]"><option value="valid">Elena Villanueva · 2 readings · sample</option>{localIncoming && <option value="local">{localIncoming.name} · {localIncoming.readings.length} readings · this browser</option>}<option value="empty">Incomplete packet · no readings</option></select></label>}
              <dl className="grid gap-x-6 gap-y-4 border-b border-[#e8ebe5] py-5 sm:grid-cols-2">
                <div><dt className="text-xs text-[#626a62]">Patient</dt><dd className="mb-0 mt-1 text-sm font-semibold">{activeBundle.name} · {activeBundle.id}</dd></div>
                <div><dt className="text-xs text-[#626a62]">Area</dt><dd className="mb-0 mt-1 text-sm font-semibold">{activeBundle.area}</dd></div>
                <div><dt className="text-xs text-[#626a62]">Included readings</dt><dd className="mb-0 mt-1 text-sm font-semibold">{activeBundle.readings.length ? <>{activeBundle.readings.length} · {formatDate(activeBundle.readings[activeBundle.readings.length - 1].measuredAt)} to {formatDate(activeBundle.readings[0].measuredAt)}</> : 'No readings included'}</dd></div>
                <div><dt className="text-xs text-[#626a62]">Import status</dt><dd className="mb-0 mt-1 text-sm font-semibold">{patients.some(patient => patient.id === activeBundle.id) ? 'Patient code already on this device' : 'New patient record'}</dd></div>
              </dl>
              {receiveStage === 'ready' && <div className="pt-5"><ActionButton onClick={() => { setConfirmed(false); setReceiveError(''); setReceiveStage('review'); }} icon="arrow">Review readings</ActionButton><p className="mb-0 mt-3 text-xs leading-5 text-[#626a62]">This demo reads records saved in this browser. Nearby-device discovery is not connected.</p></div>}
              {receiveStage === 'review' && <div className="pt-5">
                <h3 className="mb-1 text-base font-semibold">Review before import</h3>
                <p className="mb-2 text-xs leading-5 text-[#626a62]">{activeBundle.readings.length} reading{activeBundle.readings.length === 1 ? '' : 's'} for {activeBundle.name}. Existing readings will remain unchanged.</p>
                <div className="divide-y divide-[#e8ebe5]">{activeBundle.readings.map(reading => <ReadingRow key={reading.id} reading={reading}/>)}</div>
                <label className="mt-4 flex min-h-12 items-center gap-3 border-y border-[#e8ebe5] py-3 text-sm text-[#414a42]"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="size-5 accent-[#366b60]"/>I checked the patient code and readings.</label>
                <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!confirmed} onClick={confirmReceive} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#366b60] px-5 text-sm font-semibold text-white enabled:hover:bg-[#28594f] disabled:cursor-not-allowed disabled:opacity-45">Confirm import</button><ActionButton secondary onClick={() => setReceiveStage('ready')} icon="close">Cancel</ActionButton>{confirmed && <button type="button" onClick={() => setReceiveStage('retry')} className="min-h-12 rounded-full px-4 text-sm font-semibold text-[#58675d] hover:bg-[#edf0ea]">Simulate interruption</button>}</div>
              </div>}
              {receiveStage === 'complete' && <div role="status" className="mt-5 rounded-2xl bg-[#e4f1e9] p-5"><p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#315b49]"><Icon name="check" size={18}/>Import complete</p><p className="mb-4 text-sm leading-6 text-[#557060]">Added {receiveResult.imported} readings; skipped {receiveResult.skipped} duplicate{receiveResult.skipped === 1 ? '' : 's'}. The patient record is saved on this device.</p><div className="flex flex-wrap gap-3"><ActionButton onClick={() => setView('record')}>Open {activeBundle.name}'s record</ActionButton><ActionButton secondary onClick={() => { setReceiveStage('ready'); setConfirmed(false); }}>Review this packet again</ActionButton></div></div>}
              {receiveStage === 'retry' && <div role="status" className="mt-5 rounded-2xl bg-[#f8ebe1] p-5"><p className="mb-1 text-sm font-semibold">Import interrupted</p><p className="mb-4 text-sm leading-6 text-[#786b5d]">No readings were added. Your existing records are unchanged.</p><div className="flex flex-wrap gap-3"><ActionButton onClick={confirmReceive}>Retry import</ActionButton><ActionButton secondary onClick={() => { setConfirmed(false); setReceiveStage('ready'); }}>Cancel import</ActionButton></div></div>}
              {receiveStage === 'invalid' && <div role="alert" className="mt-5 rounded-2xl bg-[#f8ebe1] p-5"><p className="mb-1 text-sm font-semibold">This record can’t be imported</p><p className="mb-4 text-sm leading-6 text-[#786b5d]">{receiveError || 'The packet is incomplete. No records were changed.'}</p>{receiveError.startsWith('Patient code') ? <ActionButton onClick={() => { setSelectedId(activeBundle.id); setView('record'); }}>Review existing record</ActionButton> : <ActionButton onClick={() => { setIncomingVariant('valid'); setReceiveError(''); setReceiveStage('ready'); }}>Load valid sample packet</ActionButton>}</div>}
            </section>
            <p className="mb-0 rounded-2xl border border-[#e4e7e1] bg-[#f8f9f5] p-4 text-xs leading-5 text-[#626a62]">All information is synthetic. This prototype does not connect to another device or send data to the RHU.</p>
          </div>}
        </div>
      </div>
    </div>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-[#e1e5de] bg-[#f8f9f5] px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden print:hidden">{navItems.map(item => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-current={activeNav === item.id ? 'page' : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold ${activeNav === item.id ? 'text-[#285d50]' : 'text-[#747a73]'}`}><span className={`grid h-8 min-w-14 place-items-center rounded-full ${activeNav === item.id ? 'bg-[#dcece4]' : ''}`}><Icon name={item.icon} size={19}/></span>{item.label}</button>)}</nav>
    {showEntry && <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#18211d]/40 p-0 sm:items-center sm:p-5 print:hidden" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowEntry(false); }}><section ref={entryDialogRef} role="dialog" aria-modal="true" aria-labelledby="entry-title" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-[#f8f9f5] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[28px] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-[#668071]">{selected.name} · {selected.id}</p><h2 id="entry-title" className="mb-0 text-xl font-semibold">Add a visit reading</h2></div><button type="button" aria-label="Close" onClick={() => setShowEntry(false)} className="grid size-10 shrink-0 place-items-center rounded-full text-[#666f67] hover:bg-[#ebeee8]"><Icon name="close"/></button></div><p className="mb-5 mt-2 text-sm leading-6 text-[#737a72]">Enter values from an external monitor. This demo saves locally.</p><form noValidate onSubmit={saveReading} className="space-y-4"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-[#5a625a]">Systolic <span className="font-normal text-[#898f87]">mmHg</span><input required type="number" min="50" max="300" inputMode="numeric" value={form.systolic} onChange={event => { setForm({ ...form, systolic: event.target.value }); setReadingError(""); }} placeholder="e.g. 120" aria-describedby={readingError ? "reading-error" : undefined} className="mt-2 min-h-14 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-lg font-semibold text-[#293a31] outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]"/></label><label className="text-xs font-semibold text-[#5a625a]">Diastolic <span className="font-normal text-[#898f87]">mmHg</span><input required type="number" min="30" max="200" inputMode="numeric" value={form.diastolic} onChange={event => { setForm({ ...form, diastolic: event.target.value }); setReadingError(""); }} placeholder="e.g. 80" aria-describedby={readingError ? "reading-error" : undefined} className="mt-2 min-h-14 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-lg font-semibold text-[#293a31] outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]"/></label></div><label className="block text-xs font-semibold text-[#5a625a]">Measurement date and time<input required type="datetime-local" aria-describedby={readingError ? "reading-error" : undefined} value={form.measuredAt} onChange={event => setForm({ ...form, measuredAt: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]"/></label><label className="block text-xs font-semibold text-[#5a625a]">Who measured it?<input required aria-describedby={readingError ? "reading-error" : undefined} value={form.measuredBy} onChange={event => setForm({ ...form, measuredBy: event.target.value })} placeholder="Name of the person using the monitor" className="mt-2 min-h-12 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]"/></label><p id="reading-error" role="alert" className="text-xs font-medium text-[#8b3f32]">{readingError}</p><label className="block text-xs font-semibold text-[#5a625a]">Optional note<textarea value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} rows={2} placeholder="Add context if needed" className="mt-2 w-full rounded-2xl border border-[#d7ddd4] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#548273] focus:ring-2 focus:ring-[#b4d2c2]"/></label><div className="flex flex-col-reverse gap-2 border-t border-[#e2e6df] pt-4 sm:flex-row sm:justify-end"><ActionButton secondary onClick={() => setShowEntry(false)}>Cancel</ActionButton><ActionButton type="submit" icon="check">Save reading</ActionButton></div></form></section></div>}
  </main>;
}
