export type Language = 'en' | 'de' | 'tr';

export interface Translations {
  app: {
    title: string;
  };
  room: {
    title: string;
    subtitle: string;
    roomIdLabel: string;
    roomIdPlaceholder: string;
    joinButton: string;
    createButton: string;
    languageLabel: string;
  };
  roles: {
    selectRole: string;
    instructor: string;
    student: string;
    instructorDesc: string;
    studentDesc: string;
    switchRole: string;
    leaveRoom: string;
  };
  instructor: {
    title: string;
    subtitle: string;
    sequenceConfig: string;
    rootNote: string;
    minNote: string;
    maxNote: string;
    waveform: string;
    stepSequencer: string;
    realtimeRecording: string;
    recordedNotes: string;
    notesCaptured: string;
    recording: string;
    pianoKeyboard: string;
    preview: string;
    stopPreview: string;
    record: string;
    stopRecording: string;
    clear: string;
    transmit: string;
    range: string;
  };
  student: {
    title: string;
    subtitle: string;
    currentSequence: string;
    waiting: string;
    waitingDesc: string;
    range: string;
    notes: string;
    waveform: string;
    progress: string;
    playing: string;
    loop: string;
    loopDesc: string;
    play: string;
    stop: string;
    practiceTips: string;
    tip1: string;
    tip2: string;
    tip3: string;
  };
  toasts: {
    addNotes: string;
    sequenceTransmitted: string;
    sequenceReceived: string;
    recordingStarted: string;
    notesRecorded: string;
    noSequence: string;
    roomCreated: string;
    roomJoined: string;
    invalidRoomId: string;
  };
}

const en: Translations = {
  app: {
    title: 'Vocal Training Studio',
  },
  room: {
    title: 'Vocal Training Studio',
    subtitle: 'Join or create a training room',
    roomIdLabel: 'Room ID',
    roomIdPlaceholder: 'Enter room ID or leave blank to create',
    joinButton: 'Join Room',
    createButton: 'Create New Room',
    languageLabel: 'Language',
  },
  roles: {
    selectRole: 'Select Your Role',
    instructor: 'Instructor',
    student: 'Student',
    instructorDesc: 'Create sequences, set ranges, and guide vocal exercises',
    studentDesc: 'Practice with sequences and receive real-time guidance',
    switchRole: 'Switch Role',
    leaveRoom: 'Leave Room',
  },
  instructor: {
    title: 'Instructor Mode',
    subtitle: 'Create and transmit vocal exercises',
    sequenceConfig: 'Sequence Configuration',
    rootNote: 'Root Note',
    minNote: 'Min Note',
    maxNote: 'Max Note',
    waveform: 'Waveform',
    stepSequencer: 'Step Sequencer',
    realtimeRecording: 'Real-time Recording',
    recordedNotes: 'Recorded Notes',
    notesCaptured: 'notes captured',
    recording: 'Recording...',
    pianoKeyboard: 'Piano Keyboard',
    preview: 'Preview',
    stopPreview: 'Stop Preview',
    record: 'Record',
    stopRecording: 'Stop Recording',
    clear: 'Clear',
    transmit: 'Transmit to Student',
    range: 'Range',
  },
  student: {
    title: 'Student Mode',
    subtitle: 'Practice with guided exercises',
    currentSequence: 'Current Sequence',
    waiting: 'Waiting for Sequence',
    waitingDesc: 'Your instructor will transmit a vocal exercise sequence',
    range: 'Range',
    notes: 'Notes',
    waveform: 'Waveform',
    progress: 'Progress',
    playing: 'Playing',
    loop: 'Loop Playback',
    loopDesc: 'Automatically repeat the sequence',
    play: 'Play Sequence',
    stop: 'Stop',
    practiceTips: '💡 Practice Tips:',
    tip1: 'Listen to the sequence first before attempting to sing',
    tip2: 'Use loop mode to practice difficult patterns',
    tip3: 'Your instructor can hear you via video call while the sequence plays',
  },
  toasts: {
    addNotes: 'Add some notes first!',
    sequenceTransmitted: 'Sequence transmitted to student!',
    sequenceReceived: 'New sequence received!',
    recordingStarted: 'Recording started - play notes on keyboard',
    notesRecorded: 'notes recorded',
    noSequence: 'No sequence available',
    roomCreated: 'Room created',
    roomJoined: 'Joined room',
    invalidRoomId: 'Invalid room ID',
  },
};

const de: Translations = {
  app: {
    title: 'Gesangstrainingsstudio',
  },
  room: {
    title: 'Gesangstrainingsstudio',
    subtitle: 'Trainingsraum beitreten oder erstellen',
    roomIdLabel: 'Raum-ID',
    roomIdPlaceholder: 'Raum-ID eingeben oder leer lassen zum Erstellen',
    joinButton: 'Raum beitreten',
    createButton: 'Neuen Raum erstellen',
    languageLabel: 'Sprache',
  },
  roles: {
    selectRole: 'Wählen Sie Ihre Rolle',
    instructor: 'Trainer',
    student: 'Schüler',
    instructorDesc: 'Sequenzen erstellen, Bereiche festlegen und Gesangsübungen anleiten',
    studentDesc: 'Mit Sequenzen üben und Anleitung in Echtzeit erhalten',
    switchRole: 'Rolle wechseln',
    leaveRoom: 'Raum verlassen',
  },
  instructor: {
    title: 'Trainer-Modus',
    subtitle: 'Gesangsübungen erstellen und übertragen',
    sequenceConfig: 'Sequenzkonfiguration',
    rootNote: 'Grundton',
    minNote: 'Tiefster Ton',
    maxNote: 'Höchster Ton',
    waveform: 'Wellenform',
    stepSequencer: 'Step-Sequenzer',
    realtimeRecording: 'Echtzeit-Aufnahme',
    recordedNotes: 'Aufgenommene Noten',
    notesCaptured: 'Noten erfasst',
    recording: 'Aufnahme läuft...',
    pianoKeyboard: 'Klaviertastatur',
    preview: 'Vorschau',
    stopPreview: 'Vorschau stoppen',
    record: 'Aufnehmen',
    stopRecording: 'Aufnahme stoppen',
    clear: 'Löschen',
    transmit: 'An Schüler übertragen',
    range: 'Bereich',
  },
  student: {
    title: 'Schüler-Modus',
    subtitle: 'Mit geführten Übungen trainieren',
    currentSequence: 'Aktuelle Sequenz',
    waiting: 'Warte auf Sequenz',
    waitingDesc: 'Ihr Trainer wird eine Gesangsübung übertragen',
    range: 'Bereich',
    notes: 'Noten',
    waveform: 'Wellenform',
    progress: 'Fortschritt',
    playing: 'Spielt ab',
    loop: 'Wiederholung',
    loopDesc: 'Sequenz automatisch wiederholen',
    play: 'Sequenz abspielen',
    stop: 'Stoppen',
    practiceTips: '💡 Übungstipps:',
    tip1: 'Hören Sie sich die Sequenz zuerst an, bevor Sie singen',
    tip2: 'Verwenden Sie den Wiederholungsmodus für schwierige Muster',
    tip3: 'Ihr Trainer kann Sie über den Videoanruf hören, während die Sequenz läuft',
  },
  toasts: {
    addNotes: 'Fügen Sie zuerst Noten hinzu!',
    sequenceTransmitted: 'Sequenz an Schüler übertragen!',
    sequenceReceived: 'Neue Sequenz erhalten!',
    recordingStarted: 'Aufnahme gestartet - spielen Sie Noten auf der Tastatur',
    notesRecorded: 'Noten aufgenommen',
    noSequence: 'Keine Sequenz verfügbar',
    roomCreated: 'Raum erstellt',
    roomJoined: 'Raum beigetreten',
    invalidRoomId: 'Ungültige Raum-ID',
  },
};

const tr: Translations = {
  app: {
    title: 'Vokal Eğitim Stüdyosu',
  },
  room: {
    title: 'Vokal Eğitim Stüdyosu',
    subtitle: 'Eğitim odasına katıl veya oluştur',
    roomIdLabel: 'Oda ID',
    roomIdPlaceholder: 'Oda ID girin veya oluşturmak için boş bırakın',
    joinButton: 'Odaya Katıl',
    createButton: 'Yeni Oda Oluştur',
    languageLabel: 'Dil',
  },
  roles: {
    selectRole: 'Rolünüzü Seçin',
    instructor: 'Eğitmen',
    student: 'Öğrenci',
    instructorDesc: 'Sekanslar oluştur, aralıklar belirle ve vokal egzersizlerine rehberlik et',
    studentDesc: 'Sekanslarla pratik yap ve gerçek zamanlı rehberlik al',
    switchRole: 'Rol Değiştir',
    leaveRoom: 'Odadan Ayrıl',
  },
  instructor: {
    title: 'Eğitmen Modu',
    subtitle: 'Vokal egzersizleri oluştur ve ilet',
    sequenceConfig: 'Sekans Yapılandırması',
    rootNote: 'Kök Nota',
    minNote: 'Min Nota',
    maxNote: 'Maks Nota',
    waveform: 'Dalga Formu',
    stepSequencer: 'Adım Sekansör',
    realtimeRecording: 'Gerçek Zamanlı Kayıt',
    recordedNotes: 'Kaydedilen Notalar',
    notesCaptured: 'nota yakalandı',
    recording: 'Kaydediliyor...',
    pianoKeyboard: 'Piyano Klavyesi',
    preview: 'Önizleme',
    stopPreview: 'Önizlemeyi Durdur',
    record: 'Kaydet',
    stopRecording: 'Kaydı Durdur',
    clear: 'Temizle',
    transmit: 'Öğrenciye İlet',
    range: 'Aralık',
  },
  student: {
    title: 'Öğrenci Modu',
    subtitle: 'Rehberli egzersizlerle pratik yap',
    currentSequence: 'Mevcut Sekans',
    waiting: 'Sekans Bekleniyor',
    waitingDesc: 'Eğitmeniniz bir vokal egzersiz sekansı iletecek',
    range: 'Aralık',
    notes: 'Notalar',
    waveform: 'Dalga Formu',
    progress: 'İlerleme',
    playing: 'Çalıyor',
    loop: 'Döngü Çalma',
    loopDesc: 'Sekansı otomatik olarak tekrarla',
    play: 'Sekansı Çal',
    stop: 'Durdur',
    practiceTips: '💡 Pratik İpuçları:',
    tip1: 'Şarkı söylemeye çalışmadan önce sekansı dinleyin',
    tip2: 'Zor kalıplar için döngü modunu kullanın',
    tip3: 'Sekans çalarken eğitmeniniz sizi görüntülü arama ile duyabilir',
  },
  toasts: {
    addNotes: 'Önce notalar ekleyin!',
    sequenceTransmitted: 'Sekans öğrenciye iletildi!',
    sequenceReceived: 'Yeni sekans alındı!',
    recordingStarted: 'Kayıt başladı - klavyede nota çalın',
    notesRecorded: 'nota kaydedildi',
    noSequence: 'Sekans mevcut değil',
    roomCreated: 'Oda oluşturuldu',
    roomJoined: 'Odaya katıldı',
    invalidRoomId: 'Geçersiz oda ID',
  },
};

export const translations: Record<Language, Translations> = {
  en,
  de,
  tr,
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}
