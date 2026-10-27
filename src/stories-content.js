// Nine shared, text-free backgrounds; only these strings change with language.
export const storyLanguages = ['ru', 'en', 'fr', 'ar', 'hi'];
export const storyIds = ['intro', ...Array.from({length: 7}, (_, i) => 'day-' + (i + 1)), 'completed'];
export const storyImages = Object.fromEntries(storyLanguages.map(language => [language,
  Object.fromEntries(storyIds.map(id => [id, `public/assets/stories/${id}.png`])),
]));

// <y> marks yellow words; newlines are deliberate reference-matching line breaks.
// The player builds text nodes and spans, never inserts these strings as HTML.
const copy = {
 ru: {
  headline: 'В 321PLAYSY\n<y>новый ивент!</y>',
  subtitle: 'Октябрь — месяц\nосведомлённости\nо синдроме Дауна.',
  invitation: 'Присоединяйтесь\nк «Ритм с Дино» —\n<y>вместе мы звучим ярче!</y>',
  event: 'Событие', day: 'День {day}',
  days: [
   'Играй и получи\nособую <y>аватарку</y>\nи <y>приз!</y>',
   'Продолжай\nиграть и получи\n<y>награду!</y>',
   'Дино ждёт тебя!\nЗабери <y>аватарку</y>\nи <y>приз.</y>',
   'Ты уже\nна <y>полпути</y>\nк награде!',
   'Ещё немного —\nаватарка и приз\n<y>всё ближе!</y>',
   'До награды\nосталось совсем\n<y>немного!</y>',
   'Последний день!\nУспей получить\n<y>аватарку и приз!</y>',
  ],
  completed: 'Событие\nзавершено!', thanks: 'Спасибо\nза игру!', reward: 'Забрать\nнаграды',
  next: 'Далее', previous: 'Предыдущая история', play: 'Играть', close: 'Закрыть', pause: 'Приостановить истории', resume: 'Продолжить истории', loading: 'Загружаем историю…', imageError: 'Не удалось загрузить картинку.', retry: 'Повторить', progress: 'История {current} из {total}',
 },
 en: {
  headline: '<y>A new event</y> is\nlive in 321Playsy!',
  subtitle: 'October is Down\nSyndrome\nAwareness Month.',
  invitation: '“Rhythm with Dino” —\n<y>together,\nwe shine brighter!</y>',
  event: 'Event', day: 'Day {day}',
  days: [
   'Play to get\na special <y>avatar</y>\n<y>and prize!</y>',
   'Keep playing —\nyour <y>reward</y>\n<y>awaits!</y>',
   'Dino is waiting!\nGet your <y>avatar</y>\n<y>and prize.</y>',
   'You’re\n<y>halfway</y> to\nyour reward!',
   'Almost there —\nyour <y>avatar and</y>\n<y>prize</y> are closer!',
   'Your reward is\n<y>almost</y> yours!',
   'Last day! Get\nyour <y>avatar and</y>\n<y>prize!</y>',
  ],
  completed: 'Event\ncomplete', thanks: 'Thanks for\nplaying!', reward: 'Claim\nthe reward',
  next: 'Next', previous: 'Previous story', play: 'Play', close: 'Close', pause: 'Pause stories', resume: 'Resume stories', loading: 'Loading story…', imageError: 'Could not load the image.', retry: 'Retry', progress: 'Story {current} of {total}',
 },
 fr: {
  headline: '<y>Un nouvel\névénement dans</y>\n321Playsy !',
  subtitle: 'Octobre est le mois\nde sensibilisation à\nla trisomie 21.',
  invitation: 'Rejoignez « Rythme avec\nDino » — <y>ensemble, nous\nbrillons davantage !</y>',
  event: 'Événement', day: 'Jour {day}',
  days: [
   'Joue pour gagner\nun avatar spécial\net un prix !',
   'Continue à jouer —\nta récompense\nt’attend !',
   'Dino t’attend !\nGagne ton avatar\net ton prix.',
   'Tu es déjà à mi-\nchemin de ta\nrécompense !',
   'Encore un peu —\nton avatar et ton\nprix approchent !',
   'Ta récompense\nest presque à\ntoi !',
   'Dernier jour !\nGagne ton avatar\net ton prix !',
  ],
  completed: 'Événement\nterminé', thanks: 'Merci\nd’avoir joué !', reward: 'Recevoir\nma récompense',
  next: 'Suivant', previous: 'Histoire précédente', play: 'Jouer', close: 'Fermer', pause: 'Mettre les histoires en pause', resume: 'Reprendre les histoires', loading: 'Chargement de l’histoire…', imageError: 'Impossible de charger l’image.', retry: 'Réessayer', progress: 'Histoire {current} sur {total}',
 },
 ar: {
  headline: '<y>فعالية جديدة</y>\nفي 321Playsy!',
  subtitle: 'أكتوبر هو شهر التوعية\nبمتلازمة داون.',
  invitation: 'انضموا إلى «الإيقاع مع دينو»\n<y>معًا نلمع أكثر!</y>',
  event: 'فعالية', day: 'اليوم {day}',
  days: [
   'العب لتحصل على\n<y>صورة رمزية مميزة</y>\n<y>وجائزة!</y>',
   'واصل اللعب —\nمكافأتك <y>بانتظارك!</y>',
   'دينو بانتظارك!\nاحصل على <y>صورتك</y>\n<y>الرمزية وجائزتك.</y>',
   'لقد قطعت\n<y>نصف الطريق</y> إلى\nمكافأتك!',
   'اقتربت النهاية —\n<y>صورتك الرمزية</y>\n<y>وجائزتك</y> أقرب!',
   'مكافأتك أصبحت\n<y>قريبة جدًا!</y>',
   'اليوم الأخير!\nاحصل على <y>صورتك</y>\n<y>الرمزية وجائزتك!</y>',
  ],
  completed: 'انتهت الفعالية', thanks: 'شكرًا للعب!\nشاهد جوائزك', reward: 'احصل على\nمكافآتك',
  next: 'التالي', previous: 'القصة السابقة', play: 'العب', close: 'إغلاق', pause: 'إيقاف القصص مؤقتًا', resume: 'متابعة القصص', loading: 'جارٍ تحميل القصة…', imageError: 'تعذر تحميل الصورة.', retry: 'إعادة المحاولة', progress: 'القصة {current} من {total}',
 },
 hi: {
  headline: '321Playsy\n<y>में नया इवेंट!</y>',
  subtitle: 'अक्टूबर डाउन सिंड्रोम\nजागरूकता माह है',
  invitation: '“Rhythm with Dino”\nसे जुड़ें — <y>साथ मिलकर हम और\nचमकते हैं!</y>',
  event: 'इवेंट', day: 'दिन {day}',
  days: [
   'खेलो और खास\nअवतार व इनाम\nपाओ!',
   'खेलते रहो —\nइनाम इंतज़ार कर\nरहा है!',
   'डीनो इंतज़ार कर रहा\nहै! अवतार और\nइनाम पाओ',
   'तुम इनाम के आधे\nरास्ते तक पहुँच\nगए!',
   'बस थोड़ा और —\nअवतार और इनाम\nकरीब हैं!',
   'तुम्हारा इनाम\nअब बहुत\nकरीब है!',
   'आखिरी दिन! अवतार\nऔर इनाम पाना मत\nभूलो!',
  ],
  completed: 'इवेंट पूरा हुआ', thanks: 'खेलने के लिए\nधन्यवाद! अपने\nइनाम देखो', reward: 'इनाम पाएं',
  next: 'आगे', previous: 'पिछली स्टोरी', play: 'खेल', close: 'बंद करें', pause: 'स्टोरी रोकें', resume: 'स्टोरी जारी रखें', loading: 'स्टोरी लोड हो रही है…', imageError: 'चित्र लोड नहीं हो सका।', retry: 'फिर से कोशिश करें', progress: 'स्टोरी {current} / {total}',
 },
};
const plain = text => text.replace(/<\/?y>/g, '').replace(/\n/g, ' ');
export function storyContent(id, language) {
 const lang = storyLanguages.includes(language) ? language : 'ru';
 if (!storyIds.includes(id)) throw Error('story-id');
 const ui = copy[lang], day = Number(id.slice(4));
 const heading = id === 'intro' ? ui.headline : id === 'completed' ? ui.completed : ui.day.replace('{day}', day);
 const body = id === 'intro' ? ui.subtitle : id === 'completed' ? ui.thanks : ui.days[day - 1];
 return {
  image: storyImages[lang][id], type: id === 'intro' ? 'intro' : id === 'completed' ? 'completed' : 'day',
  heading, body, invitation: ui.invitation,
  hotspots: id === 'intro' ? {close: [.82, .029, .116, .052], action: [.215, .5, .535, .072]}
   : {close: [id === 'completed' ? .85 : .797, .029, .114, .052], action: [.075, .853, .85, .101]},
  alt: plain(heading) + '. ' + plain(body), ui,
 };
}
