document.addEventListener('DOMContentLoaded', () => {
  // 1. Ограничение даты (нельзя выбрать прошедшую дату)
  const dateInput = document.getElementById('order-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
  }

  // 2. Интерактивный расчет стоимости на странице order.html
  const stationSelect = document.getElementById('order-station');
  const durationSelect = document.getElementById('order-duration');
  const totalPriceElement = document.getElementById('total-price');

  const pricesPerHour = {
    'club': 1200,
    'pro': 2200,
    'motion': 3200,
    'formula': 2800,
    'drift': 1800,
    'lan': 9500
  };

  function updateOrderCost() {
    if (!stationSelect || !durationSelect || !totalPriceElement) return;
    const selectedStation = stationSelect.value;
    const selectedDuration = parseInt(durationSelect.value, 10);

    if (pricesPerHour[selectedStation]) {
      const baseHourPrice = pricesPerHour[selectedStation];
      const finalPrice = Math.round((baseHourPrice / 60) * selectedDuration);
      totalPriceElement.textContent = finalPrice.toLocaleString('ru-RU') + ' ₽';
    } else {
      totalPriceElement.textContent = '0 ₽';
    }
  }

  if (stationSelect && durationSelect) {
    stationSelect.addEventListener('change', updateOrderCost);
    durationSelect.addEventListener('change', updateOrderCost);
  }

  // 3. Обработка формы экспресс-брони в модальном окне (catalog.html)
  const quickForm = document.getElementById('quickOrderForm');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!quickForm.checkValidity()) {
        e.stopPropagation();
        quickForm.classList.add('was-validated');
        return;
      }

      const clientName = document.getElementById('quick-name').value;
      const modalEl = document.getElementById('quickOrderModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Показ уведомления на странице каталога
      const alertContainer = document.getElementById('catalogAlertContainer');
      if (alertContainer) {
        alertContainer.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show border-0 shadow" role="alert">
            <strong>Отлично, ${clientName}!</strong> Экспресс-заявка принята. Инструктор свяжется с вами по указанному телефону в течение 5 минут.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
          </div>
        `;
      }

      quickForm.reset();
      quickForm.classList.remove('was-validated');
    });
  }

  // 4. Обработка большой формы бронирования (order.html)
  const fullOrderForm = document.getElementById('fullOrderForm');
  if (fullOrderForm) {
    fullOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!fullOrderForm.checkValidity()) {
        e.stopPropagation();
        fullOrderForm.classList.add('was-validated');
        return;
      }

      const name = document.getElementById('order-name').value;
      const date = document.getElementById('order-date').value;
      const stationText = stationSelect.options[stationSelect.selectedIndex].text.split('—')[0].trim();
      const finalPrice = totalPriceElement ? totalPriceElement.textContent : '';

      const orderAlertContainer = document.getElementById('orderAlertContainer');
      if (orderAlertContainer) {
        orderAlertContainer.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show border-0 shadow mb-4" role="alert">
            <h4 class="alert-heading h5 fw-bold">Заезд успешно забронирован!</h4>
            <p class="mb-0">
              Пилот: <strong>${name}</strong>.<br>
              Конфигурация: <strong>${stationText}</strong>.<br>
              Дата: <strong>${date}</strong>. Итого к оплате на ресепшене: <strong>${finalPrice}</strong>.
            </p>
            <hr>
            <p class="small mb-0">Копия регламента и инструктаж по безопасности высланы на ваш e-mail.</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
          </div>
        `;
      }

      fullOrderForm.reset();
      fullOrderForm.classList.remove('was-validated');
      updateOrderCost();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 5. Появление и клик по кнопке «Наверх» (гоночный руль)
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});