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
        console.error('Error creating/updating mahasiswa:', error);
        throw error;
    }
};

export const deleteMahasiswa = async (id) => {
    return await axios.delete(`${API_BASE_URL}/mahasiswa/${id}`);
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

// api.js
export const createEvent = async (eventData) => {
    const response = await axios.post(`${API_BASE_URL}/event`, eventData);
    return response.data; // Pastikan mengandung _id
};

export const updateEvent = async (id, eventData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/event/${id}`, eventData);
        return {
            _id: id,
            judul: response.data.judul || eventData.judul,
            deskripsi: response.data.deskripsi || eventData.deskripsi,
            lokasi: response.data.lokasi || eventData.lokasi,
            tanggal: response.data.tanggal || eventData.tanggal,
        };
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/event/${id}`);
        return response.data; // Pastikan mengembalikan konfirmasi sukses
    } catch (error) {
        console.error('Error deleting event:', error);
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