import axios from 'axios';

const API_BASE_URL = 'https://fostipresensiapi.vercel.app/api';

export const getMahasiswa = async (divisi) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/mahasiswa`, {
            params: { divisi } // Correctly pass divisi as a query parameter
        });

        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        console.error('Format data mahasiswa tidak valid:', response.data);
        return [];
    } catch (error) {
        console.error('Error fetching mahasiswa:', error.response?.data || error.message || error);
        return [];
    }
};

export const createMahasiswa = async (data, method = "POST", url = "/mahasiswa") => {
    try {
        const response = await axios({
            method,
            url: `${API_BASE_URL}${url}`,
            data,
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
                return status < 500;
            }
        });

        if (response.status >= 400) {
            throw new Error(response.data.message || 'Gagal menyimpan data mahasiswa');
        }

        return response.data;
    } catch (error) {
        console.error('Error creating/updating mahasiswa:', error.response?.data || error.message || error);
        throw error;
    }
};

export const deleteMahasiswa = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/mahasiswa/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting mahasiswa:', error.response?.data || error.message || error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/event`);
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        console.error('Format data events tidak valid:', response.data);
        return [];
    } catch (error) {
        console.error('Error fetching events:', error.response?.data || error.message || error);
        return [];
    }
};

export const getEventById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/event/${id}`);
        // The Postman example shows "data" nested inside the main response object
        if (response.data && response.data.data) {
            return response.data; // Return the full response.data which contains 'data' property
        }
        throw new Error("Event data not found or invalid format.");
    } catch (error) {
        console.error(`Error fetching event by ID ${id}:`, error.response?.data || error.message || error);
        throw error;
    }
};

export const createEvent = async (eventData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/event`, eventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error.response?.data || error.message || error);
        throw error;
    }
};

export const updateEvent = async (id, eventData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/event/${id}`, eventData);
        // Assuming your backend returns the updated event directly, or we can use eventData
        return response.data;
    } catch (error) {
        console.error('Error updating event:', error.response?.data || error.message || error);
        throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/event/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting event:', error.response?.data || error.message || error);
        throw error;
    }
};

export const presensiMasuk = async (uid) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/log/masuk`, { uid });
        return response.data;
    } catch (error) {
        console.error('Error presensi masuk:', error.response?.data || error.message || error);
        throw error;
    }
};

export const presensiKeluar = async (uid) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/log/keluar`, { uid });
        return response.data;
    } catch (error) {
        console.error('Error presensi keluar:', error.response?.data || error.message || error);
        throw error;
    }
};