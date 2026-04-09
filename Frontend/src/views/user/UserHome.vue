<template>
  <div class="user-home">

    <!-- Hero -->
    <div class="hero">
      <div class="hero-content">
        <h1>Xin chào, {{ user?.fullName || user?.email }} 👋</h1>
        <p>Đặt nước sạch tận nơi — nhanh chóng, tiện lợi</p>
        <button class="btn-hero" @click="$router.push('/shop')">
          Đặt nước ngay →
        </button>
      </div>
    </div>

    <div class="container">

      <!-- Quick stats -->
      <div class="quick-stats">
        <div class="qs-card">
          <div class="qs-icon">📦</div>
          <div class="qs-num">{{ stats.total }}</div>
          <div class="qs-label">Tổng đơn</div>
        </div>
        <div class="qs-card">
          <div class="qs-icon">⏳</div>
          <div class="qs-num">{{ stats.pending }}</div>
          <div class="qs-label">Đang xử lý</div>
        </div>
        <div class="qs-card">
          <div class="qs-icon">✅</div>
          <div class="qs-num">{{ stats.delivered }}</div>
          <div class="qs-label">Đã giao</div>
        </div>
        <div class="qs-card">
          <div class="qs-icon">🛒</div>
          <div class="qs-num">{{ stats.cart }}</div>
          <div class="qs-label">Trong giỏ</div>
        </div>
      </div>

      <!-- Quick links -->
      <h2 class="section-title">Chức năng</h2>
      <div class="quick-links">
        <div class="ql-card blue" @click="$router.push('/shop')">
          <div class="ql-icon">🛍️</div>
          <div class="ql-title">Mua sắm</div>
          <div class="ql-desc">Xem danh sách sản phẩm</div>
        </div>
        <div class="ql-card green" @click="$router.push('/cart')">
          <div class="ql-icon">🛒</div>
          <div class="ql-title">Giỏ hàng</div>
          <div class="ql-desc">{{ stats.cart }} sản phẩm đang chờ</div>
        </div>
        <div class="ql-card orange" @click="$router.push('/orders')">
          <div class="ql-icon">📋</div>
          <div class="ql-title">Đơn hàng</div>
          <div class="ql-desc">Xem lịch sử đặt hàng</div>
        </div>
        <div class="ql-card purple" @click="$router.push('/profile')">
          <div class="ql-icon">👤</div>
          <div class="ql-title">Tài khoản</div>
          <div class="ql-desc">Cập nhật thông tin</div>
        </div>
      </div>

      <!-- Đơn gần đây -->
      <h2 class="section-title" style="margin-top:32px">Đơn hàng gần đây</h2>
      <div class="card">
        <div v-if="loading" class="loading-text">Đang tải…</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STT</th><th>Ngày đặt</th>
                <th>Tổng tiền</th><th>Trạng thái</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(o, index) in recentOrders" :key="o.id">
                <td><strong>{{ index + 1 }}</strong></td>
                <td style="color:#9aa0a6">{{ fmtDate(o.createdAt) }}</td>
                <td style="color:#1a73e8;font-weight:600">{{ fmt(o.total) }}</td>
                <td>
                  <span :class="`badge ${badgeOf(o.status)}`">
                    {{ labelOf(o.status) }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm"
                    @click="$router.push('/orders')">Chi tiết</button>
                </td>
              </tr>
              <tr v-if="!recentOrders.length">
                <td colspan="5" class="loading-text">Chưa có đơn hàng nào.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="text-align:right;margin-top:12px">
          <button class="btn btn-secondary btn-sm" @click="$router.push('/orders')">
            Xem tất cả →
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { orderApi, cartApi } from '../../services/api.js'
import { shortId } from '../../utils/display.js'

const user    = computed(() => JSON.parse(sessionStorage.getItem('user') || '{}'))
const loading = ref(true)
const recentOrders = ref([])
const stats = ref({ total: 0, pending: 0, delivered: 0, cart: 0 })

const LABELS = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Preparing: 'Đang chuẩn bị',
  Shipping: 'Đang giao',
  Completed: 'Đã giao',
  Cancelled: 'Đã hủy',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao'
}
const BADGES = {
  Pending: 'badge-warning',
  Confirmed: 'badge-info',
  Preparing: 'badge-info',
  Shipping: 'badge-ok',
  Completed: 'badge-ok',
  Cancelled: 'badge-danger',
  Shipped: 'badge-ok',
  Delivered: 'badge-ok'
}
const labelOf = s => LABELS[s] ?? s
const badgeOf = s => BADGES[s] ?? 'badge-info'

onMounted(async () => {
  try {
    const [ord, cart] = await Promise.all([orderApi.getMine(), cartApi.get()])
    const list = Array.isArray(ord.data) ? ord.data : []
    stats.value.total     = list.length
    stats.value.pending   = list.filter(o => ['Pending','Confirmed','Preparing','Shipping'].includes(o.status)).length
    stats.value.delivered = list.filter(o => ['Completed','Delivered'].includes(o.status)).length
    stats.value.cart      = Array.isArray(cart.data?.products)
      ? cart.data.products.reduce((s, i) => s + Number(i.quantity || 0), 0)
      : 0
    recentOrders.value    = list.slice(0, 5)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

const fmt     = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const fmtDate = d => { if (!d) return '—'; const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString('vi-VN') }
</script>

<style scoped>
.user-home { background: #f5f7fa; min-height: 100vh; }
.hero {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 48px 24px; color: #fff; text-align: center;
}
.hero-content { max-width: 600px; margin: 0 auto; }
.hero h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
.hero p  { font-size: 15px; opacity: 0.85; margin-bottom: 24px; }
.btn-hero {
  background: #fff; color: #1a73e8;
  padding: 12px 32px; border-radius: 8px;
  border: none; cursor: pointer; font-size: 15px; font-weight: 600;
}
.btn-hero:hover { background: #e8f0fe; }
.quick-stats {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 14px; margin: 24px 0;
}
.qs-card {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 10px; padding: 20px; text-align: center;
}
.qs-icon { font-size: 24px; margin-bottom: 8px; }
.qs-num  { font-size: 28px; font-weight: 700; color: #1e2329; }
.qs-label { font-size: 12.5px; color: #9aa0a6; margin-top: 4px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 14px; }
.quick-links { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.ql-card {
  border-radius: 12px; padding: 24px 20px; cursor: pointer;
  transition: transform .15s; text-align: center;
}
.ql-card:hover { transform: translateY(-2px); }
.ql-card.blue   { background: #e8f0fe; }
.ql-card.green  { background: #e6f4ea; }
.ql-card.orange { background: #fef9e7; }
.ql-card.purple { background: #f3e8fd; }
.ql-icon  { font-size: 32px; margin-bottom: 10px; }
.ql-title { font-size: 15px; font-weight: 600; color: #1e2329; margin-bottom: 4px; }
.ql-desc  { font-size: 12.5px; color: #5f6368; }
</style>
