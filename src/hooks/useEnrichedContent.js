import { useState, useEffect, useCallback } from 'react';

export function useEnrichedContent() {
  const [pinyin, setPinyin] = useState({});
  const [vocabulary, setVocabulary] = useState({});
  const [strokeOrder, setStrokeOrder] = useState({});
  const [exercises, setExercises] = useState({});
  const [ipa, setIpa] = useState({});
  const [examples, setExamples] = useState({});
  const [engExercises, setEngExercises] = useState({});
  const [translations, setTranslations] = useState({});

  // Load small files immediately
  useEffect(() => {
    import('../../data/chinese-pinyin.json').then(m => setPinyin(m.default));
    import('../../data/english-ipa.json').then(m => setIpa(m.default));
  }, []);

  // Lazy load larger files
  const loadVocabulary = useCallback(async () => {
    if (Object.keys(vocabulary).length === 0) {
      const mod = await import('../../data/chinese-vocabulary.json');
      setVocabulary(mod.default);
    }
  }, [vocabulary]);

  const loadStrokeOrder = useCallback(async () => {
    if (Object.keys(strokeOrder).length === 0) {
      const mod = await import('../../data/chinese-strokeorder.json');
      setStrokeOrder(mod.default);
    }
  }, [strokeOrder]);

  const loadExercises = useCallback(async () => {
    if (Object.keys(exercises).length === 0) {
      const mod = await import('../../data/chinese-exercises.json');
      setExercises(mod.default);
    }
  }, [exercises]);

  const loadExamples = useCallback(async () => {
    if (Object.keys(examples).length === 0) {
      const mod = await import('../../data/english-examples.json');
      setExamples(mod.default);
    }
  }, [examples]);

  const loadEngExercises = useCallback(async () => {
    if (Object.keys(engExercises).length === 0) {
      const mod = await import('../../data/english-exercises.json');
      setEngExercises(mod.default);
    }
  }, [engExercises]);

  const loadTranslations = useCallback(async () => {
    if (Object.keys(translations).length === 0) {
      const mod = await import('../../data/english-translations.json');
      setTranslations(mod.default);
    }
  }, [translations]);

  return {
    pinyin, vocabulary, strokeOrder, exercises,
    ipa, examples, engExercises, translations,
    loadVocabulary, loadStrokeOrder, loadExercises,
    loadExamples, loadEngExercises, loadTranslations,
  };
}
