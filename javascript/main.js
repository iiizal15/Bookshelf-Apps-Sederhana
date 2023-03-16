// Mendeklarasi Web Storage
const STORAGE_KEY = 'BOOK_APPS';
const SAVED_EVENT = 'saved-book';

// Fungsi untuk memeriksa apakah browser yang digunakan mendukung web storage
function isStorageExist() {
  if (typeof Storage === undefined) {
    return false;
  }
  return true;
}

// Menambahkan event listener untuk konten dokumen (HTML)
document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Menambahkan data buku baru
function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;
  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, year, isComplete);

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  const message = 'Buku berhasil ditambahkan!';
  alert(message);
}

// Data buku
const books = [];
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Mencari buku berdasarkan judul
const submitSearchBook = document.getElementById('searchBook');
submitSearchBook.addEventListener('submit', function (e) {
  e.preventDefault();
  const inputSearchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookItems = document.querySelectorAll('.book_item');
  for (let i = 0; i < bookItems.length; i++) {
    const bookTitle = bookItems[i].getElementsByTagName('h3')[0];
    const bookAuthor = bookItems[i].getElementsByTagName('p')[0];
    if (bookTitle || bookAuthor) {
      const textTitle = bookTitle.textContent || bookTitle.innerHTML;
      const textAuthor = bookAuthor.textContent || bookAuthor.innerHTML;
      if (textTitle.toLowerCase().indexOf(inputSearchBook) > -1 || textAuthor.toLowerCase().indexOf(inputSearchBook) > -1) {
        bookItems[i].style.display = 'block';
      } else {
        bookItems[i].style.display = 'none';
      }
    }
  }
});

// Fungsi untuk membuat elemen HTML menampilkan detail buku pada halaman web
function makeBook(bookObject) {
  const title = document.createElement('h3');
  title.innerText = bookObject.title;
  const author = document.createElement('p');
  author.innerText = `Penulis: ${bookObject.author}`;
  const year = document.createElement('p');
  year.innerText = `Tahun: ${bookObject.year}`;
  const buttonIsComplete = document.createElement('button');
  buttonIsComplete.classList.add('green');

  const buttonDelete = document.createElement('button');
  buttonDelete.innerText = 'Hapus buku';
  buttonDelete.classList.add('red');

  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('action');

  const contentBookWrapper = document.createElement('article');
  contentBookWrapper.classList.add('book_item');
  contentBookWrapper.append(title, author, year, buttonWrapper);

  if (bookObject.isComplete) {
    buttonIsComplete.innerText = 'Belum selesai dibaca';
    buttonIsComplete.addEventListener('click', () => {
      addBookIsCompleted(bookObject.id);
    });
    buttonDelete.addEventListener('click', () => removeBook(bookObject.id));
    buttonWrapper.append(buttonIsComplete, buttonDelete);
  } else {
    buttonIsComplete.innerText = 'Selesai dibaca';
    buttonIsComplete.addEventListener('click', () => {
      undoBookIsCompleted(bookObject.id);
    });
    buttonDelete.addEventListener('click', () => removeBook(bookObject.id));
    buttonWrapper.append(buttonIsComplete, buttonDelete);
  }

  return contentBookWrapper;
}

// Fungsi untuk memperbarui daftar buku yang ditampilkan pada halaman web
const RENDER_EVENT = 'render-book';
document.addEventListener(RENDER_EVENT, function () {
  const unCompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  unCompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      unCompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

function addBookIsCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk menghapus buku dari array dan juga daftar buku
function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  const message = 'Buku telah berhasil dihapus!';
  alert(message);
}

// Fungsi untuk mencari sebuah objek buku pada array berdasarkan ID buku
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function undoBookIsCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk menyimpan data buku ke Local Storage browser
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Fungsi untuk memuat data buku yang disimpan sebelumnya dari localStorage pada Browser
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
