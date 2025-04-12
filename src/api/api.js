import axios from 'axios'
const api = axios.create({
    baseURL: 'https://ridan-express-backend-yucx.onrender.com/api'
})
export default api