<template>
  <div class="home-page">

    <!-- Welcome banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-icon">💧</div>
        <div>
          <h1 class="welcome-title">Chào mừng, {{ user?.email }}</h1>
          <p class="welcome-sub">
            <span :class="isAdmin ? 'role-badge-admin' : 'role-badge-user'">
              {{ isAdmin ? 'Quản trị viên' : 'Nhân viên' }}
            </span>
            Hệ thống quản lý Mineral Water
          </p>
        </div>
      </div>
    </div>

    <div class="container">

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8f0fe">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#1a73e8" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <div class="stat-label">Tổng sản phẩm</div>
            <div class="stat-value">{{ stats.products }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#e6f4ea">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#34a853" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div>
            <div class="stat-label">
              {{ isAdmin ? 'Tổng đơn hàng' : 'Đơn hàng của bạn' }}
            </div>
            <div class="stat-value">{{ stats.orders }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#fef9e7">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#fbbc04" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div class="stat-label">Đơn chờ xử lý</div>
            <div class="stat-value">{{ stats.pending }}</div>
          </div>
        </div>

        <!-- Doanh thu chỉ Admin -->
        <div v-if="isAdmin" class="stat-card">
          <div class="stat-icon" style="background:#fce8e6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#ea4335" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div>
            <div class="stat-label">Tổng doanh thu</div>
            <div class="stat-value" style="font-size:18px">
              {{ fmt(stats.revenue) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Menu cards -->
      <h2 class="section-title">Chức năng</h2>
      <div class="menu-grid">

        <div class="menu-card" @click="$router.push('/products')">
          <div class="menu-icon" style="background:#e8f0fe">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#1a73e8" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="menu-info">
            <div class="menu-title">Sản phẩm</div>
            <div class="menu-desc">
              {{ isAdmin ? 'Thêm, sửa, xóa sản phẩm' : 'Xem danh sách sản phẩm' }}
            </div>
          </div>
          <div class="menu-arrow">→</div>
        </div>

        <div class="menu-card" @click="$router.push('/orders')">
          <div class="menu-icon" style="background:#e6f4ea">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#34a853" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div class="menu-info">
            <div class="menu-title">Đơn hàng</div>
            <div class="menu-desc">
              {{ isAdmin ? 'Quản lý và cập nhật trạng thái đơn' : 'Xem và tạo đơn hàng của bạn' }}
            </div>
          </div>
          <div class="menu-arrow">→</div>
        </div>

        <!-- Báo cáo chỉ Admin -->
        <div v-if="isAdmin" class="menu-card" @click="$router.push('/dashboard')">
          <div class="menu-icon" style="background:#fce8e6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#ea4335" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>
          </div>
          <div class="menu-info">
            <div class="menu-title">Báo cáo</div>
            <div class="menu-desc">Doanh thu và top sản phẩm bán chạy</div>
          </div>
          <div class="menu-arrow">→</div>
        </div>

      </div>

      <!-- Đơn hàng gần đây -->
      <h2 class="section-title" style="margin-top:32px">
        {{ isAdmin ? 'Đơn hàng gần đây' : 'Đơn hàng của bạn' }}
      </h2>
      <div class="card">
        <div v-if="loadingOrders" class="loading-text">Đang tải…</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width:60px">ID</th>
                <th>User ID</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in recentOrders" :key="o.id">
                <td style="color:#9aa0a6">#{{ o.id }}</td>
                <td>User #{{ o.userId }}</td>
                <td style="font-weight:600;color:#1a73e8">{{ fmt(o.total) }}</td>
                <td>
                  <span :class="`badge ${badgeOf(o.status)}`">
                    {{ labelOf(o.status) }}
                  </span>
                </td>
                <td style="color:#9aa0a6;font-size:13px">
                  {{ fmtDate(o.createdAt) }}
                </td>
              </tr>
              <tr v-if="!recentOrders.length">
                <td colspan="5" class="loading-text">Chưa có đơn hàng nào.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:14px;text-align:right">
          <button class="btn btn-secondary btn-sm"
            @click="$router.push('/orders')">
            Xem tất cả →
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productApi, orderApi, reportApi } from '../services/api.js'

const user    = computed(() => JSON.parse(sessionStorage.getItem('user') || '{}'))
const isAdmin = computed(() => user.value?.role === 'Admin')

const loadingOrders = ref(true)
const recentOrders  = ref([])
const stats = ref({ products: 0, orders: 0, pending: 0, revenue: 0 })

const LABELS = {
  Pending: 'Chờ xác nhận', Confirmed: 'Đã xác nhận',
  Shipped: 'Đang giao',    Delivered: 'Đã giao', Cancelled: 'Đã hủy'
}
const BADGES = {
  Pending: 'badge-warning', Confirmed: 'badge-info',
  Shipped: 'badge-ok',      Delivered: 'badge-ok', Cancelled: 'badge-danger'
}
const labelOf = s => LABELS[s] ?? s
const badgeOf = s => BADGES[s] ?? 'badge-info'

async function loadStats() {
  try {
    // Load sản phẩm
    const { data: products } = await productApi.getAll()
    stats.value.products = Array.isArray(products) ? products.length : 0

    // Load đơn hàng — backend tự lọc theo role
    const { data: orders } = await orderApi.getAll()
    const list = Array.isArray(orders) ? orders : []
    stats.value.orders  = list.length
    stats.value.pending = list.filter(o => o.status === 'Pending').length

    // 5 đơn gần nhất
    recentOrders.value = list.slice(-5).reverse()

    // Doanh thu chỉ Admin
    if (isAdmin.value) {
      const { data: rev } = await reportApi.getRevenue()
      stats.value.revenue = rev?.totalRevenue ?? 0
    }
  } catch (e) {
    console.error('Load stats error:', e)
  } finally {
    loadingOrders.value = false
  }
}

const fmt = v =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const fmtDate = d => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '—'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

onMounted(loadStats)
</script>

<style scoped>
.home-page { min-height: 100vh; background: #f5f7fa; }
.welcome-banner {
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  padding: 32px 24px; color: #fff;
}
.welcome-content {
  max-width: 1140px; margin: 0 auto;
  display: flex; align-items: center; gap: 20px;
}
.welcome-icon  { font-size: 48px; }
.welcome-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
.welcome-sub   { font-size: 14px; opacity: 0.85; display: flex; align-items: center; gap: 8px; }
.role-badge-admin {
  background: rgba(255,255,255,0.25); padding: 2px 10px;
  border-radius: 10px; font-size: 12px; font-weight: 600;
}
.role-badge-user {
  background: rgba(255,255,255,0.2); padding: 2px 10px;
  border-radius: 10px; font-size: 12px; font-weight: 600;
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px; margin: 24px 0;
}
.stat-card {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 10px; padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
}
.stat-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-label { font-size: 12.5px; color: #9aa0a6; margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: #1e2329; }
.section-title { font-size: 16px; font-weight: 600; color: #1e2329; margin-bottom: 14px; }
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}
.menu-card {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 12px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s;
}
.menu-card:hover { border-color: #1a73e8; box-shadow: 0 2px 12px rgba(26,115,232,0.12); }
.menu-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.menu-info { flex: 1; }
.menu-title { font-size: 15px; font-weight: 600; color: #1e2329; margin-bottom: 4px; }
.menu-desc  { font-size: 13px; color: #9aa0a6; }
.menu-arrow { font-size: 18px; color: #dadce0; }
.menu-card:hover .menu-arrow { color: #1a73e8; }
</style>