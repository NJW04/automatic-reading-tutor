import unittest
from unittest.mock import patch, MagicMock
import torch
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from speech_checker import (
    instantiateModels,
    audioToPhonemes,
    sentenceToPhonemes,
    needlemanWunsch,
    findMispronouncedWords,
    generateAudioFiles,
    generateSyllables,
    analyzeSpeech
)

class TestSpeechChecker(unittest.TestCase):
    @patch('subprocess.run')
    def test_sentenceToPhonemes(self, mock_run):
        # Mock the subprocess run to simulate espeak-ng output
        mock_result = MagicMock()
        mock_result.stdout = "ðə kwɪk bɹaʊn fɒks dʒʌmps əʊvə ðə leɪzi dɒɡ"
        mock_run.return_value = mock_result

        sentence = "The quick brown fox jumps over the lazy dog"
        expected_phonemes = ['ðə', 'kwɪk', 'bɹaʊn', 'fɒks', 'dʒʌmps', 'əʊvə', 'ðə', 'leɪzi', 'dɒɡ']
        
        result_phonemes = sentenceToPhonemes(sentence)
        self.assertEqual(result_phonemes, expected_phonemes)

    @patch('transformers.Wav2Vec2Processor.from_pretrained')
    @patch('transformers.Wav2Vec2ForCTC.from_pretrained')
    def test_audioToPhonemes(self, mock_model, mock_processor):
        # Mock the processor and model
        processor_mock = MagicMock()
        model_mock = MagicMock()

        # Set up mock values
        mock_processor.return_value = processor_mock
        mock_model.return_value = model_mock

        # Mock the output of processor and model
        processor_mock.return_tensors = MagicMock(return_value={'input_values': torch.tensor([[1.0]])})
        model_mock.return_value.logits = torch.tensor([[[0.5]]])

        # Mock batch_decode to return the expected transcription
        processor_mock.batch_decode.return_value = ['ðəkwɪkbɹaʊnfɔksdʒampsoʊvɚðəleɪzidɔɡ']

        instantiateModels()  # Initialize models and processor
        audio_file_mock = torch.tensor([1.0])  # Mock audio file

        transcription = audioToPhonemes(audio_file_mock)
        expected_transcription = 'ðəkwɪkbɹaʊnfɔksdʒampsoʊvəðəleɪzidɔɡ'

        self.assertEqual(transcription, expected_transcription) 

    def test_needlemanWunsch(self):
        seq1 = 'cat'
        seq2 = 'cut'
        expected_score = 1
        result = needlemanWunsch(seq1, seq2, match_score=1, mismatch_penalty=-1, gap_penalty=-1)
        self.assertEqual(result, expected_score)

    def test_findMispronouncedWords(self):
        espeak_words = ['ðə', 'kwɪk', 'bɹaʊn', 'fɒks']
        wav2vec_string = 'ðəkwɪkbɹaʊnfɒks'
        sentence_arr = ['the', 'quick', 'brown', 'fox']

        mispronounced_words = findMispronouncedWords(espeak_words, wav2vec_string, sentence_arr)
        self.assertEqual(mispronounced_words, [])  # Assuming no mispronunciations

    @patch('subprocess.run')
    def test_generateAudioFiles(self, mock_run):
        # Mock successful audio file generation
        mock_result = MagicMock()
        mock_result.stdout = b'audio data'
        mock_result.returncode = 0
        mock_run.return_value = mock_result

        words = ["quick", "brown", "fox"]
        audio_files = generateAudioFiles(words)

        self.assertEqual(len(audio_files), 3)
        self.assertEqual(audio_files[0], b'audio data')

    def test_generateSyllables(self):
        # Assuming the global dic is set up properly in instantiateModels
        instantiateModels()  # Initialize the dictionary
        syllables = generateSyllables(["quick", "brown", "fox"])
        expected_syllables = ['quick', 'brown', 'fox']  # Assuming no hyphens in syllables
        self.assertEqual(syllables, expected_syllables)

    @patch('speech_checker.audioToPhonemes')
    @patch('speech_checker.sentenceToPhonemes')
    @patch('speech_checker.findMispronouncedWords')
    @patch('speech_checker.generateAudioFiles')
    @patch('speech_checker.generateSyllables')
    def test_analyzeSpeech(self, mock_generateSyllables, mock_generateAudioFiles, 
                           mock_findMispronouncedWords, mock_sentenceToPhonemes, 
                           mock_audioToPhonemes):
        # Mock function outputs
        mock_audioToPhonemes.return_value = 'ðəkwɪkbɹaʊnfɔks'
        mock_sentenceToPhonemes.return_value = ['ðə', 'kwɪk', 'bɹaʊn', 'fɒks']
        mock_findMispronouncedWords.return_value = ['quick']
        mock_generateAudioFiles.return_value = [b'audio data']
        mock_generateSyllables.return_value = ['quick']

        audio_file = MagicMock()  # Mock audio file
        sentence = "The quick brown fox"
        result = analyzeSpeech(audio_file, sentence)

        # Assertions
        self.assertEqual(result[0], ['quick'])  # Mispronounced words
        self.assertEqual(result[1], [b'audio data'])  # Audio data
        self.assertEqual(result[2], ['quick'])  # Syllables


if __name__ == '__main__':
    unittest.main()
