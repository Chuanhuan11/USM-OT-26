import os
import sys

import PyPDF2


def read_pdf_to_file(file_path):
    out_path = f"{file_path}.txt"
    try:
        with open(file_path, 'rb') as file, open(out_path, 'w', encoding='utf-8') as out:
            reader = PyPDF2.PdfReader(file)
            for i, page in enumerate(reader.pages):
                out.write(f"--- Page {i+1} ---\n")
                text = page.extract_text()
                if text:
                    out.write(text + "\n")
                else:
                    out.write("[No text found]\n")
        print(f"Successfully extracted {file_path} to {out_path}")
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            read_pdf_to_file(arg)
