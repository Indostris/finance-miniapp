import requests
import json

UZBEK_NUMBERS = {
    "nol": 0, "bir": 1, "ikki": 2, "uch": 3, "to'rt": 4, "besh": 5,
    "olti": 6, "yetti": 7, "sakkiz": 8, "to'qqiz": 9, "o'n": 10,
    "yigirma": 20, "o'ttiz": 30, "qirq": 40, "ellik": 50,
    "oltmish": 60, "yetmish": 70, "sakson": 80, "to'qson": 90,
    "yuz": 100, "ming": 1000, "million": 1000000
}

UZBEK_SUFFIXES = ("ga", "da", "dan", "ni", "ning", "lar", "mi", "ku", "chi", "gina", "ta", "tadan", "lab")


def strip_uzbek_suffix(word: str) -> str:
    word = word.strip(".,!?")
    for suffix in UZBEK_SUFFIXES:
        if word.endswith(suffix) and len(word) > len(suffix):
            return word[:-len(suffix)]
    return word


def convert_uzbek_numbers(text: str) -> str:
    words = text.lower().split()
    result = []
    current = 0
    total = 0

    for word in words:
        word_clean = strip_uzbek_suffix(word)

        if word_clean.isdigit():
            val = int(word_clean)
            current += val

        elif word_clean in UZBEK_NUMBERS:
            val = UZBEK_NUMBERS[word_clean]
            if val in (1000, 1000000):
                if current == 0:
                    current = 1
                total += current * val
                current = 0
            elif val == 100:
                if current == 0:
                    current = 1
                current *= val
            else:
                current += val

        else:
            if current + total > 0:
                result.append(str(current + total))
                current = 0
                total = 0
            result.append(word)

    if current + total > 0:
        result.append(str(current + total))

    return " ".join(result)


def build_prompt(converted_text: str) -> str:
    return f'''You are a finance extractor. Extract ONLY spending transactions from the text. Text can be Uzbek, Russian, or mixed.

STRICT Rules:
- Extract ONLY transactions where the person SPENT money on something
- "qaytarib berish", "qarzdorman", "berish kerak" means paying back a debt — DO NOT extract these
- COPY the amount EXACTLY as the number appears in the text. If you see 150000, amount is 150000. Never change it
- Return ONLY a JSON array, no explanation, no markdown, no extra brackets
- Do NOT wrap the array in another array
- Do NOT invent or assume any transactions not explicitly stated
- category must be one of: food, transport, shopping, entertainment, health, education, utilities, grocery, home, clothing, other
- If category is unclear, use other

Category mappings:
- sigaret, cigarette, zvachka, kiyim, magazin → shopping
- taksi, taxi, uber, avtobus, metro → transport
- osh, non, ovqat, burger, cafe, restaurant, kafe → food
- bozor, supermarket, oziq-ovqat → grocery
- uy, kvartira, kommunal → home
- dori, dorixona, shifoxona → health
- maktab, kurs, kitob → education
- internet, gaz, suv, elektr → utilities

If no spending transactions found, return: []
Return ONLY this format: [{{"category": "food", "amount": 150000, "currency": "UZS"}}]

Text: "{converted_text}"'''


def extract_finance_data(text: str) -> list:
    converted_text = convert_uzbek_numbers(text)
    print(f"Converted: {converted_text}")

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": build_prompt(converted_text),
                "stream": False
            },
            timeout=120
        )
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return []

    raw = response.json().get("response", "").strip()
    raw = raw.strip('"')
    raw = raw.replace('["{"', '[{"').replace('"}"]', '"}]')
    print(f"Raw: {raw}")

    start = raw.find("[")
    end = raw.rfind("]") + 1

    if start == -1 or end == 0:
        return []

    try:
        result = json.loads(raw[start:end])
        if isinstance(result, list) and len(result) == 1 and isinstance(result[0], list):
            result = result[0]
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], str):
            result = [json.loads(item) for item in result]
    except json.JSONDecodeError:
        return []

    if not isinstance(result, list):
        return []

    return [
        {**t, "amount": int(t.get("amount", 0))}
        for t in result
        if isinstance(t, dict) and int(t.get("amount", 0)) > 0
    ]