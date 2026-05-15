"""
Reorder resume sections so Technical Skills lives at the bottom.

Target order:
  HEADER  →  EDUCATION  →  EXPERIENCE  →  PROJECTS AND ENGAGEMENTS  →
  CERTIFICATIONS  →  TECHNICAL SKILLS
"""
from copy import deepcopy
from docx import Document
from docx.oxml.ns import qn

PATH = r"C:\Users\hamze\Desktop\Hamzeh_Emreish_Resume_Portfolio_NEW.docx"


def text_of(p):
    return "".join((t.text or "") for t in p.iter(qn("w:t"))).strip()


def main():
    doc = Document(PATH)
    body = doc.element.body

    paras = list(body.findall(qn("w:p")))

    skills_idx = None
    exp_idx = None
    last_cert_idx = None

    for i, p in enumerate(paras):
        t = text_of(p)
        if t == "TECHNICAL SKILLS":
            skills_idx = i
        elif t == "EXPERIENCE":
            exp_idx = i
        elif t.startswith("CodePath: Intermediate"):
            last_cert_idx = i

    if skills_idx is None or exp_idx is None or last_cert_idx is None:
        print("ERROR: could not find one of the section anchors.")
        return

    # Skills section runs from its heading through the last non-blank paragraph
    # before EXPERIENCE (i.e. the bullets). The trailing blank between sections
    # is left in place so Education→Experience spacing remains intact.
    skills_end = skills_idx
    for i in range(skills_idx + 1, exp_idx):
        if text_of(paras[i]):
            skills_end = i
        else:
            break

    skills_range = paras[skills_idx:skills_end + 1]
    print(f"Moving {len(skills_range)} paragraphs to the end:")
    for p in skills_range:
        print(f"  - {text_of(p)[:65]!r}")

    # Detach skills paragraphs from their current location.
    for p in skills_range:
        body.remove(p)

    # Locate the CodePath cert (anchor for insertion). Re-find since indices
    # shifted after removal.
    codepath_anchor = None
    for p in body.findall(qn("w:p")):
        if text_of(p).startswith("CodePath: Intermediate"):
            codepath_anchor = p
            break
    if codepath_anchor is None:
        print("ERROR: CodePath anchor not found after removal.")
        return

    # Find a blank paragraph to clone as a separator between Certs and Skills.
    blank_template = None
    for p in body.findall(qn("w:p")):
        if not text_of(p):
            blank_template = p
            break

    anchor = codepath_anchor
    if blank_template is not None:
        blank_copy = deepcopy(blank_template)
        anchor.addnext(blank_copy)
        anchor = blank_copy

    # Re-insert the skills paragraphs in order after the (blank + CodePath) anchor.
    for sp in skills_range:
        anchor.addnext(sp)
        anchor = sp

    doc.save(PATH)
    print(f"\nSaved: {PATH}")


if __name__ == "__main__":
    main()
