import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function MediumForm({ reloadKey, onMediumChange }) {
    const [mediums, setMediums] = useState([]);
    const [name, setName] = useState('');
    const [boardId, setBoardId] = useState('');
    const [boards, setBoards] = useState([]);
    const [notification, setNotification] = useState('');
    const [sortBy, setSortBy] = useState({ field: '', order: '' });
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentMediumId, setCurrentMediumId] = useState('');
    const [currentMediumName, setCurrentMediumName] = useState('');
    const [currentMediumBoardId, setCurrentMediumBoardId] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentMediumToDelete, setCurrentMediumToDelete] = useState(null);
    const [currentBoardName, setCurrentBoardName] = useState('');


    const [currentBoardId, setCurrentBoardId] = useState('');
    const [isEditAllModalOpen, setIsEditAllModalOpen] = useState(false);
    const [editableMediums, setEditableMediums] = useState([]);


    useEffect(() => {
        loadMediums();
        loadBoards();
    }, [reloadKey]); // Reload when reloadKey changes

    async function loadMediums() {
        try {
            const response = await axios.get('/api/mediums');
            setMediums(response.data);
        } catch (error) {
            console.error("Error loading mediums:", error);
        }
    }

    async function loadBoards() {
        try {
            const response = await axios.get('/api/boards');
            setBoards(response.data);
        } catch (error) {
            console.error("Error loading boards:", error);
        }
    }

    async function addMedium() {
        try {
            if (!name.trim() || !boardId.trim()) {
                alert("Please enter a valid medium name and select a board.");
                return;
            }

            const response = await axios.post('/api/mediums', { name, parentref: boardId });
            const { message } = response.data;
            setName('');
            setBoardId('');
            onMediumChange(); // Trigger reload
            showNotification(message);
        } catch (error) {
            console.error("Error adding medium:", error);
            showNotification('Error adding medium');
        }
    }

    async function updateMedium(id, newName, newBoardId) {
        try {
            const response = await axios.put(`/api/mediums/${id}`, { name: newName, parentref: newBoardId });
            const { message } = response.data;
            loadMediums();
            showNotification(message);
            onMediumChange();
        } catch (error) {
            console.error("Error updating medium:", error);
            showNotification('Error updating medium');
        }
    }

    async function deleteMedium(id) {
        try {
            const response = await axios.delete(`/api/mediums/${id}`);
            const { message } = response.data;
            loadMediums();
            showNotification(message);
            onMediumChange();
        } catch (error) {
            console.error("Error deleting medium:", error);
            if (error.response && error.response.data && error.response.data.message) {
                showNotification(error.response.data.message);
            } else {
                showNotification('Error deleting medium');
            }
        }
    }

    function showNotification(message) {
        setNotification(message);
        setTimeout(() => {
            setNotification('');
        }, 5000);
    }

    function handleSort(field) {
        const order = sortBy.field === field && sortBy.order === 'asc' ? 'desc' : 'asc';
        setSortBy({ field, order });
        const sortedMediums = [...mediums].sort((a, b) => {
            if (field === 'id') {
                return order === 'asc' ? a.id - b.id : b.id - a.id;
            } else {
                const nameA = a[field].toLowerCase();
                const nameB = b[field].toLowerCase();
                if (nameA < nameB) return order === 'asc' ? -1 : 1;
                if (nameA > nameB) return order === 'asc' ? 1 : -1;
                return 0;
            }
        });
        setMediums(sortedMediums);
    }

    function handleUpdateMedium() {
        updateMedium(currentMediumId, currentMediumName, currentMediumBoardId);
        setIsUpdateModalOpen(false);
    }

    function handleEditAll() {
        setEditableMediums(mediums.map(medium => ({ ...medium, newName: medium.name, newBoardId: medium.parentref })));
        setIsEditAllModalOpen(true);
    }

    function handleUpdateAll() {
        try {
            const updatePromises = editableMediums.map(medium =>
                axios.put(`/api/mediums/${medium.id}`, { name: medium.newName, parentref: medium.newBoardId })
            );
            const deletePromises = editableMediums
                .filter(medium => medium.toDelete)
                .map(medium => axios.delete(`/api/mediums/${medium.id}`));

            Promise.all([...updatePromises, ...deletePromises]).then(() => {
                loadMediums();
                onMediumChange();
                showNotification('Mediums updated successfully');
                setIsEditAllModalOpen(false);
            });
        } catch (error) {
            console.error("Error editing mediums:", error);
            showNotification('Error editing mediums');
        }
    }

    function handleEditAllChange(id, field, value) {
        setEditableMediums(prevMediums =>
            prevMediums.map(medium =>
                medium.id === id ? { ...medium, [field]: value } : medium
            )
        );
    }

    function handleDeleteToggle(id) {
        setEditableMediums(prevMediums =>
            prevMediums.map(medium =>
                medium.id === id ? { ...medium, toDelete: !medium.toDelete } : medium
            )
        );
    }


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex justify-between">
                Manage Mediums
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
                    placeholder="Add new medium"
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
                <button
                    onClick={addMedium}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Add Medium
                </button>
            </div>
            {notification && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{notification}</div>}
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border-b p-2 text-left">
                            <div className="flex items-center">
                                Medium ID
                                <button onClick={() => handleSort('id')} className="ml-1">
                                    {sortBy.field === 'id' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                </button>
                            </div>
                        </th>
                        <th className="border-b p-2 text-left">
                            <div className="flex items-center">
                                Medium Name
                                <button onClick={() => handleSort('name')} className="ml-1">
                                    {sortBy.field === 'name' ? (sortBy.order === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                </button>
                            </div>
                        </th>
                        {/* <th className="border-b p-2 text-left">Board ID</th> */}
                        <th className="border-b p-2 text-left">Board Name</th>
                        <th className="border-b p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mediums.map((medium) => (
                        <tr key={medium.id}>
                            <td className="border-b p-2">{medium.id}</td>
                            <td className="border-b p-2">{medium.name}</td>
                            {/* <td className="border-b p-2">{medium.parentref}</td> */}
                            <td className="border-b p-2">{boards.find(board => board.id === medium.parentref)?.name || 'N/A'}</td>
                            <td className="border-b p-2">
                                <button
                                    onClick={() => {
                                        setCurrentMediumId(medium.id);
                                        setCurrentMediumName(medium.name);
                                        setCurrentMediumBoardId(medium.parentref);
                                        setCurrentBoardName(boards.find(board => board.id === medium.parentref)?.name || 'N/A');
                                        setIsUpdateModalOpen(true);
                                    }}
                                    className="p-1 bg-yellow-500 text-white rounded mr-2"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentMediumToDelete(medium);
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

            {/* Edit All Modal */}
            {isEditAllModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg w-3/4 max-w-4xl">
                        <h2 className="text-xl font-semibold mb-4">Edit Mediums</h2>
                        <table className="w-full border-collapse mb-4">
                            <thead>
                                <tr>
                                    <th className="border-b p-2 text-left">Medium ID</th>
                                    <th className="border-b p-2 text-left">Medium Name</th>
                                    <th className="border-b p-2 text-left">Board Name</th>
                                    {/* <th className="border-b p-2 text-left">Board Name</th> */}
                                    <th className="border-b p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editableMediums.map((medium) => (
                                    <tr key={medium.id}>
                                        <td className="border-b p-2">{medium.id}</td>
                                        <td className="border-b p-2">
                                            <input
                                                type="text"
                                                value={medium.newName}
                                                onChange={(e) => handleEditAllChange(medium.id, 'newName', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="border-b p-2">
                                            <select
                                                value={medium.newBoardId}
                                                onChange={(e) => handleEditAllChange(medium.id, 'newBoardId', e.target.value)}
                                                className="p-2 border border-gray-300 rounded"
                                            >
                                                <option value="">Select board</option>
                                                {boards.map((board) => (
                                                    <option key={board.id} value={board.id}>
                                                        {board.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        {/* <td className="border-b p-2">{boards.find(board => board.id === medium.newBoardId)?.name || 'N/A'}</td> */}
                                        <td className="border-b p-2">
                                            <button
                                                onClick={() => handleDeleteToggle(medium.id)}
                                                className={`p-1 ${medium.toDelete ? 'bg-gray-500' : 'bg-red-500'} text-white rounded`}
                                            >
                                                {medium.toDelete ? 'Undo' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    setIsEditAllModalOpen(false);
                                    showNotification('Edit request canceled');
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



            {/* Update Medium Modal */}
            {isUpdateModalOpen && (

                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">

                        <div className="mb-4">
                            <p className="text-lg font-semibold mb-4">Current Details:</p>
                            <p>Medium Name: {currentMediumName}</p>
                            <p>Board Name: {currentBoardName}</p>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Update Medium</h3>

                        <h5 className="text-lg font-semibold mb-4">Medium Name:</h5>
                        <input
                            type="text"
                            value={currentMediumName}
                            onChange={(e) => setCurrentMediumName(e.target.value)}
                            placeholder="Enter new medium name"
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                        />

                        <div className="mb-4">

                            <h5 className="text-lg font-semibold mb-4">Select Board:</h5>
                            <select
                                value={currentMediumBoardId}
                                onChange={(e) => setCurrentMediumBoardId(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                            >
                                {boards.map(board => (
                                    <option key={board.id} value={board.id}>
                                        {board.name}
                                    </option>
                                ))}
                            </select>


                        </div>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsUpdateModalOpen(false);
                                    setCurrentMediumToDelete(null);
                                    showNotification('Update request canceled');
                                }}
                                className="p-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateMedium}
                                className="p-2 bg-yellow-500 text-white rounded"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>)}

            {/* Delete Medium Modal */}
            {isDeleteModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Delete Medium</h2>
                        <p className="mb-2">Are you sure you want to delete this medium?</p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setCurrentMediumToDelete(null);
                                    showNotification('Delete request canceled');
                                }}
                                className="p-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteMedium(currentMediumToDelete.id);
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
        </div>
    );
}

export default MediumForm;
