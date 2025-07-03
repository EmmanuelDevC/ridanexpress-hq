import axios from 'axios'
const api = axios.create({
    baseURL: 'https://martafrik-api.onrender.com',
    withCredentials: true,
})
export default api