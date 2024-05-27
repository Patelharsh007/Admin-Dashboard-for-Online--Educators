"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

function ChapterForm({ reloadKey }) {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [notification, setNotification] = useState("");
  const [isEditAllModalOpen, setIsEditAllModalOpen] = useState(false);
  const [editableChapters, setEditableChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState({ field: "chapterId", order: "asc" });

  useEffect(() => {
    loadChapters();
    loadSubjects();
  }, [reloadKey]);

  async function loadChapters() {
    try {
      const response = await axios.get("/api/chapters");
      setChapters(response.data);
    } catch (error) {
      console.error("Error loading chapters:", error);
    }
  }

  async function loadSubjects() {
    try {
      const response = await axios.get("/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }

  async function addChapter() {
    try {
      if (!name.trim() || !subjectId.trim()) {
        alert("Please enter a valid chapter name and select a subject.");
        return;
      }

      await axios.post("/api/chapters", { name, parentref: subjectId });
      setName("");
      setSubjectId("");
      loadChapters();
      showNotification("Chapter added successfully");
    } catch (error) {
      console.error("Error adding chapter:", error);
      showNotification("Error adding chapter");
    }
  }

  async function deleteChapter(id) {
    try {
      await axios.delete(`/api/chapters/${id}`);
      setIsDeleteModalOpen(false);
      showNotification("Chapter deleted successfully");
      loadChapters();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      showNotification("Error deleting chapter");
    }
  }

  function showNotification(message) {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 5000);
  }

  function handleEditAll() {
    setEditableChapters(
      chapters.map((chapter) => ({
        ...chapter,
        newName: chapter.chapterName,
        newSubjectId: chapter.subjectId,
        deleteFlag: false,
      }))
    );
    setIsEditAllModalOpen(true);
  }

  function handleEditAllChange(id, field, value) {
    setEditableChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.chapterId === id ? { ...chapter, [field]: value } : chapter
      )
    );
  }

  function handleDeleteFlagToggle(id) {
    setEditableChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.chapterId === id
          ? { ...chapter, deleteFlag: !chapter.deleteFlag }
          : chapter
      )
    );
  }

  async function handleUpdateAll() {
    try {
      const updatePromises = editableChapters
        .filter((chapter) => !chapter.deleteFlag)
        .map((chapter) =>
          axios.put(`/api/chapters/${chapter.chapterId}`, {
            name: chapter.newName,
            parentref: chapter.newSubjectId,
          })
        );

      const deletePromises = editableChapters
        .filter((chapter) => chapter.deleteFlag)
        .map((chapter) => axios.delete(`/api/chapters/${chapter.chapterId}`));

      await Promise.all([...updatePromises, ...deletePromises]);
      loadChapters();
      showNotification("Chapters updated and deleted successfully");
      setIsEditAllModalOpen(false);
    } catch (error) {
      console.error("Error editing chapters:", error);
      showNotification("Error editing chapters");
    }
  }

  function handleUpdateModal(chapter) {
    setCurrentChapter({
      ...chapter,
      newName: chapter.chapterName,
      newSubjectId: chapter.subjectId,
    });
    setIsUpdateModalOpen(true);
  }

  function handleDeleteModal(chapter) {
    setCurrentChapter(chapter);
    setIsDeleteModalOpen(true);
  }

  function handleSort(field) {
    const order =
      sortBy.field === field && sortBy.order === "asc" ? "desc" : "asc";
    setSortBy({ field, order });
    const sortedChapters = [...chapters].sort((a, b) => {
      if (field === "chapterId") {
        return order === "asc" ? a.chapterId - b.chapterId : b.chapterId - a.chapterId;
      } else {
        const nameA = a[field].toLowerCase();
        const nameB = b[field].toLowerCase();
        if (nameA < nameB) return order === "asc" ? -1 : 1;
        if (nameA > nameB) return order === "asc" ? 1 : -1;
        return 0;
      }
    });
    setChapters(sortedChapters);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 flex justify-between">
        Manage Chapters
        <button
          onClick={handleEditAll}
          className="p-2 bg-green-500 text-white rounded"
        >
          Edit
        </button>
      </h2>
      <div className="mb-4 flex">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add new chapter"
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        />
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        >
          <option value="">Select subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <button
          onClick={addChapter}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Add Chapter
        </button>
      </div>
      {notification && (
        <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">
          {notification}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">
                Chapter ID
                <button onClick={() => handleSort("chapterId")}>
                  {sortBy.field === "chapterId" ? (
                    sortBy.order === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    )
                  ) : (
                    <FaSort />
                  )}
                </button>
              </th>
              <th className="border-b p-2 text-left">
                Chapter Name
                <button onClick={() => handleSort("chapterName")}>
                  {sortBy.field === "chapterName" ? (
                    sortBy.order === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    )
                  ) : (
                    <FaSort />
                  )}
                </button>
              </th>
              <th className="border-b p-2 text-left">Subject Name</th>
              <th className="border-b p-2 text-left">Standard Name</th>
              <th className="border-b p-2 text-left">Medium Name</th>
              <th className="border-b p-2 text-left">Board Name</th>
              <th className="border-b p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <tr key={chapter.chapterId}>
                <td className="border-b p-2">{chapter.chapterId}</td>
                <td className="border-b p-2">{chapter.chapterName}</td>
                <td className="border-b p-2">{chapter.subjectName}</td>
                <td className="border-b p-2">{chapter.standardName}</td>
                <td className="border-b p-2">{chapter.mediumName}</td>
                <td className="border-b p-2">{chapter.boardName}</td>
                <td className="border-b p-2">
                  <button
                    onClick={() => handleUpdateModal(chapter)}
                    className="p-1 bg-yellow-500 text-white rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteModal(chapter)}
                    className="p-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Update Chapter</h3>
            <input
              type="text"
              value={currentChapter.newName}
              onChange={(e) =>
                setCurrentChapter({
                  ...currentChapter,
                  newName: e.target.value,
                })
              }
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
            <select
              value={currentChapter.newSubjectId}
              onChange={(e) =>
                setCurrentChapter({
                  ...currentChapter,
                  newSubjectId: e.target.value,
                })
              }
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <div className="mb-4">
              <p>Standard Name: {currentChapter.standardName}</p>
              <p>Medium Name: {currentChapter.mediumName}</p>
              <p>Board Name: {currentChapter.boardName}</p>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {setIsUpdateModalOpen(false);
                  showNotification('Update request canceled')}
                }
                className="p-2 bg-gray-400 text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.put(`/api/chapters/${currentChapter.chapterId}`, {
                      name: currentChapter.newName,
                      parentref: currentChapter.newSubjectId,
                    });
                    loadChapters();
                    setIsUpdateModalOpen(false);
                    showNotification("Chapter updated successfully");
                  } catch (error) {
                    console.error("Error updating chapter:", error);
                    showNotification("Error updating chapter");
                  }
                }}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p>
              Are you sure you want to delete the chapter "
              {currentChapter.chapterName}"?
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {setIsDeleteModalOpen(false);
                  showNotification('Delete request canceled')}
                }
                className="p-2 bg-gray-400 text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`/api/chapters/${currentChapter.chapterId}`);
                    loadChapters();
                    setIsDeleteModalOpen(false);
                    showNotification("Chapter deleted successfully");
                  } catch (error) {
                    console.error("Error deleting chapter:", error);
                    showNotification("Error deleting chapter");
                  }
                }}
                className="p-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditAllModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-3/4 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Chapters</h3>
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Chapter ID</th>
                  <th className="border-b p-2 text-left">Chapter Name</th>
                  <th className="border-b p-2 text-left">Subject Name</th>
                  <th className="border-b p-2 text-left">Standard Name</th>
                  <th className="border-b p-2 text-left">Medium Name</th>
                  <th className="border-b p-2 text-left">Board Name</th>
                  <th className="border-b p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editableChapters.map((chapter) => (
                  <tr key={chapter.chapterId}>
                    <td className="border-b p-2">{chapter.chapterId}</td>
                    <td className="border-b p-2">
                      <input
                        type="text"
                        value={chapter.newName}
                        onChange={(e) =>
                          handleEditAllChange(chapter.chapterId, "newName", e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </td>
                    <td className="border-b p-2">
                      <select
                        value={chapter.newSubjectId}
                        onChange={(e) =>
                          handleEditAllChange(chapter.chapterId, "newSubjectId", e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded w-full"
                      >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* <td className="border-b p-2">{chapter.subjectName}</td> */}
                    <td className="border-b p-2">{chapter.standardName}</td>
                    <td className="border-b p-2">{chapter.mediumName}</td>
                    <td className="border-b p-2">{chapter.boardName}</td>
                    <td className="border-b p-2">
                      <button
                        onClick={() => handleDeleteFlagToggle(chapter.chapterId)}
                        className={`p-2 rounded ${chapter.deleteFlag ? "bg-gray-500" : "bg-red-500"} text-white`}
                      >
                        {chapter.deleteFlag ? "Undo" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                onClick={() =>{ setIsEditAllModalOpen(false);
                  showNotification('Edit request canceled')}
                }
                className="p-2 bg-gray-400 text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAll}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChapterForm;