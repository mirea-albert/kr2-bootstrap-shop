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

  // 5. Кнопка «Наверх» (гоночный руль)
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

  // 6. Анимация счетчиков от 0 на странице «О нас»
  const counters = document.querySelectorAll('.stat-counter');
  if (counters.length > 0) {
    const animateCounter = (counter) => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 1600;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        const currentCount = Math.floor(easeProgress * target);

        counter.textContent = currentCount + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach((counter) => observer.observe(counter));
  }

  // 7. Переключение темы (Светлая / Тёмная)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('ropz-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-bs-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  function applyTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('ropz-theme', theme);

    if (themeIcon && themeToggleBtn) {
      if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeToggleBtn.title = 'Включить светлую тему';
      } else {
        themeIcon.textContent = '🌙';
        themeToggleBtn.title = 'Включить тёмную тему';
      }
    }
  }

  // 8. Глобальный поиск по сайту (работает на любой странице автоматически)
  const siteSearchIndex = [
    { title: 'Главная страница', desc: 'Обзор клуба ropZ Sim Racing, Direct Drive базы и популярные сетапы', url: 'index.html', tag: 'Раздел' },
    { title: 'Автопарк и симуляторы (Каталог)', desc: 'Все 6 конфигураций кокпитов: Club, Pro, Motion VR, Formula, Drift, LAN-зона', url: 'catalog.html', tag: 'Каталог' },
    { title: 'Club Rig Entry — 1 200 ₽/час', desc: 'База Moza R9 (9 Нм), педали CRP, ультраширокий монитор 34"', url: 'catalog.html', tag: 'Тариф' },
    { title: 'Кокпит Pro Simucube Triple — 2 200 ₽/час', desc: 'Simucube 2 Pro (25 Нм), три экрана 32" QHD 165Hz, педали Heusinkveld Ultimate+', url: 'product.html', tag: 'Оборудование' },
    { title: 'Motion Platform 4DOF VR — 3 200 ₽/час', desc: 'Подвижная платформа с перегрузками до 2G и шлем виртуальной реальности Pimax Crystal', url: 'catalog.html', tag: 'Тариф' },
    { title: 'Formula Single Seater — 2 800 ₽/час', desc: 'Полулежачая посадка F1, штурвал с телеметрией, активные педали ActivePedal', url: 'catalog.html', tag: 'Тариф' },
    { title: 'Drift & Rally Station — 1 800 ₽/час', desc: 'Замшевый руль 350мм, гидроручник, секвентальная КПП и H-шифтер', url: 'catalog.html', tag: 'Тариф' },
    { title: 'LAN Grid (аренда 6 мест) — 9 500 ₽/час', desc: 'Закрытый турнир для компании друзей по локальной сети', url: 'catalog.html', tag: 'Групповой' },
    { title: 'Турниры и кубки', desc: 'Winter Endurance 3H (Suzuka), Formula Open Cup, прошедшие LAN-гонки', url: 'tournaments.html', tag: 'Соревнования' },
    { title: 'Таблица рекордов клуба (Hotlaps)', desc: 'Лучшее время круга на Spa-Francorchamps (GT3) и Nordschleife (GT4)', url: 'leaderboard.html', tag: 'Рейтинг' },
    { title: 'Бронирование заезда онлайн', desc: 'Форма выбора станции, даты, длительности сессии и калькулятор цены', url: 'order.html', tag: 'Запись' },
    { title: 'О клубе ropZ Sim Racing', desc: 'История создания, телеметрия MoTeC, принципы подготовки пилотов', url: 'about.html', tag: 'Инфо' },
    { title: 'Контакты и Яндекс.Карта', desc: 'Москва, Проспект Вернадского, 78, телефон +7 (495) 120-22-00, режим работы', url: 'contacts.html', tag: 'Адрес' },
    { title: 'Регламент клуба и FAQ', desc: 'Требования к обуви, экипировке, перчаткам и настройкам авто', url: 'catalog.html#faq', tag: 'Правила' }
  ];

  // Динамически создаём модальное окно поиска, чтобы оно работало на всех страницах сразу
  const searchModalHTML = `
    <div class="modal fade" id="globalSearchModal" tabindex="-1" aria-labelledby="globalSearchModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-sim text-white">
          <div class="modal-header border-secondary">
            <h2 class="modal-title h5 fw-bold text-white" id="globalSearchModalLabel">
              <span class="text-danger me-1">///</span> Поиск по сайту ropZ Sim Racing
            </h2>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3">
              <span class="input-group-text bg-black border-secondary text-secondary">🔍</span>
              <input type="search" id="globalSearchInput" class="form-control form-control-lg form-dark" placeholder="Введите запрос: Simucube, Spa, турнир, цена, адрес..." autocomplete="off">
            </div>
            <div id="globalSearchResults" style="max-height: 360px; overflow-y: auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', searchModalHTML);

  const searchModalEl = document.getElementById('globalSearchModal');
  const searchInput = document.getElementById('globalSearchInput');
  const searchResults = document.getElementById('globalSearchResults');

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const filtered = q === ''
      ? siteSearchIndex.slice(0, 6)
      : siteSearchIndex.filter(item =>
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q)
        );

    if (filtered.length === 0) {
      searchResults.innerHTML = `<p class="text-secondary text-center py-4 mb-0">По запросу «<strong>${query}</strong>» ничего не найдено.</p>`;
      return;
    }

    searchResults.innerHTML = filtered.map(item => `
      <a href="${item.url}" class="search-result-item">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-white">${item.title}</strong>
          <span class="badge bg-danger">${item.tag}</span>
        </div>
        <div class="small text-secondary">${item.desc}</div>
      </a>
    `).join('');
  }

  if (searchModalEl && searchInput) {
    searchModalEl.addEventListener('shown.bs.modal', () => {
      searchInput.focus();
      renderSearchResults(searchInput.value);
    });

    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    // Горячая клавиша Ctrl + K для быстрого вызова поиска
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const modal = bootstrap.Modal.getOrCreateInstance(searchModalEl);
        modal.show();
      }
    });
  }
});