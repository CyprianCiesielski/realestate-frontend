import React, { useState, useRef, useEffect } from "react";
import type { Tag } from "./types";
import { CreateTagModal } from "./CreateTagModal";
// Jeśli nie masz react-icons, zamień <FaTimes /> na zwykły tekst "x"
import { FaTimes } from "react-icons/fa";
import "./TagSelector.css";

interface TagSelectorProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  allTags: Tag[];
}

export function TagSelector({
  selectedTags,
  onChange,
  allTags,
}: TagSelectorProps) {
  console.log("TAGI W SELECTORZE:", allTags);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Czy kliknięto w pole?

  // Ref do wykrywania kliknięcia poza komponentem (zamykanie dropdowna)
  const wrapperRef = useRef<HTMLDivElement>(null);

  const tagsToCheck = allTags || [];

  // Obsługa zamykania listy po kliknięciu gdzieś indziej
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectExistingTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
    }
    setNewTagName("");
    // Utrzymujemy focus, żeby można było dodać kolejny
    setIsFocused(true);
  };

  const handleRemoveTag = (tagId: number) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleNewTagCreated = (newTag: Tag) => {
    setIsModalOpen(false);
    setNewTagName("");
    onChange([...selectedTags, newTag]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Zapobiegamy wysłaniu formularza głównego (ProjectModal) po wciśnięciu Enter
    if (e.key === "Enter") {
      e.preventDefault();

      if (newTagName.trim() === "") return;

      const trimmedName = newTagName.trim();
      const existingTag = tagsToCheck.find(
        (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (!existingTag) {
        setIsModalOpen(true); // Otwórz modal tworzenia
      } else {
        handleSelectExistingTag(existingTag); // Wybierz istniejący
      }
    }

    // Opcjonalnie: Usuwanie ostatniego taga backspacem
    if (e.key === "Backspace" && newTagName === "" && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  // Filtrowanie: Pokaż tagi pasujące do tekstu, które nie są jeszcze wybrane
  // Jeśli tekst pusty, pokaż wszystkie dostępne (niewybrane)
  const filteredTags = tagsToCheck.filter(
    (tag) =>
      (newTagName === "" ||
        tag.name.toLowerCase().includes(newTagName.toLowerCase())) &&
      !selectedTags.some((t) => t.id === tag.id),
  );

  return (
    <div className="tag-selector-component" ref={wrapperRef}>
      {/* 1. KONTENER UDAJĄCY INPUT (Tagi + Pole tekstowe w środku) */}
      <div
        className={`tag-selector-wrapper ${isFocused ? "focused" : ""}`}
        onClick={() => setIsFocused(true)} // Kliknięcie gdziekolwiek w ramkę aktywuje input
      >
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="selected-tag-badge"
            style={{
              backgroundColor: tag.color || "#e0e0e0",
              color: "#fff", // Możesz tu dodać logikę kontrastu
              borderColor: tag.color,
            }}
          >
            {tag.name}
            <button
              type="button"
              className="remove-tag-btn"
              onClick={(e) => {
                e.stopPropagation(); // Żeby nie otwierać listy przy usuwaniu
                handleRemoveTag(tag.id);
              }}
            >
              <FaTimes />
            </button>
          </span>
        ))}

        {/* Input bez ramki, wypełnia resztę miejsca */}
        <input
          type="text"
          className="tag-selector-input-field"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={
            selectedTags.length === 0 ? "Wybierz lub wpisz tag..." : ""
          }
        />
      </div>

      {/* 2. LISTA ROZWIJANA (DROPDOWN) */}
      {isFocused && filteredTags.length > 0 && (
        <div className="tag-dropdown">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="tag-dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault(); // Zapobiega utracie focusa przed klikiem
                handleSelectExistingTag(tag);
              }}
            >
              <span
                className="dropdown-tag-color"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </div>
          ))}
        </div>
      )}

      {/* 3. MODAL TWORZENIA */}
      {isModalOpen && (
        <CreateTagModal
          initialName={newTagName}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleNewTagCreated}
        />
      )}
    </div>
  );
}
