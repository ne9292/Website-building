// פונקציה שמחזירה את ההגדרות המחדליות לכל סוג אלמנט
export function getElementDefaults(type: string, shapeType?: string): any {
  switch (type) {
    case 'hero':
      return {
        title: 'כותרת ראשית', subtitle: 'תת כותרת',
        bgColor: '#2d2d2d', textColor: '#e2e8f0', bgImage: '',
        overlayOpacity: 0.4, btnText: 'קרא עוד',
        btnColor: '#f97316', showBtn: true
      };
    case 'text':
      return {
        text: 'לחצי פעמיים לעריכה', fontSize: 16,
        color: '#e2e8f0', bold: false, italic: false,
        underline: false, align: 'right',
        lineHeight: 1.6, letterSpacing: 0, bgColor: '#2d2d2d'
      };
    case 'image':
      return {
        url: '', alt: '', overlayText: '',
        overlayColor: 'rgba(0,0,0,0.4)', objectFit: 'cover',
        objectPosition: 'center', borderRadius: 0
      };
    case 'button':
      return {
        label: 'לחץ כאן', style: 'filled',
        bgColor: '#f97316', textColor: '#fff',
        fontSize: 16, radius: 8,
        borderColor: '#f97316', borderWidth: 2,
        bold: true, linkTo: ''
      };
    case 'product':
      return {
        name: 'שם מוצר', price: 99, imageUrl: '',
        desc: 'תיאור קצר', currency: '₪',
        bgColor: '#2d2d2d', btnText: 'הוסף לסל',
        btnColor: '#f97316', nameColor: '#e2e8f0',
        priceColor: '#f97316', borderRadius: 10
      };
    case 'navbar':
      return { siteName: 'שם האתר', bgColor: '#1a1a1a', textColor: '#e2e8f0', links: [], sticky: false };
    case 'shape':
      return { fillColor: '#f97316', strokeColor: '#ea580c', strokeWidth: 0, borderRadius: 8 };
    case 'contact':
      return {
        title: 'צרו קשר', titleColor: '#e2e8f0',
        btnText: 'שלח הודעה', btnColor: '#f97316',
        bgColor: '#2d2d2d'
      };
    case 'about':
      return {
        businessName: 'שם העסק', description: 'תיאור העסק',
        phone: '050-0000000', email: 'info@example.com', address: 'כתובת',
        logoUrl: '', bgColor: '#2d2d2d', textColor: '#e2e8f0'
      };
    case 'testimonial':
      return {
        text: 'המלצה כאן', author: 'שם הלקוח', role: 'תפקיד',
        bgColor: '#2d2d2d', textColor: '#e2e8f0', accentColor: '#f97316'
      };
    case 'booking':
      return {
        title: 'הזמנת תור', subtitle: 'נשמח לראותך',
        btnText: 'שלח הזמנה', btnColor: '#f97316',
        titleColor: '#e2e8f0', bgColor: '#2d2d2d',
        fields: { name: true, phone: true, date: true, time: true, note: false }
      };
    case 'social':
      return {
        links: [{ icon: '📘', url: '' }, { icon: '📸', url: '' }, { icon: '🐦', url: '' }],
        iconColor: '#e2e8f0', size: 24, bgColor: '#2d2d2d'
      };
    case 'pricing':
      return {
        title: 'חבילה בסיסית', price: 99, period: 'חודש',
        features: ['פיצ\'ר ראשון', 'פיצ\'ר שני', 'פיצ\'ר שלישי'],
        btnText: 'התחל עכשיו', btnColor: '#f97316',
        bgColor: '#2d2d2d', highlighted: false
      };
    case 'cart':
      return { title: 'סל קניות', bgColor: '#2d2d2d', accentColor: '#f97316' };
    case 'countdown':
      return { title: 'ספירה לאחור', bgColor: '#2d2d2d', textColor: '#e2e8f0', accentColor: '#f97316' };
    case 'divider':
      return { color: '#f97316', thickness: 2, style: 'solid' };
    case 'map':
      return { address: 'תל אביב, ישראל' };
    default:
      return {};
  }
}
