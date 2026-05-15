"""
Update the company-type descriptors in the Bug Bounty bullets to match the
new chip labels on the live site:
  Grafana       -> 'monitoring & observability platform'
  Bumba (x2)    -> 'crypto platform'
  DigitalOcean  -> 'cloud infrastructure provider'   (slight tightening)
  Under Armour  -> 'fitness tracking platform'
  Verisign      -> 'domain registry'

Per-run text replacement — safe because every descriptor we're replacing
lives entirely inside a single (non-bold) run on either side of the
severity-tag bold run.
"""
from docx import Document
from docx.oxml.ns import qn

PATH = r"C:\Users\hamze\Desktop\Hamzeh_Emreish_Resume_Portfolio_NEW.docx"

REPLACEMENTS = [
    # Grafana
    ("an enterprise observability platform's",
     "a monitoring & observability platform's"),
    # Bumba (email injection) — title chunk
    ("on an enterprise LMS platform's Frappe-based contact form",
     "on a crypto platform's Frappe-based contact form"),
    # Bumba (Cognito enumeration)
    ("on an enterprise LMS platform via Cognito",
     "on a crypto platform via Cognito"),
    # DigitalOcean
    ("a major cloud provider's GenAI Knowledge Base",
     "a cloud infrastructure provider's GenAI Knowledge Base"),
    # Under Armour MapMyFitness
    ("a major consumer fitness platform's API",
     "a fitness tracking platform's API"),
    # Verisign (Namestudio)
    ("a major DNS / internet infrastructure provider's domain-suggestion product",
     "a domain registry's public JavaScript config"),
]


def main():
    doc = Document(PATH)
    total = 0
    matched_per_pair = {old: 0 for old, _ in REPLACEMENTS}

    for p in doc.paragraphs:
        for run in p.runs:
            for old, new in REPLACEMENTS:
                if old in run.text:
                    run.text = run.text.replace(old, new)
                    matched_per_pair[old] += 1
                    total += 1

    print(f"Per-pair replacements:")
    for old, new in REPLACEMENTS:
        count = matched_per_pair[old]
        flag = "OK" if count > 0 else "MISS"
        print(f"  [{flag}] {count}x  {old[:55]!r}...")

    doc.save(PATH)
    print(f"\nTotal replacements: {total}")
    print(f"Saved: {PATH}")


if __name__ == "__main__":
    main()
