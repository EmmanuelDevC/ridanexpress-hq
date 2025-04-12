import axios from 'axios'
const api = axios.create({
    baseURL: 'https://ridan-express-backend-wpxq.onrender.com/api'
})
export default api