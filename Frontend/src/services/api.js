import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

function attachInterceptors(client) {
  client.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(err)
    }
  )

  return client
}

const api = attachInterceptors(
  axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  })
)

const formApi = attachInterceptors(
  axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true
  })
)

export const authApi = {
  login:    data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data)
}

export const productApi = {
  getAll:      ()         => api.get('/products'),
  getById:     id         => api.get(`/products/${id}`),
  create:      data       => api.post('/products', data),
  update:      (id, data) => api.put(`/products/${id}`, data),
  delete:      id         => api.delete(`/products/${id}`)
}

export const paymentMethodApi = {
  getAll:      ()         => api.get('/payment-methods'),
  getById:     id         => api.get(`/payment-methods/${id}`),
  create:      data       => api.post('/payment-methods', data),
  update:      (id, data) => api.put(`/payment-methods/${id}`, data),
  delete:      id         => api.delete(`/payment-methods/${id}`)
}

export const brandApi = {
  getAll:      ()         => api.get('/brands'),
  getById:     id         => api.get(`/brands/${id}`),
  create:      data       => api.post('/brands', data),
  update:      (id, data) => api.put(`/brands/${id}`, data),
  delete:      id         => api.delete(`/brands/${id}`)
}

export const productImageApi = {
  getAll:      ()         => api.get('/product-images'),
  getById:     id         => api.get(`/product-images/${id}`),
  create:      data       => api.post('/product-images', data),
  upload:      data       => formApi.post('/product-images/upload', data),
  update:      (id, data) => api.put(`/product-images/${id}`, data),
  delete:      id         => api.delete(`/product-images/${id}`)
}

export const cartApi = {
  get:    ()         => api.get('/cart'),
  add:    data       => api.post('/cart', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: id         => api.delete(`/cart/${id}`),
  clear:  ()         => api.delete('/cart/clear')
}

export const orderApi = {
  getAll:       ()           => api.get('/orders'),
  getById:      id           => api.get(`/orders/${id}`),
  create:       data         => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel:       id           => api.put(`/orders/${id}/cancel`)
}

export const userApi = {
  getProfile:    ()    => api.get('/users/profile'),
  updateProfile: data  => api.put('/users/profile', data),
  getAllUsers:    ()    => api.get('/users'),           // ✅ Admin lấy danh sách khách hàng
  toggleLock:    id    => api.put(`/users/${id}/toggle-lock`)
}

export const adminApi = {
  getAll: ()   => api.get('/users/admins'),  // ✅ Đổi từ /admins → /users/admins
  create: data => api.post('/admins', data),
  delete: id   => api.delete(`/admins/${id}`)
}

export const reportApi = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getRevenue:        () => api.get('/reports/revenue'),
  getTopProducts:    () => api.get('/reports/top-products')
}

export default api
