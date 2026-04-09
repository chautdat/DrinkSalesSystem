<template>
  <div class="container">
    <div class="page-header">
      <h1>🛒 Giỏ hàng</h1>
      <button v-if="items.length" class="btn btn-secondary btn-sm" @click="clearCart">
        Xóa tất cả
      </button>
    </div>

    <div v-if="loading" class="loading-text">Đang tải…</div>

    <div v-else-if="!items.length" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <p>Giỏ hàng trống</p>
      <button class="btn btn-primary" @click="$router.push('/shop')">
        Mua sắm ngay
      </button>
    </div>

    <div v-else>
      <!-- Cart items -->
      <div class="card" style="margin-bottom:16px">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th><th style="width:130px">Số lượng</th>
                <th>Đơn giá</th><th>Thành tiền</th><th style="width:50px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td style="font-weight:500">{{ item.productName }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <button class="qty-btn" @click="updateQty(item, -1)">−</button>
                    <span style="font-weight:600;min-width:20px;text-align:center">
                      {{ item.quantity }}
                    </span>
                    <button class="qty-btn" @click="updateQty(item, 1)">+</button>
                  </div>
                </td>
                <td>{{ fmt(item.price) }}</td>
                <td style="font-weight:600;color:#1a73e8">{{ fmt(item.subtotal) }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="removeItem(item)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary + Checkout -->
      <div class="checkout-box">
        <div class="summary">
          <div class="summary-row">
            <span>Tạm tính</span>
            <span>{{ fmt(subtotal) }}</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng</span>
            <span style="color:#1a73e8">{{ fmt(grandTotal) }}</span>
          </div>
        </div>

        <!-- Form giao hàng -->
        <div class="shipping-form">
          <h3>Thông tin giao hàng</h3>
          <div class="grid-2">
            <div class="form-group">
              <label>Họ tên người nhận *</label>
              <input class="form-control" v-model="shipping.name"
                :placeholder="user?.fullName || 'Nhập họ tên'" />
            </div>
            <div class="form-group">
              <label>Số điện thoại *</label>
              <input class="form-control" v-model="shipping.phone"
                :placeholder="user?.phone || 'Nhập SĐT'" />
            </div>
          </div>
          <div class="form-group">
            <label>Địa chỉ giao hàng *</label>
            <input class="form-control" v-model="shipping.address"
              :placeholder="user?.address || 'Số nhà, đường, phường, quận'" />
          </div>
          <div class="form-group">
            <label>Phương thức thanh toán *</label>
            <select class="form-control" v-model="shipping.paymentMethodId">
              <option value="">-- Chọn phương thức --</option>
              <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                {{ method.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Ghi chú</label>
            <input class="form-control" v-model="shipping.note"
              placeholder="Giao buổi sáng, gọi trước khi giao…" />
          </div>
          <div v-if="checkoutError" class="alert alert-error">{{ checkoutError }}</div>
          <button class="btn-checkout" :disabled="submitting" @click="checkout">
            {{ submitting ? 'Đang đặt hàng…' : '✅ Đặt hàng ngay' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { cartApi, orderApi, paymentMethodApi } from '../../services/api.js'
import { useRouter } from 'vue-router'
import { idKey } from '../../utils/display.js'

const emit = defineEmits(['cart-updated'])

const router = useRouter()
const items   = ref([])
const paymentMethods = ref([])
const loading = ref(true)
const submitting    = ref(false)
const checkoutError = ref('')

const user = JSON.parse(sessionStorage.getItem('user') || '{}')

const shipping = ref({
  name:    user.fullName || '',
  phone:   user.phone    || '',
  address: user.address  || '',
  paymentMethodId: '',
  note:    ''
})

const subtotal = computed(() => items.value.reduce((s, i) => s + i.subtotal, 0))
const grandTotal = computed(() => subtotal.value)

function normalizeCartItems(cart) {
  const list = Array.isArray(cart?.products) ? cart.products : []
  return list
    .map(item => {
      const product = item.product && typeof item.product === 'object' ? item.product : null
      const quantity = Number(item.quantity || 0)
      const price = Number(product?.price || 0)
      return {
        id: product?._id || item.product || '',
        productId: product?._id || item.product || '',
        productName: product?.title || product?.name || 'Sản phẩm',
        price: price,
        quantity: quantity,
        subtotal: price * quantity
      }
    })
    .filter(item => item.id)
}

async function loadCart() {
  try {
    const { data } = await cartApi.get()
    items.value = normalizeCartItems(data)
  }
  finally { loading.value = false }
}

async function loadPaymentMethods() {
  try {
    const { data } = await paymentMethodApi.getAll()
    paymentMethods.value = (Array.isArray(data) ? data : [])
      .filter(m => m.isActive)
      .map(m => ({
        ...m,
        id: idKey(m.id || m._id)
      }))
  } catch (e) {
    paymentMethods.value = []
  }
}

async function updateQty(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  try {
    await cartApi.update(item.productId, { quantity: newQty })
    await loadCart()
    emit('cart-updated')
  } catch (e) { alert(e.response?.data?.message || 'Lỗi.') }
}

async function removeItem(item) {
  if (!confirm('Xóa sản phẩm này khỏi giỏ?')) return
  await cartApi.remove(item.productId, item.quantity)
  await loadCart()
  emit('cart-updated')
}

async function clearCart() {
  if (!confirm('Xóa toàn bộ giỏ hàng?')) return
  await cartApi.clear()
  await loadCart()
  emit('cart-updated')
}

async function checkout() {
  if (!shipping.value.name)    { checkoutError.value = 'Nhập tên người nhận.'; return }
  if (!shipping.value.phone)   { checkoutError.value = 'Nhập số điện thoại.'; return }
  if (!shipping.value.address) { checkoutError.value = 'Nhập địa chỉ giao hàng.'; return }
  if (!shipping.value.paymentMethodId) { checkoutError.value = 'Chọn phương thức thanh toán.'; return }

  checkoutError.value = ''
  submitting.value    = true
  try {
    await orderApi.checkout({
      userId:          user.id,
      shippingName:    shipping.value.name,
      shippingPhone:   shipping.value.phone,
      shippingAddress: shipping.value.address,
      paymentMethodId: shipping.value.paymentMethodId,
      note:            shipping.value.note,
      total:           grandTotal.value,
      items: items.value.map(i => ({ productId: i.productId, quantity: i.quantity }))
    })
    await cartApi.clear()
    emit('cart-updated')
    router.push('/orders')
  } catch (e) {
    checkoutError.value = e.response?.data?.message || 'Đặt hàng thất bại.'
  } finally { submitting.value = false }
}

const fmt = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

onMounted(() => {
  loadCart()
  loadPaymentMethods()
})
</script>

<style scoped>
.empty-cart { text-align: center; padding: 64px 0; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-cart p { font-size: 16px; color: #9aa0a6; margin-bottom: 20px; }
.qty-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid #dadce0; background: #fff;
  cursor: pointer; font-size: 15px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:hover { background: #f1f3f4; }
.checkout-box {
  display: grid; grid-template-columns: 1fr 2fr; gap: 20px;
}
.summary {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 10px; padding: 20px; align-self: start;
}
.summary-row {
  display: flex; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid #f0f2f5;
  font-size: 14px;
}
.summary-row:last-child { border-bottom: none; }
.summary-row.total { font-weight: 700; font-size: 16px; }
.shipping-form {
  background: #fff; border: 1px solid #e8eaed;
  border-radius: 10px; padding: 24px;
}
.shipping-form h3 { font-size: 16px; font-weight: 600; margin-bottom: 18px; }
.btn-checkout {
  width: 100%; padding: 14px; border-radius: 8px;
  background: #1a73e8; color: #fff; border: none;
  cursor: pointer; font-size: 15px; font-weight: 600;
  margin-top: 8px;
}
.btn-checkout:hover    { background: #1557b0; }
.btn-checkout:disabled { background: #9aa0a6; cursor: not-allowed; }
</style>
