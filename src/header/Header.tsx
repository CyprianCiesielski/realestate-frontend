import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaBell, FaPlus, FaHashtag } from "react-icons/fa";
import "./Header.css";

import { SearchBar } from "../components/searching/SearchBar.tsx";
import { CreateProjectModal } from "../components/project/CreateProjectModal.tsx";
import { TagModal } from "../components/tag/TagModal.tsx";
import type { Project } from "../components/project/types.ts";

// 👇 IMPORTY API I TYPÓW TAGÓW
import {
  getAllTags,
  createTag,
  updateTag,
  archiveTag,
} from "../components/tag/api";
import type { Tag } from "../components/tag/types";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // --- LOGIKA TAGÓW ---
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  // 1. Pobieranie tagów przy starcie
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (err) {
      console.error("Błąd pobierania tagów:", err);
    }
  };

  // 2. Dodawanie taga
  const handleAddTag = async (data: { name: string; color: string }) => {
    try {
      const newTag = await createTag({
        name: data.name,
        color: data.color,
      });
      setTags((prev) => [...prev, newTag]);
    } catch (err) {
      console.error("Błąd tworzenia taga:", err);
      alert("Nie udało się utworzyć taga.");
    }
  };

  // 3. Usuwanie (archiwizacja) taga
  const handleRemoveTag = async (tagId: number) => {
    try {
      await archiveTag(tagId);
      // Usuwamy go lokalnie z listy
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      console.error("Błąd usuwania taga:", err);
      alert("Nie udało się usunąć taga.");
    }
  };

  // 4. Edycja taga
  const handleEditTag = async (
    tagId: number,
    data: { name: string; color: string },
  ) => {
    try {
      const updatedTag = await updateTag(tagId, {
        name: data.name,
        color: data.color, // Przekazujemy wybrany kolor do API
      });

      setTags((prev) => prev.map((t) => (t.id === tagId ? updatedTag : t)));
    } catch (err) {
      console.error("Błąd edycji taga:", err);
      alert("Nie udało się edytować taga.");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/projects" className="logo-text">
          RealEstate<span style={{ fontWeight: "normal" }}>Tracker</span>
        </Link>

        <button
          className="add-project-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Dodaj Projekt <FaPlus />
        </button>
      </div>

      <SearchBar />

      <div className="header-right">
        <button
          className="icon-btn"
          onClick={() => setIsTagsModalOpen(true)}
          title="Zarządzaj tagami"
        >
          <FaHashtag />
        </button>

        <button className="icon-btn">
          <FaCalendarAlt />
        </button>

        <button className="icon-btn">
          <FaBell />
        </button>

        <div className="user-avatar">CC</div>

        {isModalOpen && (
          <CreateProjectModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={(newProject) => {
              setProjects([...projects, newProject]);
              setIsModalOpen(false);
            }}
          />
        )}

        {isTagsModalOpen && (
          <TagModal
            isOpen={isTagsModalOpen}
            onClose={() => setIsTagsModalOpen(false)}
            tags={tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onEditTag={handleEditTag}
          />
        )}
      </div>
    </header>
  );
}
