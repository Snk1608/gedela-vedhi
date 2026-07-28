import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "te";

const dict = {
  en: {
    // Nav
    home: "Home",
    about: "About",
    gallery: "Gallery",
    news: "News",
    vinayaka: "Vinayaka Chavithi 2026",
    events: "Events",
    contact: "Contact",
    login: "Login",
    admin: "Admin",
    signOut: "Sign out",
    quickLinks: "Quick Links",
    contactHeading: "Contact",
    tagline:
      "A community of friends from Gedela Vedhi celebrating festivals, traditions and togetherness with our beloved village.",
    copyright: "© {year} Gedela Vedhi Youth",
    langLabel: "EN",

    // Home
    welcome: "✦ Welcome ✦",
    heroSubtitle:
      "A community of friends from Gajarayuni Valasa — celebrating festivals, traditions, and the spirit of togetherness.",
    donateBtn: "Donate for Vinayaka Chavithi 2026",
    exploreGallery: "Explore Gallery",
    ourHighlights: "Our Highlights",
    eventsCelebrations: "Events & Celebrations",
    learnMore: "Learn more",
    upcomingEvents: "Our Community Events",
    upcomingEventsSub: "Donate, track and celebrate every festival together.",
    viewAndDonate: "View & Donate",
    ctaHeading: "Vinayaka Chavithi 2026",
    ctaText:
      "Be a part of our biggest annual celebration. Every contribution — big or small — helps us bring our community closer together.",
    donateNow: "Donate now",
    noEvents: "No events yet.",

    // About
    aboutKicker: "Our Story",
    aboutTitle: "About Gedela Vedhi Youth",
    aboutIntro:
      "We are a group of friends from Gedela Vedhi, Gajarayuni Valasa — bound by our love for our village, our traditions and each other. From Vinayaka Chavithi to Sankranthi, we come together to celebrate, support and uplift our community.",
    aboutCommunityTitle: "Community First",
    aboutCommunityText: "Built by youth, for the village. Every member matters.",
    aboutTraditionTitle: "Tradition & Culture",
    aboutTraditionText: "Honouring our festivals, customs and Telugu heritage.",
    aboutJoyTitle: "Joyful Celebrations",
    aboutJoyText: "Festivals, birthdays and events — making memories together.",
    aboutVillageTitle: "Our Village",
    aboutVillageText:
      "Gajarayuni Valasa is a vibrant village in Andhra Pradesh known for its warm community, age-old traditions and joyful festivals. Gedela Vedhi is the heart of our celebrations — where neighbours become family.",

    // Contact
    contactKicker: "Reach Us",
    contactTitle: "Contact",
    contactSubtitle: "We'd love to hear from you.",
    contactAddress: "Our Address",
    contactOpenMaps: "Open in Maps",
    contactPhone: "Phone",
    contactCall: "Call us",
    contactEmail: "Email",
    contactSendEmail: "Send email",
    contactInstagram: "Instagram",
    contactFollow: "Follow",

    // Gallery
    galleryKicker: "Memories",
    galleryTitle: "Photo Gallery",
    gallerySubtitle: "Browse photos from our festivals, events and celebrations.",
    galleryLoading: "Loading categories…",
    galleryEmpty: "No photos yet in this category.",
    photoOne: "photo",
    photoMany: "photos",
    download: "Download",

    // News
    newsKicker: "What's New",
    newsTitle: "News & Updates",
    newsSubtitle: "Latest announcements from our community.",
    newsEmpty: "No announcements yet.",
    announcement: "Announcement",

    // Events
    eventsKicker: "🪔 Our Celebrations",
    eventsTitle: "Community Events",
    eventsSubtitle: "Donate, track, and celebrate together.",
    eventNotFound: "Event not found",
    loading: "Loading…",

    // Donation / event detail
    eventKicker: "🪔 Community Event",
    totalDonations: "Total Donations",
    totalExpenses: "Total Expenses",
    balance: "Balance",
    remainingBalance: "Remaining Balance",
    donationConfirmation: "Donation Confirmation",
    donationFormHelp:
      "Submit details after you've made your contribution. Your entry will appear publicly once approved by admin.",
    formName: "Name",
    formAmount: "Amount (₹)",
    formPaymentMethod: "Payment Method",
    formPhone: "Phone",
    formPhoneOptional: "Phone Number (optional)",
    formEmail: "Email",
    formEmailOptional: "Email (optional)",
    formTransactionId: "Transaction ID (optional)",
    formMessage: "Message (optional)",
    submitting: "Submitting…",
    submitDonation: "Submit Donation",
    donationThanks: "Thank you! Your donation is pending admin approval.",
    ourDonors: "Our Donors",
    approved: "approved",
    noDonations: "No donations yet. Be the first to contribute!",
    donorName: "Donor Name",
    paymentMethod: "Payment Method",
    dateLbl: "Date",
    amountLbl: "Amount",
    expenses: "Expenses",
    entries: "entries",
    noExpenses: "No expenses recorded yet.",
    title: "Title",
    category: "Category",

    // Vinayaka page
    vinayakaKicker: "🙏 Festival of Devotion",
    vinayakaIntro:
      "Join hands with us to celebrate Lord Ganesha. Every contribution lights up our village.",
    bankTransfer: "Bank Transfer",
    bankName: "Bank Name",
    accountNumber: "Account Number",
    ifsc: "IFSC",
    accountHolder: "Account Holder",
    phonepeUpi: "PhonePe / UPI",
    phonepeNumber: "PhonePe Number",
    upiId: "UPI ID",
    scanToPay: "Scan to pay",
    afterPaying:
      "After paying, please fill the donation form below so we can confirm and add your name to our donor list.",
    upiNote: "Tap a button to open your UPI app. Enter the amount and complete the payment.",
    payWithPhonePe: "PhonePe",
    payWithGooglePay: "Google Pay",
    payWithPaytm: "Paytm",

    // Auth
    authWelcome: "Welcome",
    authSubtitle: "Sign in to access the admin panel.",
    signIn: "Sign in",
    signUp: "Sign up",
    fullName: "Full name",
    password: "Password",
    passwordHint: "Password (min 6 chars)",
    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    createAccount: "Create account",
    authNote:
      "Sign up with gedelavedhiboyz@gmail.com to get admin access automatically.",
    welcomeBack: "Welcome back!",
    accountCreated: "Account created. You're signed in.",

    // Suggestion form
    suggestionsTitle: "Share Your Suggestions",
    suggestionsSubtitle: "Help us improve — your ideas matter to our community.",
    suggestionLabel: "Suggestion",
    optional: "(optional)",
    placeholderName: "Your name",
    placeholderSuggestion: "Tell us your thoughts, ideas, or feedback…",
    placeholderEmail: "you@example.com",
    placeholderPhone: "+91 90000 00000",
    mobile: "Mobile",
    submitSuggestion: "Submit Suggestion",
    suggestionThanks: "Thanks for your suggestion!",
    suggestionFailed: "Failed to submit. Please try again.",

    // Countdown
    days: "Days",
    hrs: "Hrs",
    min: "Min",
    sec: "Sec",
    happeningNow: "🎉 Happening now!",

    // Carousel
    birthdayToday: "Birthday Today",
  },
  te: {
    home: "హోమ్",
    about: "మా గురించి",
    gallery: "గ్యాలరీ",
    news: "వార్తలు",
    vinayaka: "వినాయక చవితి 2026",
    events: "ఈవెంట్లు",
    contact: "సంప్రదించండి",
    login: "లాగిన్",
    admin: "అడ్మిన్",
    signOut: "సైన్ అవుట్",
    quickLinks: "త్వరిత లింక్‌లు",
    contactHeading: "సంప్రదింపు",
    tagline:
      "గెడెల వీధి మిత్రుల సమూహం — పండుగలు, సంప్రదాయాలు మరియు మన గ్రామంతో కలసి జరుపుకుంటున్నాం.",
    copyright: "© {year} గెడెల వీధి యూత్",
    langLabel: "తె",

    welcome: "✦ స్వాగతం ✦",
    heroSubtitle:
      "గజరాయుని వలస మిత్రుల కూటమి — పండుగలు, సంప్రదాయాలు, ఐక్యత స్ఫూర్తితో కలిసి జరుపుకుంటున్నాం.",
    donateBtn: "వినాయక చవితి 2026 కోసం విరాళం ఇవ్వండి",
    exploreGallery: "గ్యాలరీ చూడండి",
    ourHighlights: "మా ముఖ్యాంశాలు",
    eventsCelebrations: "పండుగలు & వేడుకలు",
    learnMore: "మరింత చూడండి",
    upcomingEvents: "మా సంఘ ఈవెంట్లు",
    upcomingEventsSub: "ప్రతి పండుగను కలిసి జరుపుకుందాం, విరాళం ఇవ్వండి.",
    viewAndDonate: "చూడండి & విరాళం ఇవ్వండి",
    ctaHeading: "వినాయక చవితి 2026",
    ctaText:
      "మా అతిపెద్ద వార్షిక వేడుకలో భాగమవ్వండి. ప్రతి విరాళం — పెద్దది లేదా చిన్నది — మన సమాజాన్ని దగ్గర చేస్తుంది.",
    donateNow: "ఇప్పుడు విరాళం ఇవ్వండి",
    noEvents: "ఇంకా ఈవెంట్లు లేవు.",

    aboutKicker: "మా కథ",
    aboutTitle: "గెడెల వీధి యూత్ గురించి",
    aboutIntro:
      "మేము గెడెల వీధి, గజరాయుని వలస నుండి మిత్రుల కూటమి — మన గ్రామం, సంప్రదాయాలు మరియు ఒకరిపై ఒకరు ఉన్న ప్రేమతో కలిసి ఉన్నాం. వినాయక చవితి నుండి సంక్రాంతి వరకు, మన సమాజాన్ని ఉత్సవంగా జరుపుకోవడానికి, మద్దతుగా నిలవడానికి కలిసి వస్తాం.",
    aboutCommunityTitle: "సమాజమే మొదట",
    aboutCommunityText: "యూత్ చేత, గ్రామం కోసం. ప్రతి సభ్యుడు ముఖ్యమే.",
    aboutTraditionTitle: "సంప్రదాయం & సంస్కృతి",
    aboutTraditionText: "మా పండుగలు, ఆచారాలు మరియు తెలుగు సంస్కృతిని గౌరవిస్తాం.",
    aboutJoyTitle: "ఆనందమైన వేడుకలు",
    aboutJoyText: "పండుగలు, పుట్టినరోజులు మరియు ఈవెంట్లు — కలిసి జ్ఞాపకాలు చేస్తాం.",
    aboutVillageTitle: "మా గ్రామం",
    aboutVillageText:
      "గజరాయుని వలస ఆంధ్రప్రదేశ్‌లో ఉన్న చైతన్యవంతమైన గ్రామం, వెచ్చని సమాజం, పురాతన సంప్రదాయాలు మరియు ఆనందమైన పండుగలకు ప్రసిద్ధి. గెడెల వీధి మా వేడుకల హృదయం — ఇక్కడ పొరుగువారు కుటుంబంగా మారతారు.",

    contactKicker: "మమ్మల్ని సంప్రదించండి",
    contactTitle: "సంప్రదించండి",
    contactSubtitle: "మీ నుండి వినడం మాకు సంతోషం.",
    contactAddress: "మా చిరునామా",
    contactOpenMaps: "మ్యాప్స్‌లో తెరవండి",
    contactPhone: "ఫోన్",
    contactCall: "కాల్ చేయండి",
    contactEmail: "ఇమెయిల్",
    contactSendEmail: "ఇమెయిల్ పంపండి",
    contactInstagram: "ఇన్‌స్టాగ్రామ్",
    contactFollow: "ఫాలో",

    galleryKicker: "జ్ఞాపకాలు",
    galleryTitle: "ఫోటో గ్యాలరీ",
    gallerySubtitle: "మా పండుగలు, ఈవెంట్లు మరియు వేడుకల ఫోటోలు చూడండి.",
    galleryLoading: "విభాగాలు లోడ్ అవుతున్నాయి…",
    galleryEmpty: "ఈ విభాగంలో ఇంకా ఫోటోలు లేవు.",
    photoOne: "ఫోటో",
    photoMany: "ఫోటోలు",
    download: "డౌన్‌లోడ్",

    newsKicker: "కొత్తదేమిటి",
    newsTitle: "వార్తలు & తాజా సమాచారం",
    newsSubtitle: "మా సమాజం నుండి తాజా ప్రకటనలు.",
    newsEmpty: "ఇంకా ప్రకటనలు లేవు.",
    announcement: "ప్రకటన",

    eventsKicker: "🪔 మా వేడుకలు",
    eventsTitle: "సమాజ ఈవెంట్లు",
    eventsSubtitle: "విరాళం ఇవ్వండి, ట్రాక్ చేయండి, కలిసి జరుపుకోండి.",
    eventNotFound: "ఈవెంట్ కనుగొనబడలేదు",
    loading: "లోడ్ అవుతోంది…",

    eventKicker: "🪔 సమాజ ఈవెంట్",
    totalDonations: "మొత్తం విరాళాలు",
    totalExpenses: "మొత్తం ఖర్చులు",
    balance: "బ్యాలెన్స్",
    remainingBalance: "మిగిలిన బ్యాలెన్స్",
    donationConfirmation: "విరాళం నిర్ధారణ",
    donationFormHelp:
      "మీ విరాళం చేసిన తర్వాత వివరాలు సమర్పించండి. అడ్మిన్ ఆమోదించాక మీ పేరు డోనర్ జాబితాలో కనిపిస్తుంది.",
    formName: "పేరు",
    formAmount: "మొత్తం (₹)",
    formPaymentMethod: "చెల్లింపు విధానం",
    formPhone: "ఫోన్",
    formPhoneOptional: "ఫోన్ నంబర్ (ఐచ్ఛికం)",
    formEmail: "ఇమెయిల్",
    formEmailOptional: "ఇమెయిల్ (ఐచ్ఛికం)",
    formTransactionId: "లావాదేవీ ID (ఐచ్ఛికం)",
    formMessage: "సందేశం (ఐచ్ఛికం)",
    submitting: "సమర్పిస్తోంది…",
    submitDonation: "విరాళం సమర్పించండి",
    donationThanks: "ధన్యవాదాలు! మీ విరాళం అడ్మిన్ ఆమోదం కోసం వేచి ఉంది.",
    ourDonors: "మా దాతలు",
    approved: "ఆమోదించబడింది",
    noDonations: "ఇంకా విరాళాలు లేవు. మీరే మొదటివారు అవ్వండి!",
    donorName: "దాత పేరు",
    paymentMethod: "చెల్లింపు విధానం",
    dateLbl: "తేదీ",
    amountLbl: "మొత్తం",
    expenses: "ఖర్చులు",
    entries: "ఎంట్రీలు",
    noExpenses: "ఇంకా ఖర్చులు నమోదు చేయలేదు.",
    title: "శీర్షిక",
    category: "విభాగం",

    vinayakaKicker: "🙏 భక్తి పండుగ",
    vinayakaIntro:
      "శ్రీ గణేశుని వేడుకలో మాతో కలవండి. ప్రతి విరాళం మన గ్రామాన్ని వెలిగిస్తుంది.",
    bankTransfer: "బ్యాంక్ ట్రాన్స్‌ఫర్",
    bankName: "బ్యాంక్ పేరు",
    accountNumber: "ఖాతా సంఖ్య",
    ifsc: "IFSC",
    accountHolder: "ఖాతాదారుడు",
    phonepeUpi: "ఫోన్‌పే / UPI",
    phonepeNumber: "ఫోన్‌పే నంబర్",
    upiId: "UPI ID",
    scanToPay: "చెల్లించడానికి స్కాన్ చేయండి",
    afterPaying:
      "చెల్లించిన తర్వాత, దయచేసి కింది ఫారం పూరించండి, తద్వారా మేము మీ పేరును దాతల జాబితాకు చేర్చగలము.",
    upiNote: "మీ UPI యాప్ తెరవడానికి బటన్‌ను నొక్కండి. మొత్తం నమోదు చేసి చెల్లింపు పూర్తి చేయండి.",
    payWithPhonePe: "ఫోన్‌పే",
    payWithGooglePay: "గూగుల్ పే",
    payWithPaytm: "పేటియం",

    authWelcome: "స్వాగతం",
    authSubtitle: "అడ్మిన్ ప్యానెల్ యాక్సెస్ చేయడానికి సైన్ ఇన్ చేయండి.",
    signIn: "సైన్ ఇన్",
    signUp: "సైన్ అప్",
    fullName: "పూర్తి పేరు",
    password: "పాస్‌వర్డ్",
    passwordHint: "పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు)",
    signingIn: "సైన్ ఇన్ అవుతోంది…",
    creatingAccount: "ఖాతా సృష్టిస్తోంది…",
    createAccount: "ఖాతా సృష్టించండి",
    authNote:
      "ఆటోమేటిక్‌గా అడ్మిన్ యాక్సెస్ పొందడానికి gedelavedhiboyz@gmail.com తో సైన్ అప్ చేయండి.",
    welcomeBack: "తిరిగి స్వాగతం!",
    accountCreated: "ఖాతా సృష్టించబడింది. మీరు సైన్ ఇన్ అయ్యారు.",

    suggestionsTitle: "మీ సూచనలు పంచుకోండి",
    suggestionsSubtitle: "మాకు మెరుగుపరచడంలో సహాయం చేయండి — మీ ఆలోచనలు మా సమాజానికి ముఖ్యం.",
    suggestionLabel: "సూచన",
    optional: "(ఐచ్ఛికం)",
    placeholderName: "మీ పేరు",
    placeholderSuggestion: "మీ ఆలోచనలు, సూచనలు లేదా అభిప్రాయాలు చెప్పండి…",
    placeholderEmail: "you@example.com",
    placeholderPhone: "+91 90000 00000",
    mobile: "మొబైల్",
    submitSuggestion: "సూచన సమర్పించండి",
    suggestionThanks: "మీ సూచనకు ధన్యవాదాలు!",
    suggestionFailed: "సమర్పించడంలో విఫలమైంది. మళ్లీ ప్రయత్నించండి.",

    days: "రోజులు",
    hrs: "గం",
    min: "ని",
    sec: "సె",
    happeningNow: "🎉 ఇప్పుడు జరుగుతోంది!",

    birthdayToday: "ఈరోజు పుట్టినరోజు",
  },
} as const;

export type TKey = keyof typeof dict["en"];

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
}

const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("gvb-lang") as Lang | null) : null;
    if (saved === "en" || saved === "te") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("gvb-lang", l);
  };

  const t = (k: TKey) =>
    (dict[lang][k] ?? dict.en[k] ?? k).replace("{year}", String(new Date().getFullYear()));

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
