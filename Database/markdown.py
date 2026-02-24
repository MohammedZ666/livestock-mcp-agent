import os
import json
from pdf2docx import Converter
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table
import unicodeconverter as uc
import re

def is_english(token):
    return re.fullmatch(r"[A-Za-z0-9]+", token) is not None

def bijoy_to_unicode(text):
    # tokens = text.split()

    # for i, token in enumerate(tokens):

    #     # core = re.sub(r'^[^\w]+|[^\w]+$', '', token)

    #     try:
    #         # converted = uc.convert_bijoy_to_unicode(core)
    #         token = re.sub(r'([•●◦▪‣⁃∙])(?=\S)', r'\1 ', token)
    #         tokens[i] = uc.convert_bijoy_to_unicode(token)
    #     except:
    #         print(f"Failed to convert {token}")
    #         pass

    # return " ".join(tokens)
    return uc.convert_bijoy_to_unicode(text)

def clean_text(text):
    return "".join(c for c in text if c == "\n" or ord(c) >= 32)


def process_text(text):
    # text = clean_text(text)
    text = bijoy_to_unicode(text)
    return text.strip()


def iter_block_items(parent):
    """
    Yield Paragraph or Table objects in document order
    """
    for child in parent.element.body.iterchildren():

        if child.tag.endswith("p"):
            yield Paragraph(child, parent)

        elif child.tag.endswith("tbl"):
            yield Table(child, parent)


def extract_images_from_paragraph(para, doc, images_dir, img_counter):

    images = []

    for run in para.runs:

        drawings = run._element.xpath(".//a:blip")

        for d in drawings:

            rId = d.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"
            )

            image_part = doc.part.related_parts[rId]

            img_name = f"image_{img_counter}.png"
            img_path = os.path.join(images_dir, img_name)

            with open(img_path, "wb") as f:
                f.write(image_part.blob)

            images.append((img_name, img_path))
            img_counter += 1

    return images, img_counter


def table_to_rows(table):

    rows = []

    for row in table.rows:
        cells = [process_text(c.text) for c in row.cells]
        rows.append(cells)

    return rows


def rows_to_markdown(rows):

    md = []

    header = "| " + " | ".join(rows[0]) + " |"
    sep = "| " + " | ".join(["---"] * len(rows[0])) + " |"

    md.append(header)
    md.append(sep)

    for r in rows[1:]:
        md.append("| " + " | ".join(r) + " |")

    md.append("")

    return md


def pdf_to_rag(pdf_path, output_dir):

    md_output = f"{output_dir}/{pdf_path.replace('.pdf', '.md')}"
    json_output = f"{output_dir}/{pdf_path.replace('.pdf', '.json')}"
    images_dir = f"{output_dir}/images"

    os.makedirs(images_dir, exist_ok=True)

    tmp_docx = pdf_path.replace(".pdf", "_temp.docx")

    print("Converting PDF → DOCX")

    cv = Converter(pdf_path)
    cv.convert(tmp_docx)
    cv.close()

    doc = Document(tmp_docx)

    markdown = []
    rag_chunks = []

    chunk_id = 0
    img_counter = 1

    for block in iter_block_items(doc):

        # -------- PARAGRAPH --------
        if isinstance(block, Paragraph):

            text = process_text(block.text)

            if text:

                markdown.append(text + "\n\n")

                rag_chunks.append({
                    "id": chunk_id,
                    "type": "paragraph",
                    "text": text
                })

                chunk_id += 1

            images, img_counter = extract_images_from_paragraph(
                block, doc, images_dir, img_counter
            )

            for img_name, img_path in images:

                img_path = img_path.replace(f"{output_dir}/", "")

                markdown.append(f"![figure]({img_path})")

                rag_chunks.append({
                    "id": chunk_id,
                    "type": "image",
                    "image_path": img_path,
                    "text": "figure related to livestock"
                })

                chunk_id += 1

        # -------- TABLE --------
        elif isinstance(block, Table):

            rows = table_to_rows(block)

            md_table = rows_to_markdown(rows)

            markdown.extend(md_table)

            rag_chunks.append({
                "id": chunk_id,
                "type": "table",
                "rows": rows,
                "text": "\n".join([" | ".join(r) for r in rows])
            })

            chunk_id += 1
        else:
            raise Exception(f"Found unhandled block type: {type(block)}")

    with open(md_output, "w", encoding="utf-8") as f:
        f.write("\n".join(markdown))

    with open(json_output, "w", encoding="utf-8") as f:
        json.dump(rag_chunks, f, ensure_ascii=False, indent=2)

    os.remove(tmp_docx)

    print("Done.")
    print("Markdown:", md_output)
    print("JSON:", json_output)

pdf_to_rag(
    "livestock_bible.pdf",
    "output"
)