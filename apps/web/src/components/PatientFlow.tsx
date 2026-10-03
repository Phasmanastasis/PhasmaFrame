import { useEffect, useState, type SyntheticEvent } from 'react';

type PatientReading = {
  id: string;
  measuredAt: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  measuredBy: string;
  enteredBy: string;
};

type PatientRecord = {
  id: string;
  name: string;
  area: string;
  readings: PatientReading[];
};

type Props = { onChangeRole: () => void };

const STORAGE_KEY = 'alaga-patient-demo';
const TRANSFER_KEY = 'alaga-pending-transfer';
const initialPatient: PatientRecord = {
  id: 'SI-0042',
  name: 'Lina Reyes',
  area: 'Purok 3 · San Isidro',
  readings: [
    { id: 'bp-0042-3', measuredAt: '2026-10-04T08:42:00+08:00', systolic: 132, diastolic: 84, heartRate: 76, measuredBy: 'Lina Reyes', enteredBy: 'Lina Reyes' },
    { id: 'bp-0042-2', measuredAt: '2026-10-01T19:15:00+08:00', systolic: 128, diastolic: 82, heartRate: 74, measuredBy: 'Lina Reyes', enteredBy: 'Lina Reyes' },
    { id: 'bp-0042-1', measuredAt: '2026-09-28T09:10:00+08:00', systolic: 136, diastolic: 86, heartRate: 78, measuredBy: 'Lina Reyes', enteredBy: 'Ana Cruz' },
  ],
};

const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' });
const timeLabel = (value: string) => new Date(value).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
const nowLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

function ReadingItem({ reading }: { reading: PatientReading }) {
  return <li className="grid gap-2 border-b border-[#e5e8e1] py-4 last:border-0 sm:grid-cols-[minmax(180px,1fr)_auto] sm:items-center">
    <div><p className="mb-1 text-base font-semibold text-[#303631]">{dateLabel(reading.measuredAt)} · {timeLabel(reading.measuredAt)}</p><p className="mb-0 text-sm leading-6 text-[#626a62]">Measured by {reading.measuredBy}. Entered by {reading.enteredBy}.</p></div>
    <p className="mb-0 text-lg font-bold tabular-nums text-[#263e38]">{reading.systolic}/{reading.diastolic} <span className="text-sm font-semibold">mmHg</span><span className="mx-3 text-[#8b928b]">·</span>{reading.heartRate} <span className="text-sm font-semibold">bpm</span></p>
  </li>;
}

export default function PatientFlow({ onChangeRole }: Props) {
  const [patient, setPatient] = useState(initialPatient);
  const [section, setSection] = useState<'home' | 'history' | 'add' | 'send'>('home');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ systolic: '', diastolic: '', heartRate: '', measuredAt: nowLocal(), measuredBy: 'Lina Reyes' });
  const latest = patient.readings[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PatientRecord;
        if (parsed.id === initialPatient.id && Array.isArray(parsed.readings)) setPatient(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(patient)); } catch { /* Keep this session usable when storage is unavailable. */ }
  }, [patient, ready]);

  const saveReading = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    const heartRate = Number(form.heartRate);
    const measuredAt = new Date(form.measuredAt);
    if (!form.systolic || !form.diastolic || !form.heartRate || !form.measuredBy.trim() || !Number.isFinite(measuredAt.getTime())) {
      setError('Fill in all values and the measurement time before saving.');
      return;
    }
    if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200 || heartRate < 20 || heartRate > 250) {
      setError('Check the values. Pressure must be 50–300 / 30–200 mmHg and heart rate 20–250 bpm.');
      return;
    }
    const entry: PatientReading = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `bp-${Date.now()}`,
      measuredAt: measuredAt.toISOString(), systolic, diastolic, heartRate,
      measuredBy: form.measuredBy.trim(), enteredBy: 'Lina Reyes',
    };
    setPatient(current => ({ ...current, readings: [entry, ...current.readings] }));
    setForm({ systolic: '', diastolic: '', heartRate: '', measuredAt: nowLocal(), measuredBy: 'Lina Reyes' });
    setError('');
    setSection('history');
  };

  const prepareTransfer = () => {
    try {
      localStorage.setItem(TRANSFER_KEY, JSON.stringify({ ...patient, followUp: 'Patient transfer', note: '', readings: patient.readings }));
      setSent(true);
    } catch {
      setSent(false);
      setError('Could not prepare this record on the device. Check available storage and try again.');
    }
  };

  return <main className="min-h-screen bg-[#f2f4ef] text-[#202522]">
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-10 sm:px-7 md:px-10">
      <header className="flex min-h-[72px] items-center justify-between border-b border-[#e3e7df] bg-[#f8f9f5] px-1">
        <div><p className="mb-0 text-sm font-semibold text-[#295d52]">Alaga · Patient record</p><p className="mb-0 mt-1 text-sm text-[#626a62]">Saved on this device</p></div>
        <button type="button" onClick={onChangeRole} className="min-h-12 rounded-full px-4 text-base font-semibold text-[#285d50] underline underline-offset-4">Change role</button>
      </header>

      <div className="mx-auto max-w-4xl pt-7 md:pt-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="mb-1 text-3xl font-semibold tracking-tight text-[#243e35] sm:text-4xl">Hello, {patient.name.split(' ')[0]}</h1><p className="mb-0 text-base leading-7 text-[#525f55]">Your readings stay on this device until you prepare them for your BHW.</p></div>
          <span className="rounded-full bg-[#e4f1e9] px-4 py-2 text-sm font-semibold text-[#315b49]">Offline record</span>
        </div>

        <nav aria-label="Patient record" className="mb-6 flex flex-wrap gap-2 border-b border-[#dfe4dc] pb-3">
          {([['home', 'Overview'], ['history', 'Reading history'], ['add', 'Add a reading'], ['send', 'Prepare for BHW']] as const).map(([id, label]) => <button key={id} type="button" onClick={() => { setSection(id); setSent(false); setError(''); }} aria-current={section === id ? 'page' : undefined} className={`min-h-12 rounded-full px-4 text-base font-semibold ${section === id ? 'bg-[#dcece4] text-[#24584d]' : 'text-[#525d54] hover:bg-[#e9ede7]'}`}>{label}</button>)}
        </nav>

        {section === 'home' && <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
          <section className="rounded-3xl bg-white p-5 sm:p-7">
            <h2 className="mb-1 text-xl font-semibold text-[#303731]">Most recent reading</h2>
            <p className="mb-5 text-base text-[#626a62]">{latest ? `${dateLabel(latest.measuredAt)} · ${timeLabel(latest.measuredAt)}` : 'No readings saved yet'}</p>
            {latest ? <div className="grid grid-cols-2 gap-4 border-y border-[#e7eae4] py-5 sm:grid-cols-3">
              <div><p className="mb-1 text-sm font-medium text-[#626a62]">Blood pressure</p><p className="mb-0 text-3xl font-bold tabular-nums text-[#263e38]">{latest.systolic}/{latest.diastolic}</p><p className="mb-0 mt-1 text-sm text-[#626a62]">mmHg</p></div>
              <div><p className="mb-1 text-sm font-medium text-[#626a62]">Heart rate</p><p className="mb-0 text-3xl font-bold tabular-nums text-[#263e38]">{latest.heartRate}</p><p className="mb-0 mt-1 text-sm text-[#626a62]">beats per minute</p></div>
              <div className="col-span-2 border-t border-[#e7eae4] pt-3 sm:col-span-1 sm:border-0 sm:pt-0"><p className="mb-0 text-sm leading-6 text-[#626a62]">Measured by {latest.measuredBy}. Recorded by {latest.enteredBy}.</p></div>
            </div> : <p className="mb-0 py-8 text-base text-[#626a62]">Add a measured value to start your history.</p>}
            <button type="button" onClick={() => setSection('add')} className="mt-5 min-h-14 rounded-full bg-[#366b60] px-6 text-base font-semibold text-white hover:bg-[#28594f]">Add a reading</button>
          </section>
          <aside className="rounded-3xl bg-[#e8eee7] p-5 sm:p-7"><h2 className="mb-2 text-xl font-semibold text-[#303731]">Bring your record to a BHW</h2><p className="mb-5 text-base leading-7 text-[#4c5e51]">Prepare your saved readings for review during a visit.</p><button type="button" onClick={() => { setSection('send'); setSent(false); }} className="min-h-14 rounded-full border border-[#7f9c89] bg-white px-6 text-base font-semibold text-[#285d50] hover:bg-[#f4f8f3]">Review before sharing</button></aside>
        </div>}

        {section === 'history' && <section className="rounded-3xl bg-white p-5 sm:p-7"><h2 className="mb-1 text-2xl font-semibold">Reading history</h2><p className="mb-3 text-base leading-7 text-[#626a62]">Your saved blood pressure and heart-rate values.</p><ul className="m-0 list-none p-0">{patient.readings.map(reading => <ReadingItem key={reading.id} reading={reading}/>)}</ul>{patient.readings.length === 0 && <p className="mb-0 py-8 text-base">No readings saved. Add one when you have a measured value.</p>}</section>}

        {section === 'add' && <section className="max-w-2xl rounded-3xl bg-white p-5 sm:p-7"><h2 className="mb-1 text-2xl font-semibold">Add a reading</h2><p className="mb-6 text-base leading-7 text-[#626a62]">Enter the values shown by your blood pressure monitor. This app does not measure your blood pressure.</p><form noValidate onSubmit={saveReading} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3"><label className="text-base font-semibold">Top number <span className="block text-sm font-normal text-[#626a62]">Systolic · mmHg</span><input type="number" inputMode="numeric" min="50" max="300" required value={form.systolic} onChange={event => setForm({ ...form, systolic: event.target.value })} placeholder="120" className="mt-2 min-h-14 w-full rounded-xl border border-[#aab5aa] bg-white px-4 text-xl outline-none focus:border-[#366b60] focus:ring-2 focus:ring-[#b4d2c2]" /></label>
            <label className="text-base font-semibold">Bottom number <span className="block text-sm font-normal text-[#626a62]">Diastolic · mmHg</span><input type="number" inputMode="numeric" min="30" max="200" required value={form.diastolic} onChange={event => setForm({ ...form, diastolic: event.target.value })} placeholder="80" className="mt-2 min-h-14 w-full rounded-xl border border-[#aab5aa] bg-white px-4 text-xl outline-none focus:border-[#366b60] focus:ring-2 focus:ring-[#b4d2c2]" /></label>
            <label className="text-base font-semibold">Heart rate <span className="block text-sm font-normal text-[#626a62]">Beats per minute</span><input type="number" inputMode="numeric" min="20" max="250" required value={form.heartRate} onChange={event => setForm({ ...form, heartRate: event.target.value })} placeholder="72" className="mt-2 min-h-14 w-full rounded-xl border border-[#aab5aa] bg-white px-4 text-xl outline-none focus:border-[#366b60] focus:ring-2 focus:ring-[#b4d2c2]" /></label></div>
          <label className="block text-base font-semibold">When was it measured?<input type="datetime-local" required value={form.measuredAt} onChange={event => setForm({ ...form, measuredAt: event.target.value })} className="mt-2 min-h-14 w-full rounded-xl border border-[#aab5aa] bg-white px-4 text-base font-normal outline-none focus:border-[#366b60] focus:ring-2 focus:ring-[#b4d2c2]" /></label>
          <label className="block text-base font-semibold">Who measured it?<input required value={form.measuredBy} onChange={event => setForm({ ...form, measuredBy: event.target.value })} className="mt-2 min-h-14 w-full rounded-xl border border-[#aab5aa] bg-white px-4 text-base font-normal outline-none focus:border-[#366b60] focus:ring-2 focus:ring-[#b4d2c2]" /></label>
          {error && <p role="alert" className="mb-0 text-base font-medium text-[#8b3f32]">{error}</p>}
          <div className="flex flex-wrap gap-3 border-t border-[#e7eae4] pt-5"><button type="submit" className="min-h-14 rounded-full bg-[#366b60] px-6 text-base font-semibold text-white hover:bg-[#28594f]">Save reading</button><button type="button" onClick={() => setSection('home')} className="min-h-14 rounded-full px-6 text-base font-semibold text-[#3e4840] underline underline-offset-4">Cancel</button></div>
        </form></section>}

        {section === 'send' && <section className="max-w-3xl rounded-3xl bg-white p-5 sm:p-7"><h2 className="mb-2 text-2xl font-semibold">Review your record</h2><p className="mb-5 text-base leading-7 text-[#626a62]">Check what you are preparing for {patient.name}’s BHW. You can still cancel.</p><div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-[#e7eae4] py-4 text-base"><p className="mb-0"><span className="font-semibold">Patient:</span> {patient.name} · {patient.id}</p><p className="mb-0"><span className="font-semibold">Readings:</span> {patient.readings.length}</p></div><ul className="mb-5 mt-0 list-none p-0">{patient.readings.slice(0, 3).map(reading => <ReadingItem key={reading.id} reading={reading}/>)}</ul>
          {sent ? <div role="status" className="rounded-2xl bg-[#e4f1e9] p-5"><h3 className="mb-2 text-lg font-semibold text-[#315b49]">Record prepared for your BHW</h3><p className="mb-0 text-base leading-7 text-[#405d4b]">This prototype keeps the demo record in this browser. It does not send data to another device.</p></div> : <div className="flex flex-wrap gap-3"><button type="button" onClick={prepareTransfer} className="min-h-14 rounded-full bg-[#366b60] px-6 text-base font-semibold text-white hover:bg-[#28594f]">Prepare record for BHW</button><button type="button" onClick={() => setSection('home')} className="min-h-14 rounded-full px-5 text-base font-semibold text-[#3e4840] underline underline-offset-4">Cancel</button></div>}
          {error && <p role="alert" className="mb-0 mt-3 text-base font-medium text-[#8b3f32]">{error}</p>}
        </section>}

        <p className="mb-0 mt-7 max-w-3xl text-sm leading-6 text-[#626a62]">All records here are synthetic demo data. This screen stores entries in this browser only. It does not diagnose or recommend treatment.</p>
      </div>
    </div>
  </main>;
}
