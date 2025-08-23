<template>
  <footer class="footer">
    <div class="container-fluid d-flex flex-wrap justify-content-center align-items-center">
      <div class="footer-brand">
        <img :src="logoUrl" alt="CRMS Logo" class="footer-logo">
        <span class="footer-text">CRMS</span>
        <span class="trademark">®</span>
        <span class="year">{{ currentYear }}</span>
      </div>
      <div class="footer-version">
        <span class="version-text">v 19.06.25</span>
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      logoUrl: require('@/assets/img/crms.svg')
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
};
</script>
<style scoped>
.footer {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  padding: 15px 0;
  position: relative;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

.footer-logo {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.footer-logo:hover {
  transform: scale(1.1);
}

.footer-text {
  font-weight: 700;
  letter-spacing: 1px;
}

.trademark {
  font-size: 0.8rem;
  font-weight: 400;
  opacity: 0.8;
  margin-left: 2px;
}

.year {
  font-weight: 500;
  opacity: 0.9;
  margin-left: 5px;
}

.footer-version {
  display: flex;
  align-items: center;
}

.version-text {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .footer {
    padding: 12px 0;
  }
  
  .footer-brand {
    font-size: 1rem;
    gap: 6px;
  }
  
  .footer-logo {
    width: 20px;
    height: 20px;
  }
  
  .version-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .container-fluid {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .footer-brand {
    justify-content: center;
  }
  
  .footer-version {
    justify-content: center;
  }
}
</style>
