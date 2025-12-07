import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { getAllTags, createTag } from "./api";
import type { Tag } from "./types.ts";

interface Option {
  label: string;
  value: number; // ID taga
  __isNew__?: boolean;
}

interface TagSelectorProps {
  selectedTags: Tag[]; // Aktualnie wybrane tagi (przekazane z formularza rodzica)
  onChange: (newTags: Tag[]) => void; // Funkcja do aktualizacji stanu w rodzicu
  isDisabled?: boolean;
}

export function TagSelector({
  selectedTags,
  onChange,
  isDisabled,
}: TagSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  // 1. Przy montowaniu komponentu pobierz wszystkie dostępne tagi z bazy
  useEffect(() => {
    setIsLoading(true);
    getAllTags()
      .then((tags) => {
        // Mapujemy Twój obiekt Tag na format react-select (label/value)
        const formattedOptions = tags.map((t) => ({
          label: t.name,
          value: t.id,
        }));
        setOptions(formattedOptions);
      })
      .catch((err) => console.error("Błąd pobierania tagów:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // 2. Obsługa tworzenia nowego taga
  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    try {
      // Strzał do backendu: POST /api/tags
      const newTag = await createTag(inputValue);

      // Dodajemy nowy tag do listy opcji
      const newOption = { label: newTag.name, value: newTag.id };
      setOptions((prev) => [...prev, newOption]);

      // I od razu go zaznaczamy (aktualizujemy rodzica)
      onChange([...selectedTags, newTag]);
    } catch (error) {
      console.error("Nie udało się utworzyć taga:", error);
      alert("Błąd podczas tworzenia taga.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Obsługa zmiany wyboru (dodanie istniejącego lub usunięcie)
  const handleChange = (newValue: any) => {
    // react-select zwraca tablicę Option[], musimy to zamienić z powrotem na Tag[]
    const selectedOptions = newValue as Option[];

    const tagsToSave: Tag[] = selectedOptions.map((opt) => ({
      id: opt.value,
      name: opt.label,
      state: "active", // domyślnie
    }));

    onChange(tagsToSave);
  };

  // Konwersja aktualnie wybranych tagów na format dla react-select
  const valueForSelect = selectedTags.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  return (
    <CreatableSelect
      isMulti // Pozwala wybrać wiele
      isDisabled={isDisabled || isLoading}
      isLoading={isLoading}
      onChange={handleChange}
      onCreateOption={handleCreate} // To magiczna funkcja od "tworzenia w locie"
      options={options}
      value={valueForSelect}
      placeholder="Wybierz tagi lub wpisz nowy..."
      formatCreateLabel={(inputValue) => `Utwórz tag: "${inputValue}"`}
      className="tag-select-container"
      classNamePrefix="react-select"
    />
  );
}
