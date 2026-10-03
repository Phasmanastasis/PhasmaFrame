import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Divider, IconButton, MD3LightTheme, PaperProvider, Snackbar, Surface, Text, TextInput } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Reading = { id: string; systolic: string; diastolic: string; measuredAt: string; measuredBy: string; recordedBy: string; note: string };
type Patient = { name: string; barangay: string; patientId: string; caregiver: string };
type Transfer = { state: 'not-started' | 'prepared' | 'interrupted'; preparedAt?: string };
type Store = { patient: Patient; readings: Reading[]; transfer: Transfer };
type Tab = 'Today' | 'History' | 'Transfer';

const STORAGE_KEY = 'kasigla.patient.v1';
const InsetProvider = Platform.OS === 'web' ? React.Fragment : SafeAreaProvider;
const ScreenFrame = Platform.OS === 'web' ? View : SafeAreaView;
const theme = {
  ...MD3LightTheme,
  roundness: 18,
  colors: { ...MD3LightTheme.colors, primary: '#126b5b', onPrimary: '#ffffff', primaryContainer: '#c9eee3', onPrimaryContainer: '#063b32', secondary: '#4c635c', secondaryContainer: '#dce8e1', background: '#f5f7f4', surface: '#ffffff', surfaceVariant: '#e8eeea', outline: '#74877f', error: '#ba1a1a' },
};

const demo: Store = {
  patient: { name: 'Maria Santos', barangay: 'San Isidro', patientId: 'DEMO-0148', caregiver: 'Ana Santos' },
  readings: [
    { id: 'demo-1', systolic: '128', diastolic: '82', measuredAt: new Date(Date.now() - 86400000).toISOString(), measuredBy: 'Ana Santos', recordedBy: 'Ana Santos', note: '' },
    { id: 'demo-2', systolic: '134', diastolic: '86', measuredAt: new Date(Date.now() - 3 * 86400000).toISOString(), measuredBy: 'BHW Liza', recordedBy: 'Ana Santos', note: 'After morning walk' },
  ],
  transfer: { state: 'not-started' },
};

const dateLabel = (value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => new Date(value).toLocaleDateString(undefined, options);
const timeLabel = (value: string) => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [tab, setTab] = useState<Tab>('Today');
  const [entryOpen, setEntryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [snack, setSnack] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => setStore(value ? JSON.parse(value) as Store : demo)).catch(() => setStore(demo)).finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    if (!busy && store) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)).catch(() => setSnack('Could not save on this device. Check available storage.'));
  }, [store, busy]);

  const latest = store?.readings[0];
  const sorted = useMemo(() => [...(store?.readings ?? [])].sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt)), [store?.readings]);
  const updatePatient = (patient: Patient) => store && setStore({ ...store, patient });

  if (busy || !store) return <PaperProvider theme={theme}><InsetProvider><ScreenFrame style={styles.loading}><ActivityIndicator size="large" /><Text style={styles.muted}>Opening your offline record…</Text></ScreenFrame></InsetProvider></PaperProvider>;

  const saveReading = (reading: Reading) => {
    setStore({ ...store, readings: [reading, ...store.readings] });
    setEntryOpen(false);
    setTab('Today');
    setSnack('Reading saved on this device');
  };

  return (
    <PaperProvider theme={theme}>
      <InsetProvider>
        <StatusBar style="dark" />
        <ScreenFrame style={styles.safe}>
          <View style={styles.shell}>
            <View style={styles.topbar}>
              <View style={styles.brand}><Avatar.Text size={38} label="K" style={styles.brandMark} labelStyle={styles.brandLetter} /><View><Text variant="titleMedium" style={styles.brandName}>kasigla</Text><Text variant="labelSmall" style={styles.eyebrow}>YOUR HEALTH RECORD</Text></View></View>
              <IconButton icon="account-circle-outline" size={25} onPress={() => setProfileOpen(true)} accessibilityLabel="Edit patient profile" />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {entryOpen ? <ReadingForm patient={store.patient} onCancel={() => setEntryOpen(false)} onSave={saveReading} /> : profileOpen ? <ProfileForm patient={store.patient} onCancel={() => setProfileOpen(false)} onSave={(patient) => { updatePatient(patient); setProfileOpen(false); setSnack('Profile saved on this device'); }} /> : tab === 'Today' ? <Today patient={store.patient} latest={latest} count={store.readings.length} onAdd={() => setEntryOpen(true)} onHistory={() => setTab('History')} /> : tab === 'History' ? <History readings={sorted} onAdd={() => setEntryOpen(true)} /> : <TransferScreen store={store} onStart={() => { setStore({ ...store, transfer: { state: 'prepared', preparedAt: new Date().toISOString() } }); setSnack('A one-patient handoff is ready for an in-person demo'); }} onInterrupt={() => setStore({ ...store, transfer: { state: 'interrupted', preparedAt: store.transfer.preparedAt } })} onRetry={() => { setStore({ ...store, transfer: { state: 'prepared', preparedAt: new Date().toISOString() } }); setSnack('Handoff package prepared again'); }} />}
              <View style={styles.footer}><Text variant="labelSmall" style={styles.footerText}>Saved on this device · Demo profile uses sample data</Text><Text variant="labelSmall" style={styles.footerText}>Not medical advice</Text></View>
            </ScrollView>
            {!entryOpen && !profileOpen && <View style={styles.nav}>{(['Today', 'History', 'Transfer'] as Tab[]).map((item) => <Button key={item} mode={tab === item ? 'contained-tonal' : 'text'} icon={item === 'Today' ? 'home-variant-outline' : item === 'History' ? 'clipboard-text-clock-outline' : 'swap-horizontal'} onPress={() => setTab(item)} compact style={styles.navItem} labelStyle={styles.navLabel}>{item}</Button>)}</View>}
          </View>
          <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2800}>{snack}</Snackbar>
        </ScreenFrame>
      </InsetProvider>
    </PaperProvider>
  );
}

function Today({ patient, latest, count, onAdd, onHistory }: { patient: Patient; latest?: Reading; count: number; onAdd: () => void; onHistory: () => void }) {
  return <>
    <View style={styles.greeting}><Text variant="labelLarge" style={styles.kicker}>TODAY · {dateLabel(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text><Text variant="headlineMedium" style={styles.title}>Good day, {patient.name.split(' ')[0]}.</Text><Text variant="bodyLarge" style={styles.muted}>Keep your readings together, even offline.</Text></View>
    <Card mode="contained" style={styles.latestCard}>
      <Card.Content>
        <View style={styles.rowBetween}><Text variant="labelLarge" style={styles.kicker}>LATEST READING</Text><Surface style={styles.offlinePill} elevation={0}><View style={styles.dot} /><Text variant="labelSmall" style={styles.offlineText}>Saved offline</Text></Surface></View>
        {latest ? <><View style={styles.bpLine}><Text style={styles.bpValue}>{latest.systolic}</Text><Text style={styles.bpSlash}>/</Text><Text style={styles.bpValue}>{latest.diastolic}</Text><Text variant="labelLarge" style={styles.bpUnit}>mmHg</Text></View><Text variant="bodyMedium" style={styles.cardMeta}>{dateLabel(latest.measuredAt)} · {timeLabel(latest.measuredAt)}</Text><Divider style={styles.divider} /><Text variant="bodySmall" style={styles.cardMeta}>Measured by {latest.measuredBy} · Entered by {latest.recordedBy}</Text></> : <Text variant="bodyMedium" style={styles.muted}>No readings saved yet.</Text>}
      </Card.Content>
    </Card>
    <Button mode="contained" icon="plus" onPress={onAdd} contentStyle={styles.primaryButton} style={styles.mainAction}>Add a reading</Button>
    <View style={styles.sectionRow}><Text variant="titleMedium" style={styles.sectionTitle}>Your record</Text><Button mode="text" onPress={onHistory} compact>View all</Button></View>
    <Card mode="outlined" style={styles.summaryCard} onPress={onHistory}>
      <Card.Content style={styles.summaryContent}><Avatar.Icon size={46} icon="chart-timeline-variant" style={styles.summaryIcon} /><View style={styles.summaryCopy}><Text variant="titleSmall" style={styles.summaryTitle}>{count} {count === 1 ? 'reading' : 'readings'} saved</Text><Text variant="bodySmall" style={styles.muted}>Your history stays on this device</Text></View><IconButton icon="chevron-right" onPress={onHistory} /></Card.Content>
    </Card>
    <Card mode="outlined" style={styles.handoffCard} onPress={() => { /* bottom navigation makes transfer available */ }}>
      <Card.Content style={styles.handoffContent}><Text variant="titleSmall" style={styles.handoffTitle}>Preparing for a BHW visit?</Text><Text variant="bodySmall" style={styles.muted}>Open Transfer to prepare this patient record for an in-person demo.</Text></Card.Content>
    </Card>
  </>;
}

function History({ readings, onAdd }: { readings: Reading[]; onAdd: () => void }) {
  return <>
    <View style={styles.pageHeading}><Text variant="labelLarge" style={styles.kicker}>YOUR RECORD</Text><Text variant="headlineMedium" style={styles.title}>Reading history</Text><Text variant="bodyLarge" style={styles.muted}>A private record saved on this device.</Text></View>
    <Button mode="contained-tonal" icon="plus" onPress={onAdd} style={styles.historyAdd}>Add a reading</Button>
    {readings.length ? readings.map((reading, index) => <Card key={reading.id} mode="outlined" style={styles.historyCard}><Card.Content><View style={styles.rowBetween}><Text variant="titleSmall" style={styles.historyDate}>{dateLabel(reading.measuredAt)}</Text><Text variant="labelSmall" style={styles.timeChip}>{timeLabel(reading.measuredAt)}</Text></View><View style={styles.historyBp}><Text style={styles.historyValue}>{reading.systolic}</Text><Text style={styles.historySlash}>/</Text><Text style={styles.historyValue}>{reading.diastolic}</Text><Text variant="labelMedium" style={styles.historyUnit}>mmHg</Text></View><Text variant="bodySmall" style={styles.muted}>Measured by {reading.measuredBy} · Entered by {reading.recordedBy}</Text>{reading.note ? <Text variant="bodySmall" style={styles.note}>{reading.note}</Text> : null}</Card.Content></Card>) : <Surface style={styles.emptyState} elevation={0}><Avatar.Icon icon="clipboard-text-outline" size={54} style={styles.emptyIcon} /><Text variant="titleMedium" style={styles.sectionTitle}>No readings yet</Text><Text variant="bodyMedium" style={styles.muted}>Add a reading after using your blood-pressure monitor.</Text></Surface>}
  </>;
}

function TransferScreen({ store, onStart, onInterrupt, onRetry }: { store: Store; onStart: () => void; onInterrupt: () => void; onRetry: () => void }) {
  const state = store.transfer.state;
  return <>
    <View style={styles.pageHeading}><Text variant="labelLarge" style={styles.kicker}>IN-PERSON HANDOFF</Text><Text variant="headlineMedium" style={styles.title}>Share with your BHW</Text><Text variant="bodyLarge" style={styles.muted}>Prepare one patient record to show during a visit.</Text></View>
    <Card mode="contained" style={styles.patientCard}><Card.Content><Text variant="labelLarge" style={styles.kicker}>PATIENT RECORD</Text><Text variant="titleLarge" style={styles.patientName}>{store.patient.name}</Text><Text variant="bodyMedium" style={styles.muted}>{store.patient.barangay} · {store.patient.patientId}</Text><Divider style={styles.divider} /><Text variant="bodyMedium" style={styles.cardMeta}>{store.readings.length} saved {store.readings.length === 1 ? 'reading' : 'readings'}</Text></Card.Content></Card>
    <Card mode="outlined" style={styles.transferStateCard}><Card.Content><View style={styles.stateHeader}><Avatar.Icon size={44} icon={state === 'prepared' ? 'check-circle-outline' : state === 'interrupted' ? 'alert-circle-outline' : 'cellphone-link'} style={state === 'interrupted' ? styles.warningIcon : styles.summaryIcon} /><View style={styles.stateCopy}><Text variant="titleSmall" style={styles.summaryTitle}>{state === 'prepared' ? 'Ready for an in-person handoff' : state === 'interrupted' ? 'Handoff interrupted' : 'No handoff prepared'}</Text><Text variant="bodySmall" style={styles.muted}>{state === 'prepared' ? `Prepared ${store.transfer.preparedAt ? timeLabel(store.transfer.preparedAt) : 'just now'} · This demo has not sent data.` : state === 'interrupted' ? 'Your saved readings are unchanged. Prepare the handoff again when ready.' : 'This local demo does not connect to another device.'}</Text></View></View></Card.Content></Card>
    {state === 'not-started' ? <Button mode="contained" icon="package-variant-closed-check" onPress={onStart} contentStyle={styles.primaryButton} style={styles.mainAction}>Prepare patient record</Button> : <Button mode={state === 'interrupted' ? 'contained' : 'outlined'} icon={state === 'interrupted' ? 'refresh' : 'close-circle-outline'} onPress={state === 'interrupted' ? onRetry : onInterrupt} contentStyle={styles.primaryButton} style={styles.mainAction}>{state === 'interrupted' ? 'Retry preparation' : 'Simulate interruption'}</Button>}
    <Surface style={styles.infoBox} elevation={0}><Text variant="titleSmall" style={styles.infoTitle}>What this demo does</Text><Text variant="bodySmall" style={styles.muted}>It prepares a local handoff status for one patient. No data leaves your device, and no BHW device is contacted.</Text></Surface>
    <Surface style={styles.infoBox} elevation={0}><Text variant="titleSmall" style={styles.infoTitle}>Your record stays yours</Text><Text variant="bodySmall" style={styles.muted}>Preparing or retrying a handoff never removes or changes your saved readings.</Text></Surface>
  </>;
}

function ReadingForm({ patient, onCancel, onSave }: { patient: Patient; onCancel: () => void; onSave: (reading: Reading) => void }) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [measurementTime, setMeasurementTime] = useState(() => { const now = new Date(); return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; });
  const [measuredBy, setMeasuredBy] = useState(patient.caregiver || patient.name);
  const [recordedBy, setRecordedBy] = useState(patient.caregiver || patient.name);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const save = () => {
    const sys = Number(systolic); const dia = Number(diastolic);
    if (!Number.isInteger(sys) || sys < 50 || sys > 300 || !Number.isInteger(dia) || dia < 30 || dia > 200) { setError('Enter whole-number readings within the displayed ranges.'); return; }
    if (!measuredBy.trim() || !recordedBy.trim()) { setError('Add who measured and who entered this reading.'); return; }
    const timeMatch = measurementTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch || Number(timeMatch[1]) > 23 || Number(timeMatch[2]) > 59) { setError('Enter the measurement time as hours and minutes, for example 08:30.'); return; }
    const measuredAt = new Date(); measuredAt.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    onSave({ id: `${Date.now()}`, systolic: String(sys), diastolic: String(dia), measuredAt: measuredAt.toISOString(), measuredBy: measuredBy.trim(), recordedBy: recordedBy.trim(), note: note.trim() });
  };
  return <>
    <View style={styles.pageHeading}><Text variant="labelLarge" style={styles.kicker}>NEW ENTRY · SAVES OFFLINE</Text><Text variant="headlineMedium" style={styles.title}>Add a reading</Text><Text variant="bodyLarge" style={styles.muted}>Enter the values shown on the monitor.</Text></View>
    <View style={styles.formCard}>
      <View style={styles.inputRow}><TextInput label="Systolic" value={systolic} onChangeText={setSystolic} keyboardType="number-pad" mode="outlined" style={styles.halfInput} right={<TextInput.Affix text="mmHg" />} accessibilityLabel="Systolic blood pressure" /><TextInput label="Diastolic" value={diastolic} onChangeText={setDiastolic} keyboardType="number-pad" mode="outlined" style={styles.halfInput} right={<TextInput.Affix text="mmHg" />} accessibilityLabel="Diastolic blood pressure" /></View>
      <Text variant="bodySmall" style={styles.fieldHint}>Use the values displayed by your monitor.</Text>
      <TextInput label="Measurement time (24-hour)" value={measurementTime} onChangeText={setMeasurementTime} keyboardType="numbers-and-punctuation" mode="outlined" left={<TextInput.Icon icon="clock-outline" />} accessibilityLabel="Measurement time in 24-hour format" /><Text variant="bodySmall" style={styles.fieldHint}>Today · edit this to match the monitor record.</Text>
      <TextInput label="Measured by" value={measuredBy} onChangeText={setMeasuredBy} mode="outlined" style={styles.formInput} />
      <TextInput label="Entered by" value={recordedBy} onChangeText={setRecordedBy} mode="outlined" style={styles.formInput} />
      <TextInput label="Note (optional)" value={note} onChangeText={setNote} mode="outlined" multiline numberOfLines={3} style={styles.formInput} placeholder="For example: taken after breakfast" />
      {error ? <Text variant="bodySmall" style={styles.errorText}>{error}</Text> : null}
      <Surface style={styles.privacyHint} elevation={0}><Avatar.Icon size={28} icon="lock-outline" style={styles.lockIcon} /><Text variant="bodySmall" style={styles.muted}>This entry is saved on this device.</Text></Surface>
    </View>
    <Button mode="contained" icon="check" onPress={save} contentStyle={styles.primaryButton} style={styles.mainAction}>Save reading</Button><Button mode="text" onPress={onCancel}>Cancel</Button>
  </>;
}

function ProfileForm({ patient, onCancel, onSave }: { patient: Patient; onCancel: () => void; onSave: (patient: Patient) => void }) {
  const [name, setName] = useState(patient.name); const [barangay, setBarangay] = useState(patient.barangay); const [caregiver, setCaregiver] = useState(patient.caregiver);
  return <>
    <View style={styles.pageHeading}><Text variant="labelLarge" style={styles.kicker}>ON-DEVICE PROFILE</Text><Text variant="headlineMedium" style={styles.title}>Patient details</Text><Text variant="bodyLarge" style={styles.muted}>A simple label for this local record.</Text></View>
    <View style={styles.formCard}><TextInput label="Patient name" value={name} onChangeText={setName} mode="outlined" style={styles.formInput} /><TextInput label="Barangay" value={barangay} onChangeText={setBarangay} mode="outlined" style={styles.formInput} /><TextInput label="Caregiver name" value={caregiver} onChangeText={setCaregiver} mode="outlined" style={styles.formInput} /><Surface style={styles.privacyHint} elevation={0}><Text variant="bodySmall" style={styles.muted}>Demo identifier: {patient.patientId}. Profile information stays on this device.</Text></Surface></View>
    <Button mode="contained" icon="check" onPress={() => onSave({ ...patient, name: name.trim() || patient.name, barangay: barangay.trim() || patient.barangay, caregiver: caregiver.trim() })} contentStyle={styles.primaryButton} style={styles.mainAction}>Save profile</Button><Button mode="text" onPress={onCancel}>Cancel</Button>
  </>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7f4' }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, backgroundColor: '#f5f7f4' }, shell: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: '#f5f7f4' }, topbar: { height: 64, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#dce5df', backgroundColor: '#f5f7f4' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandMark: { backgroundColor: '#126b5b' }, brandLetter: { color: '#fff', fontWeight: '700' }, brandName: { color: '#153e35', fontWeight: '700', letterSpacing: 0.2 }, eyebrow: { color: '#53655d', fontSize: 11, letterSpacing: 0.6 }, content: { padding: 20, paddingTop: 24, paddingBottom: 30 }, greeting: { marginBottom: 22 }, kicker: { color: '#365d50', letterSpacing: 0.4, fontSize: 12, fontWeight: '700' }, title: { marginTop: 8, color: '#163b33', fontWeight: '700', lineHeight: 36 }, muted: { color: '#52635b', lineHeight: 21 }, latestCard: { backgroundColor: '#e2f0e9', borderRadius: 22, marginBottom: 16 }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, offlinePill: { backgroundColor: '#d2eadd', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, flexDirection: 'row', alignItems: 'center', gap: 6 }, dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#24805f' }, offlineText: { color: '#25604c', fontWeight: '600' }, bpLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 18, marginBottom: 2 }, bpValue: { color: '#153e35', fontSize: 50, letterSpacing: -2, fontWeight: '700', lineHeight: 58 }, bpSlash: { color: '#668079', fontSize: 35, marginHorizontal: 4 }, bpUnit: { color: '#3f6155', marginLeft: 10 }, cardMeta: { color: '#50675e' }, divider: { marginVertical: 14, backgroundColor: '#cadad3' }, mainAction: { borderRadius: 28, marginBottom: 24 }, primaryButton: { height: 52 }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, sectionTitle: { color: '#193f36', fontWeight: '700' }, summaryCard: { borderColor: '#d8e3dc', borderRadius: 18, marginBottom: 12, backgroundColor: '#fff' }, summaryContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }, summaryIcon: { backgroundColor: '#d6ede3' }, summaryCopy: { flex: 1, marginLeft: 12 }, summaryTitle: { color: '#22463b', fontWeight: '700', marginBottom: 3 }, handoffCard: { borderColor: '#d8e3dc', borderRadius: 18, backgroundColor: '#fbfcfa', marginTop: 2 }, handoffContent: { gap: 6 }, handoffTitle: { color: '#264d40', fontWeight: '700' }, footer: { alignItems: 'center', gap: 3, marginTop: 28, marginBottom: 8 }, footerText: { color: '#52635b', fontSize: 12 }, nav: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#d9e2dc', flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6, backgroundColor: '#f8faf7' }, navItem: { flex: 1, marginHorizontal: 3, borderRadius: 18 }, navLabel: { fontSize: 12 }, pageHeading: { marginBottom: 20 }, historyAdd: { borderRadius: 24, marginBottom: 16, alignSelf: 'flex-start' }, historyCard: { borderRadius: 18, marginBottom: 12, borderColor: '#d9e3dd', backgroundColor: '#fff' }, historyDate: { color: '#284a40', fontWeight: '700' }, timeChip: { color: '#5f746b', backgroundColor: '#edf3ef', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, historyBp: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 9 }, historyValue: { color: '#143d33', fontSize: 33, letterSpacing: -0.6, fontWeight: '700' }, historySlash: { color: '#7a9187', fontSize: 23, marginHorizontal: 4 }, historyUnit: { color: '#667c72', marginLeft: 7 }, note: { color: '#405f53', marginTop: 9, fontStyle: 'italic' }, emptyState: { backgroundColor: '#eaf1ec', padding: 24, borderRadius: 20, alignItems: 'center', gap: 9 }, emptyIcon: { backgroundColor: '#d7e9df' }, formCard: { gap: 14, padding: 16, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce5df', marginBottom: 18 }, inputRow: { flexDirection: 'row', gap: 10 }, halfInput: { flex: 1, backgroundColor: '#fff' }, fieldHint: { color: '#6a7e75', marginTop: -9, marginBottom: 3, marginLeft: 3 }, formInput: { backgroundColor: '#fff' }, errorText: { color: '#a32929' }, privacyHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#edf5f0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 }, lockIcon: { backgroundColor: '#dceee4' }, patientCard: { backgroundColor: '#e5f1eb', borderRadius: 20, marginBottom: 14 }, patientName: { color: '#1b453a', fontWeight: '700', marginTop: 8, marginBottom: 3 }, transferStateCard: { borderColor: '#d7e2dc', borderRadius: 18, backgroundColor: '#fff', marginBottom: 15 }, stateHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' }, stateCopy: { flex: 1, gap: 5 }, warningIcon: { backgroundColor: '#ffebc2' }, infoBox: { backgroundColor: '#e9f0eb', padding: 16, borderRadius: 16, marginBottom: 10, gap: 5 }, infoTitle: { color: '#315447', fontWeight: '700' },
});
