import os


def clean_text_files(
    directory,
    phrase="সহায় হেলথ — সহজ বাংলায় নির্ভরযোগ্য স্বাস্থ্য তথ্য পৌঁছে দিতে কাজ করে।",
    overwrite=True,
):
    for filename in os.listdir(directory):
        if filename.endswith(".txt"):
            filepath = os.path.join(directory, filename)

            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()

            # Remove the phrase
            cleaned_content = content.replace(phrase, "")

            # Save changes
            if overwrite:
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(cleaned_content)
                print(f"Cleaned: {filename}")
            else:
                new_filepath = os.path.join(directory, f"cleaned_{filename}")
                with open(new_filepath, "w", encoding="utf-8") as file:
                    file.write(cleaned_content)
                print(f"Saved cleaned file as: cleaned_{filename}")


folder_path = "D:\\ADK_pregnancy_agent\\crawler\\sohay_articles"
clean_text_files(folder_path)
