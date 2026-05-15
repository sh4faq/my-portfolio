"""
Bump the body font size in the resume from 10pt (sz=20 half-points) to 11pt
(sz=22). Targets every <w:sz>/<w:szCs> element currently set to "20", in
both run-level <w:rPr> and paragraph-level <w:pPr><w:rPr>. Section headers
typically carry a different size and are left untouched.
"""
from docx import Document
from docx.oxml.ns import qn

PATH = r"C:\Users\hamze\Desktop\Hamzeh_Emreish_Resume_Portfolio_NEW.docx"

OLD_HALF = "20"   # 10pt
NEW_HALF = "22"   # 11pt


def bump_rPr(rPr):
    """Bump w:sz and w:szCs inside an rPr element. Returns count of bumps."""
    if rPr is None:
        return 0
    bumped = 0
    for tag in ("w:sz", "w:szCs"):
        elem = rPr.find(qn(tag))
        if elem is None:
            continue
        val = elem.get(qn("w:val"))
        if val == OLD_HALF:
            elem.set(qn("w:val"), NEW_HALF)
            bumped += 1
    return bumped


def main():
    doc = Document(PATH)
    total = 0

    # Run-level rPr
    for p in doc.paragraphs:
        for run in p.runs:
            rPr = run._element.find(qn("w:rPr"))
            total += bump_rPr(rPr)

        # Paragraph-mark rPr (inside pPr) — controls inherited sizing for
        # any future text appended to the paragraph, and what Word displays
        # in the ruler for that paragraph's mark.
        pPr = p._element.find(qn("w:pPr"))
        if pPr is not None:
            total += bump_rPr(pPr.find(qn("w:rPr")))

    doc.save(PATH)
    print(f"Bumped {total} size properties from sz={OLD_HALF} (10pt) to sz={NEW_HALF} (11pt).")
    print(f"Saved: {PATH}")


if __name__ == "__main__":
    main()
