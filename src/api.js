import axios from 'axios';

const API_BASE_URL = 'https://fostipresensiapi.vercel.app/api';

export const getMahasiswa = async (divisi) => {

    try {
        const response = await axios.get(`${API_BASE_URL}/mahasiswa`, { divisi });

        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
    } catch (error) {
        console.error('Error fetching mahasiswa:', error.response || error);
        return []; // Selalu return array meskipun error
    }
};

export const createMahasiswa = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/mahasiswa`, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
                return status < 500; // Reject only if status is 500 or above
            }
        });

        if (response.status >= 400) {
            throw new Error(response.data.message || 'Gagal menyimpan data mahasiswa');
        }

        return response.data;
    } catch (error) {
        console.error('Error creating mahasiswa:', error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/event`);

        // Ekstrak array events dari response.data.data
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        console.error('Format data tidak valid:', response.data);
        return [];
    } catch (error) {
        console.error('Error fetching events:', error.response || error);
        return [];
    }
};

export const createEvent = async (eventData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/event`, eventData);
        console.log('Event created:', response.data); // Debug log
        return response.data; // Pastikan backend mengembalikan data event yang baru dibuat
    } catch (error) {
        console.error('Error creating event:', error.response || error);
        throw error;
    }
};

export const presensiMasuk = async (uid) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/log/masuk`, { uid });
        return response.data;
    } catch (error) {
        console.error('Error presensi masuk:', error);
        throw error;
    }
};

export const presensiKeluar = async (uid) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/log/keluar`, { uid });
        return response.data;
    } catch (error) {
        console.error('Error presensi keluar:', error);
        throw error;
    }
};