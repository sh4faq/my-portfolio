"""Fix the doubled 'JavaScript config' wording in the Verisign bullet."""
from docx import Document
from docx.oxml.ns import qn

PATH = r"C:\Users\hamze\Desktop\Hamzeh_Emreish_Resume_Portfolio_NEW.docx"

OLD = "on a domain registry's public JavaScript config"
NEW = "on a domain registry's domain-suggestion product"

doc = Document(PATH)
fixed = 0
for p in doc.paragraphs:
    for run in p.runs:
        if OLD in run.text:
            run.text = run.text.replace(OLD, NEW)
            fixed += 1

doc.save(PATH)
print(f"Fixed {fixed} occurrence(s) of the Verisign redundancy.")
