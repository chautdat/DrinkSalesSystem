<template>
  <div class="dashboard">

    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Báo cáo</h1>
        <p class="dash-sub">Thống kê doanh thu & sản phẩm bán chạy</p>
      </div>
      <button class="refresh-btn" @click="loadAll" :disabled="loading">
        <span :class="loading ? 'spin' : ''">↻</span>
        {{ loading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </div>

    <!-- Revenue cards -->
    <div class="revenue-grid">
      <div class="rev-card primary">
        <div class="rev-icon">💰</div>
        <div class="rev-body">
          <div class="rev-label">Tổng doanh thu</div>
          <div class="rev-value">{{ fmt(revenue.totalRevenue ?? 0) }}</div>
          <div class="rev-note">Chỉ tính đơn Shipped & Delivered</div>
        </div>
      </div>

      <div class="rev-card green">
        <div class="rev-icon">✅</div>
        <div class="rev-body">
          <div class="rev-label">Đơn đã giao</div>
          <div class="rev-value">{{ revenue.deliveredOrders ?? 0 }}</div>
          <div class="rev-note">Delivered</div>
        </div>
      </div>

      <div class="rev-card orange">
        <div class="rev-icon">🚚</div>
        <div class="rev-body">
          <div class="rev-label">Đang giao</div>
          <div class="rev-value">{{ revenue.shippedOrders ?? 0 }}</div>
          <div class="rev-note">Shipped</div>
        </div>
      </div>

      <div class="rev-card purple">
        <div class="rev-icon">📦</div>
        <div class="rev-body">
          <div class="rev-label">Tổng đơn hợp lệ</div>
          <div class="rev-value">{{ revenue.totalOrders ?? 0 }}</div>
          <div class="rev-note">Shipped + Delivered</div>
        </div>
      </div>
    </div>

    <!-- Top products -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">🏆 Top sản phẩm bán chạy</div>
        <span class="section-badge">Top {{ topProducts.length }}</span>
      </div>

      <div v-if="loading" class="loading-text">Đang tải…</div>

      <div v-else-if="!topProducts.length" class="empty-state">
        <div style="font-size:40px;margin-bottom:12px">📊</div>
        <p>Chưa có dữ liệu sản phẩm.</p>
      </div>

      <div v-else class="top-list">
        <div v-for="(p, i) in topProducts" :key="p.productId"
          class="top-item" :class="i < 3 ? `rank-${i+1}` : ''">

          <!-- Rank -->
          <div class="rank-badge" :class="i < 3 ? `rank-color-${i+1}` : 'rank-default'">
            {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 }}
          </div>

          <!-- Product info -->
          <div class="top-info">
            <div class="top-name">{{ p.productName || `Product ${shortId(p.productId)}` }}</div>
            <div class="top-id">ID: {{ shortId(p.productId) }}</div>
          </div>

          <!-- Stats -->
          <div class="top-stats">
            <div class="top-qty">{{ p.quantity }} <span>sản phẩm</span></div>
            <div class="top-revenue">{{ fmt(p.revenue ?? 0) }}</div>
          </div>

          <!-- Bar -->
          <div class="top-bar-wrap">
            <div class="top-bar"
              :style="`width:${Math.round((p.quantity / topProducts[0].quantity) * 100)}%`"
              :class="i < 3 ? `bar-${i+1}` : 'bar-default'">
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportApi } from '../services/api.js'
import { shortId } from '../utils/display.js'

const loading     = ref(false)
const revenue     = ref({
  totalRevenue:    0,
  totalOrders:     0,
  deliveredOrders: 0,
  shippedOrders:   0
})
const topProducts = ref([])

async function loadAll() {
  loading.value = true
  try {
    const [revRes, topRes] = await Promise.all([
      reportApi.getRevenue(),
      reportApi.getTopProducts()
    ])
    revenue.value     = revRes.data ?? {}
    topProducts.value = Array.isArray(topRes.data) ? topRes.data : []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fmt = v =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0)

onMounted(loadAll)
</script>

<style scoped>
.dashboard {
  padding: 28px 32px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}
.dash-title {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.dash-sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.refresh-btn:hover:not(:disabled) { background: #f3f4f6; }
.spin { display: inline-block; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Revenue grid */
.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}
.rev-card {
  background: #fff;
  border-radius: 14px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  border-left: 4px solid;
  transition: transform 0.15s;
}
.rev-card:hover { transform: translateY(-2px); }
.rev-card.primary { border-color: #3b82f6; }
.rev-card.green   { border-color: #10b981; }
.rev-card.orange  { border-color: #f97316; }
.rev-card.purple  { border-color: #8b5cf6; }
.rev-icon { font-size: 28px; }
.rev-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}
.rev-value {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}
.rev-note {
  font-size: 11px;
  color: #d1d5db;
  margin-top: 4px;
}

/* Section card */
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.section-badge {
  font-size: 12px;
  background: #eff6ff;
  color: #3b82f6;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
}

/* Top list */
.top-list { display: flex; flex-direction: column; gap: 14px; }
.top-item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  grid-template-rows: auto 8px;
  align-items: center;
  gap: 0 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  transition: all 0.15s;
}
.top-item:hover { background: #f0f9ff; border-color: #bae6fd; }
.top-item.rank-1 { background: #fffbeb; border-color: #fde68a; }
.top-item.rank-2 { background: #f8fafc; border-color: #e2e8f0; }
.top-item.rank-3 { background: #fff7ed; border-color: #fed7aa; }

.rank-badge {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  grid-row: 1;
}
.rank-color-1 { background: #fef9c3; }
.rank-color-2 { background: #f1f5f9; }
.rank-color-3 { background: #fff7ed; }
.rank-default { background: #f3f4f6; font-size: 14px; font-weight: 700; color: #9ca3af; }

.top-info { grid-row: 1; }
.top-name { font-size: 14px; font-weight: 600; color: #111827; }
.top-id   { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.top-stats { grid-row: 1; text-align: right; }
.top-qty {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
.top-qty span { font-size: 12px; font-weight: 400; color: #9ca3af; }
.top-revenue  { font-size: 12px; color: #3b82f6; margin-top: 2px; }

.top-bar-wrap {
  grid-column: 1 / -1;
  grid-row: 2;
  background: #e5e7eb;
  border-radius: 4px;
  height: 6px;
  margin-top: 10px;
  overflow: hidden;
}
.top-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
  min-width: 4px;
}
.bar-1       { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.bar-2       { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }
.bar-3       { background: linear-gradient(90deg, #f97316, #fdba74); }
.bar-default { background: #3b82f6; }
</style>
