// Массив для хранения имён файлов фотографий, получаемых с сервера
let photos = [];

// Основное фото, отображаемое в галерее
const mainPhoto = document.getElementById('main-photo');
// Контейнер для миниатюр (превью)
const thumbnailsContainer = document.querySelector('.thumbnails');
// Индекс текущей выбранной фотографии
let currentIndex = 0;
// Индекс первого отображаемого превью в полосе миниатюр
let thumbStart = 0;
// Количество одновременно видимых миниатюр
const THUMBS_VISIBLE = 6;

// Функция отрисовки миниатюр и стрелок прокрутки
function renderThumbnails() {
  // Очищаем контейнер миниатюр
  thumbnailsContainer.innerHTML = '';
  // Создаём левую стрелку для прокрутки миниатюр
  const leftArrow = document.createElement('span');
  leftArrow.className = 'slider-arrow left-arrow material-icons';
  leftArrow.textContent = 'chevron_left';
  leftArrow.title = 'Прокрутить влево';
  // Обработчик клика по левой стрелке
  leftArrow.onclick = () => {
    if (photos.length === 0) return; // Нет фото — ничего не делаем
    if (thumbStart > 0) {
      thumbStart--; // Прокручиваем влево
      renderThumbnails();
    } else {
      // Циклическая прокрутка влево: показываем последние миниатюры
      if (photos.length > THUMBS_VISIBLE) {
        thumbStart = photos.length - THUMBS_VISIBLE;
      } else {
        thumbStart = 0;
      }
      renderThumbnails();
    }
  };
  thumbnailsContainer.appendChild(leftArrow);

  // Отрисовываем миниатюры в пределах видимого диапазона
  for (let i = thumbStart; i < Math.min(thumbStart + THUMBS_VISIBLE, photos.length); i++) {
    const thumb = document.createElement('div');
    // Добавляем класс selected для выбранной миниатюры
    thumb.className = 'thumbnail' + (i === currentIndex ? ' selected' : '');
    thumb.innerHTML = `<img src="images/${photos[i]}" alt="Превью ${i+1}">`;
    // Обработчик клика по миниатюре — выбор фото
    thumb.addEventListener('click', () => selectPhoto(i));
    thumbnailsContainer.appendChild(thumb);
  }

  // Создаём правую стрелку для прокрутки миниатюр
  const rightArrow = document.createElement('span');
  rightArrow.className = 'slider-arrow right-arrow material-icons';
  rightArrow.textContent = 'chevron_right';
  rightArrow.title = 'Прокрутить вправо';
  // Обработчик клика по правой стрелке
  rightArrow.onclick = () => {
    if (photos.length === 0) return; // Нет фото — ничего не делаем
    if (thumbStart + THUMBS_VISIBLE < photos.length) {
      thumbStart++; // Прокручиваем вправо
      renderThumbnails();
    } else {
      // Циклическая прокрутка вправо: возвращаемся к началу
      thumbStart = 0;
      renderThumbnails();
    }
  };
  thumbnailsContainer.appendChild(rightArrow);
}

// Функция выбора фото по индексу
function selectPhoto(idx) {
  if (idx === currentIndex) return; // Уже выбрано — ничего не делаем
  currentIndex = idx;
  // Если выбранная миниатюра вне видимого диапазона — корректируем thumbStart
  if (currentIndex < thumbStart) {
    thumbStart = currentIndex;
  } else if (currentIndex >= thumbStart + THUMBS_VISIBLE) {
    thumbStart = currentIndex - THUMBS_VISIBLE + 1;
  }
  // Циклическая логика для выбора фото через стрелки
  if (currentIndex < 0) {
    currentIndex = photos.length - 1;
    thumbStart = Math.max(0, photos.length - THUMBS_VISIBLE);
  } else if (currentIndex >= photos.length) {
    currentIndex = 0;
    thumbStart = 0;
  }
  // Анимация смены фото: убираем класс, меняем src, возвращаем класс
  mainPhoto.classList.remove('active');
  setTimeout(() => {
    mainPhoto.src = `images/${photos[idx]}`;
    mainPhoto.classList.add('active');
    renderThumbnails();
  }, 100);
}

// После загрузки изображения добавляем класс для анимации
mainPhoto.addEventListener('load', () => {
  mainPhoto.classList.add('active');
});

// Элементы для увеличения фото
const mainPhotoHover = document.querySelector('.main-photo-hover');
const zoomIcon = document.querySelector('.zoom-icon');

// Функция открытия модального окна с полноразмерным фото
function openFullscreenModal() {
  const modal = document.createElement('div');
  modal.className = 'fullscreen-modal';
  modal.innerHTML = `
    <img src="images/${photos[currentIndex]}" alt="Фото в полном размере">
    <span class="material-icons close-icon" title="Закрыть">close</span>
  `;
  document.body.appendChild(modal);
  const closeIcon = modal.querySelector('.close-icon');
  // Функция закрытия модального окна
  function closeModal() {
    modal.remove();
    document.removeEventListener('keydown', escHandler);
  }
  // Обработчик закрытия по клавише Escape
  function escHandler(e) {
    if (e.key === 'Escape') closeModal();
  }
  closeIcon.addEventListener('click', closeModal);
  // Закрытие по клику вне изображения
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', escHandler);
}

// Обработчик клика по иконке увеличения
zoomIcon.addEventListener('click', openFullscreenModal);

// Загрузка списка файлов с сервера и инициализация галереи
fetch('/api/images')
  .then(res => res.json())
  .then(files => {
    // Фильтруем только изображения jpg и png
    photos = files.filter(f => /\.(jpe?g|png)$/i.test(f));
    if (photos.length === 0) return; // Нет фото — не инициализируем
    mainPhoto.src = `images/${photos[0]}`; // Показываем первое фото
    renderThumbnails(); // Отрисовываем миниатюры
  });