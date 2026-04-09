<template>
  <div id="app">
    <!-- Navbar Admin -->
    <nav v-if="isLoggedIn && isAdmin" class="navbar navbar-admin">
      <span class="brand">🛡️ Admin Panel</span>
      <div class="nav-links">
        <router-link to="/admin" class="nav-link">Tổng quan</router-link>
        <router-link to="/admin/products" class="nav-link"
          >Sản phẩm</router-link
        >
        <router-link to="/admin/orders" class="nav-link">Đơn hàng</router-link>
        <router-link to="/admin/dashboard" class="nav-link"
          >Báo cáo</router-link
        >
        <router-link to="/admin/payment-methods" class="nav-link"
          >Thanh toán</router-link
        >
        <router-link to="/admin/brands" class="nav-link"
          >Thương hiệu</router-link
        >
      </div>
      <div class="nav-right">
        <span class="user-email">{{ user?.email }}</span>
        <span class="role-badge role-admin">Admin</span>
        <button class="btn-logout" @click="logout">Đăng xuất</button>
      </div>
    </nav>

    <!-- Navbar User -->
    <nav v-if="isLoggedIn && !isAdmin" class="navbar navbar-user">
      <span class="brand">💧 Mineral Water</span>
      <div class="nav-links">
        <router-link to="/home" class="nav-link">Trang chủ</router-link>
        <router-link to="/shop" class="nav-link">Sản phẩm</router-link>
        <router-link to="/orders" class="nav-link">Đơn hàng</router-link>
        <router-link to="/profile" class="nav-link">Tài khoản</router-link>
      </div>
      <div class="nav-right">
        <router-link to="/cart" class="cart-btn">
          🛒 Giỏ hàng
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>
        <span class="user-email">{{ user?.fullName || user?.email }}</span>
        <button class="btn-logout" @click="logout">Đăng xuất</button>
      </div>
    </nav>

    <main :class="{ 'has-navbar': isLoggedIn }">
      <router-view @cart-updated="loadCartCount" />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authApi, cartApi } from "./services/api.js";

const router = useRouter();
const route = useRoute();

const isLoggedIn = computed(() => {
  route.path;
  return !!sessionStorage.getItem("token");
});
const user = computed(() => {
  route.path;
  return JSON.parse(sessionStorage.getItem("user") || "{}");
});
const isAdmin = computed(() => (user.value?.role || "").toLowerCase() === "admin");
const cartCount = ref(0);

async function loadCartCount() {
  if (!isLoggedIn.value || isAdmin.value) return;
  try {
    const { data } = await cartApi.get();
    const items = Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data)
        ? data
        : [];
    cartCount.value = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
  } catch {
    cartCount.value = 0;
  }
}

watch(
  isLoggedIn,
  (val) => {
    if (val && !isAdmin.value) loadCartCount();
  },
  { immediate: true },
);

async function logout() {
  try {
    await authApi.logout()
  } catch {
    // Ignore logout failures and clear client state anyway.
  } finally {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.push("/login");
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 56px;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  border-bottom: 1px solid #e8eaed;
}
.navbar-admin {
  background: #1e2329;
}
.navbar-user {
  background: #fff;
}
.brand {
  font-size: 15px;
  font-weight: 700;
  margin-right: 8px;
}
.navbar-admin .brand {
  color: #facc15;
}
.navbar-user .brand {
  color: #1a73e8;
}
.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
}
.nav-link {
  padding: 7px 14px;
  border-radius: 7px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
}
.navbar-admin .nav-link {
  color: #9ca3af;
}
.navbar-admin .nav-link:hover,
.navbar-admin .nav-link.router-link-active {
  background: #374151;
  color: #fff;
}
.navbar-user .nav-link {
  color: #5f6368;
}
.navbar-user .nav-link:hover {
  background: #f1f3f4;
}
.navbar-user .nav-link.router-link-active {
  background: #e8f0fe;
  color: #1a73e8;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-email {
  font-size: 13px;
}
.navbar-admin .user-email {
  color: #9ca3af;
}
.navbar-user .user-email {
  color: #5f6368;
}
.role-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
.role-admin {
  background: #fce8e6;
  color: #c5221f;
}
.cart-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 7px;
  text-decoration: none;
  color: #5f6368;
  font-size: 13.5px;
  font-weight: 500;
  background: #f1f3f4;
  position: relative;
}
.cart-btn:hover {
  background: #e8f0fe;
  color: #1a73e8;
}
.cart-badge {
  background: #ea4335;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}
.btn-logout {
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid #dadce0;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}
.navbar-admin .btn-logout {
  color: #9ca3af;
  border-color: #374151;
}
.navbar-admin .btn-logout:hover {
  background: #374151;
  color: #fff;
}
.navbar-user .btn-logout {
  color: #5f6368;
}
.navbar-user .btn-logout:hover {
  background: #fce8e6;
  color: #ea4335;
}
main.has-navbar {
  padding-top: 56px;
}
</style>
