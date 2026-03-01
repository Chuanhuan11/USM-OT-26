const fs = require('fs');
const filePath = 'c:/Users/GIGABYTE/Downloads/USMBNC OT 20252026/index.html';
let text = fs.readFileSync(filePath, 'utf8');

// Replacements based on surrounding context to ensure we get exactly the labels
text = text.replace(/<span class="info-label">[^<]*Date<\/span>/g, '<span class="info-label">📅 Date</span>');
text = text.replace(/<span class="info-label">[^<]*Time<\/span>/g, '<span class="info-label">⏱ Time</span>');
text = text.replace(/<span class="info-label">[^<]*Venue<\/span>/g, '<span class="info-label">📍 Venue</span>');
text = text.replace(/<span class="info-label">[^<]*Format<\/span>/g, '<span class="info-label">🎯 Format</span>');
text = text.replace(/<span class="info-label">[^<]*Time Control<\/span>/g, '<span class="info-label\">⏳ Time Control</span>');
text = text.replace(/<span class="info-label">[^<]*Categories<\/span>/g, '<span class="info-label">🏆 Categories</span>');
text = text.replace(/<span class="info-label">[^<]*Registration Closes<\/span>/g, '<span class="info-label">🗓 Registration Closes</span>');
text = text.replace(/<span class="info-label">[^<]*Team Size<\/span>/g, '<span class="info-label">👥 Team Size</span>');

text = text.replace(/<span class="section-label">[^<]*Plan Your Quest<\/span>/g, '<span class="section-label">⏱ Plan Your Quest</span>');

text = text.replace(/<span class="schedule-event">[^<]*Registration<\/span>/g, '<span class="schedule-event">� Registration</span>');
text = text.replace(/<span class="schedule-event\">[^<]*Opening Ceremony<\/span>/g, '<span class="schedule-event">� Opening Ceremony</span>');
text = text.replace(/<span class=\"schedule-event\">[^<]*Arbiter & Swiss Briefing \+ Q&A<\/span>/g, '<span class=\"schedule-event\">📋 Arbiter & Swiss Briefing + Q&A</span>');
text = text.replace(/<span class="schedule-event">[^<]*Lunch Break<\/span>/g, '<span class="schedule-event">🍽 Lunch Break</span>');
text = text.replace(/<span class="schedule-event">[^<]*Break Time<\/span>/g, '<span class="schedule-event">☕ Break Time</span>');
text = text.replace(/<span class="schedule-event">[^<]*Closing Ceremony & Prize Giving<\/span>/g, '<span class="schedule-event">🏆 Closing Ceremony & Prize Giving</span>');

fs.writeFileSync(filePath, text, 'utf8');
console.log('Regex emoji replacements complete.');
