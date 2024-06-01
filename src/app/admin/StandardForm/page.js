import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function StandardForm({ reloadKey, onStandardChange }) {
    const [standards, setStandards] = useState([]);
    const [mediums, setMediums] = useState([]);
    const [boards, setBoards] = useState([]);
    const [name, setName] = useState('');
    const [mediumId, setMediumId] = useState('');
    const [notification, setNotification] = useState('');
    const [errornotification, setErrorNotification] = useState('');
    const [sortBy, setSortBy] = useState({ field: '', order: '' });
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentStandardId, setCurrentStandardId] = useState('');
    const [currentStandardName, setCurrentStandardName] = useState('');
    const [currentMediumId, setCurrentMediumId] = useState('');
    const [currentMediumName, setCurrentMediumName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentStandardToDelete, setCurrentStandardToDelete] = useState(null);
    const [isEditAllModalOpen, setIsEditAllModalOpen] = useState(false);
    const [editableStandards, setEditableStandards] = useState([]);
    const [currentBoardName, setCurrentBoardName] = useState('');
    const [boardId, setBoardId] = useState("");
    const [allMediums, setAllMediums] = useState([]);

    // Define new state variables for filters
    const [filteredmediums, setfilterMediums] = useState([]);
    const [filteredboards, setfilterBoards] = useState([]);

    // Define state variables for edit all modal
    const [editAllFilterBoard, setEditAllFilterBoard] = useState("");
    const [editAllFilterMedium, setEditAllFilterMedium] = useState("");
    const [editAllFilterStandardName, setEditAllFilterStandardName] = useState("");


    // Define state variables for filters and set initial values
    const [standardFilters, setStandardFilters] = useState({
        chapterName: "",
        subjectName: "",
        standardName: "",
        mediumName: "",
        boardName: "",
    });

    // Define state variable for fetched standards
    const [fetchedStandards, setFetchedStandards] = useState([]);

    // Fetch standards on component mount or when reloadKey changes
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/api/standards'); // Replace with your API endpoint
            setFetchedStandards(response.data);
        };
        fetchData();
    }, [reloadKey]); // Dependency array includes reloadKey

    useEffect(() => {
        loadStandards();
        loadBoards();
    }, [reloadKey]); // Reload when reloadKey changes

    useEffect(() => {
        loadMediums(boardId);
    }, [boardId]);

    // Call the new function to load all mediums during filter
    useEffect(() => {
        loadAllMediums();
    }, []);

    // Call the new function to load all boards during filter
    useEffect(() => {
        loadAllBoards();
    }, []);

    useEffect(() => {
        if (isEditAllModalOpen) {
            loadMediumsSortedByBoard();
        }
    }, [isEditAllModalOpen]);


    async function loadStandards() {
        try {
            const response = await axios.get('/api/standards');
            setStandards(response.data);
        } catch (error) {
            console.error("Error loading standards:", error);
            showErrorNotification('Error loading standards');
        }
    }


    async function loadBoards() {
        try {
            const response = await axios.get("/api/boards");
            setBoards(response.data);
        } catch (error) {
            console.error("Error loading boards:", error);
            showErrorNotification('Error loading boards');
        }
    }


    async function loadMediums(boardId) {
        try {
            if (boardId) {
                const response = await axios.get(`/api/mediums/${boardId}`);
                setMediums(response.data);
            } else {
                const response = await axios.get("/api/mediums");
                setMediums(response.data);
            }
        } catch (error) {
            console.error("Error loading mediums:", error);
            showErrorNotification('Error loading mediums');
        }
    }

    async function loadMediumsSortedByBoard() {
        try {
            const response = await axios.get("/api/mediums");
            const sortedMediums = response.data.sort((a, b) => {
                // Sort by boardName
                const boardComparison = a.boardName.localeCompare(b.boardName);
                if (boardComparison !== 0) return boardComparison;
    
                // Sort by mediumName
                return a.mediumName.localeCompare(b.mediumName);
            });
            setMediums(sortedMediums);
        } catch (error) {
            console.error("Error loading mediums sorted by board:", error);
            showErrorNotification('Error loading mediums');
        }
    }

    async function loadAllMediums() {
        try {
            const response = await axios.get(`/api/mediums`);
            const sortedMediums = response.data.sort((a, b) => a.boardName.localeCompare(b.boardName));
            setAllMediums(sortedMediums);
        } catch (error) {
            console.error("Error loading all mediums:", error);
            showErrorNotification('Error loading all mediums');
        }
    }


    async function addStandard() {
        try {
            if (!name.trim() || !mediumId.trim()) {
                alert("Please enter a valid standard name and select a medium.");
                return;
            }
            const response = await axios.post('/api/standards', { name, parentref: mediumId });
            setName('');
            setMediumId('');
            onStandardChange(); // Trigger reload
            showNotification('Standard added successfully');
        } catch (error) {
            console.error("Error adding standard:", error);
            //showNotification('Error adding standard');
            showErrorNotification('Error adding standard');
        }
    }

    async function updateStandard(id, newName, newMediumId) {
        try {
            await axios.put(`/api/standards/${id}`, { name: newName, parentref: newMediumId });
            loadStandards();
            showNotification('Standard updated successfully');
            onStandardChange();
        } catch (error) {
            console.error("Error updating standard:", error);
            //showNotification('Error updating standard');
            showErrorNotification('Error updating standard');
        }
    }

    async function deleteStandard(id) {
        try {
            await axios.delete(`/api/standards/${id}`);
            loadStandards();
            showNotification('Standard deleted successfully');
            onStandardChange();
        } catch (error) {
            console.error("Error deleting standard:", error);
            //showNotification('Error deleting standard');
            showErrorNotification('Error deleting standard');
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


    function handleSort(field) {
        const order = sortBy.field === field && sortBy.order === 'asc' ? 'desc' : 'asc';
        setSortBy({ field, order });
        const sortedStandards = [...standards].sort((a, b) => {
            if (field === 'id' || field === 'standard' || field === 'name') {
                // Numeric sort for 'id', 'standard', and 'name' fields
                const valueA = parseFloat(a[field]);
                const valueB = parseFloat(b[field]);
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            } else {
                // Maintain original order for other fields
                return 0;
            }
        });
        setStandards(sortedStandards);
    }



    function handleUpdateStandard() {
        updateStandard(currentStandardId, currentStandardName, currentMediumId);
        setIsUpdateModalOpen(false);
    }

    function handleEditAll() {
        setEditableStandards(standards.map(standard => ({
            ...standard,
            newName: standard.name,
            newMediumId: standard.parentref,
            toDelete: false,
        })));
        setIsEditAllModalOpen(true);
    }

    function handleUpdateAll() {
        try {
            const updatePromises = editableStandards.map(standard =>
                axios.put(`/api/standards/${standard.id}`, { name: standard.newName, parentref: standard.newMediumId })
            );
            const deletePromises = editableStandards
                .filter(standard => standard.toDelete)
                .map(standard => axios.delete(`/api/standards/${standard.id}`));

            Promise.all([...updatePromises, ...deletePromises]).then(() => {
                loadStandards();
                onStandardChange();
                showNotification('Standards updated successfully');
                setIsEditAllModalOpen(false);
                setMediums([]);
            });
        } catch (error) {
            console.error("Error editing standards:", error);
            //showNotification('Error editing standards');
            showErrorNotification('Error editing standards');
        }
    }

    function handleEditAllChange(id, field, value) {
        setEditableStandards(prevStandards =>
            prevStandards.map(standard =>
                standard.id === id ? { ...standard, [field]: value } : standard
            )
        );
    }

    function handleDeleteToggle(id) {
        setEditableStandards(prevStandards =>
            prevStandards.map(standard =>
                standard.id === id ? { ...standard, toDelete: !standard.toDelete } : standard
            )
        );
    }

    //filter functions

    // Define a new function to filter standards
    const filterStandards = (standards) => {
        const { standardName, mediumName, boardName } = standardFilters;
        return standards.filter((standard) => (
            (!standardName || standard.name.toLowerCase().includes(standardName.toLowerCase())) &&
            (!mediumName || standard.mediumName.includes(mediumName)) &&
            (!boardName || standard.boardName.includes(boardName))
        ));
    };

    // Filter the fetched standard based on the current filters
    const filteredStandards = filterStandards(fetchedStandards);

    // Define a new function to handle subject name filter changes
    const handleStandardNameChange = (e) => {
        setStandardFilters({ ...standardFilters, standardName: e.target.value.toUpperCase() });
    };

    // Define a new function to handle medium filter changes
    function handleMediumFilterChange(event) {
        const selectedMedium = event.target.value;
        setStandardFilters((prevFilters) => ({
            ...prevFilters,
            mediumName: selectedMedium,
        }));
    }

    // Define a new function to handle board filter changes
    function handleBoardFilterChange(event) {
        const selectedBoard = event.target.value;
        setStandardFilters((prevFilters) => ({
            ...prevFilters,
            boardName: selectedBoard,
        }));
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

    // Function to handle changes in the chapter name filter for edit all modal
    const handleEditAllFilterStandardNameChange = (event) => {
        setEditAllFilterStandardName(event.target.value.toUpperCase());
    };


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex justify-between">
                Manage Standards
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
                    placeholder="Add new standard"
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
                <button
                    onClick={addStandard}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Add Standard
                </button>
            </div>
            {notification && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{notification}</div>}
            {errornotification && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errornotification}</div>}

            <div className="overflow-x-auto">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-4">Filter Standards</h3>
                    <input
                        type="text"
                        placeholder="Search Standard Name"
                        value={standardFilters.standardName}
                        onChange={handleStandardNameChange}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <select
                        value={standardFilters.boardName}
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
                        value={standardFilters.mediumName}
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
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left">
                                <div className="flex items-center">
                                    Standard ID
                                    <button onClick={() => handleSort('id')} className="ml-1">
                                        {sortBy.field === 'id' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </button>
                                </div>
                            </th>
                            <th className="border-b p-2 text-left">
                                <div className="flex items-center">
                                    Standard Name
                                    <button onClick={() => handleSort('name')} className="ml-1">
                                        {sortBy.field === 'name' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </button>
                                </div>
                            </th>
                            <th className="border-b p-2 text-left">Medium Name</th>
                            <th className="border-b p-2 text-left">Board Name</th>
                            <th className="border-b p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStandards.map((standard) => (
                            <tr key={standard.id}>
                                <td className="border-b p-2">{standard.id}</td>
                                <td className="border-b p-2">{standard.name}</td>
                                <td className="border-b p-2">{standard.mediumName}</td>
                                <td className="border-b p-2">{standard.boardName}</td>
                                <td className="border-b p-2">
                                    <button
                                        onClick={() => {
                                            setCurrentStandardId(standard.id);
                                            setCurrentStandardName(standard.name);
                                            setCurrentMediumId(standard.parentref);
                                            setCurrentMediumName(standard.mediumName);
                                            setCurrentBoardName(standard.boardName);
                                            setIsUpdateModalOpen(true);
                                        }}
                                        className="p-1 bg-yellow-500 text-white rounded mr-2"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCurrentStandardToDelete(standard.id);
                                            setIsDeleteModalOpen(true);
                                        }}
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

            {/* Update Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white flex gap-10 p-6 px-35 rounded-lg shadow-md">

                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-4">Current Details:</p>
                            <p>Standard: {currentStandardName}</p>
                            <p>Medium Name: {currentMediumName}</p>
                            <p>Board Name: {currentBoardName}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Update Standard</h3>

                            <h5 className="text-lg font-semibold mb-4">Standard Name:</h5>
                            <input
                                type="text"
                                value={currentStandardName}
                                onChange={(e) => setCurrentStandardName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                placeholder="Standard Name"
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
                                    value={currentMediumId}
                                    onChange={(e) => setCurrentMediumId(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded mb-4"
                                >
                                    <option value="">Select Medium</option>
                                    {mediums.map((medium) => (
                                        <option key={medium.id} value={medium.id}>
                                            {medium.name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => {
                                        setIsUpdateModalOpen(false);
                                        //showNotification("Update Request Cancelled");
                                        showErrorNotification("Update Request Cancelled");
                                    }}
                                    className="p-2 bg-gray-400 text-white rounded mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStandard}
                                    className="p-2 bg-yellow-500 text-white rounded"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold mb-4">Delete Standard</h3>
                        <p>Are you sure you want to delete this standard?</p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    //showNotification("Delete request cancelled");
                                    showErrorNotification("Delete request cancelled");
                                }}
                                className="p-2 bg-gray-400 text-white rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteStandard(currentStandardToDelete);
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

            {/* Edit All Modal */}
            {isEditAllModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-3/4">
                        <h3 className="text-xl font-semibold mb-4">Edit Standards</h3>
                        
                        <div className="mb-4">
                            {/* Filter Bar */}
                            <h5 className="text-lg font-semibold mb-4">Filters:</h5>

                            <div className="flex justify-evenly ">

                                <div>
                                    <label className="block mb-1">Standard:</label>
                                    <input
                                        type="text"
                                        placeholder="Search Standard Name"
                                        value={editAllFilterStandardName}
                                        onChange={handleEditAllFilterStandardNameChange}
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
                            </div>
                        </div>
                        
                        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="min-w-full border-collapse">
                                <thead style={{ position: "sticky", top: 0, background: "white", 'z-index': "1" }}>
                                <tr>
                                    <th className="border-b p-2">ID</th>
                                    <th className="border-b p-2">Name</th>
                                    <th className="border-b p-2">Medium Name</th>
                                    <th className="border-b p-2">Board Name</th>
                                    <th className="border-b p-2">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editableStandards
                                .filter((standard) => {
                                    return (
                                        (!editAllFilterBoard || standard.boardName === editAllFilterBoard) &&
                                        (!editAllFilterMedium || standard.mediumName === editAllFilterMedium) &&
                                        (!editAllFilterStandardName || standard.name.toLowerCase().includes(editAllFilterStandardName.toLowerCase()))
                                    );
                                })
                                .map((standard) => (
                                    <tr key={standard.id}>
                                        <td className="border-b p-2">{standard.id}</td>
                                        <td className="border-b p-2">
                                            <input
                                                type="text"
                                                value={standard.newName}
                                                onChange={(e) => handleEditAllChange(standard.id, 'newName', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="border-b p-2">
                                            <select
                                                value={standard.newMediumId}
                                                onChange={(e) => handleEditAllChange(standard.id, 'newMediumId', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                            >
                                                <option value="">Select Medium</option>
                                                {filteredmediums.map((medium) => (
                                                    <option key={medium.id} value={medium.id}>
                                                        {`${medium.name} - (${medium.boardName})`}
                                                    </option>
                                                ))}
                                            </select>

                                        </td>
                                        <td className="border-b p-2">{standard.boardName}</td>
                                        <td className="border-b p-2">
                                            <button
                                                onClick={() => handleDeleteToggle(standard.id)}
                                                className={`p-1 ${standard.toDelete ? 'bg-gray-500' : 'bg-red-500'} text-white rounded`}
                                            >
                                                {standard.toDelete ? 'Undo' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsEditAllModalOpen(false);
                                    //showNotification('Edit request cancelled');
                                    showErrorNotification('Edit request cancelled');
                                }}
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

export default StandardForm;
