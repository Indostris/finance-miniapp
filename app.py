import os
import torch
import librosa
import warnings
import subprocess

warnings.filterwarnings("ignore")

from flask import Flask, request, jsonify
from flask_cors import CORS

from transformers import WhisperProcessor, WhisperForConditionalGeneration
from dotenv import load_dotenv
from llama_text_separate import extract_finance_data

load_dotenv()

HF_TOKEN = os.getenv('HF_TOKEN')


app = Flask(__name__)
CORS(app, origins="*")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device: {device}")

print("Whisper model yuklanmoqda...")
processor = WhisperProcessor.from_pretrained("islomov/rubaistt_v2_medium", token=HF_TOKEN)
model = WhisperForConditionalGeneration.from_pretrained("islomov/rubaistt_v2_medium", token=HF_TOKEN)
model = model.to(device)
model = torch.compile(model)
print(f"Model device: {next(model.parameters()).device}")
print("Whisper model yuklandi!")


def transcribe_audio(audio_path):
    # ✅ Convert webm/any format to wav for librosa
    wav_path = audio_path.rsplit(".", 1)[0] + ".wav"
    subprocess.run(
        ["ffmpeg", "-i", audio_path, "-ar", "16000", "-ac", "1", wav_path, "-y"],
        capture_output=True
    )

    print(f"Audio yuklanmoqda: {wav_path}")
    waveform, sample_rate = librosa.load(wav_path, sr=16000, mono=True)
    print("Transcribe qilinmoqda...")

    inputs = processor(
        waveform,
        sampling_rate=16000,
        return_tensors="pt",
        language="uz",
    )

    input_features = inputs.input_features.to(device)
    attention_mask = torch.ones(input_features.shape[:2], dtype=torch.long).to(device)

    with torch.no_grad():
        predicted_ids = model.generate(
            input_features,
            attention_mask=attention_mask,
            suppress_tokens=[],
        )

    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    print(f"Transcribe tayyor: {transcription}")

    # ✅ Cleanup temp files
    os.remove(audio_path)
    os.remove(wav_path)

    return transcription



@app.route("/transcribe_audio", methods=["POST"])
def transcribe_audio_api():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    audio_file = request.files["file"]
    temp_path = f"/tmp/{audio_file.filename}"
    audio_file.save(temp_path)

    result = transcribe_audio(temp_path)
    return jsonify({"result": result})


@app.route("/text_separate", methods=["POST"])
def text_separate_api():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]
    result = extract_finance_data(text)

    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, ssl_context='adhoc')