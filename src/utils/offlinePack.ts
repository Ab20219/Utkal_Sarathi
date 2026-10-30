/**
 * UtkalSarathi Offline Pack Utility
 * Formats and validates offline emergency data, offline phrasebook, and saved pack.
 */

export interface EmergencyContact {
  id: string;
  name: string;
  odiaName: string;
  number: string;
  description: string;
  priority: 'critical' | 'standard';
}

export interface OfflinePhrase {
  id: string;
  category: 'Directions' | 'Emergency' | 'Food' | 'Transport';
  english: string;
  odia: string;
  odiaPhonetic: string;
  hindi: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'sos-112',
    name: 'National Unified Emergency Services (Police / Fire / Ambulance)',
    odiaName: 'ଜରୁରୀକାଳୀନ ସେବା',
    number: '112',
    description: 'Toll-free 24/7 national emergency dispatcher across all Odisha districts.',
    priority: 'critical',
  },
  {
    id: 'tourist-police-puri',
    name: 'Odisha Tourist Police Assistance Cell (Puri & Golden Triangle)',
    odiaName: 'ଓଡ଼ିଶା ପର୍ଯ୍ୟଟକ ପୋଲିସ୍',
    number: '06752-222074',
    description: 'Dedicated police cell for tourist assistance, lost items, and fraud prevention.',
    priority: 'critical',
  },
  {
    id: 'women-helpline-181',
    name: 'State Women Helpline',
    odiaName: 'ମହିଳା ହେଲ୍ପଲାଇନ୍',
    number: '181',
    description: '24/7 dedicated confidential support and safety assistance for women travellers.',
    priority: 'critical',
  },
  {
    id: 'otdc-helpline',
    name: 'OTDC Tourism Information Helpline (Panthanivas)',
    odiaName: 'ଓଟିଡିସି ସୂଚନା କେନ୍ଦ୍ର',
    number: '1800-208-1414',
    description: 'Government tourism information, bus timings, and Panthanivas bookings.',
    priority: 'standard',
  },
  {
    id: 'disaster-control-1070',
    name: 'Odisha State Disaster Management (OSDMA) / Cyclone Helpline',
    odiaName: 'ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା କକ୍ଷ',
    number: '1070',
    description: 'Severe weather, cyclone alerts, and coastal warning broadcast line.',
    priority: 'standard',
  },
];

export const OFFLINE_PHRASES: OfflinePhrase[] = [
  {
    id: 'p1',
    category: 'Emergency',
    english: 'Please help me, it is an emergency!',
    odia: 'ଦୟାକରି ମୋତେ ସାହାଯ୍ୟ କରନ୍ତୁ, ଏହା ଜରୁରୀ!',
    odiaPhonetic: 'Dayakari mote sahayya karantu, eha jaruri!',
    hindi: 'कृपया मेरी मदद करें, यह आपातकालीन स्थिति है!',
  },
  {
    id: 'p2',
    category: 'Directions',
    english: 'Where is the Jagannath Temple / Konark Sun Temple?',
    odia: 'ଜଗନ୍ନାଥ ମନ୍ଦିର / କୋଣାର୍କ ମନ୍ଦିର କେଉଁଠି?',
    odiaPhonetic: 'Jagannatha mandira / Konark mandira keunthi?',
    hindi: 'जगन्नाथ मंदिर / कोणार्क मंदिर कहाँ है?',
  },
  {
    id: 'p3',
    category: 'Transport',
    english: 'How much is the fare to the railway station?',
    odia: 'ରେଳ ଷ୍ଟେସନ ପାଇଁ ଭଡ଼ା କେତେ?',
    odiaPhonetic: 'Rail station pain bhada kete?',
    hindi: 'रेलवे स्टेशन तक का किराया कितना है?',
  },
  {
    id: 'p4',
    category: 'Transport',
    english: 'Does this Mo Bus go to Master Canteen?',
    odia: 'ଏହି ମୋ ବସ୍ ମାଷ୍ଟର କ୍ୟାଣ୍ଟିନ୍ ଯିବ କି?',
    odiaPhonetic: 'Ehi Mo Bus Master Canteen jiba ki?',
    hindi: 'क्या यह मो बस मास्टर कैंटीन जाएगी?',
  },
  {
    id: 'p5',
    category: 'Food',
    english: 'Where can I get pure vegetarian Dalma and Pakhala?',
    odia: 'ନିରାମିଷ ଡାଲମା ଏବଂ ପଖାଳ କେଉଁଠି ମିଳିବ?',
    odiaPhonetic: 'Niramisha Dalma ebang Pakhala keunthi miliba?',
    hindi: 'शुद्ध शाकाहारी दालमा और पखाल कहाँ मिलेगा?',
  },
];

export interface OfflinePackData {
  generatedAt: string;
  version: string;
  contacts: EmergencyContact[];
  phrases: OfflinePhrase[];
  savedTripNotes?: string;
}

/**
 * Generates an offline safety pack payload
 */
export function buildOfflinePack(notes?: string): OfflinePackData {
  return {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    contacts: EMERGENCY_CONTACTS,
    phrases: OFFLINE_PHRASES,
    savedTripNotes: notes || 'UtkalSarathi Offline Safety & Travel Companion',
  };
}

/**
 * Validates whether an offline pack is valid
 */
export function isValidOfflinePack(pack: unknown): pack is OfflinePackData {
  if (!pack || typeof pack !== 'object') return false;
  const p = pack as Partial<OfflinePackData>;
  return (
    typeof p.version === 'string' &&
    Array.isArray(p.contacts) &&
    p.contacts.length > 0 &&
    Array.isArray(p.phrases)
  );
}
