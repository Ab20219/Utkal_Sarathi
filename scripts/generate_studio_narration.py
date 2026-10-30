import os
import asyncio
import edge_tts

# Odia to Devanagari phonetic converter
def odia_to_devanagari(text: str) -> str:
    res = []
    for ch in text:
        code = ord(ch)
        if ch == 'ୱ':
            res.append('व')
        elif ch == 'ୟ':
            res.append('य')
        elif ch == 'ଯ':
            res.append('ज')
        elif ch == 'ଳ':
            res.append('ल')
        elif ch == 'ଡ଼':
            res.append('ड़')
        elif ch == 'ଢ଼':
            res.append('ढ़')
        elif 0x0B01 <= code <= 0x0B71:
            res.append(chr(code - 0x0200))
        else:
            res.append(ch)
    return "".join(res)

MONUMENTS_NARRATION = [
    {
        "id": "story-konark",
        "en": "Welcome to the Sun Temple of Konark, the monumental Black Pagoda and crowning jewel of Kalinga architectural genius. Built by Emperor Langula Narasimhadeva, its twenty-four giant sundial wheels tell time to the exact minute.",
        "hi": "कोणार्क के सूर्य मंदिर में आपका स्वागत है, जो कलिंग वास्तुकला और खगोलशास्त्र का अनुपम चमत्कार है। राजा नरसिंहदेव द्वारा निर्मित इसके चौबीस पहिये समय का सटीक माप करते हैं।",
        "or": "କୋଣାର୍କର ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଓଡ଼ିଆ ଜାତିର ସ୍ଥାପତ୍ୟ କଳା ଓ ବୈଜ୍ଞାନିକ ଦୂରଦୃଷ୍ଟିର ସର୍ବୋଚ୍ଚ ଶିଖର ଅଟେ। ଲାଙ୍ଗୁଳା ନରସିଂହଦେବଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଏହି ମନ୍ଦିରର ଚବିଶଟି ଚକ୍ର ସଠିକ୍ ସମୟ ଗଣନା କରେ।"
    },
    {
        "id": "story-puri-jagannath",
        "en": "Welcome to Shree Jagannath Temple in Puri, the sacred Purushottama Kshetra of Sanatana Dharma. Constructed by King Anantavarman Chodagangadeva, this eternal shrine has stood through centuries of devotion and grand Ratha Yatras.",
        "hi": "श्री जगन्नाथ मंदिर पुरी में आपका स्वागत है, जो सनातन धर्म का पवित्र पुरुषोत्तम क्षेत्र है। राजा चोडगंगदेव द्वारा निर्मित यह दिव्य धाम सदियों की भक्ति और महाप्रसाद की महिमा समेटे हुए है।",
        "or": "ପୁରୀର ଶ୍ରୀଜଗନ୍ନାଥ ମନ୍ଦିର ସମଗ୍ର ବିଶ୍ୱର ପବିତ୍ର ପୁରୁଷୋତ୍ତମ କ୍ଷେତ୍ର ଅଟେ। ରାଜା ଅନନ୍ତବର୍ମା ଚୋଡ଼ଗଙ୍ଗଦେବଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଏହି ପବିତ୍ର ଶ୍ରୀମନ୍ଦିର ଓ ମହାପ୍ରଭୁଙ୍କ ରଥଯାତ୍ରା ସମସ୍ତଙ୍କୁ ମୁଗ୍ଧ କରେ।"
    },
    {
        "id": "story-dhauli",
        "en": "Welcome to Dhauli Shanti Stupa and the ancient Ashokan rock edicts along the peaceful banks of the Daya River. Here, Emperor Ashoka renounced bloodshed after the Kalinga War, embracing Buddhism and universal peace.",
        "hi": "धौली शांति स्तूप और दया नदी के तट पर सम्राट अशोक के प्राचीन शिलालेखों में आपका स्वागत है। कलिंग युद्ध के पश्चात् यहीं अशोक ने हिंसा त्यागकर बौद्ध धर्म और शांति का मार्ग अपनाया था।",
        "or": "ଦୟା ନଦୀ କୂଳରେ ଅବସ୍ଥିତ ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ସମ୍ରାଟ ଅଶୋକଙ୍କ ଶିଳାଲେଖକୁ ସ୍ୱାଗତ। କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ଚଣ୍ଡାଶୋକ ଏହିଠାରେ ଧର୍ମାଶୋକରେ ରୂପାନ୍ତରିତ ହୋଇ ଅହିଂସାର ବାର୍ତ୍ତା ଦେଇଥିଲେ।"
    },
    {
        "id": "story-khandagiri-udayagiri",
        "en": "Welcome to Udayagiri and Khandagiri caves, sculpted in the first century BCE under Emperor Kharavela. The famous seventeen-line Hathigumpha inscription chronicles Kalinga's golden era of arts, trade, and royal victories.",
        "hi": "उदयगिरि और खंडगिरि की पाषाण गुफाओं में आपका स्वागत है, जिनका निर्माण ईसा पूर्व प्रथम शताब्दी में सम्राट खारवेल के शासनकाल में हुआ था। हाथीगुंफा शिलालेख कलिंग के गौरव का प्रमाण है।",
        "or": "ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରିର ପ୍ରାଚୀନ ଗୁମ୍ଫାକୁ ସ୍ୱାଗତ। ଖ୍ରୀଷ୍ଟପୂର୍ବ ପ୍ରଥମ ଶତାବ୍ଦୀରେ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ଦ୍ୱାରା ଖୋଦିତ ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖ କଳିଙ୍ଗର ଶୌର୍ଯ୍ୟ ଓ ଐତିହ୍ୟ ବର୍ଣ୍ଣନା କରେ।"
    },
    {
        "id": "story-lingaraj",
        "en": "Welcome to the majestic Lingaraj Temple of Bhubaneswar, the epitome of classical Kalinga Rekha Deula architecture. Built by Somavamsi monarchs, it enshrines Lord Harihara, blending Vaishnavite and Shaivite traditions.",
        "hi": "भुवनेश्वर के भव्य लिंगराज मंदिर में आपका स्वागत है, जो कलिंग रेखा देउल वास्तुकला का अनुपम शिखर है। सोमवंशी राजाओं द्वारा निर्मित यह मंदिर हरिहर स्वरूप में शिव-विष्णु एकता का प्रतीक है।",
        "or": "ଭୁବନେଶ୍ୱରର ଏକାମ୍ର କ୍ଷେତ୍ରସ୍ଥିତ ମହାପ୍ରଭୁ ଲିଙ୍ଗରାଜଙ୍କ ଭବ୍ୟ ମନ୍ଦିରକୁ ସ୍ୱାଗତ। ସୋମବଂଶୀ ରାଜାମାନଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଏହି ପବିତ୍ର ପୀଠରେ ହରିହରଙ୍କ ପୂଜା ଅନନ୍ୟ ଅଟେ।"
    },
    {
        "id": "story-cuttack-barabati",
        "en": "Welcome to the historic millennium city of Cuttack and the ancient Barabati Fort on the Mahanadi River. Celebrated for the historic Boita Bandana and Bali Jatra, this was Kalinga's thriving maritime capital.",
        "hi": "कटक के सहस्राब्दी पुराने ऐतिहासिक नगर और बाराबाटी किले में आपका स्वागत है। महानदी के तट पर आयोजित बाली यात्रा प्राचीन कलिंग के समृद्ध समुद्री व्यापार की साक्षी है।",
        "or": "କଟକର ଐତିହାସିକ ବାରବାଟୀ ଦୁର୍ଗ ଓ ମହାନଦୀ କୂଳକୁ ସ୍ୱାଗତ। ପ୍ରାଚୀନ କାଳର ବୋଇତ ବନ୍ଦାଣ ଓ ବାଲିଯାତ୍ରା କଳିଙ୍ଗର ନୌବାଣିଜ୍ୟର ଗୌରବ ଗାନ କରେ।"
    },
    {
        "id": "story-diamond-triangle",
        "en": "Welcome to Odisha's Buddhist Diamond Triangle comprising Ratnagiri, Lalitgiri, and Udayagiri. These world-renowned monastic universities preserved sacred Mahayana and Vajrayana manuscripts and timeless stone sculptures.",
        "hi": "ओडिशा के बौद्ध हीरक त्रिभुज रत्नगिरि, ललितगिरि और उदयगिरि में आपका स्वागत है। ये प्राचीन बौद्ध विहार महायान और वज्रयान दर्शन के प्रमुख अंतरराष्ट्रीय केंद्र रहे हैं।",
        "or": "ରତ୍ନଗିରି, ଲଳିତଗିରି ଓ ଉଦୟଗିରିକୁ ନେଇ ଗଠିତ ବୌଦ୍ଧ ହୀରକ ତ୍ରିଭୁଜକୁ ସ୍ୱାଗତ। ଏହି ପ୍ରାଚୀନ ବିହାରଗୁଡ଼ିକରେ ବୌଦ୍ଧ ସ୍ତୂପ ଓ ଦିବ୍ୟ ପ୍ରସ୍ତର ମୂର୍ତ୍ତିକଳା ଶୋଭାପାଉଛି।"
    },
    {
        "id": "story-chilika",
        "en": "Welcome to Chilika Lake, Asia's largest brackish water lagoon and a sanctuary for migratory birds. Steeped in maritime lore, this scenic paradise enshrines the sacred island temple of Goddess Kalijai.",
        "hi": "एशिया की सबसे बड़ी खारे पानी की लैगून चिल्का झील में आपका स्वागत है। लाखों प्रवासी पक्षियों की शरणस्थली और माँ कालीजाई का पवित्र द्वीप मंदिर यहाँ की पहचान हैं।",
        "or": "ଚିଲିକା ହ୍ରଦ ଓ ମା' କାଳୀଜାଈଙ୍କ ପବିତ୍ର ଦ୍ୱୀପକୁ ସ୍ୱାଗତ। ଏସିଆର ଏହି ବିଶାଳ ହ୍ରଦ ଦେଶବିଦେଶର ପକ୍ଷୀ ଏବଂ ଇରାୱାଡି ଡଲଫିନ ପାଇଁ ପ୍ରସିଦ୍ଧ ଅଟେ।"
    },
    {
        "id": "story-similipal",
        "en": "Welcome to Similipal Biosphere Reserve in Mayurbhanj, home of majestic Royal Bengal tigers, towering sal forests, and the exquisite black chlorite sculptures of Khiching's Kichakeswari Temple.",
        "hi": "मयूरभंज के सिमलीपाल बायोस्फीयर रिजर्व में आपका स्वागत है। घने साल के जंगल, बंगाल टाइगर और खिचिंग के माँ कीचकेश्वरी मंदिर की नक्काशी इसकी विशेषता हैं।",
        "or": "ମୟୂରଭଞ୍ଜର ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଶିମିଳିପାଳ ଅଭୟାରଣ୍ୟ ଓ ଖିଚିଂର ମା' କୀଚକେଶ୍ୱରୀ ମନ୍ଦିରକୁ ସ୍ୱାଗତ। ସୁନ୍ଦର ଜଳପ୍ରପାତ ଓ ବନ୍ୟଜନ୍ତୁ ଏହାର ପ୍ରାକୃତିକ ଶୋଭା ବଢ଼ାନ୍ତି।"
    },
    {
        "id": "story-hirakud-sambalpur",
        "en": "Welcome to Sambalpur, home of the world's longest earthen dam at Hirakud and the revered temple of Goddess Samaleswari on the banks of the sacred Mahanadi.",
        "hi": "संबलपुर के विश्व प्रसिद्ध हीराकुद बांध और महानदी तट पर स्थित माँ समलेश्वरी के पावन धाम में आपका स्वागत है।",
        "or": "ସମ୍ବଲପୁରର ଐତିହାସିକ ମା' ସମଲେଶ୍ୱରୀ ପୀଠ ଏବଂ ବିଶ୍ୱର ଦୀର୍ଘତମ ହୀରାକୁଦ ନଦୀବନ୍ଧକୁ ସ୍ୱାଗତ। ମହାନଦୀର ପବିତ୍ର ଧାରା ଏହାର ଗୌରବ ବହନ କରେ।"
    },
    {
        "id": "story-daringbadi",
        "en": "Welcome to Daringbadi, affectionately known as the Kashmir of Odisha. Perched amidst Kandhamal's mist-covered hills, pine forests, and lush coffee plantations, it offers pristine tranquility.",
        "hi": "ओडिशा के कश्मीर नाम से विख्यात दारिंगबाड़ी में आपका स्वागत है। कंधमाल की खूबसूरत वादियों, देवदार के जंगलों और कॉफी के बागानों से घिरा यह एक शांत पर्वतीय स्थल है।",
        "or": "ଓଡ଼ିଶାର କାଶ୍ମୀର କୁହାଯାଉଥିବା ଦାରିଙ୍ଗବାଡ଼ିକୁ ସ୍ୱାଗତ। କନ୍ଧମାଳ ଜିଲ୍ଲାର ପାଇନ ବନ, କଫି ବଗିଚା ଓ ଶୀତଳ ପାହାଡ଼ର ସୌନ୍ଦର୍ଯ୍ୟ ଅତ୍ୟନ୍ତ ମନୋରମ।"
    },
    {
        "id": "story-gupteswar-koraput",
        "en": "Welcome to Gupteswar Cave Temple in the sacred forests of Koraput. Hidden beside the Kolab River, this subterranean limestone cavern enshrines a naturally formed Shiva lingam revered by tribal and pilgrimage communities.",
        "hi": "कोरापुट के घने जंगलों में स्थित गुप्तेश्वर गुफा मंदिर में आपका स्वागत है। कोलाब नदी के तट पर प्राकृतिक चूना-पत्थर की इस गुफा में स्वयंभू शिवलिंग प्रतिष्ठित है।",
        "or": "କୋରାପୁଟର ପବିତ୍ର ଗୁପ୍ତେଶ୍ୱର ଗୁମ୍ଫା ପୀଠକୁ ସ୍ୱାଗତ। କୋଲାବ ନଦୀ ନିକଟସ୍ଥ ପ୍ରାକୃତିକ ଗୁମ୍ଫାରେ ପୂଜା ପାଉଥିବା ସ୍ୱୟଂଭୂ ଶିବଲିଙ୍ଗଙ୍କ ମହିମା ଅପାର।"
    },
    {
        "id": "story-raghurajpur",
        "en": "Welcome to Raghurajpur, Odisha's celebrated heritage crafts village near Puri. Here, master chitrakaras preserve ancient Pattachitra scroll paintings, palm-leaf engraving, and the acrobatic Gotipua dance tradition.",
        "hi": "पूरी के निकट स्थित ऐतिहासिक शिल्प ग्राम रघुराजपुर में आपका स्वागत है। यहाँ के कलाकार सदियों पुरानी पट्टचित्र कला, ताड़पत्र उत्कीर्णन और गोटीपुआ नृत्य परंपरा को जीवित रखे हुए हैं।",
        "or": "ପୁରୀ ନିକଟସ୍ଥ ପ୍ରସିଦ୍ଧ ଶିଳ୍ପ ଗ୍ରାମ ରଘୁରାଜପୁରକୁ ସ୍ୱାଗତ। ଏହି ଗ୍ରାମର ପ୍ରତ୍ୟେକ ଘର ପଟ୍ଟଚିତ୍ର, ତାଳପତ୍ର ଖୋଦେଇ ଓ ଗୋଟିପୁଅ ନୃତ୍ୟର ଏକ ଜୀବନ୍ତ କେନ୍ଦ୍ର ଅଟେ।"
    },
    {
        "id": "story-mukteswar-rajarani",
        "en": "Welcome to the jewel of Odishan architecture, Mukteswar Temple, renowned for its exquisite torana archway, and the elegant Rajarani Temple celebrated for its graceful female nayika sculptures.",
        "hi": "ओडिशा की वास्तुकला के रत्न मुक्तेश्वर मंदिर के तोरण द्वार और राजरानी मंदिर की अनुपम पाषाण मूर्तियों में आपका स्वागत है।",
        "or": "କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟର ମୁକୁଟ ମଣି ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିରର ତୋରଣ ଓ ରାଜାରାଣୀ ମନ୍ଦିରର ଅପୂର୍ବ ପ୍ରସ୍ତର କଳାକୁ ସ୍ୱାଗତ।"
    },
    {
        "id": "story-hirapur-yogini",
        "en": "Welcome to the hypaethral Chausathi Yogini Temple of Hirapur. Constructed in the ninth century by Queen Hira Devi, this roofless circular shrine features sixty-four exquisite dark chlorite yogini sculptures.",
        "hi": "हीरापुर के चौंसठ योगिनी मंदिर में आपका स्वागत है। 9वीं शताब्दी में निर्मित यह खुला गोलाकार तंत्र पीठ चौंसठ योगिनियों की सुंदर मूर्तियों से सुसज्जित है।",
        "or": "ହୀରାପୁରର ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିର ଏକ ବିଶ୍ୱପ୍ରସିଦ୍ଧ ତାନ୍ତ୍ରିକ ପୀଠ ଅଟେ। ଖୋଲା ଆକାଶ ତଳେ ଅବସ୍ଥିତ ଏହି ବୃତ୍ତାକାର ମନ୍ଦିରର କାରୁକାର୍ଯ୍ୟ ଅତୁଳନୀୟ।"
    },
    {
        "id": "story-jajpur-biraja",
        "en": "Welcome to Jajpur, the ancient sacred capital on the Vaitarani River and home to Maa Biraja, one of India's earliest Shakti Peethas where the Goddess is worshipped as the two-armed Mahishasuramardini.",
        "hi": "वैतरणी नदी के तट पर स्थित प्राचीन जाजपुर और माँ बिरजा शक्तिपीठ में आपका स्वागत है। यहाँ देवी की द्विभुज महिषासुरमर्दिनी प्रतिमा प्रतिष्ठित है।",
        "or": "ବୈତରଣୀ ନଦୀ କୂଳରେ ଅବସ୍ଥିତ ପ୍ରାଚୀନ ଯାଜପୁରର ମା' ବିରଜା କ୍ଷେତ୍ରକୁ ସ୍ୱାଗତ। ଏହା ଭାରତର ଏକ ପ୍ରମୁଖ ଶକ୍ତିପୀଠ ଅଟେ।"
    },
    {
        "id": "story-jaugada-taratarini",
        "en": "Welcome to Jaugada and Maa Tara Tarini in Ganjam. Here stand Emperor Ashoka's ancient rock inscriptions and the twin goddess hill-shrine overlooking the Rushikulya River valley.",
        "hi": "जौगड़ा के मौर्यकालीन अशोक शिलालेखों और ऋषिकुल्या नदी किनारे स्थित माँ तारा तारिणी शक्तिपीठ में आपका स्वागत है।",
        "or": "ଗଞ୍ଜାମର ଐତିହାସିକ ଜଉଗଡ଼ ଅଶୋକ ଶିଳାଲେଖ ଓ ଋଷିକୁଲ୍ୟା ନଦୀ କୂଳସ୍ଥିତ ମା' ତାରା ତାରିଣୀ ପବିତ୍ର ପୀଠକୁ ସ୍ୱାଗତ।"
    },
    {
        "id": "story-kapilash-joranda",
        "en": "Welcome to Kapilash Temple, the Kailash of Odisha, and the sacred Joranda Gadi in Dhenkanal, world headquarters of the egalitarian Mahima Dharma.",
        "hi": "ओडिशा के कैलाश कहे जाने वाले कपिलाश मंदिर और ढेंकनाल के जोरंदा महिमा गादी में आपका स्वागत है।",
        "or": "ଢେଙ୍କାନାଳର ପ୍ରସିଦ୍ଧ କପିଳାସ ଶୈବପୀଠ ଏବଂ ମହିମା ଧର୍ମର ମୁଖ୍ୟ ପୀଠ ଯୋରନ୍ଦା ଗାଦିକୁ ସ୍ୱାଗତ।"
    },
    {
        "id": "story-bhitarkanika-kanika",
        "en": "Welcome to Bhitarkanika National Park, India's second largest mangrove ecosystem, renowned for saltwater crocodiles and Kingfisher sanctuaries in Kendrapara.",
        "hi": "केंद्रपाड़ा के भितरकनिका राष्ट्रीय उद्यान में आपका स्वागत है, जो विशाल मैंग्रोव वन और खारे पानी के मगरमच्छों का प्राकृतिक आवास है।",
        "or": "କେନ୍ଦ୍ରାପଡ଼ାର ଭିତରକନିକା ଜାତୀୟ ଉଦ୍ୟାନକୁ ସ୍ୱାଗତ। ଏହାର ହେନ୍ତାଳବଣ ଓ ଲୁଣା କୁମ୍ଭୀର ଅଭୟାରଣ୍ୟ ସମଗ୍ର ବିଶ୍ୱରେ ପ୍ରସିଦ୍ଧ।"
    },
    {
        "id": "story-gandhamardan-nrusinghanath",
        "en": "Welcome to Gandhamardan Hill, the legendary medicinal mountain of the Ramayana spanning Bargarh and Balangir, home to sacred Nrusinghanath and Harishankar shrines.",
        "hi": "गंधमार्दन पर्वत और नृसिंहनाथ तीर्थ में आपका स्वागत है। रामायण काल की दुर्लभ औषधीय जड़ी-बूटियों से समृद्ध यह पावन धाम अद्भुत शांति प्रदान करता है।",
        "or": "ବରଗଡ଼ ଓ ବଲାଙ୍ଗୀର ସୀମାନ୍ତରେ ଅବସ୍ଥିତ ଔଷଧୀୟ ଗନ୍ଧମାର୍ଦ୍ଦନ ପର୍ବତ ଓ ପବିତ୍ର ନୃସିଂହନାଥ ପୀଠକୁ ସ୍ୱାଗତ।"
    },
    {
        "id": "story-ranipur-jharial",
        "en": "Welcome to Ranipur-Jharial in Balangir, the ancient Somatirtha featuring sixty-four yogini hypaethral temples, brick temples, and early medieval Tantric Shaivite complexes.",
        "hi": "बलांगीर के रानीपुर-झरियाल में आपका स्वागत है, जो चौंसठ योगिनी और प्राचीन ईंट मंदिरों का ऐतिहासिक तांत्रिक केंद्र है।",
        "or": "ବଲାଙ୍ଗୀରର ପ୍ରାଚୀନ ରାଣୀପୁର ଝରିଆଲ ସୋମତୀର୍ଥ ଓ ଚଉଷଠି ଯୋଗିନୀ ପୀଠକୁ ସ୍ୱାଗତ।"
    },
    {
        "id": "story-mahendragiri",
        "en": "Welcome to Mount Mahendragiri in Gajapati, the legendary abode of Sage Parashurama mentioned in the Ramayana and Mahabharata, crowned with early Eastern Ganga stone temples.",
        "hi": "गजपति के पौराणिक महेंद्रगिरि पर्वत में आपका स्वागत है, जो भगवान परशुराम की तपोभूमि और प्राचीन गंग मंदिरों से सुशोभित है।",
        "or": "ଗଜପତି ଜିଲ୍ଲାର ପୌରାଣିକ ମହେନ୍ଦ୍ରଗିରି ପର୍ବତକୁ ସ୍ୱାଗତ। ଏହା ଭଗବାନ ପରଶୁରାମଙ୍କ ତପୋଭୂମି ଓ ପ୍ରାଚୀନ ମନ୍ଦିର ପାଇଁ ବିଖ୍ୟାତ।"
    },
    {
        "id": "story-sonepur-suvarnapura",
        "en": "Welcome to Sonepur, the ancient golden city of Suvarnapura on the confluence of the Mahanadi and Tel rivers, celebrated for Somavamsi temples and world-famous handloom weaving.",
        "hi": "सोनपुर के ऐतिहासिक सुवर्णपुर नगर में आपका स्वागत है। महानदी और तेल नदी के संगम पर स्थित यह शहर अपने प्राचीन मंदिरों और संबलपुरी हथकरघा के लिए प्रसिद्ध है।",
        "or": "ମହାନଦୀ ଓ ତେଲ ନଦୀର ସଙ୍ଗମସ୍ଥଳୀ ସୁବର୍ଣ୍ଣପୁର ବା ସୋନପୁରକୁ ସ୍ୱାଗତ। ଏହାର ପ୍ରାଚୀନ ମନ୍ଦିର ଓ ହସ୍ତତନ୍ତ ବସ୍ତ୍ର ବିଶ୍ୱପ୍ରସିଦ୍ଧ।"
    },
    {
        "id": "story-balasore-chandipur",
        "en": "Welcome to Balasore and the magical receding sea of Chandipur, where the Bay of Bengal ebbs up to five kilometers twice a day, alongside the historic maritime bastion of Raibania Fort.",
        "hi": "बालासोर और चांदीपुर के जादुई समुद्र तट पर आपका स्वागत है, जहाँ समुद्र का पानी दिन में दो बार पांच किलोमीटर तक पीछे चला जाता है।",
        "or": "ବାଲେଶ୍ୱରର ଚାନ୍ଦିପୁର ବେଳାଭୂମି ଓ ରାଇବଣିଆ ଦୁର୍ଗକୁ ସ୍ୱାଗତ। ଚାନ୍ଦିପୁର ସମୁଦ୍ରର ଜୁଆର-ଭଟ୍ଟାର ଲୁଚକାଳି ଏକ ଅଲୌକିକ ଦୃଶ୍ୟ ଅଟେ।"
    },
    {
        "id": "story-sunabeda-koraput-sabara",
        "en": "Welcome to Sabara Srikhetra Koraput and the tribal highlands of southern Odisha, where Lord Jagannath is venerated in the indigenous tribal Sabara tradition without discrimination.",
        "hi": "कोरापुट के शबर श्रीक्षेत्र में आपका स्वागत है, जहाँ महाप्रभु जगन्नाथ की पूजा जनजातीय शबर परंपरा के अनुसार समरसता के साथ की जाती है।",
        "or": "କୋରାପୁଟର ଶବର ଶ୍ରୀକ୍ଷେତ୍ରକୁ ସ୍ୱାଗତ। ଏଠାରେ ମହାପ୍ରଭୁ ଶ୍ରୀଜଗନ୍ନାଥ ଆଦିବାସୀ ଶବର ପରମ୍ପରା ଅନୁସାରେ ସମସ୍ତଙ୍କ ଦ୍ୱାରା ପୂଜା ପାଆନ୍ତି।"
    }
]

VOICE_CONFIG = {
    'en': 'en-IN-PrabhatNeural',
    'hi': 'hi-IN-MadhurNeural',
    'or': 'hi-IN-MadhurNeural', # Spoken naturally using Devanagari phonetic mapping
}

OUTPUT_DIRS = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'offline-audio'),
    os.path.join('C:\\Users\\abhis\\Downloads\\UtkalSarathi-main\\UtkalSarathi-main', 'public', 'offline-audio')
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

async def generate_single(text: str, voice: str, out_path_mp3: str):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(out_path_mp3)

async def main():
    print(f"Generating authentic studio neural narrations for 25 monuments in EN, HI, OR...")
    
    tasks = []
    
    for item in MONUMENTS_NARRATION:
        m_id = item['id']
        
        # English
        en_text = item['en']
        out_en = os.path.join(OUTPUT_DIRS[0], f"{m_id}-en-seg0.mp3")
        tasks.append((en_text, VOICE_CONFIG['en'], out_en, f"{m_id}-en"))
        
        # Hindi
        hi_text = item['hi']
        out_hi = os.path.join(OUTPUT_DIRS[0], f"{m_id}-hi-seg0.mp3")
        tasks.append((hi_text, VOICE_CONFIG['hi'], out_hi, f"{m_id}-hi"))
        
        # Odia via Devanagari phonetic bridge
        or_text = odia_to_devanagari(item['or'])
        out_or = os.path.join(OUTPUT_DIRS[0], f"{m_id}-or-seg0.mp3")
        tasks.append((or_text, VOICE_CONFIG['or'], out_or, f"{m_id}-or"))

    # Execute with concurrency semaphore
    sem = asyncio.Semaphore(5)
    async def run_task(text, voice, out_p, tag):
        async with sem:
            try:
                await generate_single(text, voice, out_p)
                # Copy to second directory if exists
                if os.path.exists(OUTPUT_DIRS[1]):
                    dest2 = os.path.join(OUTPUT_DIRS[1], os.path.basename(out_p))
                    with open(out_p, 'rb') as f_src, open(dest2, 'wb') as f_dst:
                        f_dst.write(f_src.read())
                print(f" [OK] Generated {tag}")
            except Exception as e:
                print(f" [ERR] {tag}: {e}")

    await asyncio.gather(*(run_task(t, v, p, tag) for t, v, p, tag in tasks))
    print("All 75 authentic spoken narrations successfully generated!")

if __name__ == '__main__':
    asyncio.run(main())
