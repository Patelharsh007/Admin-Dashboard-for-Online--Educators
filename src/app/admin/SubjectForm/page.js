"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function SubjectForm({ reloadKey, onSubjectChange }) {
    const [subjects, setSubjects] = useState([]);
    const [standards, setStandards] = useState([]);
    const [mediums, setMediums] = useState([]);
    const [name, setName] = useState('');
    const [notification, setNotification] = useState('');
    const [errornotification, setErrorNotification] = useState('');
    const [isEditAllModalOpen, setIsEditAllModalOpen] = useState(false);
    const [editableSubjects, setEditableSubjects] = useState([]);
    const [currentSubject, setCurrentSubject] = useState({});
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState({ field: 'id', order: 'asc' });
    const [standardId, setStandardId] = useState("");
    const [mediumId, setMediumId] = useState("");
    const [boardId, setBoardId] = useState("");
    const [boards, setBoards] = useState([]);


    // Define new state variables for filters
    const [filteredstandards, setfilterStandards] = useState([]);
    const [filteredmediums, setfilterMediums] = useState([]);
    const [filteredboards, setfilterBoards] = useState([]);

    // Define state variables for edit all modal
    const [editAllFilterBoard, setEditAllFilterBoard] = useState("");
    const [editAllFilterMedium, setEditAllFilterMedium] = useState("");
    const [editAllFilterStandard, setEditAllFilterStandard] = useState("");
    const [editAllFilterSubjectName, setEditAllFilterSubjectName] = useState("");


    // Define state variables for filters and set initial values
    const [subjectFilters, setSubjectFilters] = useState({
        chapterName: "",
        subjectName: "",
        standardName: "",
        mediumName: "",
        boardName: "",
    });


    // Define state variable for fetched subjects
    const [fetchedSubjects, setFetchedSubjects] = useState([]);

    // Fetch subjects on component mount or when reloadKey changes
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/api/subjects'); // Replace with your API endpoint
            setFetchedSubjects(response.data);
        };
        fetchData();
    }, [reloadKey]); // Dependency array includes reloadKey


    // Update the loadSubjects & loadBoards function to accept a reload key
    useEffect(() => {
        loadSubjects();
        loadBoards();
    }, [reloadKey]);

    // Update the loadMediums function to accept a boardId parameter
    useEffect(() => {
        loadStandards(mediumId);
    }, [mediumId]);

    // Update the loadMediums function to accept a boardId parameter
    useEffect(() => {
        loadMediums(boardId);
    }, [boardId]);



    // Call the new function to load all standards during filter
    useEffect(() => {
        loadAllStandards();
    }, []);

    // Call the new function to load all mediums during filter
    useEffect(() => {
        loadAllMediums();
    }, []);

    // Call the new function to load all boards during filter
    useEffect(() => {
        loadAllBoards();
    }, []);

    // Call the new function to  boards during filter
    useEffect(() => {
        if (isEditAllModalOpen) {
            loadStandardsSortedByBoard();
        }
    }, [isEditAllModalOpen]);

    async function loadBoards() {
        try {
            const response = await axios.get("/api/boards");
            setBoards(response.data);
        } catch (error) {
            console.error("Error loading boards:", error);
            showErrorNotification('Error loading boards');
        }
    }

    async function loadStandards(mediumId) {
        try {
            if (mediumId) {
                const response = await axios.get(`/api/standards/${mediumId}`);
                setStandards(response.data);
            } else {
                const response = await axios.get("/api/standards");
                setStandards(response.data);
            }
        } catch (error) {
            console.error("Error loading standards:", error);
            showErrorNotification('Error loading standards');
        }
    }

    async function loadStandardsSortedByBoard() {
        try {
            const response = await axios.get("/api/standards");
            const sortedStandards = response.data.sort((a, b) => {
                // Sort by boardName
                const boardComparison = a.boardName.localeCompare(b.boardName);
                if (boardComparison !== 0) return boardComparison;

                // Sort by mediumName
                const mediumComparison = a.mediumName.localeCompare(b.mediumName);
                if (mediumComparison !== 0) return mediumComparison;

                // Assuming standardName is a number, sort numerically
                return a.standardName - b.standardName;
            });
            setStandards(sortedStandards);
        } catch (error) {
            console.error("Error loading standards sorted by board:", error);
            showErrorNotification('Error loading standards');
        }
    }


    // Update the loadMediums function to accept a boardId parameter
    async function loadMediums(boardId) {
        try {
            if (boardId) {
                const response = await axios.get(`/api/mediums/${boardId}`);
                setMediums(response.data);
            } else {
                setMediums([]);
            }
        } catch (error) {
            console.error("Error loading mediums:", error);
            showErrorNotification('Error loading mediums');
        }
    }



    async function loadSubjects() {
        try {
            const response = await axios.get('/api/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error("Error loading subjects:", error);
            showErrorNotification('Error loading subjects');
        }
    }


    async function addSubject() {
        try {
            if (!name.trim() || !standardId.trim()) {
                //alert("Please enter a valid subject name and select a standard.");
                showErrorNotification('Please enter a valid subject name and select a standard.');
                return;
            }
            await axios.post('/api/subjects', { name, parentref: standardId });
            setName('');
            setStandardId('');
            onSubjectChange();
            showNotification('Subject added successfully');
        } catch (error) {
            console.error("Error adding subject:", error);
            //showNotification('Error adding subject');
            showErrorNotification('Error adding subject');
        }
    }

    async function deleteSubject(id) {
        try {
            const response = await axios.delete(`/api/subjects/${id}`);
            const { message } = response.data;
            setIsDeleteModalOpen(false);
            showNotification(message);
            loadSubjects();
            onSubjectChange();
        } catch (error) {
            console.error("Error deleting subject:", error);
            if (error.response && error.response.data && error.response.data.message) {
                //showNotification(error.response.data.message);
                showErrorNotification(error.response.data.message);
            } else {
                //showNotification('Error deleting subject');
                showErrorNotification('Error deleting subject');
            }
        }
    }

    function showNotification(message) {
        setNotification(message);
        setTimeout(() => {
            setNotification('');
        }, 5000);
    }

    function showErrorNotification(message) {
        setErrorNotification(message);
        setTimeout(() => {
            setErrorNotification('');
        }, 5000);
    }

    function handleEditAll() {
        loadStandardsSortedByBoard();
        setEditableSubjects(subjects.map(subject => ({
            ...subject,
            newName: subject.name,
            newStandardId: subject.parentref,
            deleteFlag: false
        })));
        setIsEditAllModalOpen(true);
    }

    function handleEditAllChange(id, field, value) {
        setEditableSubjects(prevSubjects =>
            prevSubjects.map(subject =>
                subject.id === id ? { ...subject, [field]: value } : subject
            )
        );
    }

    function handleDeleteFlagToggle(id) {
        setEditableSubjects(prevSubjects =>
            prevSubjects.map(subject =>
                subject.id === id ? { ...subject, deleteFlag: !subject.deleteFlag } : subject
            )
        );
    }

    async function handleUpdateAll() {
        try {
            const updatePromises = editableSubjects.filter(subject => !subject.deleteFlag).map(subject =>
                axios.put(`/api/subjects/${subject.id}`, { name: subject.newName, parentref: subject.newStandardId })
            );

            const deletePromises = editableSubjects.filter(subject => subject.deleteFlag).map(subject =>
                axios.delete(`/api/subjects/${subject.id}`)
            );

            await Promise.all([...updatePromises, ...deletePromises]);
            loadSubjects();
            loadStandards();
            onSubjectChange();
            showNotification('Subjects updated and deleted successfully');
            setIsEditAllModalOpen(false);
        } catch (error) {
            console.error("Error editing subjects:", error);
            //showNotification('Error editing subjects');
            showErrorNotification('Error editing subjects');
        }
    }

    function handleUpdateModal(subject) {
        setCurrentSubject(subject);
        setIsUpdateModalOpen(true);
    }

    function handleDeleteModal(subject) {
        setCurrentSubject(subject);
        setIsDeleteModalOpen(true);
    }

    // function handleSort(field) {
    //     const order = sortBy.field === field && sortBy.order === 'asc' ? 'desc' : 'asc';
    //     setSortBy({ field, order });
    //     const sortedSubjects = [...subjects].sort((a, b) => {
    //         if (field === 'id') {
    //             return order === 'asc' ? a.id - b.id : b.id - a.id;
    //         } else {
    //             const nameA = a[field].toLowerCase();
    //             const nameB = b[field].toLowerCase();
    //             if (nameA < nameB) return order === 'asc' ? -1 : 1;
    //             if (nameA > nameB) return order === 'asc' ? 1 : -1;
    //             return 0;
    //         }
    //     });
    //     setSubjects(sortedSubjects);
    // }




    // Define a new function to filter chapters based on the current filters
    const filterSubjects = (subjects) => {
        const { subjectName, standardName, mediumName, boardName } = subjectFilters;
        return subjects.filter((subject) => (
            (!subjectName || subject.name.toLowerCase().includes(subjectName.toLowerCase())) &&
            (!standardName || subject.standardName.includes(standardName)) &&
            (!mediumName || subject.mediumName.includes(mediumName)) &&
            (!boardName || subject.boardName.includes(boardName))
        ));
    };

    // Filter the fetched subjects based on the current filters
    const filteredSubjects = filterSubjects(fetchedSubjects);

    // Define a new function to handle subject name filter changes
    const handleSubjectNameChange = (e) => {
        setSubjectFilters({ ...subjectFilters, subjectName: e.target.value.toUpperCase() });
    };

    // Define a new function to handle standard filter changes
    function handleStandardFilterChange(event) {
        const selectedStandard = event.target.value;
        setSubjectFilters((prevFilters) => ({
            ...prevFilters,
            standardName: selectedStandard,
        }));
    }

    // Define a new function to handle medium filter changes
    function handleMediumFilterChange(event) {
        const selectedMedium = event.target.value;
        setSubjectFilters((prevFilters) => ({
            ...prevFilters,
            mediumName: selectedMedium,
        }));
    }

    // Define a new function to handle board filter changes
    function handleBoardFilterChange(event) {
        const selectedBoard = event.target.value;
        setSubjectFilters((prevFilters) => ({
            ...prevFilters,
            boardName: selectedBoard,
        }));
    }


    // Define a new function to load all standards for filter
    async function loadAllStandards() {
        try {
            const response = await axios.get(`/api/standards`);
            setfilterStandards(response.data);
        } catch (error) {
            console.error("Error loading standards:", error);
            showErrorNotification("Error loading standards");
        }
    }

    // Define a new function to load all mediums for filter  
    async function loadAllMediums() {
        try {
            const response = await axios.get(`/api/mediums`);
            setfilterMediums(response.data);
        } catch (error) {
            console.error("Error loading mediums:", error);
            showErrorNotification("Error loading mediums");
        }
    }

    // Define a new function to load all boards for filter
    async function loadAllBoards() {
        try {
            const response = await axios.get(`/api/boards`);
            setfilterBoards(response.data);
        } catch (error) {
            console.error("Error loading boards:", error);
            showErrorNotification("Error loading boards");
        }
    }

    // Function to handle changes in the board filter for edit all modal
    const handleEditAllFilterBoardChange = (event) => {
        setEditAllFilterBoard(event.target.value);
    };

    // Function to handle changes in the medium filter for edit all modal
    const handleEditAllFilterMediumChange = (event) => {
        setEditAllFilterMedium(event.target.value);
    };

    // Function to handle changes in the standard filter for edit all modal
    const handleEditAllFilterStandardChange = (event) => {
        setEditAllFilterStandard(event.target.value);
    };


    // Function to handle changes in the chapter name filter for edit all modal
    const handleEditAllFilterSubjectNameChange = (event) => {
        setEditAllFilterSubjectName(event.target.value.toUpperCase());
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex justify-between">
                Manage Subjects
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
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    placeholder="Add new subject"
                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                />
                <select
                    value={boardId}
                    onChange={(e) => setBoardId(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                >
                    <option value="">Select board</option>
                    {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                            {board.name}
                        </option>
                    ))}
                </select>

                <select
                    value={mediumId}
                    onChange={(e) => setMediumId(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                >
                    <option value="">Select medium</option>
                    {mediums.map((medium) => (
                        <option key={medium.id} value={medium.id}>
                            {medium.name}
                        </option>
                    ))}
                </select>
                <select
                    value={standardId}
                    onChange={(e) => setStandardId(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                >
                    <option value="">Select standard</option>
                    {standards.map((standard) => (
                        <option key={standard.id} value={standard.id}>
                            {standard.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={addSubject}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Add Subject
                </button>
            </div>
            {notification && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{notification}</div>}
            {errornotification && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errornotification}</div>}


            <div className="overflow-x-auto">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-4">Filter Subjects</h3>
                    <input
                        type="text"
                        placeholder="Search Subject Name"
                        value={subjectFilters.subjectName}
                        onChange={handleSubjectNameChange}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <select
                        value={subjectFilters.boardName}
                        onChange={handleBoardFilterChange}
                        className="flex-1 p-2 border border-gray-300 rounded mr-2"
                    >
                        <option value="">All Boards</option>
                        {/* Filter unique boards */}
                        {Array.from(new Set(filteredboards.map(board => board.name)))
                            .sort((a, b) => a.localeCompare(b))
                            .map((boardName) => (
                                <option key={boardName} value={boardName}>
                                    {boardName}
                                </option>
                            ))}
                    </select>
                    <select
                        value={subjectFilters.mediumName}
                        onChange={handleMediumFilterChange}
                        className="flex-1 p-2 border border-gray-300 rounded mr-2"
                    >
                        <option value="">All Mediums</option>
                        {/* Filter unique mediums */}
                        {Array.from(new Set(filteredmediums.map(medium => medium.name)))
                            .sort((a, b) => a.localeCompare(b))
                            .map((mediumName) => (
                                <option key={mediumName} value={mediumName}>
                                    {mediumName}
                                </option>
                            ))}
                    </select>
                    <select
                        value={subjectFilters.standardName}
                        onChange={handleStandardFilterChange}
                        className="flex-1 p-2 border border-gray-300 rounded mr-2"
                    >
                        <option value="">All Standards</option>
                        {/* Filter unique standards */}
                        {Array.from(new Set(filteredstandards.map(standard => standard.name)))
                            .sort((a, b) => a.localeCompare(b))
                            .map((standardName) => (
                                <option key={standardName} value={standardName}>
                                    {standardName}
                                </option>
                            ))}
                    </select>
                </div>


                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left">
                                Subject ID
                                {/* <button onClick={() => handleSort('id')}>
                                    {sortBy.field === 'id' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                </button> */}
                            </th>
                            <th className="border-b p-2 text-left">
                                Subject Name
                                {/* <button onClick={() => handleSort('name')}>
                                    {sortBy.field === 'name' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                </button> */}
                            </th>
                            <th className="border-b p-2 text-left">Standard Name</th>
                            <th className="border-b p-2 text-left">Medium Name</th>
                            <th className="border-b p-2 text-left">Board Name</th>
                            <th className="border-b p-2 text-left">Actions</th>
                        </tr>
                    </thead>


                    <tbody>
                        {filteredSubjects.map((subject) => (
                            <tr key={subject.id}>
                                <td className="border-b p-2">{subject.id}</td>
                                <td className="border-b p-2">{subject.name}</td>
                                <td className="border-b p-2">{subject.standardName}</td>
                                <td className="border-b p-2">{subject.mediumName}</td>
                                <td className="border-b p-2">{subject.boardName}</td>
                                <td className="border-b p-2">
                                    <button
                                        onClick={() => handleUpdateModal(subject)}
                                        className="p-1 bg-yellow-500 text-white rounded mr-2"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDeleteModal(subject)}
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
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-6 px-30 flex rounded-lg shadow-md max-w-md">

                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-4">Current Details:</p>
                            <p>Standard: {currentSubject.standardName}</p>
                            <p>Medium Name: {currentSubject.mediumName}</p>
                            <p>Board Name: {currentSubject.boardName}</p>
                        </div>

                        <div>

                            <h3 className="text-xl font-semibold mb-4">Update Subject</h3>

                            <h5 className="text-lg font-semibold mb-4">Subject Name:</h5>
                            <input
                                type="text"
                                value={currentSubject.name}
                                onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value.toUpperCase() })}
                                className="mb-4 p-2 border border-gray-300 rounded w-full"
                            />

                            <div className="mb-4">

                                <h5 className="text-lg font-semibold mb-4">Select Board:</h5>
                                <select
                                    value={boardId}
                                    onChange={(e) => setBoardId(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                                >
                                    <option value="">Select Board</option>
                                    {boards.map((board) => (
                                        <option key={board.id} value={board.id}>
                                            {board.name}
                                        </option>
                                    ))}
                                </select>
                                <br />
                                <br />


                                <h5 className="text-lg font-semibold mb-4">Select Medium:</h5>
                                <select
                                    value={mediumId}
                                    onChange={(e) => setMediumId(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                                >
                                    <option value="">Select Medium</option>
                                    {mediums.map((medium) => (
                                        <option key={medium.id} value={medium.id}>
                                            {medium.name}
                                        </option>
                                    ))}
                                </select>
                                <br />
                                <br />

                                <h5 className="text-lg font-semibold mb-4">Select Standard:</h5>
                                <select
                                    value={currentSubject.parentref}
                                    onChange={(e) => setCurrentSubject({ ...currentSubject, parentref: e.target.value })}
                                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                                >
                                    <option value="">Select Standard</option>
                                    {standards.map((standard) => (
                                        <option key={standard.id} value={standard.id}>
                                            {standard.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => {
                                        setIsUpdateModalOpen(false);
                                        //showNotification('Update request cancelled');
                                        showErrorNotification('Update request cancelled');
                                    }}
                                    className="p-2 bg-gray-400 text-white rounded mr-2 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            // ... your update logic
                                            await axios.put(`/api/subjects/${currentSubject.id}`, {
                                                name: currentSubject.name,
                                                parentref: currentSubject.parentref,
                                            });
                                            loadSubjects();
                                            onSubjectChange();
                                            setIsUpdateModalOpen(false);
                                            showNotification('Subject updated successfully');
                                        } catch (error) {
                                            console.error("Error updating subject:", error);
                                            //showNotification('Error updating subject');
                                            showErrorNotification('Error updating subject');
                                        }
                                    }}
                                    className="p-2 bg-blue-500 text-white rounded focus:outline-none"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
                        <p>Are you sure you want to delete the subject "{currentSubject.name}"?</p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    //showNotification('Delete request cancelled');
                                    showErrorNotification('Delete request cancelled');
                                }
                                }
                                className="p-2 bg-gray-400 text-white rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    deleteSubject(currentSubject.id);
                                    setIsDeleteModalOpen(false);
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
                    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-3/4">
                        <h3 className="text-xl font-semibold mb-4">Edit Subjects</h3>
                        <div className="mb-4">
                            {/* Filter Bar */}
                            <h5 className="text-lg font-semibold mb-4">Filters:</h5>

                            <div className="flex justify-evenly ">

                                <div>
                                    <label className="block mb-1">Subject:</label>
                                    <input
                                        type="text"
                                        placeholder="Search Subject Name"
                                        value={editAllFilterSubjectName}
                                        onChange={handleEditAllFilterSubjectNameChange}
                                        className="p-2 border border-gray-300 rounded mr-2"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="editAllFilterBoard" className="block mb-1">Board:</label>
                                    <select
                                        id="editAllFilterBoard"
                                        value={editAllFilterBoard}
                                        onChange={handleEditAllFilterBoardChange}
                                        className="p-2 border border-gray-300 rounded w-full"
                                    >
                                        <option value="" slected>All Boards</option>
                                        {filteredboards.map(board => (
                                            <option key={board.id} value={board.name}>{board.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="editAllFilterMedium" className="block mb-1">Medium:</label>
                                    <select
                                        id="editAllFilterMedium"
                                        value={editAllFilterMedium}
                                        onChange={handleEditAllFilterMediumChange}
                                        className="p-2 border border-gray-300 rounded w-full"
                                    >
                                        <option value="">All Mediums</option>
                                        {[...new Set(filteredmediums.map(medium => medium.name))]
                                            .sort()
                                            .map(mediumName => (
                                                <option key={mediumName} value={mediumName}>
                                                    {mediumName}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="editAllFilterStandard" className="block mb-1">Standard:</label>
                                    <select
                                        id="editAllFilterStandard"
                                        value={editAllFilterStandard}
                                        onChange={handleEditAllFilterStandardChange}
                                        className="p-2 border border-gray-300 rounded w-full"
                                    >
                                        <option value="">All Standards</option>
                                        {[...new Set(filteredstandards.map(standard => standard.name))]
                                            .sort()
                                            .map(standardName => (
                                                <option key={standardName} value={standardName}>
                                                    {standardName}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table of subjects */}

                        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="min-w-full border-collapse">
                                <thead style={{ position: "sticky", top: 0, background: "white", 'z-index': "1" }}>
                                    <tr >
                                        <th className="border-b p-2 text-left">Subject ID</th>
                                        <th className="border-b p-2 text-left">Subject Name</th>
                                        <th className="border-b p-2 text-left">Standard Name</th>
                                        <th className="border-b p-2 text-left">Medium Name</th>
                                        <th className="border-b p-2 text-left">Board Name</th>
                                        <th className="border-b p-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableSubjects
                                        .filter((subject) => {
                                            return (
                                                (!editAllFilterBoard || subject.boardName === editAllFilterBoard) &&
                                                (!editAllFilterMedium || subject.mediumName === editAllFilterMedium) &&
                                                (!editAllFilterStandard || subject.standardName === editAllFilterStandard) &&
                                                (!editAllFilterSubjectName || subject.name.toLowerCase().includes(editAllFilterSubjectName.toLowerCase()))
                                            );
                                        })
                                        .map((subject) => (
                                            <tr key={subject.id}>
                                                <td className="border-b p-2">{subject.id}</td>
                                                <td className="border-b p-2">
                                                    <input
                                                        type="text"
                                                        value={subject.newName}
                                                        onChange={(e) => handleEditAllChange(subject.id, 'newName', e.target.value.toUpperCase())}
                                                        className="p-2 border border-gray-300 rounded w-full"
                                                    />
                                                </td>
                                                <td className="border-b p-2">
                                                    <select
                                                        value={subject.newStandardId}
                                                        onChange={(e) => handleEditAllChange(subject.id, 'newStandardId', e.target.value)}
                                                        className="p-2 border border-gray-300 rounded w-full"
                                                    >
                                                        <option value="">Select standard</option>
                                                        {standards.map((standard) => (
                                                            <option key={standard.id} value={standard.id}>
                                                                {`${standard.name} (${standard.boardName} - ${standard.mediumName} Medium)`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="border-b p-2">{subject.mediumName}</td>
                                                <td className="border-b p-2">{subject.boardName}</td>
                                                <td className="border-b p-2">
                                                    <button
                                                        onClick={() => handleDeleteFlagToggle(subject.id)}
                                                        className={`p-2 rounded ${subject.deleteFlag ? 'bg-gray-500' : 'bg-red-500'} text-white`}
                                                    >
                                                        {subject.deleteFlag ? 'Undo' : 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>



                        </div>

                        {/* Button of cancel and Done */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsEditAllModalOpen(false);
                                    setEditAllFilterBoard('')
                                    setEditAllFilterMedium('')
                                    setEditAllFilterStandard('')
                                    setEditAllFilterSubjectName('')
                                    //showNotification('Edit request cancelled');
                                    showErrorNotification('Edit request cancelled');
                                }
                                }
                                className="p-2 bg-gray-400 text-white rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateAll}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
                                Save Changes
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default SubjectForm;
