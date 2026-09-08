import { useState, useCallback, useMemo } from 'react';
import { getGrades, getUnits, getLessons, getLessonCharacters, searchContents } from '../data/courseData';

export function useCourseData() {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('语文');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const grades = useMemo(() => getGrades(), []);
  const units = useMemo(
    () => (selectedGrade ? getUnits(selectedGrade, selectedSubject) : []),
    [selectedGrade, selectedSubject]
  );
  const lessons = useMemo(
    () => (selectedGrade && selectedUnit ? getLessons(selectedGrade, selectedUnit) : []),
    [selectedGrade, selectedUnit]
  );
  const searchResults = useMemo(
    () => (searchQuery ? searchContents(searchQuery) : []),
    [searchQuery]
  );

  const selectGrade = useCallback((gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
    setSearchQuery('');
  }, []);

  const selectSubject = useCallback((subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
  }, []);

  const selectUnit = useCallback((unitId) => {
    setSelectedUnit(unitId);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
  }, []);

  const selectLesson = useCallback((lesson) => {
    setSelectedLesson(lesson);
    const chars = getLessonCharacters(lesson.id);
    setSelectedCharacters(new Set(chars));
  }, []);

  const toggleCharacter = useCallback((char) => {
    setSelectedCharacters(prev => {
      const next = new Set(prev);
      if (next.has(char)) next.delete(char);
      else next.add(char);
      return next;
    });
  }, []);

  const selectAllCharacters = useCallback(() => {
    if (selectedLesson) {
      const chars = getLessonCharacters(selectedLesson.id);
      setSelectedCharacters(new Set(chars));
    }
  }, [selectedLesson]);

  const deselectAllCharacters = useCallback(() => {
    setSelectedCharacters(new Set());
  }, []);

  const search = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return {
    grades, units, lessons, searchResults,
    selectedGrade, selectedSubject, selectedUnit, selectedLesson, selectedCharacters, searchQuery,
    selectGrade, selectSubject, selectUnit, selectLesson, toggleCharacter,
    selectAllCharacters, deselectAllCharacters, search,
  };
}
