import os
import math
import struct
import wave

# List of 25 monuments matching monumentVoiceProfiles.ts
MONUMENTS = [
    ('story-konark', [73.42, 110.0, 146.83, 220.0], 'stone-sanctum'),
    ('story-puri-jagannath', [146.83, 220.0, 293.66, 440.0], 'oceanic-sanctum'),
    ('story-dhauli', [110.0, 164.81, 220.0, 329.63], 'monastery-bells'),
    ('story-khandagiri-udayagiri', [130.81, 196.0, 261.63, 392.0], 'cave-reverb'),
    ('story-lingaraj', [146.83, 220.0, 293.66, 440.0], 'temple-sanctum'),
    ('story-cuttack-barabati', [98.0, 146.83, 196.0, 293.66], 'fortress-echo'),
    ('story-diamond-triangle', [110.0, 164.81, 220.0, 329.63], 'monastery-bells'),
    ('story-chilika', [130.81, 196.0, 261.63, 327.03], 'coastal-breeze'),
    ('story-similipal', [123.47, 185.0, 246.94, 370.0], 'forest-canopy'),
    ('story-hirakud-sambalpur', [98.0, 146.83, 196.0, 293.66], 'river-valley'),
    ('story-daringbadi', [164.81, 246.94, 329.63, 493.88], 'highland-mist'),
    ('story-gupteswar-koraput', [110.0, 164.81, 220.0, 329.63], 'cave-reverb'),
    ('story-raghurajpur', [146.83, 220.0, 293.66, 440.0], 'artisan-courtyard'),
    ('story-mukteswar-rajarani', [164.81, 246.94, 329.63, 493.88], 'sculpture-echo'),
    ('story-hirapur-yogini', [130.81, 196.0, 261.63, 392.0], 'hypaethral-sky'),
    ('story-jajpur-biraja', [146.83, 220.0, 293.66, 440.0], 'sacred-river'),
    ('story-jaugada-taratarini', [123.47, 185.0, 246.94, 370.0], 'hilltop-shrine'),
    ('story-kapilash-joranda', [110.0, 164.81, 220.0, 329.63], 'mountain-sanctum'),
    ('story-bhitarkanika-kanika', [130.81, 196.0, 261.63, 327.03], 'estuary-wind'),
    ('story-gandhamardan-nrusinghanath', [123.47, 185.0, 246.94, 370.0], 'medicinal-stream'),
    ('story-ranipur-jharial', [110.0, 164.81, 220.0, 329.63], 'granite-terrace'),
    ('story-mahendragiri', [164.81, 246.94, 329.63, 493.88], 'cloud-ridge'),
    ('story-sonepur-suvarnapura', [130.81, 196.0, 261.63, 392.0], 'river-confluence'),
    ('story-balasore-chandipur', [146.83, 220.0, 293.66, 440.0], 'tide-whisper'),
    ('story-sunabeda-koraput-sabara', [164.81, 246.94, 329.63, 493.88], 'highland-mist'),
]

LANGUAGES = ['or', 'hi', 'en']

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '..', 'public', 'offline-audio'
)
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 44100
DURATION_SEC = 4.4  # ~4.4 seconds yields ~388 KB per 16-bit mono file
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION_SEC)

# Formant frequencies for Indic vowels:
# Odia/Hindi formants for cultural voice simulation
LANG_FORMANTS = {
    'or': [(700, 1200), (350, 1900), (500, 1100), (800, 1350)],   # /ɔ/, /e/, /o/, /a/
    'hi': [(800, 1250), (450, 2100), (300, 2400), (550, 1050)],   # /a/, /e/, /i/, /u/
    'en': [(730, 1090), (530, 1840), (270, 2290), (660, 1720)],   # /ɑ/, /ɛ/, /i/, /æ/
}

print(f"Generating 75 high-definition offline audio soundscapes into {OUTPUT_DIR}...")

for story_id, freqs, preset in MONUMENTS:
    for lang in LANGUAGES:
        filename = f"{story_id}-{lang}-seg0.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        formants = LANG_FORMANTS[lang]
        f0 = freqs[0]

        # Generate audio samples
        samples = []
        for i in range(TOTAL_SAMPLES):
            t = i / SAMPLE_RATE

            # 1. Global envelope: soft fade in (0.2s), steady body, gentle fade out (0.4s)
            if t < 0.2:
                env = 0.5 * (1 - math.cos(math.pi * t / 0.2))
            elif t > DURATION_SEC - 0.4:
                rem = (DURATION_SEC - t) / 0.4
                env = 0.5 * (1 - math.cos(math.pi * max(0.0, rem)))
            else:
                env = 1.0

            # 2. Temple Bell / Shankha chime onset (first 1.5 seconds)
            chime = 0.0
            if t < 1.8:
                decay = math.exp(-3.2 * t)
                chime = 0.35 * decay * (
                    math.sin(2 * math.pi * 587.33 * t) +       # D5
                    0.5 * math.sin(2 * math.pi * 880.0 * t) +   # A5
                    0.3 * math.sin(2 * math.pi * 1174.66 * t)   # D6
                )

            # 3. Harmonic Drone chord based on monument's specific droneRootFreqs
            drone = 0.0
            for idx, root_f in enumerate(freqs):
                weight = 0.25 / (idx + 1)
                drone += weight * math.sin(2 * math.pi * root_f * t + idx * 0.4)

            # 4. Spoken cadence formant modulation (mimics Indic vocal resonance)
            # Syllable cadence rate at 3.6 Hz (natural spoken meter)
            syllable_phase = 2 * math.pi * 3.6 * t
            syllable_amp = 0.5 + 0.5 * math.sin(syllable_phase)
            
            # Select active vowel formant pair cyclically
            vowel_idx = int(t * 3.6) % len(formants)
            f1, f2 = formants[vowel_idx]

            # Vocal fold pulse with formants
            voice = (
                0.3 * math.sin(2 * math.pi * f0 * t) * (
                    0.6 * math.sin(2 * math.pi * f1 * t) +
                    0.4 * math.sin(2 * math.pi * f2 * t)
                ) * syllable_amp
            )

            # Mix audio stream
            mixed = env * (0.35 * chime + 0.35 * drone + 0.30 * voice)

            # Soft clip to prevent distortion
            clamped = max(-0.95, min(0.95, mixed))
            int_val = int(clamped * 32767)
            samples.append(struct.pack('<h', int_val))

        with wave.open(filepath, 'wb') as wf:
            wf.setnchannels(1)       # Mono
            wf.setsampwidth(2)       # 16-bit
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(b''.join(samples))

print("All 75 offline audio soundscapes successfully generated!")
