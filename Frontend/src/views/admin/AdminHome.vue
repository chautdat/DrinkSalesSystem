<template>
  <div class="admin-home">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="page-title">Tổng quan</h1>
        <p class="page-subtitle">Xin chào, Admin 👋</p>
      </div>
      <button 
        class="refresh-btn" 
        @click="loadDashboard" 
        :class="{ spinning: loading }" 
        :disabled="loading"
      >
        <span v-if="loading" class="spinner-small"></span>
        <span v-else class="refresh-icon">↻</span>
        {{ loading ? 'Đang tải...' : 'Làm mới dữ liệu' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Đang tải dữ liệu hệ thống...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div 
          v-for="card in statCards" 
          :key="card.label" 
          class="stat-card"
          :style="{ '--accent': card.color }"
        >
          <div class="stat-icon-wrapper">
            <span class="stat-icon">{{ card.icon }}</span>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </div>
      </div>

      <!-- Low Stock Warning -->
      <div v-if="lowStockProducts.length" class="warning-banner">
        <span class="warning-icon">⚠️</span>
        <span>
          Có <strong>{{ lowStockProducts.length }}</strong> sản phẩm sắp hết hàng (≤ 20)
        </span>
        <router-link to="/admin/products" class="warning-link">
          Xem chi tiết →
        </router-link>
      </div>

      <!-- Menu Section -->
      <div class="section-title">Quản lý hệ thống</div>
      <div class="menu-grid">
        <div 
          v-for="item in menuItems" 
          :key="item.title" 
          class="menu-card"
          :style="{ '--mc': item.color }"
          @click="$router.push(item.path)"
        >
          <div class="menu-icon-wrapper">
            <span class="menu-icon">{{ item.icon }}</span>
          </div>
          <div class="menu-content">
            <div class="menu-title">{{ item.title }}</div>
            <div class="menu-desc">{{ item.desc }}</div>
          </div>
          <span class="menu-arrow">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reportApi, productApi, orderApi, adminApi, userApi, promotionApi } from '../../services/api.js'

const loading = ref(false)
const stats = ref({
  products: 0, 
  orders: 0, 
  pending: 0,
  revenue: 0, 
  todayOrders: 0, 
  todayRevenue: 0,
  customers: 0, 
  adminCount: 0, 
  activePromotions: 0
})
const lowStockProducts = ref([])

const menuItems = [
  { title: 'Sản phẩm',      desc: 'Quản lý danh sách sản phẩm',    path: '/admin/products',   icon: '📦', color: '#1a73e8' },
  { title: 'Đơn hàng',      desc: 'Xem và xử lý đơn hàng',         path: '/admin/orders',     icon: '📋', color: '#34a853' },
  { title: 'Báo cáo',       desc: 'Thống kê doanh thu & sản phẩm', path: '/admin/dashboard',  icon: '📊', color: '#fbbc05' },
  { title: 'Khách hàng',    desc: 'Quản lý tài khoản người dùng',  path: '/admin/users',      icon: '👥', color: '#ea4335' },
  { title: 'Quản trị viên', desc: 'Quản lý tài khoản Admin',       path: '/admin/admins',     icon: '🛡️', color: '#8b5cf6' },
  { title: 'Khuyến mãi',    desc: 'Mã giảm giá & chương trình',   path: '/admin/promotions', icon: '🎟️', color: '#ec4899' },
  { title: 'Thanh toán',    desc: 'Phương thức thanh toán',       path: '/admin/payment-methods', icon: '💳', color: '#14b8a6' },
  { title: 'Thương hiệu',   desc: 'Danh mục brand sản phẩm',      path: '/admin/brands',     icon: '🏷️', color: '#f97316' }
]

const statCards = computed(() => [
  { label: 'Tổng sản phẩm',     value: stats.value.products.toLocaleString('vi-VN'),         icon: '📦', color: '#1a73e8' },
  { label: 'Tổng đơn hàng',     value: stats.value.orders.toLocaleString('vi-VN'),           icon: '📋', color: '#34a853' },
  { label: 'Đơn chờ xử lý',     value: stats.value.pending.toLocaleString('vi-VN'),          icon: '⏳', color: '#fbbc05' },
  { label: 'Doanh thu',          value: formatCurrency(stats.value.revenue),                  icon: '💰', color: '#ea4335' },
  { label: 'Đơn hôm nay',       value: stats.value.todayOrders.toLocaleString('vi-VN'),      icon: '📅', color: '#4285f4' },
  { label: 'Doanh thu hôm nay', value: formatCurrency(stats.value.todayRevenue),             icon: '📈', color: '#34a853' },
  { label: 'Tổng khách hàng',   value: stats.value.customers.toLocaleString('vi-VN'),        icon: '👥', color: '#9c27b0' },
  { label: 'Tài khoản Admin',   value: stats.value.adminCount.toLocaleString('vi-VN'),       icon: '🛡️', color: '#8b5cf6' },
  { label: 'Khuyến mãi',        value: stats.value.activePromotions.toLocaleString('vi-VN'), icon: '🎟️', color: '#ec4899' }
])

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0
  }).format(value || 0)
}

async function loadDashboard() {
  loading.value = true
  stats.value = {
    products: 0, orders: 0, pending: 0,
    revenue: 0, todayOrders: 0, todayRevenue: 0,
    customers: 0, adminCount: 0, activePromotions: 0
  }

  try {
    const [productsRes, ordersRes, revenueRes, promotionsRes] = await Promise.all([
      productApi.getAll(),
      orderApi.getAll(),
      reportApi.getRevenue(),
      promotionApi.getAll()
    ])

    // Sản phẩm
    const products = Array.isArray(productsRes.data) ? productsRes.data : []
    stats.value.products = products.length
    lowStockProducts.value = products.filter(p => Number(p.stock ?? 0) <= 20 && Number(p.stock ?? 0) > 0)

    // Đơn hàng
    const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : []
    stats.value.orders  = allOrders.length
    stats.value.pending = allOrders.filter(o => o.status === 'Pending').length

    // Doanh thu tổng
    stats.value.revenue = revenueRes.data?.totalRevenue ?? 0

    // Đơn hôm nay
    const todayStr = new Date().toLocaleDateString('en-CA')
    const validStatuses = ['Shipping', 'Completed', 'Shipped', 'Delivered']
    const todayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt).toLocaleDateString('en-CA')
      return d === todayStr && validStatuses.includes(o.status)
    })
    stats.value.todayOrders  = todayOrders.length
    stats.value.todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)

    // Khách hàng
    try {
      const usersRes = await userApi.getAllUsers()
      stats.value.customers = Array.isArray(usersRes.data) ? usersRes.data.length : 0
    } catch (e) { 
      console.warn('Không tải được khách hàng:', e) 
    }

    // Admin
    try {
      const adminsRes = await adminApi.getAll()
      stats.value.adminCount = Array.isArray(adminsRes.data) ? adminsRes.data.length : 0
    } catch (e) { 
      console.warn('Không tải được Admin:', e) 
    }

    const promotions = Array.isArray(promotionsRes.data) ? promotionsRes.data : []
    const now = Date.now()
    stats.value.activePromotions = promotions.filter(p => {
      const expireTime = p.expireDate ? new Date(p.expireDate).getTime() : null
      const maxUsage = Number(p.maxUsage || 0)
      const usageCount = Number(p.usageCount || 0)
      return p.isActive !== false && (!expireTime || expireTime >= now) && (maxUsage <= 0 || usageCount < maxUsage)
    }).length

  } catch (e) {
    console.error('Lỗi load dashboard:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.admin-home {
  padding: 40px 32px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 34px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 15.5px;
  margin-top: 6px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  background: #0f172a;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14.5px;
  cursor: pointer;
  transition: all 0.25s;
}

.refresh-btn:hover:not(:disabled) {
  background: #1e2937;
  transform: translateY(-2px);
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border-left: 5px solid var(--accent);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f1f5f9;           /* Thay color-mix bằng màu cố định an toàn */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  flex-shrink: 0;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.warning-banner {
  background: #fefce8;
  border: 1px solid #facc15;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;
  font-size: 15px;
  color: #854d0e;
}

.warning-link {
  margin-left: auto;
  color: #d97706;
  font-weight: 600;
  text-decoration: none;
}

.warning-link:hover {
  text-decoration: underline;
}

.section-title {
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.menu-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.menu-card:hover {
  border-color: var(--mc);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.menu-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #f1f5f9;           /* Thay color-mix bằng màu cố định */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 16.5px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.menu-desc {
  font-size: 13.5px;
  color: #64748b;
}

.menu-arrow {
  font-size: 24px;
  color: #94a3b8;
  transition: all 0.3s;
}

.menu-card:hover .menu-arrow {
  transform: translateX(8px);
  color: var(--mc);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  color: #64748b;
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 6px solid #e2e8f0;
  border-top-color: #1e40af;
  border-radius: 50%;
  animation: spin 1.1s linear infinite;
  margin-bottom: 20px;
}
</style>
