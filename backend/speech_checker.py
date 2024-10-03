from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
from phonemizer.backend.espeak.wrapper import EspeakWrapper
import subprocess
import numpy as np
import pyphen


# Set the path to the espeak-ng library and get espeak-ng recognized 
_ESPEAK_LIBRARY = '/opt/homebrew/bin/espeak-ng'
EspeakWrapper.set_library(_ESPEAK_LIBRARY)


# Global variables for model, processor, and dictionary
processor = None
model = None
dic = None


def instantiateModels():
    """
    Initialize the global models and processor.
    This function should be called once before using other functions in this module.
    """
    global processor, model, dic
    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-xlsr-53-espeak-cv-ft")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-xlsr-53-espeak-cv-ft")
    dic = pyphen.Pyphen(lang='en')
   
    

def audioToPhonemes(audio_file):
    """
    Convert an audio file to phonemes using Wav2Vec2 model.

    Args:
    audio_file (file): The input audio file.

    Returns:
    str: A string of phonemes flattened with no spacesrepresenting the audio content.
    """
    global processor,model

    # Tokenize audio file
    input_values = processor(audio_file, return_tensors="pt").input_values

    # Retrieve logits
    with torch.no_grad():
        logits = model(input_values).logits

    # Take argmax and decode
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)
    
    transcription = transcription[0].replace(' ','')    #ðəkwɪkbɹaʊnfɔksdʒampsoʊvɚðəleɪzidɔɡ

    
    # Apply common corrections
    corrections = {
        'ː': '', 'ɚ': 'ə', 'ðɪ': 'ðə', 'tu': 'tə', 'ðɛ': 'ðe', 'dɛ': 'de','da':'ðə','ei':'ɐ'
    }
    for old, new in corrections.items():
        transcription = transcription.replace(old, new)
    return transcription
    
    
def sentenceToPhonemes(sentence):
    """
    Convert a sentence to phonemes using espeak-ng.

    Args:
    sentence (str): The input sentence.

    Returns:
    list: A list of phoneme strings for each word of the sentence
    """
    try:
        result = subprocess.run(
            ['espeak-ng', '--ipa=1','-q', '-v', 'en-za', sentence],
            capture_output=True,
            text=True,
            check=True
        )
        phonemes = result.stdout.strip()
        
        
        # Cleaning up phoneme string
        phonemes = phonemes.replace("_","")
        phonemes = phonemes.replace('ˈ', '')
        phonemes = phonemes.replace('ˌ', '')
        phonemes = phonemes.replace('ː', '')
        phonemes = phonemes.replace("\\", '')
        
        # ['ðə','kwɪk','bɹaʊn','fɒks','dʒʌmps','əʊvə','ðə','leɪzi','dɒɡ']
        espeak_arr = phonemes.split(' ')
        
        # Correct symbol for "a" pronounciation
        for index,phoneme_word in enumerate(espeak_arr):
            if phoneme_word == "ɐ":
                espeak_arr[index] = "eɪ"
        
        return espeak_arr
    
    except subprocess.CalledProcessError as e:
        print("Error occurred:", e.stderr)
        return None, None
    
    
def needlemanWunsch(seq1, seq2, match_score=1, mismatch_penalty=-1, gap_penalty=-1):
    """
    Compute the Needleman-Wunsch alignment for two sequences.

    Args:
    seq1 (str): First sequence.
    seq2 (str): Second sequence.
    match_score (int): Score for matching characters.
    mismatch_penalty (int): Penalty for mismatching characters.
    gap_penalty (int): Penalty for gaps.

    Returns:
    float: The alignment score.
    """
    n, m = len(seq1), len(seq2)
    score = np.zeros((n + 1, m + 1))
    
    # Initialize first row and column
    for i in range(1, n + 1):
        score[i][0] = i * gap_penalty
    for j in range(1, m + 1):
        score[0][j] = j * gap_penalty
    
    # Fill the scoring matrix
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if seq1[i - 1] == seq2[j - 1]:
                diag_score = score[i - 1][j - 1] + match_score
            else:
                diag_score = score[i - 1][j - 1] + mismatch_penalty
            score[i][j] = max(score[i - 1][j] + gap_penalty, score[i][j - 1] + gap_penalty, diag_score)
    
    # The score for optimal alignment
    alignment_score = score[n][m]
    return alignment_score


def findMispronouncedWords(espeak_phonemes, wav2vec_string, sentence_arr):
    """
    Identify mispronounced words by comparing espeak phonemes with wav2vec phonemes.

    Args:
    espeak_phonemes (list): List of words as phonemes from espeak.
    wav2vec_string (str): Flattened string of phonemes from wav2vec.
    sentence_arr (list): Original sentence split into words.

    Returns:
    list: List of mispronounced words.
    """
    key_phoneme_acceptance = {
        'the': 'ð',
        'to': 't',
        'for': 'f'
    }

    def calculateThreshold(word, length):
        common_words_whitelist = ["the", "to", "for","upon","this","that","it","its","new"]
        if word.lower() in common_words_whitelist:
            # Higher threshold means less sensitivity to variations
            return max(0.8, min(2, length / 4.0))
        else:
            return max(0.5, min(1.0, length / 4.0))

    mispronounced_words = []
    start_index = 0

    # Iterate over each word in the espeak_phonemes array
    for index, word in enumerate(espeak_phonemes):
        # Check if word is in the key phoneme list and contains the phoneme
        if word.lower() in key_phoneme_acceptance:
            key_phoneme = key_phoneme_acceptance[word.lower()]
            wav2vec_segment = wav2vec_string[start_index:start_index + len(word) * 2]
            if key_phoneme in wav2vec_segment:
                # If key phoneme is present, assume correct pronunciation
                start_index += len(wav2vec_segment)
                continue

        # Find best matching segment in wav2vec string
        min_distance = float('inf')
        best_match_index = start_index
        for length in range(1, len(wav2vec_string) - start_index + 1):
            wav2vec_segment = wav2vec_string[start_index:start_index + length]
            nw_score = needlemanWunsch(word, wav2vec_segment, match_score=2, mismatch_penalty=-1, gap_penalty=-2)

            # Convert score to distance (negative because higher scores are better in NW)
            distance = -nw_score

            # Check if this is the best match
            if distance < min_distance:
                min_distance = distance
                best_match_index = start_index + length

            # Stop if we find an exact match
            if distance == 0:
                break

        # Mark as mispronounced if distance exceeds threshold
        threshold = calculateThreshold(sentence_arr[index], len(word))
        if min_distance > threshold:
            mispronounced_words.append(sentence_arr[index])

        # Move the start index to the next segment in wav2vec_string
        start_index = best_match_index

    return mispronounced_words


def generateAudioFiles(mispronounced_words_arr):
    """
    Generate correct pronounciation audio files for mispronounced words using espeak-ng.

    Args:
    mispronounced_words_arr (list): List of mispronounced words.

    Returns:
    list: List of audio data for each mispronounced word.
    """
    audio_files = []
    
    for word in mispronounced_words_arr:
        try:
            command = [
                "espeak-ng",
                "-v", "en-za",    # Voice selection (ZA English)
                "-s", "130",      # Speed (130 words per minute)
                "-p", "50",       # Pitch (neutral)
                "-a", "150",      # Volume (slightly increased)
                word,
                "--stdout"        # Output the audio to stdout instead of a file
            ]

            # Run the command and capture the audio output in memory
            result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            if result.returncode == 0:
                audio_data = result.stdout  # Audio data (WAV format)
                audio_files.append(audio_data)
            else:
                print(f"Error generating audio for word '{word}': {result.stderr.decode()}")

        except subprocess.CalledProcessError as e:
            print(f"Subprocess error occurred: {e.stderr}")
            
    return audio_files


def generateSyllables(words):
    """
    Generate syllable spellings for given words.

    Args:
    words (list): List of words.

    Returns:
    list: List of syllable spellings for each word.
    """
    syllables_list = []
    for word in words:
        syllable_string = dic.inserted(word)
        syllables_list.append(syllable_string)
        
    return syllables_list
    
    
def analyzeSpeech(audio_file, sentence):
    """
    Analyze speech by comparing an audio file to a given sentence.

    Args:
    audio_file (file): The input audio file of user pronouncing a sentence.
    sentence (str): The sentence read by the user.

    Returns:
    tuple: A tuple containing lists of mispronounced words, their audio files, and syllable spellings.
    """
    wav2vec_phonemes = audioToPhonemes(audio_file)
    
    espeak_arr = sentenceToPhonemes(sentence)
    sentence_arr = sentence.split(' ')   # ['The','quick','brown','fox','jumps','over','the','lazy','dog']
    
    print(f"This is the wav2vec phonemes: {wav2vec_phonemes}")
    print(f"This is the espeak_arr: {espeak_arr}")
    #print(f"This is the sentence_arr: {sentence_arr}")
    mispronounced_words_data = findMispronouncedWords(espeak_arr,wav2vec_phonemes,sentence_arr)
    
    # Generate correct pronounciation audio files for mispronounced words
    audio_files = generateAudioFiles(mispronounced_words_data)
    syllables_list = generateSyllables(mispronounced_words_data)
    
    return (mispronounced_words_data,audio_files,syllables_list)
    
    