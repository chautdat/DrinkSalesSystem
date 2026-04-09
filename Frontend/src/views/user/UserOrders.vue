<template>
  <div class="container">
    <div class="page-header">
      <h1>📋 Lịch sử đơn hàng</h1>
      <button class="btn btn-secondary" @click="load">🔄 Làm mới</button>
    </div>

    <div v-if="loading" class="loading-text">Đang tải…</div>

    <div v-else-if="!orders.length" style="text-align:center;padding:64px 0">
      <div style="font-size:48px;margin-bottom:16px">📦</div>
      <p style="color:#9aa0a6;margin-bottom:16px">Bạn chưa có đơn hàng nào.</p>
      <button class="btn btn-primary" @click="$router.push('/shop')">
        Mua sắm ngay
      </button>
    </div>

    <div v-else>
      <!-- Filter tabs -->
      <div class="status-tabs">
        <button v-for="tab in tabs" :key="tab.val"
          :class="['tab-btn', { active: activeTab === tab.val }]"
          @click="activeTab = tab.val">
          {{ tab.label }}
          <span v-if="countByStatus(tab.val) > 0" class="tab-count">
            {{ countByStatus(tab.val) }}
          </span>
        </button>
      </div>

      <!-- Orders list -->
      <div class="orders-list">
        <div v-for="(o, index) in filteredOrders" :key="o.id" class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">#{{ index + 1 }}</span>
              <span :class="`badge ${badgeOf(o.status)}`" style="margin-left:8px">
                {{ labelOf(o.status) }}
              </span>
            </div>
            <span class="order-date">{{ fmtDate(o.createdAt) }}</span>
          </div>

          <!-- Items -->
          <div v-if="o.items && o.items.length" class="order-items">
            <div v-for="i in o.items" :key="i.productId" class="order-item">
              <span class="item-name">{{ i.productName }}</span>
              <span class="item-qty">x{{ i.quantity }}</span>
              <span class="item-price">{{ fmt(i.subtotal) }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div style="font-size:13px;color:#9aa0a6">
              📍 {{ o.shippingAddress }}
              <span v-if="o.paymentMethodName" style="margin-left:10px">
                • 💳 {{ o.paymentMethodName }}
              </span>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="order-total">{{ fmt(o.total) }}</span>
              <!-- Nút hủy — chỉ khi Pending hoặc Confirmed -->
              <button
                v-if="canCancel(o.status)"
                class="btn btn-danger btn-sm"
                @click="cancelOrder(o.id)">
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { orderApi } from '../../services/api.js'
import { shortId, idKey } from '../../utils/display.js'

const orders    = ref([])
const loading   = ref(true)
const activeTab = ref('all')

const tabs = [
  { val: 'all',        label: 'Tất cả' },
  { val: 'Pending',    label: 'Chờ xác nhận' },
  { val: 'Confirmed',  label: 'Đã xác nhận' },
  { val: 'Preparing',  label: 'Đang chuẩn bị' },
  { val: 'Shipping',   label: 'Đang giao' },
  { val: 'Completed',  label: 'Đã giao' },
  { val: 'Cancelled',  label: 'Đã hủy' }
]

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

const labelOf   = s => LABELS[s] ?? s
const badgeOf   = s => BADGES[s] ?? 'badge-info'
const canCancel = s => ['Pending', 'Confirmed'].includes(s)

function normalizeOrderStatus(status) {
  if (status === 'Shipped') return 'Shipping'
  if (status === 'Delivered') return 'Completed'
  return status
}

function normalizeOrderItem(item) {
  const product = item?.product && typeof item.product === 'object' ? item.product : null
  const productId = idKey(item?.productId || product?._id || item?.product || '')
  return {
    ...item,
    productId,
    productName: item?.title || item?.productName || product?.title || product?.name || 'Sản phẩm'
  }
}

const filteredOrders = computed(() =>
  activeTab.value === 'all'
    ? orders.value
    : orders.value.filter(o => o.status === activeTab.value)
)

const countByStatus = s =>
  s === 'all' ? orders.value.length : orders.value.filter(o => o.status === s).length

async function load() {
  loading.value = true
  try {
    const { data } = await orderApi.getMine()
    orders.value = (Array.isArray(data) ? data : []).map(o => ({
      ...o,
      id: idKey(o.id || o._id),
      status: normalizeOrderStatus(o.status),
      items: Array.isArray(o.items) ? o.items.map(normalizeOrderItem) : []
    }))
  } finally { loading.value = false }
}

async function cancelOrder(id) {
  if (!confirm('Xác nhận hủy đơn hàng này?')) return
  try {
    await orderApi.cancel(id)
    await load()
  } catch (e) {
    alert(e.response?.data?.message || 'Không thể hủy đơn.')
  }
}

const fmt     = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const fmtDate = d => { if (!d) return '—'; const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString('vi-VN') }
let timer
onMounted(() => {
  load()
  timer = setInterval(load, 30000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.status-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.tab-btn {
  padding: 7px 16px; border-radius: 20px;
  border: 1px solid #e8eaed; background: #fff;
  cursor: pointer; font-size: 13.5px; color: #5f6368;
  display: flex; align-items: center; gap: 6px;
}
.tab-btn.active { background: #1a73e8; color: #fff; border-color: #1a73e8; }
.tab-count {
  background: #ea4335; color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 1px 5px; border-radius: 10px;
}
.orders-list { display: flex; flex-direction: column; gap: 14px; }
.order-card {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 10px; overflow: hidden;
}
.order-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid #f0f2f5;
}
.order-id   { font-weight: 700; font-size: 15px; }
.order-date { font-size: 13px; color: #9aa0a6; }
.order-items { padding: 12px 18px; border-bottom: 1px solid #f0f2f5; }
.order-item {
  display: flex; gap: 8px; align-items: center;
  padding: 4px 0; font-size: 13.5px;
}
.item-name  { flex: 1; }
.item-qty   { color: #9aa0a6; min-width: 32px; }
.item-price { font-weight: 500; color: #1a73e8; min-width: 80px; text-align: right; }
.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 18px;
}
.order-total { font-size: 16px; font-weight: 700; color: #1a73e8; }
</style>
