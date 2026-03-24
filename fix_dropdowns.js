const fs = require('fs');

const files = [
  "f:\\College-erp-final\\src\\app\\layout\\header\\header.component.html",
  "f:\\College-erp-final\\src\\app\\features\\notices\\notices.component.html",
  "f:\\College-erp-final\\src\\app\\features\\hr\\faculty-management.component.html",
  "f:\\College-erp-final\\src\\app\\features\\examinations\\examinations.component.html",
  "f:\\College-erp-final\\src\\app\\features\\auth\\contact-admin\\contact-admin.component.html",
  "f:\\College-erp-final\\src\\app\\features\\admissions\\admissions.component.html",
  "f:\\College-erp-final\\src\\app\\features\\admin\\department-config\\department-config.component.html",
  "f:\\College-erp-final\\src\\app\\features\\academics\\timetable\\timetable.component.html",
  "f:\\College-erp-final\\src\\app\\features\\academics\\students\\students.component.html",
  "f:\\College-erp-final\\src\\app\\features\\academics\\curriculum\\curriculum.component.html",
  "f:\\College-erp-final\\src\\app\\features\\academics\\attendance\\attendance-recording.component.html",
  "f:\\College-erp-final\\src\\app\\features\\academics\\course-assignment\\course-assignment.component.html"
];

for (const filepath of files) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    let result = '';
    const blocks = content.split('<p-dropdown ');
    if (blocks.length > 1) {
      result = blocks[0];
      for (let i = 1; i < blocks.length; i++) {
        let block = blocks[i];
        const tagAttrs = block.split('>')[0];
        
        if (!tagAttrs.includes('appendTo=')) {
          block = 'appendTo="body" ' + block;
        }
        if (!tagAttrs.includes('w-full')) {
          block = 'styleClass="w-full" ' + block;
        }
        result += '<p-dropdown ' + block;
      }
      
      if (result !== content) {
        fs.writeFileSync(filepath, result, 'utf8');
        console.log(`Updated ${filepath}`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${filepath}:`, err);
  }
}
