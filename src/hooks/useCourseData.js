import { useState, useCallback, useMemo } from 'react';
import { getGrades, getUnits, getLessons, getLessonCharacters, searchContents } from '../data/courseData';

// 选中年级/学科后自动选中第一个单元，让课文列表立即出现，
// 用户无需先点一次「单元」再选课文（少一步点击）。
function firstUnitId(gradeId, subject) {
  return getUnits(gradeId, subject)[0]?.id ?? null;
}

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
    // 自动选中当前学科的第一个单元，课文列表立即可见
    setSelectedUnit(firstUnitId(gradeId, selectedSubject));
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
    setSearchQuery('');
  }, [selectedSubject]);

  const selectSubject = useCallback((subject) => {
    setSelectedSubject(subject);
    // 自动选中新学科的第一个单元
    setSelectedUnit(selectedGrade ? firstUnitId(selectedGrade, subject) : null);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
  }, [selectedGrade]);

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
