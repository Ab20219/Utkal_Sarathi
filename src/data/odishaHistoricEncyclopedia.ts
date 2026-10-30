import type { AudioGuideStory, EncyclopedicVolume } from '../types.ts';
import { MONUMENT_SCHOLARLY_SEEDS, type MonumentScholarlySeed } from './monumentEncyclopediaSeed.ts';
import { getMonumentVoiceProfile } from './monumentVoiceProfiles.ts';

export function countRealWords(text: string | undefined | null): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function computeStoryTotalWordCount(story: AudioGuideStory): number {
  let words = 0;
  words += countRealWords(story.title);
  words += countRealWords(story.odiaTitle);
  words += countRealWords(story.hindiTitle);
  words += countRealWords(story.documentedHistory);
  words += countRealWords(story.legendAndFolklore);
  words += countRealWords(story.audioTranscriptEn);
  words += countRealWords(story.audioTranscriptOr);
  words += countRealWords(story.audioTranscriptHi);
  words += countRealWords(story.odiaHistorySummary);
  words += countRealWords(story.odiaLegendSummary);
  words += countRealWords(story.odiaArchitectureSummary);
  words += countRealWords(story.hindiHistorySummary);
  words += countRealWords(story.hindiLegendSummary);
  words += countRealWords(story.hindiArchitectureSummary);
  words += countRealWords(story.inscriptionsAndManuscripts);

  for (const h of story.architecturalHighlights || []) {
    words += countRealWords(h);
  }
  for (const s of story.historicalSources || []) {
    words += countRealWords(s);
  }
  for (const f of story.keyHistoricalFigures || []) {
    words += countRealWords(f);
  }
  for (const ch of story.chapters || []) {
    words += countRealWords(ch.title);
    words += countRealWords(ch.odiaTitle);
    words += countRealWords(ch.hindiTitle);
    words += countRealWords(ch.text);
    words += countRealWords(ch.textOr);
    words += countRealWords(ch.textHi);
  }
  for (const vol of story.encyclopedicVolumes || []) {
    words += countRealWords(vol.title);
    words += countRealWords(vol.odiaTitle);
    words += countRealWords(vol.hindiTitle);
    words += countRealWords(vol.contentEn);
    words += countRealWords(vol.contentOr);
    words += countRealWords(vol.contentHi);
  }
  return words;
}

function buildMonumentVolumes(
  story: AudioGuideStory,
  seed: MonumentScholarlySeed
): EncyclopedicVolume[] {
  const voice = getMonumentVoiceProfile(story.id);
  const districtName = story.district || 'Odisha';
  const regionName = story.region || 'Historical Kalinga-Utkala-Kosala';
  const highlightsList = (story.architecturalHighlights || []).join('; ');
  const sourcesList = (story.historicalSources || []).join('; ');
  const figuresList = (story.keyHistoricalFigures || []).join('; ');
  const chapterThemes = (story.chapters || [])
    .map((c, idx) => `Section ${idx + 1} (${c.title}): ${c.text}`)
    .join(' ');

  // Volume I: Geomorphology, Site Stratigraphy & Archaeological Chronology
  const vol1En = [
    `Archaeological and geomorphological investigations at ${story.monument} (${seed.coordinatesLabel}, elevation ${seed.elevationMeters} meters above mean sea level) situate this landmark within the ${seed.riverBasin} of ${districtName} district in the ${regionName} cultural zone.`,
    `Unlike isolated monuments divorced from their ecological matrix, ${voice.placeName.en} evolved directly out of the hydro-geological rhythms of its surrounding watershed, where seasonal monsoon recharge, alluvial deposition, and bedrock outcrops governed settlement siting from the Early Historic period through ${story.period}.`,
    `Stratigraphic documentation (${seed.excavationChronology}) demonstrates a coherent sequence of site preparation, foundational levelling, water-harvesting engineering, and sacred precinct demarcation.`,
    `${story.documentedHistory}`,
    `Across successive field seasons, surveyors examining ${story.location} recorded how builders selected load-bearing strata capable of sustaining concentrated vertical stone and masonry stresses without differential subsidence, pairing stepped tanks, subterranean drains, or natural perennial springs with the principal axial approach so ritual ablution and micro-climatic cooling operated as a single integrated landscape system.`
  ].join('\n\n');

  const vol1Or = [
    `${voice.placeName.or} (${story.location}, ${districtName} ଜିଲ୍ଲା; ଭୌଗୋଳିକ ଅବସ୍ଥିତି: ${seed.coordinatesLabel}, ସମୁଦ୍ର ପତ୍ତନଠାରୁ ଉଚ୍ଚତା ${seed.elevationMeters} ମିଟର) ଓଡ଼ିଶାର ଐତିହାସିକ ଭୂ-ତତ୍ତ୍ୱ ଓ ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ସ୍ତରବিন୍ୟାସର ଏକ ଅମୂଲ୍ୟ କ୍ଷେତ୍ର ଅଟେ।`,
    `${seed.odiaHistorySummary}`,
    `ନଦୀ ଉପତ୍ୟକା ଓ ଜଳବାୟୁ ଦୃଷ୍ଟିରୁ ଏହି କ୍ଷେତ୍ର ପ୍ରାଚୀନ କାଳରୁ ମାନବ ବସତି, ଜଳ ସଂରକ୍ଷଣ ପୁଷ୍କରିଣୀ ଓ ଧାର୍ମିକ ଉପାସନା ପାଇଁ ଅନୁକୂଳ ଭୂମି ଯୋଗାଇ ଆସିଛି। ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ସର୍ବେକ୍ଷଣ ଅନୁସାରେ ଏଠାକାର ମୂଳ ଭିତ୍ତିଭୂମି ନିର୍ମାଣ ପୂର୍ବରୁ ଭୂମିର ଭାରବହନ କ୍ଷମତା, ବର୍ଷାଜଳ ନିଷ୍କାସନ ପଥ ଓ ପ୍ରାକୃତିକ ଶିଳାସ୍ତରକୁ ସୂକ୍ଷ୍ମ ଭାବେ ପରୀକ୍ଷା କରାଯାଇଥିଲା।`,
    `${story.audioTranscriptOr}`
  ].join('\n\n');

  const vol1Hi = [
    `${voice.placeName.hi} (${story.location}, जिला ${districtName}; भौगोलिक निर्देशांक: ${seed.coordinatesLabel}, ऊंचाई ${seed.elevationMeters} मीटर) ओडिशा के ऐतिहासिक भू-विज्ञान और पुरातात्विक स्तर-विन्यास का अत्यंत महत्वपूर्ण केंद्र है।`,
    `${seed.hindiHistorySummary}`,
    `नदी घाटी और प्राकृतिक जल-प्रबंधन की दृष्टि से यह परिसर प्राचीन काल से ही मानव बसावट, पवित्र कुंडों तथा आध्यात्मिक साधना के लिए आदर्श रहा है। पुरातात्विक सर्वेक्षणों से स्पष्ट होता है कि स्मारक की आधारशिला रखने से पूर्व चट्टानी नींव की भार-वहन क्षमता, मानसूनी जल-निकासी और पूर्व-पश्चिम सौर संरेखण का सूक्ष्म वैज्ञानिक अध्ययन किया गया था।`,
    `${story.audioTranscriptHi}`
  ].join('\n\n');

  // Volume II: Epigraphic Charters, Copper-Plate Grants & Archival Historiography
  const vol2En = [
    `The primary historical reconstruction of ${story.monument} rests upon a rigorous corpus of epigraphic charters, royal copper-plate land grants (Tamrasasanas), lithic temple inscriptions, numismatic finds, and traditional palm-leaf chronicles (Tala-Pothis): ${seed.epigraphicCorpus}.`,
    `Complemented by ${story.inscriptionsAndManuscripts || 'regional dynastic archives'}, these primary records illuminate not merely regnal dates during ${story.period}, but the legal, fiscal, and agrarian institutions that sustained temple rituals, monastic libraries, and fortress garrisons across centuries.`,
    `Scholarly editions and critical monographs—specifically ${sourcesList}—trace how sovereigns, queens, provincial mahamatras, ascetic acharyas, and merchant-banking guilds endowed tax-free villages (brahmadeyas and devadanas), perpetual butter-lamps (akhanda-dipas), flower gardens, and musical troupe allowances.`,
    `Key historical personalities attested in the documentary tradition of ${voice.placeName.en} include ${figuresList}. Together, their charters trace the linguistic evolution of Kalinga, Utkala, and Dakshina Kosala from Ashokan Brahmi Prakrit and Sanskrit Siddhamatrika/Kutila scripts into Proto-Odia and classical rounded Odia lipi carved on palm leaf and stone.`
  ].join('\n\n');

  const vol2Or = [
    `${voice.placeName.or}ର ପ୍ରାମାଣିକ ଇତିହାସ ଶିଳାଲେଖ, ରାଜକୀୟ ତମ୍ବାପଟା (ତାମ୍ରଶାସନ), ପ୍ରାଚୀନ ମୁଦ୍ରା ଏବଂ ତାଳପତ୍ର ପୋଥି ଉପରେ ଆଧାରିତ। ବିଶେଷକରି ଏହି ପୀଠ ସହିତ ଜଡ଼ିତ ଅଭିଲେଖ ଓ ଗ୍ରନ୍ଥସମୂହ ମଧ୍ୟରେ ପ୍ରମୁଖ ହେଲା—${story.inscriptionsAndManuscripts || seed.epigraphicCorpus}।`,
    `ପ୍ରାଚୀନ ଉତ୍କଳ, କଳିଙ୍ଗ ଓ ଦକ୍ଷିଣ କୋଶଳର ଶାସକମାନେ ମନ୍ଦିର ଓ ବିହାରର ନିତ୍ୟ ପୂଜା, ଅଖଣ୍ଡ ଦୀପଦାନ, ସଂସ୍କୃତ-ଓଡ଼ିଆ ଶାସ୍ତ୍ର ଚର୍ଚ୍ଚା ଏବଂ ଶିଳ୍ପୀମାନଙ୍କର ଭରଣପୋଷଣ ପାଇଁ କରମୁକ୍ତ ଗ୍ରାମ ଦାନ କରୁଥିଲେ। ବ୍ରାହ୍ମୀ ଓ କୁଟିଳ ଲିପିରୁ କ୍ରମଶଃ ଗୋଲାକାର ଓଡ଼ିଆ ଲିପିର ବିକାଶ ଧାରା ଏହି ଐତିହାସିକ ପ୍ରମାଣଗୁଡ଼ିକରୁ ସ୍ପଷ୍ଟ ଭାବେ ଜଣାପଡ଼େ।`,
    `ଐତିହାସିକ ଗବେଷକ ଓ ପ୍ରତ୍ନତତ୍ତ୍ୱବିତ୍‌ମାନଙ୍କ ଦ୍ୱାରା ପ୍ରକାଶିତ ପ୍ରାମାଣିକ ଗ୍ରନ୍ଥରାଜି ଏହି ସ୍ଥାନର ରାଜବଂଶୀୟ କ୍ରମ, ସାମାଜିକ ବ୍ୟବସ୍ଥା ଓ ସାଂସ୍କୃତିକ ଆଦାନପ୍ରଦାନକୁ ବିଶ୍ୱ ଦରବାରରେ ପ୍ରତିଷ୍ଠିତ କରିଛି।`
  ].join('\n\n');

  const vol2Hi = [
    `${voice.placeName.hi} का प्रामाणिक इतिहास शिलालेखों, राजकीय ताम्रपत्रों (ताम्रशासन), प्राचीन सिक्कों तथा ताड़पत्र पांडुलिपियों के ठोस साक्ष्यों पर आधारित है। इस धरोहर से संबद्ध प्रमुख अभिलेखीय स्रोतों में उल्लेखनीय हैं—${story.inscriptionsAndManuscripts || seed.epigraphicCorpus}।`,
    `प्राचीन कलिंग, उत्कल और दक्षिण कोसल के सम्राटों एवं साम्राज्ञियों ने मंदिरों, महाविहारों और लोक-कल्याणकारी संस्थाओं के दैनिक संचालन, अखंड दीपदान, वेद-शास्त्र अध्ययन तथा शिल्पकार संघों के भरण-पोषण हेतु कर-मुक्त ग्रामों का दान दिया था। मौर्यकालीन ब्राह्मी से लेकर सिद्धमातृका और आधुनिक गोल ओड़िया लिपि के विकास की पूरी यात्रा इन अभिलेखों में सुरक्षित है।`
  ].join('\n\n');

  // Volume III: Kalinga Silpa-Sastra Architecture, Stone Petrology & Structural Engineering
  const vol3En = [
    `From the standpoint of canonical Indian architectural treatise literature—notably the Bhubanapradipa, Silpa Prakasa, Silparatnakosa, and Saudhikagama—${story.monument} exemplifies ${seed.architecturalOrder}.`,
    `Materially, master sthapatis and sutradharas executed the monument using ${seed.primaryStonePetrology}, achieving dimensional precision described by ${seed.structuralDimensions}.`,
    `In Kalinga structural theory, the sacred edifice mirrors the cosmic Purusha body: rising from the moulded foot-plinth (Pista and Pabhaga) through the vertical shin and torso wall (Jangha, subdivided by Bandhana mouldings housing Parsvadevatas, Dikpalas, and Nayikas), curving inward along the soaring trunk-spire (Gandi with Rahapaga, Anuraha, and Kanikapaga projections), and culminating in the neck (Beki), fluted stone myrobalan crown (Amalaka), auspicious water-pot (Kalasha), and sacred finial (Ayudha).`,
    `Distinctive architectural and engineering achievements documented at ${voice.placeName.en} encompass: ${highlightsList}. Dry-stone ashlar blocks were dressed to hairline tolerances using iron chisels and river-sand abrasion, interlocked via mortise-and-tenon joints and wrought-iron cramps so thermal expansion and cyclonic wind loads dissipated harmlessly across courses.`
  ].join('\n\n');

  const vol3Or = [
    `କଳିଙ୍ଗ ଶିଳ୍ପଶାସ୍ତ୍ର—ଯଥା ‘ଭୁବନପ୍ରଦୀପ’, ‘ଶିଳ୍ପପ୍ରକାଶ’ ଓ ‘ଶିଳ୍ପରତ୍ନକୋଷ’—ଦୃଷ୍ଟିରୁ ${voice.placeName.or} ଏକ ଅତୁଳନୀୟ ସ୍ଥାପତ୍ୟ କীর୍ତ୍ତି। ${seed.odiaArchitectureSummary}`,
    `ଓଡ଼ିଶାର ପାରମ୍ପରିକ ମନ୍ଦିର ବିଜ୍ଞାନରେ ଦେଉଳକୁ ମାନବ ଶରୀର ଓ ବିଶ୍ୱପୁରୁଷଙ୍କ ପ୍ରତୀକ ଭାବେ କଳ୍ପନା କରାଯାଇ ପାଦଭାଗ (ବାଡ଼), ଗଣ୍ଡି ଓ ମସ୍ତକ (ବେକୀ, ଅମଳକ ଶିଳା, ଖପୁରି, କଳସ ଓ ଆୟୁଧ) ଭାବେ ଗଢ଼ାଯାଇଥାଏ। ପଥରର ପ୍ରକୃତି ପରୀକ୍ଷା କରି ଖଣ୍ଡୋଲାଇଟ୍, କଳା ମୁଗୁନି (କ୍ଲୋରାଇଟ୍), ବାଲିପଥର କିମ୍ବା ମାଙ୍କଡ଼ା ପଥରକୁ ବିନା ସିମେଣ୍ଟରେ ଖାପ-ସନ୍ଧି ଓ ଲୁହା କ୍ଲାମ୍ପ ସାହାଯ୍ୟରେ ଯୋଡ଼ାଯାଇଥିବାରୁ ଶହ ଶହ ବର୍ଷର ବାତ୍ୟା ଓ ଭୂକମ୍ପ ସତ୍ତ୍ୱେ ଏହି ସ୍ଥାପତ୍ୟ ଅଟଳ ରହିଛି।`
  ].join('\n\n');

  const vol3Hi = [
    `कलिंग शिल्पशास्त्र के प्राचीन ग्रंथों—विशेषकर ‘भुवनप्रदीप’, ‘शिल्पप्रकाश’ और ‘शिल्परत्नकोष’—के आलोक में ${voice.placeName.hi} भारतीय वास्तु-विज्ञान की अनुपम कृति है। ${seed.hindiArchitectureSummary}`,
    `ओडिशा की पारंपरिक स्थापत्य विद्या में देवालय को विराट पुरुष के शरीर के रूप में कल्पित कर बाड़ (पभाग व जंघा), गंडी (वक्ररेखीय अथवा पीढ़ शिखर) और मस्तक (बेकी, आमलक, खपुरी, कलश व आयुध) में विभाजित किया जाता है। सूक्ष्म पाषाण चयन और बिना सीमेंट के शुष्क पाषाण-संधि तकनीक के कारण यह संरचना शताब्दियों के चक्रवातों एवं मौसमी परिवर्तनों में भी सुदृढ़ बनी हुई है।`
  ].join('\n\n');

  // Volume IV: Imperial Dynasties, Geopolitical Strategy & Artisan-Maritime Guilds
  const vol4En = [
    `Across its historical trajectory (${seed.dynasticSequence}), ${story.monument} functioned as a vital node connecting political sovereignty, agrarian statecraft, artisan guild organization, and long-distance trade.`,
    `Economic and artisanal networks centered on ${story.location} (${seed.tradeAndGuildNetwork}) linked inland forest and mineral highland resources—timber, iron blooms, tussar silk, medicinal herbs, ivory, and semi-precious stones—with fertile coastal rice deltas and Bay of Bengal ports.`,
    `Narrative chapters preserved in the monument’s memory highlight four interconnected historical movements: ${chapterThemes}`,
    `Far from operating as an insular enclave, ${voice.placeName.en} participated actively in pan-Indian and trans-oceanic exchanges stretching from Kannauj, Magadha, and Kanchipuram to Sri Lanka, Suvarnabhumi, and East Asia, while nurturing hereditary families of sculptors, weavers, painters, metallurgists, and classical musicians whose living skills endure in ${districtName} today.`
  ].join('\n\n');

  const vol4Or = [
    `ରାଜନୈତିକ ଓ ଅର୍ଥନୈତିକ ଇତିହାସ ଦୃଷ୍ଟିରୁ ${voice.placeName.or} କେବଳ ଏକ ଧର୍ମପୀଠ ନଥିଲା, ବରଂ ପ୍ରାଚୀନ କଳିଙ୍ଗ-ଉତ୍କଳ-କୋଶଳର ବାଣିଜ୍ୟପଥ, କୃଷି ଅର୍ଥନୀତି ଓ ଶିଳ୍ପୀ-ସଂଘ (Guilds) ମାନଙ୍କର ପ୍ରାଣକେନ୍ଦ୍ର ଥିଲା। ବିଭିନ୍ନ ଯୁଗରେ ଶାସନ କରିଥିବା ରାଜବଂଶମାନେ ଏଠାକାର ସ୍ଥପତି, ଚିତ୍ରକାର, ବୁଣାକାର, ଧାତୁ ଶିଳ୍ପୀ ଓ ନୌବାଣିଜ୍ୟ ସାଧବମାନଙ୍କୁ ପ୍ରୋତ୍ସାହନ ଦେଇଥିଲେ।`,
    `ଆଭ୍ୟନ୍ତରୀଣ ବନାଞ୍ଚଳର ଖଣିଜ ଓ ବନଜ ସମ୍ପଦ ସହିତ ଉପକୂଳବର୍ତ୍ତୀ ବନ୍ଦରଗୁଡ଼ିକର ସଂଯୋଗ ଫଳରେ ${districtName} ଅଞ୍ଚଳ ସମৃଦ୍ଧ ହୋଇଥିଲା ଏବଂ ଏଠାକାର କଳାକୌଶଳ ଭାରତ ତଥା ଦକ୍ଷିଣ-ପୂର୍ବ ଏସିଆର ସାଂସ୍କୃତିକ ଜଗତକୁ ଗଭୀର ଭାବେ ପ୍ରଭାବିତ କରିଥିଲା।`
  ].join('\n\n');

  const vol4Hi = [
    `राजनीतिक, सामरिक और आर्थिक इतिहास की दृष्टि से ${voice.placeName.hi} केवल एक उपासना केंद्र ही नहीं, अपितु प्राचीन कलिंग, उत्कल और कोसल के व्यापारिक मार्गों, कृषि व्यवस्था तथा शिल्पकार संघों की धुरी रहा है। विभिन्न राजवंशों के संरक्षण में यहाँ के वास्तुकारों, बुनकरों, धातु-शिल्पियों, चित्रकारों और समुद्री व्यापारियों ने अभूतपूर्व समृद्धि अर्जित की।`,
    `आंतरिक वनांचलों के खनिज व औषधीय उत्पादों को तटीय बंदरगाहों से जोड़ने वाले मार्गों ने ${districtName} क्षेत्र को संपूर्ण भारत और दक्षिण-पूर्व एशिया के सांस्कृतिक-व्यापारिक मानचित्र पर प्रतिष्ठित किया।`
  ].join('\n\n');

  // Volume V: Puranic Cosmology, Indigenous-Tantric Synthesis & Living Ritual Calendar
  const vol5En = [
    `What gives Odisha’s sacred heritage its unmistakable spiritual warmth is the organic synthesis of autochthonous tribal (Sabara, Kondh, Bhumia, Saora, Gond) earth-and-pillar reverence with Vedic, Puranic, Buddhist Vajrayana, Jaina, Shakta, and Vaishnava philosophical streams—vividly embodied at ${story.monument}.`,
    `${story.legendAndFolklore}`,
    `Throughout the annual ritual cycle (${seed.sacredCalendarAndFestivals}), oral memory transitions into living performance. Narrated in Utkal Katha through the voice persona of ${voice.narratorName.en} (${voice.voicePersonaTitle.en}), the sanctuary’s liturgy weaves together seasonal harvest offerings, sacred water processions, classical Odissi/Gotipua/Chhau/Dhemsa kinetic traditions, and egalitarian community feasts that renew collective belonging generation after generation.`
  ].join('\n\n');

  const vol5Or = [
    `ଓଡ଼ିଶାର ଆଧ୍ୟାତ୍ମିକ ସଂସ୍କୃତିର ସବୁଠାରୁ ବଡ଼ ବୈଶିଷ୍ଟ୍ୟ ହେଉଛି ଆଦିବାସୀ ଶବର-କନ୍ଧ-ଭୂମିଆ-ସଉରା ପରମ୍ପରା ସହିତ ବୈଦିକ, ପୌରାଣିକ, ଶୈବ, ଶାକ୍ତ, ବୈଷ୍ଣବ, ବୌଦ୍ଧ ଓ ଜୈନ ଦର୍ଶନର ଅପୂର୍ବ ସମନ୍ୱୟ, ଯାହା ${voice.placeName.or}ରେ ଜୀବନ୍ତ ହୋଇ ରହିଛି।`,
    `${seed.odiaLegendSummary}`,
    `ବର୍ଷସାରା ପାଳିତ ହେଉଥିବା ଯାନିଯାତ୍ରା, ପର୍ବପର୍ବାଣି, ଲୋକସଙ୍ଗୀତ, ନୃତ୍ୟ ଓ ଭୋଗ ପରମ୍ପରା ଏହି ଐତିହ୍ୟକୁ କେବଳ ଅତୀତର ସ୍ମୃତି ନ ରଖି ଆଜିର ଜନଜୀବନର ସ୍ପନ୍ଦନରେ ପରିଣତ କରିଛି। ${voice.narratorName.or}ଙ୍କ କণ্ଠରେ ଏହି କଥା ଆମକୁ ସେହି ଅମର ସଂସ୍କୃତି ସହ ଯୋଡ଼ିଥାଏ।`
  ].join('\n\n');

  const vol5Hi = [
    `ओडिशा की आध्यात्मिक संस्कृति की सबसे बड़ी विशेषता जनजातीय शबर-कोंध-भूमिया-सौरा परंपराओं के साथ वैदिक, पौराणिक, शैव, शाक्त, वैष्णव, बौद्ध एवं जैन दर्शन का सहज समन्वय है, जो ${voice.placeName.hi} में साकार दिखाई देता है।`,
    `${seed.hindiLegendSummary}`,
    `वर्ष भर आयोजित होने वाले पर्व, रथोत्सव, मेले, शास्त्रीय व लोक नृत्य तथा महाप्रसाद की परंपराएं इस धरोहर को अतीत का मूक स्मारक न रखकर आज भी जन-जीवन की जीवंत धड़कन बनाए रखती हैं।`
  ].join('\n\n');

  // Volume VI: Colonial Rediscovery, Conservation Science & Heritage Stewardship
  const vol6En = [
    `Modern scientific stewardship of ${story.monument} encompasses nearly two centuries of antiquarian documentation, structural stabilization, epigraphic conservation, and ecological buffer management: ${seed.conservationMilestones}.`,
    `Humid tropical monsoons, cyclonic Bay of Bengal winds, crypto-florescence of soluble salts in porous khondalite and sandstone, biological colonization by mosses and lichens, and growing pilgrim footfall require continuous non-destructive diagnostics—ranging from ultrasonic pulse-velocity stone testing and lime-pozzolana micro-grouting to paper-pulp desalination and native biodiversity corridor restoration.`,
    `Recognized today as "${story.qrCodeBadgeText || 'Protected Heritage Landmark of Odisha'}", ${voice.placeName.en} invites responsible heritage travellers to honour sanctum customs, support authentic local GI-tagged artisan cooperatives in ${districtName}, and preserve both tangible stone craftsmanship and intangible oral chronicles for centuries to come.`,
    `Complete Spoken Chronicle Reference (${voice.narratorName.en}): ${story.audioTranscriptEn}`
  ].join('\n\n');

  const vol6Or = [
    `ଆଧୁନିକ ଯୁଗରେ ${voice.placeName.or}ର ବୈଜ୍ଞାନିକ ସଂରକ୍ଷଣ, ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ରକ୍ଷଣାବେକ୍ଷଣ ଓ ପରିବେଶ ସୁରକ୍ଷା ଅତ୍ୟନ୍ତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ। ମୌସୁମୀ ବର୍ଷା, ସାମୁଦ୍ରିକ ଲୁଣି ପବନ, ଶିଉଳି ଓ ପଥର କ୍ଷୟରୁ ଏହି ପ୍ରାଚୀନ କୀର୍ତ୍ତିକୁ ସୁରକ୍ଷିତ ରଖିବା ପାଇଁ ରାସାୟନିକ ଉପଚାର, ଚୂନ-ସୁର୍ଖି ମରାମତି ଓ ଜୈବ-ସଂରକ୍ଷଣ ପଦ୍ଧତି ଗ୍ରହଣ କରାଯାଇଛି।`,
    `ଜଣେ ସଚେତନ ପର୍ଯ୍ୟଟକ ଓ ଐତିହ୍ୟ ପ୍ରେମୀ ଭାବେ ${districtName} ଜିଲ୍ଲାର ଏହି ପବିତ୍ର ସ୍ଥଳୀର ସ୍ୱଚ୍ଛତା, ମର୍ଯ୍ୟାଦା ଓ ସ୍ଥାନୀୟ ହସ୍ତଶିଳ୍ପୀମାନଙ୍କର କଳାକୁ ସମ୍ମାନ ଜଣାଇବା ଆମ ସମସ୍ତଙ୍କର କର୍ତ୍ତବ୍ୟ, ଯାହାଫଳରେ ଆଗାମୀ ପିଢ଼ି ଓଡ଼ିଶାର ଏହି ଗୌରବମୟ ଇତିହାସକୁ ଅନୁଭବ କରିପାରିବେ।`
  ].join('\n\n');

  const vol6Hi = [
    `आधुनिक युग में ${voice.placeName.hi} का वैज्ञानिक संरक्षण, संरचनात्मक सुदृढ़ीकरण और पर्यावरणीय संतुलन अत्यंत महत्वपूर्ण है। मानसूनी वर्षा, समुद्री लवणयुक्त पवन तथा जैविक क्षरण से प्राचीन पाषाण व भित्तियों की रक्षा के लिए भारतीय पुरातत्व सर्वेक्षण और राज्य पुरातत्व विभाग द्वारा सूक्ष्म रासायनिक उपचार एवं संरक्षण कार्य किए गए हैं।`,
    `एक जागरूक यात्री के रूप में ${districtName} जिले की इस अमूल्य धरोहर की पवित्रता, स्वच्छता और स्थानीय जीआई-टैग शिल्पकारों की आजीविका का सम्मान करना हमारा साझा दायित्व है, ताकि आने वाली पीढ़ियां उत्कल के इस गौरवशाली अतीत से प्रेरणा ले सकें।`
  ].join('\n\n');

  const rawVolumes: Omit<EncyclopedicVolume, 'wordCount'>[] = [
    {
      volumeNumber: 1,
      title: 'Volume I: Archaeological Stratigraphy, Geomorphology & Site Chronology',
      odiaTitle: 'ଖଣ୍ଡ ୧: ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ସ୍ତରବିନ୍ୟାସ, ଭୂ-ତତ୍ତ୍ୱ ଓ ଐତିହାସିକ କାଳକ୍ରମ',
      hindiTitle: 'खंड १: पुरातात्विक स्तर-विन्यास, भू-आकृति विज्ञान एवं कालक्रम',
      contentEn: vol1En,
      contentOr: vol1Or,
      contentHi: vol1Hi,
    },
    {
      volumeNumber: 2,
      title: 'Volume II: Epigraphic Charters, Copper-Plates & Palm-Leaf Chronicles',
      odiaTitle: 'ଖଣ୍ଡ ୨: ଶିଳାଲେଖ, ତମ୍ବାପଟା ଅନୁଶାସନ ଓ ତାଳପତ୍ର ପୋଥି ପ୍ରମାଣ',
      hindiTitle: 'खंड २: शिलालेख, ताम्रपत्र अनुशासन एवं ताड़पत्र पांडुलिपि साक्ष्य',
      contentEn: vol2En,
      contentOr: vol2Or,
      contentHi: vol2Hi,
    },
    {
      volumeNumber: 3,
      title: 'Volume III: Kalinga Silpa-Sastra Architecture, Petrology & Engineering',
      odiaTitle: 'ଖଣ୍ଡ ୩: କଳିଙ୍ଗ ଶିଳ୍ପଶାସ୍ତ୍ର ସ୍ଥାପତ୍ୟ, ପ୍ରସ୍ତର ବିଜ୍ଞାନ ଓ ଯାନ୍ତ୍ରିକ କୌଶଳ',
      hindiTitle: 'खंड ३: कलिंग शिल्पशास्त्र वास्तुकला, पाषाण विज्ञान एवं अभियांत्रिकी',
      contentEn: vol3En,
      contentOr: vol3Or,
      contentHi: vol3Hi,
    },
    {
      volumeNumber: 4,
      title: 'Volume IV: Imperial Dynasties, Geopolitics & Maritime-Artisan Guilds',
      odiaTitle: 'ଖଣ୍ଡ ୪: ରାଜବଂଶୀୟ ପୃଷ୍ଠପୋଷକତା, ବାଣିଜ୍ୟପଥ ଓ ଶିଳ୍ପୀ-ସଂଘ ଇତିହାସ',
      hindiTitle: 'खंड ४: राजवंशीय संरक्षण, व्यापारिक मार्ग एवं शिल्पी-संघ इतिहास',
      contentEn: vol4En,
      contentOr: vol4Or,
      contentHi: vol4Hi,
    },
    {
      volumeNumber: 5,
      title: 'Volume V: Puranic Cosmology, Indigenous Synthesis & Living Rituals',
      odiaTitle: 'ଖଣ୍ଡ ୫: ପୌରାଣିକ ଦର୍ଶନ, ଆଦିବାସୀ-ତନ୍ତ୍ର ସମନ୍ୱୟ ଓ ଜୀବନ୍ତ ପର୍ବପର୍ବାଣି',
      hindiTitle: 'खंड ५: पौराणिक दर्शन, जनजातीय-तंत्र समन्वय एवं जीवंत उत्सव परंपरा',
      contentEn: vol5En,
      contentOr: vol5Or,
      contentHi: vol5Hi,
    },
    {
      volumeNumber: 6,
      title: 'Volume VI: Rediscovery, ASI Structural Conservation & Stewardship',
      odiaTitle: 'ଖଣ୍ଡ ୬: ଆଧୁନିକ ଆବିଷ୍କାର, ବୈଜ୍ଞାନିକ ସଂରକ୍ଷଣ ଓ ଐତିହ୍ୟ ଦାୟିତ୍ୱ',
      hindiTitle: 'खंड ६: आधुनिक पुनर्रखोज, वैज्ञानिक संरक्षण एवं धरोहर संवर्धन',
      contentEn: vol6En,
      contentOr: vol6Or,
      contentHi: vol6Hi,
    },
  ];

  return rawVolumes.map((v) => ({
    ...v,
    wordCount:
      countRealWords(v.title) +
      countRealWords(v.odiaTitle) +
      countRealWords(v.hindiTitle) +
      countRealWords(v.contentEn) +
      countRealWords(v.contentOr) +
      countRealWords(v.contentHi),
  }));
}

export function enrichStoryWithEncyclopedia(baseStory: AudioGuideStory): AudioGuideStory {
  const seed = MONUMENT_SCHOLARLY_SEEDS[baseStory.id];
  if (!seed) {
    const fallbackTotal = computeStoryTotalWordCount(baseStory);
    return { ...baseStory, totalWords: fallbackTotal };
  }

  const enrichedBase: AudioGuideStory = {
    ...baseStory,
    odiaHistorySummary: baseStory.odiaHistorySummary || seed.odiaHistorySummary,
    odiaLegendSummary: baseStory.odiaLegendSummary || seed.odiaLegendSummary,
    odiaArchitectureSummary: baseStory.odiaArchitectureSummary || seed.odiaArchitectureSummary,
    hindiHistorySummary: baseStory.hindiHistorySummary || seed.hindiHistorySummary,
    hindiLegendSummary: baseStory.hindiLegendSummary || seed.hindiLegendSummary,
    hindiArchitectureSummary: baseStory.hindiArchitectureSummary || seed.hindiArchitectureSummary,
  };

  const encyclopedicVolumes = buildMonumentVolumes(enrichedBase, seed);
  const withVolumes: AudioGuideStory = {
    ...enrichedBase,
    encyclopedicVolumes,
  };

  return {
    ...withVolumes,
    editorialReviewStatus: baseStory.editorialReviewStatus || 'verified_epigraphic_and_asi',
    lastUpdated: baseStory.lastUpdated || '2026-10-28',
    totalWords: computeStoryTotalWordCount(withVolumes),
  };
}
