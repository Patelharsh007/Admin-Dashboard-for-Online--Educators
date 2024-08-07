import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function BoardForm({ reloadKey, onBoardChange }) {
    const [boards, setBoards] = useState([]);
    const [name, setName] = useState('');
    const [notification, setNotification] = useState('');
    const [errornotification, setErrorNotification] = useState('');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentBoardId, setCurrentBoardId] = useState('');
    const [currentBoardName, setCurrentBoardName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentBoardToDelete, setCurrentBoardToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableBoards, setEditableBoards] = useState([]);
    const [sortBy, setSortBy] = useState({ field: '', order: '' });

    const [boardFilters, setBoardFilters] = useState({
        chapterName: "",
        subjectName: "",
        standardName: "",
        mediumName: "",
        boardName: "",
    });

     // Define state variables for edit all modal
     const [editAllFilterBoardName, setEditAllFilterBoardName] = useState("");

    // Define state variable for fetched board
    const [fetchedBoards, setFetchedBoards] = useState([]);

    // Fetch board on component mount or when reloadKey changes
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/api/boards'); // Replace with your API endpoint
            setFetchedBoards(response.data);
        };
        fetchData();
    }, [reloadKey]); // Dependency array includes reloadKey

    useEffect(() => {
        loadBoards();
    }, [reloadKey]); // Reload when reloadKey changes

    useEffect(() => {
        if (isEditModalOpen) {
            loadBoards();
        }
    }, [isEditModalOpen]);

    async function loadBoards() {
        try {
            const response = await axios.get('/api/boards');
            setBoards(response.data);
        } catch (error) {
            console.error("Error loading boards:", error);
            showErrorNotification('Error loading boards');
        }
    }

    async function addBoard() {
        try {
            if (!name.trim()) {
                //alert("Please enter a valid board name.");
                showErrorNotification('Please enter a valid board name.');
                return;
            }

            const response = await axios.post('/api/boards', { name });
            const { message } = response.data;

            setName('');
            onBoardChange(); // Trigger reload
            showNotification(message);
        } catch (error) {
            console.error("Error adding board:", error);
            //showNotification('Error adding board');
            showErrorNotification('Error adding board');
        }
    }

    async function deleteBoard(id) {
        try {
            const response = await axios.delete(`/api/boards/${id}`);
            const { message } = response.data;
            loadBoards();
            onBoardChange();
            showNotification(message);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                //showNotification(error.response.data.message);
                showErrorNotification(error.response.data.message);
            } else {
                //showNotification('Error deleting board.');
                showErrorNotification('Error deleting board');
            }
        }
    }

    function updateBoard(id, currentName) {
        setCurrentBoardId(id);
        setCurrentBoardName(currentName);
        setIsUpdateModalOpen(true);
    }

    async function handleUpdateBoard(newName) {
        try {
            const response = await axios.put(`/api/boards/${currentBoardId}`, { name: newName });
            const { message } = response.data;

            loadBoards();
            onBoardChange();
            showNotification(message);
        } catch (error) {
            console.error("Error updating board:", error);
            //showNotification('Error updating board');
            showErrorNotification('Error updating board');
        }
    }

    async function handleEditBoards() {
        try {
            const updatePromises = editableBoards.map(board =>
                axios.put(`/api/boards/${board.id}`, { name: board.name })
            );
            const deletePromises = editableBoards
                .filter(board => board.toDelete)
                .map(board => axios.delete(`/api/boards/${board.id}`));

            await Promise.all([...updatePromises, ...deletePromises]);
            loadBoards();
            onBoardChange();
            showNotification('Boards updated successfully');
        } catch (error) {
            console.error("Error editing boards:", error);
            //showNotification('Error editing boards');
            showErrorNotification('Error editing boards');
        }
        setIsEditModalOpen(false);
    }

    // function cancelUpdate() {
    //     setIsUpdateModalOpen(false);
    //     //showNotification('Update request cancelled');
    //     showErrorNotification('Update request cancelled');
    // }

    function handleEditChange(id, newName) {
        setEditableBoards(prevBoards =>
            prevBoards.map(board =>
                board.id === id ? { ...board, name: newName } : board
            )
        );
    }

    function handleDeleteToggle(id) {
        setEditableBoards(prevBoards =>
            prevBoards.map(board =>
                board.id === id ? { ...board, toDelete: !board.toDelete } : board
            )
        );
    }

    //nnot used
    // function handleSort(field) {
    //     const order = sortBy.field === field && sortBy.order === 'asc' ? 'desc' : 'asc';
    //     setSortBy({ field, order });
    //     const sortedBoards = [...boards].sort((a, b) => {
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
    //     setBoards(sortedBoards);
    // }

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

    // Define a new function to filter boards
    const filterBoards = (boards) => {
        const { boardName } = boardFilters;
        return boards.filter((board) => (
            (!boardName || board.name.toLowerCase().includes(boardName.toLowerCase()))
        ));
    };

    // Filter the fetched boards based on the current filters
    const filteredBoards = filterBoards(fetchedBoards);

    const handleBoardNameChange = (e) => {
        setBoardFilters({ ...boardFilters, boardName: e.target.value.toUpperCase() });
    };

     // Function to handle changes in the board name filter for edit all modal
     const handleEditAllFilterBoardNameChange = (event) => {
        setEditAllFilterBoardName(event.target.value.toUpperCase());
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex justify-between">
                Manage Boards
                <button
                    onClick={() => {
                        setEditableBoards(boards.map(board => ({ ...board, toDelete: false })));
                        setIsEditModalOpen(true);
                    }}
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
                    placeholder="Add new board"
                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                />
                <button
                    onClick={addBoard}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Add Board
                </button>
            </div>
            {notification && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{notification}</div>}
            {errornotification && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errornotification}</div>}

            <div className="overflow-x-auto">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-4">Filter Boards</h3>
                    <input
                        type="text"
                        placeholder="Search Board Name"
                        value={boardFilters.boardName}
                        onChange={handleBoardNameChange}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />

                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left">
                                <div className="flex items-center">
                                    Board ID
                                    {/* <button onClick={() => handleSort('id')} className="ml-1">
                                        {sortBy.field === 'id' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </button> */}
                                </div>
                            </th>
                            <th className="border-b p-2 text-left">
                                <div className="flex items-center">
                                    Board Name
                                    {/* <button onClick={() => handleSort('name')} className="ml-1">
                                        {sortBy.field === 'name' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </button> */}
                                </div>
                            </th>
                            <th className="border-b p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBoards.map((board) => (
                            <tr key={board.id}>
                                <td className="border-b p-2">{board.id}</td>
                                <td className="border-b p-2">{board.name}</td>
                                <td className="border-b p-2">
                                    <button
                                        onClick={() => updateBoard(board.id, board.name)}
                                        className="p-1 bg-yellow-500 text-white rounded mr-2"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCurrentBoardName(board.name);
                                            setCurrentBoardToDelete(board);
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

            {/* Update Board Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white flex gap-10 p-6 px-35 rounded-lg shadow-md">
                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-4">Current Details:</p>
                            <p>Board Name: {currentBoardName}</p>

                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Update Board</h3>


                            <h5 className="text-lg font-semibold mb-4">Board Name:</h5>

                            <input
                                type="text"
                                value={currentBoardName}
                                onChange={(e) => setCurrentBoardName(e.target.value)}
                                placeholder="Enter new board name"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                            />
                            <div className="flex justify-between">
                                <button
                                    onClick={() => {
                                        setIsUpdateModalOpen(false);
                                        setCurrentBoardToDelete(null);
                                        //showNotification('Update request cancelled');
                                        showErrorNotification('Update request cancelled');
                                    }}
                                    className="p-2 bg-gray-400 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleUpdateBoard(currentBoardName);
                                        setIsUpdateModalOpen(false);
                                    }}
                                    className="p-2 bg-yellow-500 text-white rounded"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Board Modal */}
            {isDeleteModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Delete Board</h2>
                        <p className="mb-2">Are you sure you want to delete this board?</p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setCurrentBoardToDelete(null);
                                    //showNotification('Delete request cancelled');
                                    showErrorNotification('Delete request cancelled');
                                }}
                                className="p-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteBoard(currentBoardToDelete.id);
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

            {/* Edit Boards Modal */}
            {isEditModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg w-3/4 max-w-4xl">
                        <h3 className="text-xl font-semibold mb-4">Edit Boards</h3>

                        <div className="mb-4">
                            {/* Filter Bar */}
                            <h5 className="text-lg font-semibold mb-4">Filters:</h5>

                            <div className="flex">

                                <div>
                                    <label className="block mb-1">Board:</label>
                                    <input
                                        type="text"
                                        placeholder="Search Board Name"
                                        value={editAllFilterBoardName}
                                        onChange={handleEditAllFilterBoardNameChange}
                                        className="p-2 border border-gray-300 rounded mr-2"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="min-w-full border-collapse">
                                <thead style={{ position: "sticky", top: 0, background: "white", 'z-index': "1" }}>
                                    <tr>
                                        <th className="border-b p-2 text-left">Board ID</th>
                                        <th className="border-b p-2 text-left">Board Name</th>
                                        <th className="border-b p-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableBoards
                                    .filter((board) => {
                                        return (
                                            (!editAllFilterBoardName || board.name.toLowerCase().includes(editAllFilterBoardName.toLowerCase()))
                                        );
                                    })
                                    .map(board => (
                                        <tr key={board.id}>
                                            <td className="border-b p-2">{board.id}</td>
                                            <td className="border-b p-2">
                                                <input
                                                    type="text"
                                                    value={board.name}
                                                    onChange={(e) => handleEditChange(board.id, e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="border-b p-2">
                                                <button
                                                    onClick={() => handleDeleteToggle(board.id)}
                                                    className={`p-1 ${board.toDelete ? 'bg-gray-500' : 'bg-red-500'} text-white rounded`}
                                                >
                                                    {board.toDelete ? 'Undo' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    //showNotification('Edit request cancelled');
                                    showErrorNotification('Edit request cancelled');
                                }}
                                className="p-2 bg-gray-400 text-white rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditBoards}
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

export default BoardForm;
