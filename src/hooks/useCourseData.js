import { useState, useCallback, useMemo } from 'react';
import { getGrades, getUnits, getContents, searchContents } from '../data/courseData';

export function useCourseData() {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('语文');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const grades = useMemo(() => getGrades(), []);
  const units = useMemo(
    () => (selectedGrade ? getUnits(selectedGrade, selectedSubject) : []),
    [selectedGrade, selectedSubject]
  );
  const contents = useMemo(
    () => (selectedUnit ? getContents(selectedUnit) : []),
    [selectedUnit]
  );
  const searchResults = useMemo(
    () => (searchQuery ? searchContents(searchQuery) : []),
    [searchQuery]
  );

  const selectGrade = useCallback((gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedUnit(null);
    setSearchQuery('');
  }, []);

  const selectSubject = useCallback((subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
  }, []);

  const selectUnit = useCallback((unitId) => {
    setSelectedUnit(unitId);
  }, []);

  const search = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return {
    grades,
    units,
    contents,
    searchResults,
    selectedGrade,
    selectedSubject,
    selectedUnit,
    searchQuery,
    selectGrade,
    selectSubject,
    selectUnit,
    search,
  };
}
